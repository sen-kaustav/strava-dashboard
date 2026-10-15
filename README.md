# Strava Dashboard

A personal PWA for runs and swims: Home (rings and calendar), Trends (d3 charts) and
Activities (sortable TanStack table with "Open in Strava" links). React + Vite, plain JavaScript.

All data comes from `public/data/activities.csv` (see [docs/REFRESH.md](docs/REFRESH.md)).

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts: `npm run build` (production build into `dist/`), `npm run preview`
(serve the build, which is what you need to test the service worker and install prompt),
`npm run validate` (check the CSV).

## Layout

```
public/data/activities.csv   the only data source; rewritten by the scheduled refresh
public/icons/                PWA icons
scripts/validate-csv.mjs     CSV sanity check, used by CI and the refresh
src/lib/data.js              CSV parsing and all month/week calculations
src/lib/format.js            pace, duration and date formatting
src/components/              rings, calendar, d3 charts, nav
src/pages/                   Home, Trends, Activities
src/styles/app.css           Ember design tokens and styles
.github/workflows/deploy.yml build and publish to GitHub Pages on every push to main
docs/REFRESH.md              data contract and the scheduled Claude task prompt
```

## How it behaves

- Routing is hash based (`#/`, `#/trends`, `#/activities`), so it works on GitHub Pages with no server config.
- `vite.config.js` uses a relative base, so the same build works locally and at `https://<user>.github.io/<repo>/`.
- The service worker precaches the app. The CSV is fetched network-first, so new data appears the next time you open the app online, and the last copy is used offline.
- Home compares this month with last month. The first month in the data has no previous month, so its rings stay empty.

## Publish to GitHub Pages

1. Create an empty repo, then:
   ```bash
   git init -b main
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/<you>/strava-dashboard.git
   git push -u origin main
   ```
2. In the repo go to Settings, Pages, and set Source to "GitHub Actions".
3. The push (or Actions, "Build and deploy to GitHub Pages", Run workflow) builds and publishes the site at `https://<you>.github.io/strava-dashboard/`.
4. Open that URL on your phone and use "Add to Home Screen".

GitHub Pages sites are public, and so is `activities.csv` inside them. Pages from a private repo
needs a paid GitHub plan, and the site is still reachable by anyone with the link.
