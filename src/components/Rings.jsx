import { COLORS } from '../lib/data.js';
import Dot from './Dot.jsx';

const R = 48;
const C = 2 * Math.PI * R;

function Ring({ type, done, target, prevName }) {
  const frac = target > 0 ? Math.min(1, done / target) : 0;
  const over = target > 0 && done > target;
  const caption = target <= 0 ? `no ${type.toLowerCase()}s in ${prevName}` : over ? `+${(done - target).toFixed(1)} km over ${prevName}` : `of ${target.toFixed(1)} km in ${prevName}`;
  const rgb = type === 'Run' ? '229,87,42' : '245,165,36';
  return (
    <div className="ring-col">
      <div className="ring">
        <svg width="116" height="116" viewBox="0 0 116 116" role="img" aria-label={`${type} distance ${done.toFixed(1)} km, ${caption}`} style={{ overflow: 'visible' }}>
          <circle cx="58" cy="58" r={R} fill="none" stroke="#fff8f1" strokeWidth="11" />
          <circle
            cx="58" cy="58" r={R} fill="none" stroke={COLORS[type]} strokeWidth="11" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - frac)} transform="rotate(-90 58 58)"
            style={{ filter: over ? `drop-shadow(0 0 2px rgba(${rgb},0.45)) drop-shadow(0 0 6px rgba(${rgb},0.2))` : 'none', transition: 'stroke-dashoffset .4s ease' }}
          />
        </svg>
        <div className="ring-centre">
          <div className="ring-value">{done.toFixed(1)}</div>
          <div className="small">km</div>
        </div>
      </div>
      <div className="ring-label"><Dot type={type} />{type}</div>
      <div className="small">{caption}</div>
    </div>
  );
}

export default function Rings({ month }) {
  const { totals: t, prev } = month;
  return (
    <section className="hero card-fill" aria-label="Distance against last month">
      <div className="ring-grid">
        <Ring type="Run" done={t.runKm} target={prev.runKm} prevName={prev.name} />
        <Ring type="Swim" done={t.swimKm} target={prev.swimKm} prevName={prev.name} />
      </div>
      <div className="pill-row">
        {month.live && <div className="pill">{month.daysLeft > 0 ? `${month.daysLeft} days left` : 'Last day'}</div>}
      </div>
    </section>
  );
}
