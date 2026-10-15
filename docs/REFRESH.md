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

## Incremental refresh

The scheduled Claude task runs daily at 9pm and only appends. It reads the latest  in the CSV,
asks the Strava connector for activities from 3 days before that, keeps Runs and Swims, merges them by
 (new rows added, changed rows replaced), keeps the file sorted oldest first, and runs
 before committing. GitHub Actions cannot use the Claude connector, so there is no
Action-based refresh; the deploy workflow republishes on every push to main.
