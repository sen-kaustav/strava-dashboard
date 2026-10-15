import { useEffect, useMemo, useState } from 'react';
import { buildMonth, loadActivities, monthKeyOf } from './lib/data.js';
import { useHashRoute } from './lib/hooks.js';
import BottomNav from './components/BottomNav.jsx';
import Home from './pages/Home.jsx';
import Trends from './pages/Trends.jsx';
import Activities from './pages/Activities.jsx';

export default function App() {
  const route = useHashRoute();
  const today = useMemo(() => new Date(), []);
  const nowKey = monthKeyOf(today.getFullYear(), today.getMonth());
  const [all, setAll] = useState(null);
  const [error, setError] = useState(null);
  const [key, setKey] = useState(nowKey);

  useEffect(() => {
    loadActivities().then(setAll).catch((e) => setError(e.message));
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [route]);

  const minKey = all && all.length ? Math.min(all[0].monthKey, nowKey) : nowKey;
  const month = useMemo(() => (all ? buildMonth(all, key, today) : null), [all, key, today]);
  const nav = {
    canPrev: key > minKey,
    canNext: key < nowKey,
    onPrev: () => setKey((k) => Math.max(minKey, k - 1)),
    onNext: () => setKey((k) => Math.min(nowKey, k + 1))
  };

  let page;
  if (error) page = <p className="empty" role="alert">{error}</p>;
  else if (!all) page = <p className="empty">Loading activities…</p>;
  else if (route.startsWith('/trends')) page = <Trends all={all} today={today} route={route} month={month} nav={nav} />;
  else if (route.startsWith('/activities')) page = <Activities month={month} acts={all.filter((a) => a.monthKey === key)} nav={nav} />;
  else page = <Home month={month} nav={nav} />;

  return (
    <div className="app">
      <main className="page">{page}</main>
      <BottomNav route={route} />
    </div>
  );
}
