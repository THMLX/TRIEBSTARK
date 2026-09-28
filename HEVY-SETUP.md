# Connect the training page to Hevy

The page and scheduled exporter are ready. Connecting requires Hevy Pro and one private repository secret.

## One-time connection

1. Open https://hevy.com/settings?developer while signed in to your Hevy Pro account and copy your API key.
2. Open https://github.com/THMLX/TRIEBSTARK/settings/secrets/actions/new . Create a repository secret with the name `HEVY_API_KEY` and paste the key into its Secret field. Do not put the key in a source file, chat message, public setting, or commit.
3. In https://github.com/THMLX/TRIEBSTARK/actions/workflows/sync-hevy.yml choose **Run workflow** on `main`, or wait for the next scheduled run.
4. A changed snapshot produces an `Update Hevy training log` commit. Hyperlift should build the commit through its existing GitHub integration. Verify the workflow, Hyperlift build, and live page after the first connected run.

Connecting this exporter publishes the complete workout and measurement history returned by your account's API. These published snapshots are stored in this public repository and served on the public website. Workout descriptions, exercise notes, profile details, and API credentials are excluded. The API does not provide a documented workout visibility flag to filter private entries. Review this publication scope before adding the key.

## What updates

- Workouts: title, date, duration, exercises, and set details. The website displays the latest session plus expandable history.
- Body measurements: the 17 documented Hevy measurement fields, as recorded. The website offers a metric selector, change summary, graph, and full measurement table.
- Edited or removed entries are reflected in the current snapshot on the next successful refresh. Earlier snapshots can remain in Git history.
- Progress photos are not exposed by Hevy's official API. They need a separate owner-supplied source; there is no automatic photo import in this integration.

The workflow checks at minutes 17 and 47 each hour. GitHub schedules and Hyperlift deployments can be delayed; this is periodic synchronization, not an instant webhook. If Hevy is unavailable or returns incomplete data, the existing snapshot is kept. Unchanged data does not create a commit or deployment. The displayed update date is the last published data change.

## Referral button

Edit `public/data/training-config.json` and replace `null` in `hevyReferralUrl` with your exact HTTPS referral URL. The existing button automatically becomes active and shows a referral disclosure. No other code change is needed. This file is public and must never contain an API key.

## Pause or remove the connection

Disable **Sync Hevy training log** in GitHub Actions to stop scheduled runs. Remove the repository secret if it is no longer needed. Stopping the job does not remove data already published; edit or remove the snapshot separately if desired.

## Sources

- Official API: https://api.hevyapp.com/docs/
- Official API schema: https://api.hevyapp.com/docs/swagger-ui-init.js
- Body measurements and progress photos: https://help.hevyapp.com/hc/en-us/articles/35385479603479-Body-Composition-Tracking-Measurements-and-Progress-Photos
- Affiliate program: https://www.hevyapp.com/affiliate/

## Validation

Run `python -m unittest discover -s scripts -p 'test_sync_hevy.py' -v` for the offline exporter checks. Missing `HEVY_API_KEY` causes a safe skip; it does not publish a fake or empty connected log. An actual authenticated sync and automatic Hyperlift deployment must be verified after the secret is supplied.
