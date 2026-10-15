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

Runs daily at 9pm Europe/London with access to this repo and the Strava connector:

> In this repo, append any new Strava activities to `public/data/activities.csv`.
> 1. Read the latest `start_local` in the CSV. Call the Strava `list_activities` tool with
>    `range_start` = 3 days before that date, `ordering` = `StartDateLocalAsc`, `first` = 100,
>    paging with `after` = `end_cursor` until `has_next_page` is false.
> 2. Keep only `Run` and `Swim` activities and map them to the CSV columns above.
> 3. Merge by `id`: add new rows, replace rows whose values changed, never delete existing rows.
>    Keep the file sorted oldest first.
> 4. Run `npm ci && npm run validate`. If validation fails, fix the file; never commit one that fails.
> 5. If the CSV changed, commit `data: refresh Strava activities` to `main` and push (this triggers the
>    Pages deploy). If nothing changed, do nothing.

GitHub Actions cannot use the Claude connector, so there is no Action-based refresh; the deploy
workflow republishes on every push to main.
