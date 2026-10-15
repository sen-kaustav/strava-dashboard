import { useState } from 'react';
import { scaleBand, scaleLinear, max } from 'd3';
import { COLORS } from '../lib/data.js';
import { useWidth } from '../lib/hooks.js';
import { MON } from '../lib/format.js';

const H = 290;
const AXIS = 30;       // left gutter for y labels
const GAP = 2;         // surface gap between stacked segments
const TIP_W = 176;

/** Bar with only its top corners rounded (4px data end). */
function topRounded(x, y, w, h, r = 4) {
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

function range(w) {
  const s = w.start, e = w.end;
  const sameMonth = s.getMonth() === e.getMonth();
  return `${s.getDate()}${sameMonth ? '' : ` ${MON[s.getMonth()]}`} – ${e.getDate()} ${MON[e.getMonth()]}`;
}

export default function WeeklyChart({ weeks }) {
  const [wrap, width] = useWidth(316);
  const [sel, setSel] = useState(null); // null = no tooltip until a bar is clicked
  const top = Math.max(10, Math.ceil(max(weeks, (w) => w.runKm + w.swimKm) / 5) * 5);
  const x = scaleBand().domain(weeks.map((w) => w.i)).range([AXIS, width]).paddingInner(0.3).paddingOuter(0);
  // Leave ~90px of headroom above the top gridline so the tooltip never covers the heading.
  const y = scaleLinear().domain([0, top]).range([H - 2, 90]);
  const ticks = y.ticks(4).filter((t) => t <= top);
  const W = sel === null ? null : weeks[sel];
  const cx = W ? x(W.i) + x.bandwidth() / 2 : 0;
  const tipLeft = Math.max(0, Math.min(cx - TIP_W / 2, width - TIP_W));
  const tipBottom = W ? H - y(W.runKm + W.swimKm) + 12 : 0;
  let prevMon = -1;

  return (
    <div ref={wrap}>
      <div className="chart-box" style={{ height: H }}>
        <svg width={width} height={H} role="group" aria-label="Weekly run and swim distance in kilometres" style={{ overflow: 'visible', display: 'block' }}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={AXIS} x2={width} y1={y(t)} y2={y(t)} stroke="#e8d3c2" />
              <text x={AXIS - 6} y={y(t) + 4} textAnchor="end" className="axis-text">{t}</text>
            </g>
          ))}
          {weeks.map((w) => {
            const bx = x(w.i), bw = x.bandwidth(), on = w.i === sel;
            const runH = w.runKm > 0 ? Math.max(3, y(0) - y(w.runKm)) : 0;
            const swimH = w.swimKm > 0 ? Math.max(3, y(0) - y(w.swimKm)) : 0;
            const runTop = y(0) - runH;
            return (
              <g key={w.i}>
                {on && <rect x={bx - 2} y={0} width={bw + 4} height={H} rx="8" fill="#fdeadb" />}
                {runH > 0 && (swimH > 0
                  ? <rect x={bx} y={runTop} width={bw} height={runH} fill={COLORS.Run} />
                  : <path d={topRounded(bx, runTop, bw, runH)} fill={COLORS.Run} />)}
                {swimH > 0 && <path d={topRounded(bx, runTop - GAP - swimH, bw, swimH)} fill={COLORS.Swim} />}
                <rect
                  x={bx - 2} y={0} width={bw + 4} height={H} fill="transparent" tabIndex={0} role="button"
                  aria-pressed={on} aria-label={`${range(w)}: run ${w.runKm.toFixed(1)} km, swim ${w.swimKm.toFixed(1)} km`}
                  style={{ cursor: 'pointer', outlineOffset: -2 }} onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setSel(on ? null : w.i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(on ? null : w.i); } }}
                />
              </g>
            );
          })}
        </svg>
        {W && <div className="tip tip-fixed" role="tooltip" style={{ width: TIP_W, left: tipLeft, bottom: tipBottom }}>
          <div className="tip-title">{range(W)}</div>
          <div className="tip-line"><Swatch c={COLORS.Run} /><span>Run</span><b>{W.runKm.toFixed(1)} km</b></div>
          <div className="tip-line"><Swatch c={COLORS.Swim} /><span>Swim</span><b>{W.swimKm.toFixed(1)} km</b></div>
          {cx - tipLeft >= 22 && cx - tipLeft <= TIP_W - 22 && (
            <span className="tip-arrow" style={{ left: cx - tipLeft - 6 }} aria-hidden="true" />
          )}
        </div>}
      </div>
      <div className="week-labels" style={{ paddingLeft: AXIS }}>
        {weeks.map((w) => {
          const next = weeks[w.i + 1];
          // Skip a month label that would sit right next to the following one.
          const crowded = w.i === 0 && next && next.start.getMonth() !== w.start.getMonth();
          const showMon = w.start.getMonth() !== prevMon && !crowded; prevMon = w.start.getMonth();
          return (
            <div key={w.i} style={{ width: x.bandwidth(), marginRight: x.step() - x.bandwidth(), flex: 'none' }}>
              <div>{w.start.getDate()}</div>
              <div className="month-tick">{showMon ? MON[w.start.getMonth()] : ''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Swatch({ c }) {
  return <span className="dot" style={{ width: 10, height: 10, background: c }} aria-hidden="true" />;
}
