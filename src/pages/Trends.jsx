import { useMemo } from 'react';
import WeeklyChart from '../components/WeeklyChart.jsx';
import PaceChart from '../components/PaceChart.jsx';
import Dot from '../components/Dot.jsx';
import MonthNav from '../components/MonthNav.jsx';
import { buildWeeks } from '../lib/data.js';
import { dayMonth, mmss } from '../lib/format.js';

/** route: '/trends' (distance), '/trends/pace' (run pace), '/trends/swim' (swim pace) */
export default function Trends({ all, today, route, month, nav }) {
  // The 12-week window ends with the selected month: today if it's the current month, else its last day.
  const anchor = useMemo(() => (month.live ? today : new Date(month.y, month.m + 1, 0)), [month.live, month.y, month.m, today]);
  const { weeks, acts, first } = useMemo(() => buildWeeks(all, anchor, 12), [all, anchor]);
  const end = new Date(weeks[weeks.length - 1].end);
  const isDist = route === '/trends';
  const kind = route === '/trends/swim' ? 'Swim' : 'Run';
  const list = acts.filter((a) => a.type === kind);

  const avgRun = weeks.reduce((s, w) => s + w.runKm, 0) / weeks.length;
  const avgSwim = weeks.reduce((s, w) => s + w.swimKm, 0) / weeks.length;
  const totSec = list.reduce((s, a) => s + a.sec, 0);
  const totKm = list.reduce((s, a) => s + a.km, 0);
  const avgPace = list.length ? totSec / (kind === 'Run' ? totKm : totKm * 10) : null;
  const best = list.length ? Math.min(...list.map((a) => a.paceSec)) : null;
  const unit = kind === 'Run' ? 'per km' : 'per 100 m';

  return (
    <>
      <header className="page-head">
        <MonthNav {...nav} />
        <div className="small head-line">{month.live ? 'Last 12 weeks' : `12 weeks to end of ${month.name}`} · {dayMonth(first)} to {dayMonth(anchor < end ? anchor : end)}</div>
        <h1>Trends</h1>
      </header>

      <div className="segmented" role="group" aria-label="Chart">
        <a href="#/trends" className={isDist ? 'seg on' : 'seg'} aria-current={isDist ? 'page' : undefined}>Distance</a>
        <a href="#/trends/pace" className={!isDist ? 'seg on' : 'seg'} aria-current={!isDist ? 'page' : undefined}>Pace</a>
      </div>

      <section className="card chart-card">
        {isDist ? (
          <>
            <h2>Weekly distance</h2>
            <div className="small">Kilometres per week, Monday to Sunday</div>
            <div className="legend"><span><Dot type="Run" />Run</span><span><Dot type="Swim" />Swim</span></div>
            <WeeklyChart key={`dist-${month.key}`} weeks={weeks} />
          </>
        ) : (
          <>
            <h2>{kind} pace</h2>
            <div className="small">{kind === 'Run' ? 'Minutes per km' : 'Minutes per 100 m'}, faster is higher</div>
            <div className="chips" role="group" aria-label="Sport">
              <a href="#/trends/pace" className={kind === 'Run' ? 'chip on' : 'chip'} aria-current={kind === 'Run' ? 'page' : undefined}><Dot type="Run" />Run</a>
              <a href="#/trends/swim" className={kind === 'Swim' ? 'chip on' : 'chip'} aria-current={kind === 'Swim' ? 'page' : undefined}><Dot type="Swim" />Swim</a>
            </div>
            <PaceChart key={`${kind}-${month.key}`} kind={kind} acts={list} />
          </>
        )}
      </section>

      {isDist ? (
        <section className="stat-row two">
          <div className="kpi"><div className="label"><Dot type="Run" size={8} />Run / week</div><div className="kpi-big">{avgRun.toFixed(1)}<span className="unit"> km avg</span></div></div>
          <div className="kpi"><div className="label"><Dot type="Swim" size={8} />Swim / week</div><div className="kpi-big">{avgSwim.toFixed(1)}<span className="unit"> km avg</span></div></div>
        </section>
      ) : (
        <section className="stat-row three">
          <div className="kpi"><div className="label">Best</div><div className="kpi-mid">{best ? mmss(best) : '–'}</div><div className="unit">{unit}</div></div>
          <div className="kpi"><div className="label">Average</div><div className="kpi-mid">{avgPace ? mmss(avgPace) : '–'}</div><div className="unit">{unit}</div></div>
          <div className="kpi"><div className="label">{kind}s</div><div className="kpi-mid">{list.length}</div><div className="unit">in 12 weeks</div></div>
        </section>
      )}
    </>
  );
}
