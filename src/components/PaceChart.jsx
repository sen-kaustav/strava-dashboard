import { useState } from 'react';
import { scaleLinear, line, extent } from 'd3';
import { COLORS } from '../lib/data.js';
import { useWidth } from '../lib/hooks.js';
import { mmss, MON } from '../lib/format.js';

const H = 270;
const AXIS = 40;
const PADX = 10;
const PADY = 18;
const TIP_W = 208;

export default function PaceChart({ kind, acts }) {
  const [wrap, width] = useWidth(316);
  const [selRaw, setSel] = useState(null);
  const color = COLORS[kind];
  const step = kind === 'Run' ? 30 : 15;
  const sel = selRaw !== null && selRaw < acts.length ? selRaw : null; // null = no tooltip until a circle is clicked
  if (acts.length === 0) return <div ref={wrap} className="empty">No {kind.toLowerCase()}s in these 12 weeks.</div>;

  const [mn, mx] = extent(acts, (a) => a.paceSec);
  const lo = Math.floor((mn - 6) / step) * step;
  const hi = Math.ceil((mx + 6) / step) * step;
  const y = scaleLinear().domain([lo, hi]).range([PADY, H - PADY]); // faster pace sits higher
  const xs = acts.length === 1 ? [AXIS + (width - AXIS) / 2] : acts.map((_, i) => AXIS + PADX + (i * (width - AXIS - 2 * PADX)) / (acts.length - 1));
  const ticks = []; for (let t = lo; t <= hi; t += step) ticks.push(t);
  const path = line()(acts.map((a, i) => [xs[i], y(a.paceSec)]));
  const A = sel === null ? null : acts[sel];
  const ax = A ? xs[sel] : 0, ay = A ? y(A.paceSec) : 0;
  const tipLeft = Math.max(0, Math.min(ax - TIP_W / 2, width - TIP_W));
  const below = ay < 150;
  let prev = -1;
  let lastX = -100;

  return (
    <div ref={wrap}>
      <div className="chart-box" style={{ height: H }}>
        <svg width={width} height={H} onClick={() => setSel(null)} role="group" aria-label={`${kind} pace over the last 12 weeks`} style={{ overflow: 'visible', display: 'block' }}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={AXIS} x2={width} y1={y(t)} y2={y(t)} stroke="#e8d3c2" />
              <text x={AXIS - 6} y={y(t) + 4} textAnchor="end" className="axis-text">{mmss(t)}</text>
            </g>
          ))}
          <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {acts.map((a, i) => (
            <circle key={a.id} cx={xs[i]} cy={y(a.paceSec)} r={i === sel ? 7 : 5} fill={color}
              stroke="#fff8f1" strokeWidth="2" style={i === sel ? { filter: 'none' } : undefined} />
          ))}
          {A && <circle cx={ax} cy={ay} r="10" fill="none" stroke="#2a1a12" strokeWidth="2" />}
          {acts.map((a, i) => (
            <circle
              key={`hit-${a.id}`} cx={xs[i]} cy={y(a.paceSec)} r="14" fill="transparent" tabIndex={0} role="button"
              aria-pressed={i === sel} aria-label={`${a.longDate}, ${a.dist}, ${a.pace}`} style={{ cursor: 'pointer' }} onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => { e.stopPropagation(); setSel(i === sel ? null : i); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(i === sel ? null : i); } }}
            />
          ))}
        </svg>
        {A && <div className="tip tip-fixed tip-pace" role="tooltip" style={{ width: TIP_W, left: tipLeft, ...(below ? { top: ay + 20, bottom: 'auto' } : { bottom: H - ay + 20 }) }}>
          <div className="tip-title">{A.longDate}</div>
          <div className="tip-name tip-soft">{A.name}</div>
          <div className="tip-meta">{A.dist} · {A.time}</div>
          <div className="tip-pace-big">{A.pace}</div>
          {ax - tipLeft >= 22 && ax - tipLeft <= TIP_W - 22 && (
            <span className="tip-arrow" style={{ left: ax - tipLeft - 6, ...(below ? { top: -5 } : { bottom: -5 }) }} aria-hidden="true" />
          )}
        </div>}
      </div>
      <div className="month-axis" style={{ height: 18 }}>
        {acts.map((a, i) => {
          const mo = a.start.getMonth();
          // New month, and far enough from the previous label not to collide with it.
          const show = mo !== prev && xs[i] - lastX >= 44;
          if (mo !== prev) prev = mo;
          if (show) lastX = xs[i];
          return show ? <span key={a.id} style={{ left: xs[i] - 6 }}>{MON[mo]}</span> : null;
        })}
      </div>
    </div>
  );
}
