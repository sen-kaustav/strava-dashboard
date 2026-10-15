import MonthNav from '../components/MonthNav.jsx';
import Rings from '../components/Rings.jsx';
import Calendar from '../components/Calendar.jsx';
import Dot from '../components/Dot.jsx';

export default function Home({ month, nav }) {
  const t = month.totals;
  return (
    <>
      <header className="page-head">
        <MonthNav {...nav} />
        <div className="small head-line">{month.dateLine}</div>
        <h1>{month.live ? `${month.name} so far` : month.name}</h1>
      </header>
      <Rings month={month} />
      <section className="kpis" aria-label="Month summary">
        <div className="kpi"><div className="label"><Dot type="Run" size={8} />Runs</div><div className="kpi-big">{t.runs}</div></div>
        <div className="kpi"><div className="label"><Dot type="Swim" size={8} />Swims</div><div className="kpi-big">{t.swims}</div></div>
        <div className="kpi">
          <div className="label">Avg pace</div>
          <div className="kpi-pace"><Dot type="Run" size={8} />{t.runPace}<span className="unit">/km</span></div>
          <div className="kpi-pace"><Dot type="Swim" size={8} />{t.swimPace}<span className="unit">/100m</span></div>
        </div>
      </section>
      <Calendar month={month} />
    </>
  );
}
