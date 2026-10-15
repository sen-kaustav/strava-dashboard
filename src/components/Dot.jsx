import { COLORS } from '../lib/data.js';

export default function Dot({ type, size = 10 }) {
  return <span className="dot" style={{ width: size, height: size, background: COLORS[type] }} aria-hidden="true" />;
}
