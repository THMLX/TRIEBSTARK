"""Offline tests for complete, atomic and curated Hevy publication."""

import copy
from datetime import datetime, timezone
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch
from urllib.error import HTTPError

import sync_hevy as hevy


NOW = datetime(2026, 9, 28, 12, 0, tzinfo=timezone.utc)
KEY = "test-secret-not-for-publication"


def workout(identity="workout-1", start="2026-09-27T10:00:00Z"):
    return {
        "id": identity, "title": "Upper body", "start_time": start,
        "end_time": "2026-09-27T11:00:00Z", "description": "PRIVATE DESCRIPTION",
        "routine_id": "PRIVATE ROUTINE", "user_id": "PRIVATE ACCOUNT",
        "exercises": [{
            "index": 0, "title": "Bench Press", "notes": "PRIVATE NOTES",
            "exercise_template_id": "PRIVATE TEMPLATE", "superset_id": 3,
            "sets": [{"index": 0, "type": "normal", "weight_kg": 70,
                      "reps": 8, "distance_meters": None, "duration_seconds": None,
                      "rpe": 8.5, "custom_metric": None}],
        }],
    }


def single_page(workouts=None, measurements=None):
    collections = {
        "workouts": [workout()] if workouts is None else workouts,
        "body_measurements": [{"date": "2026-09-27", "weight_kg": 82.5}]
        if measurements is None else measurements,
    }

    def fetch(endpoint, page):
        if page != 1:
            raise AssertionError("Unexpected extra request")
        return {"page": 1, "page_count": 1, endpoint: copy.deepcopy(collections[endpoint])}

    return fetch


class HevySyncTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.output = Path(self.temp.name) / "hevy-feed.json"

    def read(self):
        return json.loads(self.output.read_text(encoding="utf-8"))

    def test_full_pagination_for_both_collections(self):
        calls = []

        def fetch(endpoint, page):
            calls.append((endpoint, page))
            items = [workout(f"workout-{page}")] if endpoint == "workouts" else [
                {"date": f"2026-09-{page:02}", "weight_kg": 80 + page}
            ]
            return {"page": page, "page_count": 2, endpoint: items}

        self.assertEqual(hevy.sync(self.output, KEY, fetch, NOW), "updated")
        self.assertEqual(calls, [("workouts", 1), ("workouts", 2), ("body_measurements", 1), ("body_measurements", 2)])
        self.assertEqual(len(self.read()["workouts"]), 2)
        self.assertEqual(len(self.read()["measurements"]), 2)
        self.assertEqual(self.read()["updatedAt"], "2026-09-28T12:00:00Z")

    def test_failure_in_second_collection_preserves_old_file(self):
        original = b'{"old":"last good feed"}\n'
        self.output.write_bytes(original)

        def fetch(endpoint, page):
            if endpoint == "body_measurements":
                raise hevy.SyncError("API unavailable")
            return single_page()(endpoint, page)

        with self.assertRaises(hevy.SyncError):
            hevy.sync(self.output, KEY, fetch, NOW)
        self.assertEqual(self.output.read_bytes(), original)
        self.assertEqual(list(self.output.parent.iterdir()), [self.output])

    def test_failure_on_later_page_never_publishes_partial_data(self):
        self.output.write_text("previous", encoding="utf-8")

        def fetch(endpoint, page):
            if page == 2:
                raise hevy.SyncError("Second page failed")
            return {"page": 1, "page_count": 2, endpoint: [workout()]}

        with self.assertRaises(hevy.SyncError):
            hevy.sync(self.output, KEY, fetch, NOW)
        self.assertEqual(self.output.read_text(), "previous")

    def test_curated_fields_exclude_secrets_notes_and_account_data(self):
        raw = workout()
        raw["api-key"] = KEY
        raw["description"] = KEY
        raw["profile"] = {"email": "private@example.com", "photo": "private-url"}
        measurements = [{"date": "2026-09-27", "weight_kg": 82, "photo_url": KEY, "note": KEY}]
        hevy.sync(self.output, KEY, single_page([raw], measurements), NOW)
        encoded = self.output.read_text(encoding="utf-8")
        for excluded in (KEY, "PRIVATE", "private@example.com", "photo_url", "description", "notes", "routine_id", "user_id"):
            self.assertNotIn(excluded, encoded)
        self.assertEqual(self.read()["workouts"][0]["exercises"][0]["sets"][0],
                         {"type": "normal", "weightKg": 70, "reps": 8, "rpe": 8.5})

    def test_secret_in_visible_field_blocks_publication(self):
        raw = workout()
        raw["title"] = KEY
        with self.assertRaises(hevy.SyncError):
            hevy.sync(self.output, KEY, single_page([raw]), NOW)
        self.assertFalse(self.output.exists())

    def test_no_timestamp_only_changes_and_stable_sorting(self):
        first, second = workout("a"), workout("b")
        hevy.sync(self.output, KEY, single_page([first, second]), NOW)
        original = self.output.read_bytes()
        modified = copy.deepcopy(first)
        modified["description"] = "Only private notes changed"
        later = datetime(2026, 9, 29, tzinfo=timezone.utc)
        self.assertEqual(hevy.sync(self.output, KEY, single_page([second, modified]), later), "unchanged")
        self.assertEqual(self.output.read_bytes(), original)

    def test_updates_and_deletions_replace_snapshot(self):
        hevy.sync(self.output, KEY, single_page([workout("a"), workout("b")]), NOW)
        changed = workout("b")
        changed["exercises"][0]["sets"][0]["reps"] = 10
        later = datetime(2026, 9, 29, tzinfo=timezone.utc)
        self.assertEqual(hevy.sync(self.output, KEY, single_page([changed], []), later), "updated")
        self.assertEqual([item["id"] for item in self.read()["workouts"]], ["b"])
        self.assertEqual(self.read()["workouts"][0]["exercises"][0]["sets"][0]["reps"], 10)
        self.assertEqual(self.read()["measurements"], [])
        self.assertEqual(self.read()["updatedAt"], "2026-09-29T00:00:00Z")

    def test_invalid_numbers_fail_without_replacing_output(self):
        self.output.write_text("last valid feed", encoding="utf-8")
        for value in (float("nan"), float("inf"), True, "80", -1, 2000):
            with self.subTest(value=value), self.assertRaises(hevy.SyncError):
                hevy.sync(self.output, KEY, single_page(measurements=[{"date": "2026-09-27", "weight_kg": value}]), NOW)
            self.assertEqual(self.output.read_text(), "last valid feed")

    def test_invalid_dates_and_duplicate_entries_fail(self):
        for measurements in ([{"date": "2026-09-31", "weight_kg": 80}],
                             [{"date": "2026-09-27", "weight_kg": 80}] * 2):
            with self.assertRaises(hevy.SyncError):
                hevy.sync(self.output, KEY, single_page(measurements=measurements), NOW)
        with self.assertRaises(hevy.SyncError):
            hevy.sync(self.output, KEY, single_page([workout(), workout()]), NOW)
        self.assertFalse(self.output.exists())

    def test_changed_pagination_is_rejected(self):
        def fetch(endpoint, page):
            return {"page": page, "page_count": 2 if page == 1 else 3, endpoint: [workout(str(page))]}

        with self.assertRaises(hevy.SyncError):
            hevy.sync(self.output, KEY, fetch, NOW)
        self.assertFalse(self.output.exists())

    def test_empty_collections_and_missing_key(self):
        def fetch(endpoint, page):
            return {"page": 1, "page_count": 0, endpoint: []}

        self.assertEqual(hevy.sync(self.output, "", fetch, NOW), "skipped")
        self.assertFalse(self.output.exists())
        self.assertEqual(hevy.sync(self.output, KEY, fetch, NOW), "updated")
        self.assertEqual(self.read()["workouts"], [])
        self.assertEqual(self.read()["measurements"], [])

    def test_title_cleanup_preserves_plain_text(self):
        raw = workout()
        raw["title"] = "  <b>Upper</b> &amp; Lower\x00 \u202e  "
        hevy.sync(self.output, KEY, single_page([raw]), NOW)
        self.assertEqual(self.read()["workouts"][0]["title"], "Upper & Lower")

    def test_set_order_and_timezone_normalization(self):
        raw = workout()
        raw["start_time"] = "2026-09-27T12:00:00+02:00"
        raw["exercises"][0]["sets"] = [
            {"index": 1, "type": "normal", "weight_kg": 70, "reps": 8},
            {"index": 0, "type": "warmup", "weight_kg": 40, "reps": 10},
        ]
        hevy.sync(self.output, KEY, single_page([raw]), NOW)
        result = self.read()["workouts"][0]
        self.assertEqual(result["startTime"], "2026-09-27T10:00:00Z")
        self.assertEqual(result["durationMinutes"], 60)
        self.assertEqual(result["exercises"][0]["sets"][0]["type"], "warmup")

    def test_every_documented_measurement_field_is_allowed(self):
        values = {field: 20 for field in hevy.MEASUREMENT_FIELDS}
        hevy.sync(self.output, KEY, single_page(measurements=[{"date": "2026-09-27", **values}]), NOW)
        self.assertEqual(self.read()["measurements"][0]["values"], values)

    def test_unexpected_errors_are_not_logged_with_credentials(self):
        with patch.dict("os.environ", {"HEVY_API_KEY": KEY}), patch("sys.argv", ["sync_hevy.py"]), \
                patch.object(hevy, "sync", side_effect=RuntimeError(KEY)), patch("builtins.print") as output:
            self.assertEqual(hevy.main(), 1)
            self.assertNotIn(KEY, str(output.call_args_list))

    def test_api_request_uses_fixed_https_host_and_header(self):
        response = io.BytesIO(b'{"page": 1, "page_count": 0, "workouts": []}')
        opener = Mock()
        opener.open.return_value = response
        with patch.object(hevy, "build_opener", return_value=opener):
            hevy.request_page(KEY, "workouts", 1)
        request = opener.open.call_args.args[0]
        self.assertEqual(request.full_url, "https://api.hevyapp.com/v1/workouts?page=1&pageSize=10")
        self.assertEqual(request.get_header("Api-key"), KEY)
        self.assertNotIn(KEY, request.full_url)
        self.assertEqual(request.method, "GET")

    def test_http_error_does_not_echo_response_body_or_key(self):
        opener = Mock()
        opener.open.side_effect = HTTPError("https://api.hevyapp.com", 401, KEY, {}, io.BytesIO(KEY.encode()))
        with patch.object(hevy, "build_opener", return_value=opener), self.assertRaises(hevy.SyncError) as error:
            hevy.request_page(KEY, "workouts", 1)
        self.assertNotIn(KEY, str(error.exception))
        self.assertEqual(opener.open.call_count, 1)

    def test_redirects_do_not_forward_authentication(self):
        self.assertIsNone(hevy.NoRedirect().redirect_request(None, None, 302, "", {}, "https://unexpected.invalid"))

    def test_pagination_limits_and_missing_fields_fail(self):
        for payload in ({"page": 1, "page_count": hevy.MAX_PAGES + 1, "workouts": []},
                        {"page": 1, "page_count": 1},
                        {"page": 2, "page_count": 2, "workouts": []}):
            with self.subTest(payload=payload), self.assertRaises(hevy.SyncError):
                hevy.fetch_collection(lambda endpoint, page: payload, "workouts")


if __name__ == "__main__":
    unittest.main()
