import { useEffect, useRef, useState } from 'react';

/** Current width of an element, kept up to date on resize. */
export function useWidth(initial = 320) {
  const ref = useRef(null);
  const [width, setWidth] = useState(initial);
  useEffect(() => {
    if (!ref.current) return undefined;
    const el = ref.current;
    const update = () => setWidth(Math.round(el.getBoundingClientRect().width) || initial);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [initial]);
  return [ref, width];
}

/** Tiny hash router: '#/', '#/trends', '#/activities'. Works on any static host. */
export function useHashRoute() {
  const read = () => (window.location.hash.replace(/^#/, '') || '/');
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
