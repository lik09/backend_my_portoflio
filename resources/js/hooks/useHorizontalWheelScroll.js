import { useEffect, useRef } from 'react';

// Converts a plain vertical mouse-wheel/trackpad scroll into horizontal
// scrolling, because app.css hides all scrollbars globally — on a desktop
// with no touch/trackpad there'd otherwise be no way to scroll horizontally
// at all. `selector`, if given, targets a descendant of containerRef's
// element (e.g. antd Table's internal `.ant-table-content`); omit it to
// target containerRef's element directly.
//
// Must be a native, non-passive `wheel` listener — React attaches its
// synthetic wheel listener as passive, so e.preventDefault() inside a JSX
// onWheel handler is silently ignored by the browser.
//
// Wheel input is accumulated into a target and eased toward every frame
// (instead of snapping scrollLeft instantly) so it glides like native
// touch/trackpad momentum scrolling rather than jumping in discrete steps.
export function useHorizontalWheelScroll(containerRef, { selector, enabled = true } = {}) {
  const targetRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || !enabled) return;
    const el = selector ? root.querySelector(selector) : root;
    if (!el) return;

    targetRef.current = el.scrollLeft;

    const EASE = 0.2; // 0-1: higher = snappier/less smooth, lower = smoother/slower catch-up

    const step = () => {
      const current = el.scrollLeft;
      const diff = targetRef.current - current;
      if (Math.abs(diff) < 0.5) {
        el.scrollLeft = targetRef.current;
        rafRef.current = null;
        return;
      }
      el.scrollLeft = current + diff * EASE;
      rafRef.current = requestAnimationFrame(step);
    };

    const handleWheel = (e) => {
      if (el.scrollWidth <= el.clientWidth) return; // nothing to scroll — let the page scroll normally
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      e.preventDefault();
      const max = el.scrollWidth - el.clientWidth;
      targetRef.current = Math.min(Math.max(targetRef.current + delta, 0), max);
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(step);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, selector, enabled]);
}
