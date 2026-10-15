# Refreshing the Strava data

The app never talks to Strava directly. It reads one file, `public/data/activities.csv`,
and that file is rewritten by a scheduled Claude task that uses the Strava connector.

```
scheduled Claude task ──(Strava connector)──> public/data/activities.csv ──push to main──> GitHub Action ──> Pages
```

## CSV contract

One row per activity, oldest first, runs and swims only, no quoting needed (names contain no commas).

| column | meaning |
| --- | --- |
| `id` | Strava activity id (used for the "Open in Strava" link) |
| `start_local` | local start time, `YYYY-MM-DDTHH:MM:SS` (no timezone) |
| `sport_type` | `Run` or `Swim` |
| `name` | activity name |
| `distance_m` | metres |
| `moving_time_s` | moving time, seconds |
| `elapsed_time_s` | elapsed time, seconds |
| `elevation_gain_m` | metres |

`npm run validate` checks all of this. The deploy workflow runs it before building, so a bad
refresh can never replace the live site.

## Prompt for the scheduled Claude task

Give the task access to this repo and to the Strava connector, then use this prompt:

> In this repo, refresh `public/data/activities.csv` from Strava.
> 1. Call the Strava `list_activities` tool with `range_start` = the first day of the month
>    twelve months ago (local time) and no end date, `ordering` = `StartDateLocalAsc`,
>    `first` = 100, and keep paging with `after` = `end_cursor` until `has_next_page` is false.
> 2. Keep only activities whose `sport_type` is `Run` or `Swim`.
> 3. Write the CSV exactly as described in `docs/REFRESH.md` (same header, oldest first):
>    id, start_local, sport_type, name, distance (summary.distance), moving_time,
>    elapsed_time, elevation_gain.
> 4. Run `npm ci && npm run validate`. If validation fails, fix the file; never commit a file that fails.
> 5. If the CSV changed, commit it to `main` with the message `data: refresh Strava activities`
>    and push. If nothing changed, do nothing.

Pushing to `main` triggers `.github/workflows/deploy.yml`, which republishes the site.
A weekly or daily schedule is plenty; Strava activities rarely arrive more than once a day.

## Rolling window

The window is the last 12 months. Each refresh re-pulls that whole window, so activities that
fall out of it drop off and edits or deletions made in Strava are picked up.

## GitHub Action refresh (incremental)

`.github/workflows/refresh.yml` runs daily and executes `scripts/refresh-strava.mjs`, which asks the
Strava API only for activities since the latest row (3 day overlap), merges them by id, validates,
commits and triggers a redeploy. It needs three repository secrets (Settings, Secrets and variables,
Actions): `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN` (from an API app at
https://www.strava.com/settings/api, with a refresh token authorised for `activity:read_all`).
The Claude connector cannot be used from GitHub Actions, which is why the scheduled Claude task
exists as the credential-free path.
