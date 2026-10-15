export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MON = MONTHS.map((m) => m.slice(0, 3));
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const p2 = (n) => (n < 10 ? `0${n}` : `${n}`);

/** 322 seconds -> "5:22" */
export function mmss(sec) {
  let m = Math.floor(sec / 60);
  let s = Math.round(sec - m * 60);
  if (s === 60) { m += 1; s = 0; }
  return `${m}:${p2(s)}`;
}

/** 4406 seconds -> "1h 13m", 1362 -> "23 min" */
export function duration(sec) {
  const mins = Math.round(sec / 60);
  const h = Math.floor(mins / 60);
  return h > 0 ? `${h}h ${p2(mins - h * 60)}m` : `${mins} min`;
}

export function distanceLabel(a) {
  return a.type === 'Swim' ? `${Math.round(a.km * 1000)} m` : `${a.km.toFixed(2)} km`;
}

export function paceSeconds(a) {
  return a.type === 'Swim' ? a.sec / (a.km * 10) : a.sec / a.km;
}

export function paceLabel(a) {
  return a.type === 'Swim' ? `${mmss(paceSeconds(a))} /100m` : `${mmss(paceSeconds(a))} /km`;
}

export const dayMonth = (d) => `${d.getDate()} ${MON[d.getMonth()]}`;
export const longDay = (d) => `${WEEKDAYS[d.getDay()].slice(0, 3)} ${dayMonth(d)}`;
export const stravaUrl = (id) => `https://www.strava.com/activities/${id}`;
