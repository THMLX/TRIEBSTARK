#!/usr/bin/env python3
"""Publish a curated snapshot from Hevy's official API, using only stdlib.

The key belongs in the HEVY_API_KEY environment variable, never a source file.
Both collections must finish successfully before replacing the public snapshot.
Workout descriptions, exercise notes, profile fields and photos are not exported.
"""

import argparse
from datetime import date, datetime, timezone
import html
import json
import math
import os
from pathlib import Path
import re
import tempfile
import time
import unicodedata
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener


API_BASE = "https://api.hevyapp.com"
PAGE_SIZE = 10
MAX_PAGES = 1000
MAX_RESPONSE_BYTES = 2_000_000
MAX_FEED_BYTES = 40_000_000
MEASUREMENT_FIELDS = (
    "weight_kg", "lean_mass_kg", "fat_percent", "neck_cm", "shoulder_cm",
    "chest_cm", "left_bicep_cm", "right_bicep_cm", "left_forearm_cm",
    "right_forearm_cm", "abdomen", "waist", "hips", "left_thigh",
    "right_thigh", "left_calf", "right_calf",
)
SET_FIELDS = {
    "weight_kg": ("weightKg", -1000, 5000),
    "reps": ("reps", 0, 1_000_000),
    "distance_meters": ("distanceMeters", 0, 10_000_000),
    "duration_seconds": ("durationSeconds", 0, 604800),
    "rpe": ("rpe", 0, 10),
}


class SyncError(Exception):
    """Expected error with a static, credential-free message."""


class NoRedirect(HTTPRedirectHandler):
    # Never forward the authentication header to an unexpected destination.
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def request_page(api_key, endpoint, page):
    """Read one official API page without logging response bodies or headers."""
    request = Request(
        f"{API_BASE}/v1/{endpoint}?page={page}&pageSize={PAGE_SIZE}",
        headers={"api-key": api_key, "Accept": "application/json",
                 "User-Agent": "TRIEBSTARK-Hevy-Sync/1.0"},
        method="GET",
    )
    opener = build_opener(NoRedirect)
    for attempt in range(3):
        try:
            with opener.open(request, timeout=20) as response:
                raw = response.read(MAX_RESPONSE_BYTES + 1)
            if len(raw) > MAX_RESPONSE_BYTES:
                raise SyncError("Hevy returned an oversized page; previous feed kept.")
            payload = json.loads(raw.decode("utf-8"))
            if not isinstance(payload, dict):
                raise SyncError("Hevy returned an invalid page; previous feed kept.")
            return payload
        except HTTPError as error:
            retryable = error.code == 429 or 500 <= error.code <= 599
            if retryable and attempt < 2:
                time.sleep(2 ** (attempt + 1))
                continue
            raise SyncError("Hevy API request failed; check the connection and rerun. Previous feed kept.") from None
        except (URLError, TimeoutError, OSError):
            if attempt < 2:
                time.sleep(2 ** (attempt + 1))
                continue
            raise SyncError("Hevy could not be reached; previous feed kept.") from None
        except (UnicodeError, ValueError):
            raise SyncError("Hevy returned invalid JSON; previous feed kept.") from None


def fetch_collection(fetch_page, endpoint):
    entries = []
    expected_pages = None
    for page in range(1, MAX_PAGES + 1):
        payload = fetch_page(endpoint, page)
        if not isinstance(payload, dict):
            raise SyncError("Invalid Hevy pagination; previous feed kept.")
        page_count = payload.get("page_count")
        current_page = payload.get("page")
        items = payload.get(endpoint)
        if (type(page_count) is not int or not 0 <= page_count <= MAX_PAGES
                or type(current_page) is not int or current_page != page
                or not isinstance(items, list) or len(items) > PAGE_SIZE
                or any(not isinstance(item, dict) for item in items)):
            raise SyncError("Invalid Hevy pagination; previous feed kept.")
        if expected_pages is None:
            expected_pages = page_count
        elif page_count != expected_pages:
            raise SyncError("Hevy data changed during pagination; retry next run. Previous feed kept.")
        if page_count == 0:
            if page != 1 or items:
                raise SyncError("Invalid empty Hevy collection; previous feed kept.")
            return []
        if page_count < page or (page < page_count and not items):
            raise SyncError("Incomplete Hevy collection; previous feed kept.")
        entries.extend(items)
        if page == page_count:
            return entries
    raise SyncError("Hevy pagination limit reached; previous feed kept.")


def clean_text(value, fallback, limit=140):
    if not isinstance(value, str):
        return fallback
    value = html.unescape(value)
    value = re.sub(r"<[^>]*>", "", value)
    value = "".join(c for c in value if not unicodedata.category(c).startswith("C"))
    return " ".join(value.split())[:limit] or fallback


def numeric(value, lower, upper):
    if type(value) not in (int, float) or not math.isfinite(value) or not lower <= value <= upper:
        raise SyncError("Hevy returned an invalid numeric value; previous feed kept.")
    return round(value, 3)


def timestamp(value):
    if not isinstance(value, str) or len(value) > 40:
        raise SyncError("Hevy returned an invalid timestamp; previous feed kept.")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            raise ValueError
        return parsed.astimezone(timezone.utc)
    except (ValueError, OverflowError):
        raise SyncError("Hevy returned an invalid timestamp; previous feed kept.") from None


def ordered_objects(value, maximum):
    if not isinstance(value, list) or len(value) > maximum or any(not isinstance(v, dict) for v in value):
        raise SyncError("Hevy returned invalid exercise data; previous feed kept.")
    decorated = []
    for position, item in enumerate(value):
        index = item.get("index", position)
        if type(index) not in (int, float) or not math.isfinite(index) or index < 0:
            raise SyncError("Hevy returned an invalid exercise order; previous feed kept.")
        decorated.append((index, position, item))
    return [item for _, _, item in sorted(decorated)]


def curate_workouts(entries):
    workouts = []
    seen = set()
    for raw in entries:
        identity = raw.get("id")
        if not isinstance(identity, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,100}", identity) or identity in seen:
            raise SyncError("Hevy returned invalid or duplicate workouts; previous feed kept.")
        seen.add(identity)
        start, end = timestamp(raw.get("start_time")), timestamp(raw.get("end_time"))
        seconds = (end - start).total_seconds()
        if not 0 <= seconds <= 604800:
            raise SyncError("Hevy returned an invalid workout duration; previous feed kept.")
        exercises = []
        for exercise in ordered_objects(raw.get("exercises"), 500):
            sets = []
            for raw_set in ordered_objects(exercise.get("sets"), 1000):
                set_type = raw_set.get("type", "normal")
                if set_type not in ("normal", "warmup", "dropset", "failure"):
                    raise SyncError("Hevy returned an unknown set type; previous feed kept.")
                result = {"type": set_type}
                for source, (target, lower, upper) in SET_FIELDS.items():
                    if raw_set.get(source) is not None:
                        result[target] = numeric(raw_set[source], lower, upper)
                sets.append(result)
            exercises.append({"title": clean_text(exercise.get("title"), "Exercise"), "sets": sets})
        workouts.append({
            "id": identity,
            "title": clean_text(raw.get("title"), "Workout"),
            "startTime": start.isoformat(timespec="seconds").replace("+00:00", "Z"),
            "durationMinutes": round(seconds / 60, 1),
            "exercises": exercises,
        })
    return sorted(workouts, key=lambda workout: (workout["startTime"], workout["id"]), reverse=True)


def curate_measurements(entries):
    measurements = []
    seen = set()
    for raw in entries:
        measured_on = raw.get("date")
        try:
            if not isinstance(measured_on, str) or date.fromisoformat(measured_on).isoformat() != measured_on:
                raise ValueError
        except ValueError:
            raise SyncError("Hevy returned an invalid measurement date; previous feed kept.") from None
        if measured_on in seen:
            raise SyncError("Hevy returned duplicate measurement dates; previous feed kept.")
        seen.add(measured_on)
        values = {}
        for field in MEASUREMENT_FIELDS:
            if raw.get(field) is not None:
                values[field] = numeric(raw[field], 0, 100 if field == "fat_percent" else 1000)
        if values:
            measurements.append({"date": measured_on, "values": values})
    return sorted(measurements, key=lambda measurement: measurement["date"], reverse=True)


def sync(output_path, api_key, fetch_page=None, now=None):
    """Return skipped, unchanged or updated. Never alter output on fetch failure."""
    if not api_key or not api_key.strip():
        return "skipped"
    api_key = api_key.strip()
    if "\n" in api_key or "\r" in api_key:
        raise SyncError("Invalid Hevy connection key; previous feed kept.")
    fetch_page = fetch_page or (lambda endpoint, page: request_page(api_key, endpoint, page))
    workouts = curate_workouts(fetch_collection(fetch_page, "workouts"))
    measurements = curate_measurements(fetch_collection(fetch_page, "body_measurements"))
    content = {"schemaVersion": 1, "workouts": workouts, "measurements": measurements}
    output_path = Path(output_path)
    previous = None
    if output_path.exists():
        try:
            previous = json.loads(output_path.read_text(encoding="utf-8"))
        except (ValueError, OSError):
            pass
    if isinstance(previous, dict) and previous.get("updatedAt") and all(previous.get(k) == v for k, v in content.items()):
        return "unchanged"
    updated = now or datetime.now(timezone.utc)
    content["updatedAt"] = updated.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    encoded = json.dumps(content, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
    if api_key in encoded:
        raise SyncError("Sensitive connection data detected; previous feed kept.")
    if len(encoded.encode("utf-8")) > MAX_FEED_BYTES:
        raise SyncError("Hevy feed size limit reached; previous feed kept.")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", newline="\n", dir=output_path.parent,
                                         prefix=".hevy-feed-", suffix=".tmp", delete=False) as handle:
            temporary = Path(handle.name)
            handle.write(encoded)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, output_path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()
    return "updated"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parent.parent / "public/data/hevy-feed.json")
    args = parser.parse_args()
    try:
        result = sync(args.output, os.environ.get("HEVY_API_KEY", ""))
    except SyncError as error:
        print(str(error))
        return 1
    except Exception:
        # Do not print unexpected exception contents; HTTP errors can contain secrets.
        print("Hevy sync did not complete; previous feed kept. Check configuration and rerun.")
        return 1
    messages = {
        "skipped": "Hevy sync skipped: add the HEVY_API_KEY repository secret to connect.",
        "unchanged": "Hevy public feed has no changes.",
        "updated": "Hevy public feed updated successfully.",
    }
    print(messages[result])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
