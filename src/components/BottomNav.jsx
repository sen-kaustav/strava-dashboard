import { HomeIcon, TrendsIcon, ListIcon } from './Icons.jsx';

const ITEMS = [
  { href: '#/', label: 'Home', Icon: HomeIcon, match: (r) => r === '/' },
  { href: '#/trends', label: 'Trends', Icon: TrendsIcon, match: (r) => r.startsWith('/trends') },
  { href: '#/activities', label: 'Activities', Icon: ListIcon, match: (r) => r.startsWith('/activities') }
];

export default function BottomNav({ route }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {ITEMS.map(({ href, label, Icon, match }) => {
        const on = match(route);
        return (
          <a key={label} href={href} className={on ? 'nav-item on' : 'nav-item'} aria-current={on ? 'page' : undefined}>
            <span className="nav-pill"><Icon /></span>
            {label}
          </a>
        );
      })}
    </nav>
  );
}
