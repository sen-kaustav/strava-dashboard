import { useEffect, useRef, useState } from 'react';
import { COLORS } from '../lib/data.js';
import Dot from './Dot.jsx';

function cellBackground(c) {
  if (c.hasRun && c.hasSwim) return `linear-gradient(300deg, ${COLORS.Swim} 50%, ${COLORS.Run} 50%)`;
  if (c.hasRun) return COLORS.Run;
  if (c.hasSwim) return COLORS.Swim;
  return 'transparent';
}

function Tip({ cell }) {
  // Keep the tooltip inside the card: left-align near the left edge, right-align near the right.
  const align = cell.col <= 1 ? 'left' : cell.col >= 5 ? 'right' : 'centre';
  const below = cell.row === 0;
  return (
    <div className={`tip tip-${align} ${below ? 'tip-below' : ''}`} role="tooltip">
      <div className="tip-title">{cell.label}</div>
      {cell.acts.map((a) => (
        <div className="tip-row" key={a.id}>
          <span className="tip-dot"><Dot type={a.type} /></span>
          <div>
            <div className="tip-name">{a.name}</div>
            <div className="tip-meta">{a.dist} · {a.time} · {a.pace}</div>
          </div>
        </div>
      ))}
      <span className="tip-arrow" aria-hidden="true" />
    </div>
  );
}

export default function Calendar({ month }) {
  const [sel, setSel] = useState(null);
  const ref = useRef(null);
  useEffect(() => { setSel(null); }, [month.key]);
  useEffect(() => {
    // Close on any press except on an activity cell (which toggles itself) or inside the tooltip.
    const away = (e) => {
      if (e.target.closest && e.target.closest('.cal-cell-wrap')) return;
      setSel(null);
    };
    const esc = (e) => { if (e.key === 'Escape') setSel(null); };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, []);

  return (
    <section className="card calendar" ref={ref} aria-label={`${month.name} calendar`}>
      <h2>{month.name}</h2>
      <div className="cal-grid cal-head" aria-hidden="true">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="cal-grid">
        {month.cells.map((c) => {
          if (c.blank) return <div key={c.key} />;
          const has = c.acts.length > 0;
          const both = c.hasRun && c.hasSwim;
          const on = sel === c.n;
          const style = {
            background: cellBackground(c),
            color: has ? '#2a1a12' : c.isFuture ? '#b79d8b' : '#6b4f40',
            fontWeight: both ? 700 : 600,
            boxShadow: on ? '0 0 0 2px #fff8f1, 0 0 0 4px #2a1a12' : c.isToday ? '0 0 0 2px #2a1a12' : 'none',
            zIndex: on ? 6 : undefined
          };
          return has ? (
            <div className="cal-cell-wrap" key={c.key} style={{ zIndex: on ? 6 : undefined }}>
              <button
                type="button" className="cal-cell" style={style} aria-expanded={on}
                aria-label={`${c.label}: ${c.acts.map((a) => `${a.name} ${a.dist}`).join(', ')}`}
                onClick={() => setSel(on ? null : c.n)}
              >{c.n}</button>
              {on && <Tip cell={c} />}
            </div>
          ) : (
            <div className="cal-cell" key={c.key} style={style} aria-current={c.isToday ? 'date' : undefined}>{c.n}</div>
          );
        })}
      </div>
    </section>
  );
}
