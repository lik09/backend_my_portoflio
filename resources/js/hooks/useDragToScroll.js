import { useRef } from 'react';

const DRAG_THRESHOLD = 3; // px of movement before a pointerdown counts as a drag, not a click/tap

// Click/touch/pen-and-drag horizontal scrolling via Pointer Events (one set
// of handlers covers mouse, touch, and pen — needed because a plain mouse
// has no native "drag to pan" gesture). `selector`, if given, targets a
// descendant of containerRef's element (e.g. antd Table's internal
// `.ant-table-content`) as the element actually being scrolled; omit it to
// scroll containerRef's element directly. Spread the returned handlers onto
// the element `containerRef` is attached to.
//
// scrollLeft writes are batched into requestAnimationFrame (same pattern as
// useHorizontalWheelScroll) instead of being applied synchronously on every
// pointermove. On iOS Safari especially, pointermove can fire faster than
// the paint cycle, and writing scrollLeft directly on every event forces a
// layout/paint each time — competing with canvas-heavy content (e.g. G2Plot
// charts) for the main thread and producing visible jank. Batching to one
// write per animation frame keeps the drag perfectly responsive (still
// tracks the finger 1:1, no easing/lag) while capping the write rate to the
// display's actual refresh rate.
export function useDragToScroll(containerRef, { selector } = {}) {
  const dragRef = useRef({ isDown: false, isDragging: false, startX: 0, scrollLeft: 0, pointerId: null });
  const pendingRef = useRef(null); // scrollLeft value queued for the next frame
  const rafRef = useRef(null);

  const getEl = () => {
    const root = containerRef.current;
    if (!root) return null;
    return selector ? root.querySelector(selector) : root;
  };

  const flush = (el) => {
    if (pendingRef.current != null) {
      el.scrollLeft = pendingRef.current;
      pendingRef.current = null;
    }
    rafRef.current = null;
  };

  const handleDragStart = (e) => {
    const el = getEl();
    if (!el) return;
    dragRef.current = {
      isDown: true,
      isDragging: false,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      pointerId: e.pointerId,
    };
  };

  const handleDragMove = (e) => {
    const el = getEl();
    const drag = dragRef.current;
    if (!drag.isDown || !el) return;

    const delta = e.clientX - drag.startX;

    if (!drag.isDragging) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return; // still just a click/tap so far
      drag.isDragging = true;
      el.style.cursor = 'grabbing';
      // Capture the pointer so we keep receiving move events even if the
      // finger/cursor leaves the element bounds mid-drag.
      if (el.setPointerCapture && drag.pointerId != null) {
        try { el.setPointerCapture(drag.pointerId); } catch { /* no-op */ }
      }
    }

    // Queue the target scrollLeft; only the latest value per frame is ever
    // written, so a burst of pointermove events collapses into one write.
    pendingRef.current = drag.scrollLeft - delta;
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => flush(el));
    }
  };

  const handleDragEnd = () => {
    const el = getEl();
    const drag = dragRef.current;
    if (el && drag.isDragging && el.releasePointerCapture && drag.pointerId != null) {
      try { el.releasePointerCapture(drag.pointerId); } catch { /* no-op */ }
    }
    // Make sure the last queued position is actually applied even if a
    // frame hasn't ticked yet between the final move and the release.
    if (el && rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      flush(el);
    }
    dragRef.current.isDown = false;
    dragRef.current.isDragging = false;
    if (el) el.style.cursor = el.scrollWidth > el.clientWidth ? 'grab' : 'default';
  };

  return {
    onPointerDown: handleDragStart,
    onPointerMove: handleDragMove,
    onPointerUp: handleDragEnd,
    onPointerLeave: handleDragEnd,
    onPointerCancel: handleDragEnd,
  };
}