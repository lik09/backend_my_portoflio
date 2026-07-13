import { useRef } from 'react';

const DRAG_THRESHOLD = 3; // px of movement before a pointerdown counts as a drag, not a click/tap

// Click/touch/pen-and-drag horizontal scrolling via Pointer Events (one set
// of handlers covers mouse, touch, and pen — needed because a plain mouse
// has no native "drag to pan" gesture). `selector`, if given, targets a
// descendant of containerRef's element (e.g. antd Table's internal
// `.ant-table-content`) as the element actually being scrolled; omit it to
// scroll containerRef's element directly. Spread the returned handlers onto
// the element `containerRef` is attached to.
export function useDragToScroll(containerRef, { selector } = {}) {
  const dragRef = useRef({ isDown: false, isDragging: false, startX: 0, scrollLeft: 0, pointerId: null });

  const getEl = () => {
    const root = containerRef.current;
    if (!root) return null;
    return selector ? root.querySelector(selector) : root;
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

    el.scrollLeft = drag.scrollLeft - delta;
  };

  const handleDragEnd = () => {
    const el = getEl();
    const drag = dragRef.current;
    if (el && drag.isDragging && el.releasePointerCapture && drag.pointerId != null) {
      try { el.releasePointerCapture(drag.pointerId); } catch { /* no-op */ }
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
