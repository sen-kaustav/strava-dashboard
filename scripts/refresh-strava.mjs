// Incremental refresh of public/data/activities.csv straight from the Strava API.
// Used by .github/workflows/refresh.yml. Needs STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET
// and STRAVA_REFRESH_TOKEN in the environment (see docs/REFRESH.md).
//
// Only activities newer than the latest row (minus a 3 day overlap, so edits are
// picked up) are fetched; rows are merged by id and written oldest first.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data', 'activities.csv');
const HEADER = 'id,start_local,sport_type,name,distance_m,moving_time_s,elapsed_time_s,elevation_gain_m';
const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env;
if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
  console.error('Missing STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET / STRAVA_REFRESH_TOKEN');
  process.exit(1);
}

const rows = new Map();
readFileSync(file, 'utf8').trim().split(/\r?\n/).slice(1).forEach((line) => {
  const f = line.split(',');
  rows.set(f[0], f);
});
const latest = [...rows.values()].reduce((m, f) => (f[1] > m ? f[1] : m), '1970-01-01T00:00:00');
const after = Math.floor(Date.parse(`${latest}Z`) / 1000) - 3 * 86400;

const tokenRes = await fetch('https://www.strava.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    client_secret: STRAVA_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: STRAVA_REFRESH_TOKEN,
  }),
});
if (!tokenRes.ok) { console.error(`Token refresh failed: ${tokenRes.status}`); process.exit(1); }
const { access_token } = await tokenRes.json();

let added = 0;
let updated = 0;
for (let page = 1; ; page++) {
  const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100&page=${page}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!res.ok) { console.error(`Activities fetch failed: ${res.status}`); process.exit(1); }
  const batch = await res.json();
  for (const a of batch) {
    const sport = a.sport_type || a.type;
    if (sport !== 'Run' && sport !== 'Swim') continue;
    const row = [
      String(a.id),
      a.start_date_local.replace(/Z$/, ''),
      sport,
      (a.name || sport).replace(/[,\r\n]+/g, ' ').trim(),
      String(a.distance),
      String(a.moving_time),
      String(a.elapsed_time),
      String(Math.round(a.total_elevation_gain || 0)),
    ];
    const prev = rows.get(row[0]);
    if (!prev) added++;
    else if (prev.join(',') !== row.join(',')) updated++;
    rows.set(row[0], row);
  }
  if (batch.length < 100) break;
}

const sorted = [...rows.values()].sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
writeFileSync(file, `${HEADER}\n${sorted.map((r) => r.join(',')).join('\n')}\n`);
console.log(`Refresh done: ${added} added, ${updated} updated, ${sorted.length} total`);
