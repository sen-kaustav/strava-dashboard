// Sanity-checks public/data/activities.csv. Run by CI before every build and
// by the scheduled refresh before it commits:  npm run validate
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data', 'activities.csv');
const HEADER = 'id,start_local,sport_type,name,distance_m,moving_time_s,elapsed_time_s,elevation_gain_m';
const lines = readFileSync(file, 'utf8').trim().split(/\r?\n/);
const errors = [];

if (lines[0] !== HEADER) errors.push(`Header must be exactly: ${HEADER}`);
const seen = new Set();
let prev = '';
lines.slice(1).forEach((line, i) => {
  const n = i + 2;
  const f = line.split(',');
  if (f.length !== 8) { errors.push(`Line ${n}: expected 8 fields, got ${f.length}`); return; }
  const [id, start, sport, name, dist, mov, ela, elev] = f;
  if (!/^\d+$/.test(id)) errors.push(`Line ${n}: bad id "${id}"`);
  if (seen.has(id)) errors.push(`Line ${n}: duplicate id ${id}`);
  seen.add(id);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(start)) errors.push(`Line ${n}: bad start_local "${start}"`);
  if (start < prev) errors.push(`Line ${n}: rows must be sorted oldest first`);
  prev = start;
  if (!['Run', 'Swim'].includes(sport)) errors.push(`Line ${n}: sport_type must be Run or Swim, got "${sport}"`);
  if (!name) errors.push(`Line ${n}: empty name`);
  [['distance_m', dist], ['moving_time_s', mov], ['elapsed_time_s', ela], ['elevation_gain_m', elev]].forEach(([k, v]) => {
    if (v === '' || Number.isNaN(Number(v)) || Number(v) < 0) errors.push(`Line ${n}: ${k} must be a number, got "${v}"`);
  });
  if (Number(dist) <= 0 || Number(mov) <= 0) errors.push(`Line ${n}: distance and moving time must be above zero`);
});

if (errors.length) {
  console.error(`activities.csv failed validation (${errors.length} problem${errors.length === 1 ? '' : 's'}):`);
  errors.slice(0, 20).forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(`activities.csv OK: ${lines.length - 1} activities, ${lines[1].split(',')[1].slice(0, 10)} to ${prev.slice(0, 10)}`);
