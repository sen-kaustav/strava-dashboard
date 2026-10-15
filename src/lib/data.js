import { csvParse } from 'd3';
import { distanceLabel, duration, longDay, dayMonth, MONTHS, WEEKDAYS, paceLabel, paceSeconds, mmss } from './format.js';

export const COLORS = { Run: '#e5572a', Swim: '#f5a524' };
const DAY_MS = 86400000;

/** Whole days since epoch for a local calendar date (DST safe). */
export const dayNumber = (d) => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS);

function parseLocal(str) {
  const [date, time = '00:00:00'] = str.split('T');
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi, s] = time.split(':').map(Number);
  return new Date(y, mo - 1, d, h, mi, s || 0);
}

/** Fetch and parse public/data/activities.csv. Only runs and swims are kept. */
export async function loadActivities() {
  const url = `${import.meta.env.BASE_URL}data/activities.csv`;
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load activities (${res.status})`);
  return parseActivities(await res.text());
}

export function parseActivities(text) {
  return csvParse(text)
    .filter((r) => r.sport_type === 'Run' || r.sport_type === 'Swim')
    .map((r) => {
      const start = parseLocal(r.start_local);
      const a = {
        id: r.id,
        start,
        type: r.sport_type,
        name: r.name,
        km: Number(r.distance_m) / 1000,
        sec: Number(r.moving_time_s)
      };
      a.day = dayNumber(start);
      a.monthKey = start.getFullYear() * 12 + start.getMonth();
      a.dist = distanceLabel(a);
      a.time = duration(a.sec);
      a.pace = paceLabel(a);
      a.paceSec = paceSeconds(a);
      a.dateLabel = dayMonth(start);
      a.longDate = longDay(start);
      return a;
    })
    .sort((x, y) => x.start - y.start);
}

const sum = (list, f) => list.reduce((s, a) => s + f(a), 0);

export function monthTotals(acts) {
  const runs = acts.filter((a) => a.type === 'Run');
  const swims = acts.filter((a) => a.type === 'Swim');
  const runKm = sum(runs, (a) => a.km);
  const swimKm = sum(swims, (a) => a.km);
  return {
    runKm,
    swimKm,
    runs: runs.length,
    swims: swims.length,
    runPace: runs.length ? mmss(sum(runs, (a) => a.sec) / runKm) : '–',
    swimPace: swims.length ? mmss(sum(swims, (a) => a.sec) / (swimKm * 10)) : '–'
  };
}

export const monthKeyOf = (y, m) => y * 12 + m;
export const keyToYM = (k) => ({ y: Math.floor(k / 12), m: k % 12 });

/** Everything the Home screen needs for one month. */
export function buildMonth(all, key, today) {
  const { y, m } = keyToYM(key);
  const acts = all.filter((a) => a.monthKey === key);
  const prevActs = all.filter((a) => a.monthKey === key - 1);
  const nowKey = monthKeyOf(today.getFullYear(), today.getMonth());
  const live = key === nowKey;
  const days = new Date(y, m + 1, 0).getDate();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7; // Monday first
  const through = live ? today.getDate() : days;
  const byDay = {};
  acts.forEach((a) => { (byDay[a.start.getDate()] = byDay[a.start.getDate()] || []).push(a); });

  const cells = [];
  const total = Math.ceil((offset + days) / 7) * 7;
  for (let i = 0; i < total; i++) {
    const n = i - offset + 1;
    if (n < 1 || n > days) { cells.push({ blank: true, key: `b${i}` }); continue; }
    const list = byDay[n] || [];
    cells.push({
      blank: false, key: `d${n}`, n, acts: list,
      hasRun: list.some((a) => a.type === 'Run'),
      hasSwim: list.some((a) => a.type === 'Swim'),
      isToday: live && n === today.getDate(),
      isFuture: live && n > today.getDate(),
      label: `${WEEKDAYS[new Date(y, m, n).getDay()]} ${n} ${MONTHS[m]}`,
      col: i % 7, row: Math.floor(i / 7)
    });
  }
  const prev = { name: MONTHS[(m + 11) % 12], ...monthTotals(prevActs) };
  return {
    key, y, m, name: MONTHS[m], live, days, through, cells,
    daysLeft: days - through,
    totals: monthTotals(acts),
    prev,
    count: acts.length,
    dateLine: live
      ? `${WEEKDAYS[today.getDay()]} ${today.getDate()} ${MONTHS[today.getMonth()]}`
      : `1 to ${days} ${MONTHS[m]} ${y}`
  };
}

/** Monday 00:00 of the week containing d. */
export function mondayOf(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

/** The last `n` Monday-to-Sunday weeks ending with the current one. */
export function buildWeeks(all, today, n = 12) {
  const first = mondayOf(today);
  first.setDate(first.getDate() - 7 * (n - 1));
  const startDay = dayNumber(first);
  const weeks = Array.from({ length: n }, (_, i) => {
    const s = new Date(first); s.setDate(s.getDate() + i * 7);
    const e = new Date(s); e.setDate(e.getDate() + 6);
    return { i, start: s, end: e, runKm: 0, swimKm: 0, runs: 0, swims: 0 };
  });
  const inRange = all.filter((a) => a.day >= startDay && a.day < startDay + 7 * n);
  inRange.forEach((a) => {
    const w = weeks[Math.floor((a.day - startDay) / 7)];
    if (a.type === 'Run') { w.runKm += a.km; w.runs += 1; } else { w.swimKm += a.km; w.swims += 1; }
  });
  return { weeks, acts: inRange, first };
}
