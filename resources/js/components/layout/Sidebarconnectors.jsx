import React, { useLayoutEffect, useState } from 'react';

const HOOK_LEFT_OFFSET = 12;   // hook's vertical segment, relative to each item's own left edge
const HOOK_WIDTH = 28;         // horizontal reach of the hook curve
const HOOK_HEIGHT = 18;        // vertical reach of the hook curve before it flattens
const HOOK_RADIUS = 10;        // corner radius of the curve
const TRUNK_OFFSET = 12;       // trunk's x position, relative to each item's own left edge
const STROKE_WIDTH = 1.5;

/**
 * Measures the currently-open menu groups inside `containerRef` and returns
 * the line/path data needed to draw a continuous trunk + hook connector for
 * each group, with segments on the path to the active item pre-colored.
 *
 * This exists instead of a CSS ::before/::after approach because that
 * approach kept losing to antd's own overflow rules and cssinjs-injected
 * styles no matter how many overrides were layered on — positions are
 * measured here from real rendered boxes, so there's nothing left to clip
 * and no specificity fight to lose.
 */
export function useMenuConnectors(containerRef, deps) {
  const [groups, setGroups] = useState([]);

  useLayoutEffect(() => {
    let cancelled = false;
    let waitForContainerRaf;
    const cleanupFns = [];

    const setup = () => {
      const container = containerRef.current;
      if (!container) {
        // The parent <div ref={containerRef}> can still be null here on the
        // very first commit: React commits refs/layout-effects in post-order
        // (children complete before their own parent), so this child's
        // layout effect can run before the parent div's ref is attached.
        // Retry next frame instead of giving up permanently — by then the
        // parent's ref is guaranteed to be set. This is why the connectors
        // used to only ever appear after a remount (e.g. toggling collapse)
        // and never on a cold first load.
        if (!cancelled) waitForContainerRaf = requestAnimationFrame(setup);
        return;
      }

    const measure = () => {
      const containerRect = container.getBoundingClientRect();
      const submenus = Array.from(container.querySelectorAll('.ant-menu-submenu'));
      const nextGroups = [];

      submenus.forEach((submenuEl, groupIndex) => {
        if (!submenuEl.classList.contains('ant-menu-submenu-open')) return;

        const titleEl = submenuEl.querySelector('.ant-menu-submenu-title');
        const subEl = submenuEl.querySelector('.ant-menu-sub');
        if (!titleEl || !subEl) return;

        const items = Array.from(subEl.querySelectorAll('.ant-menu-item'));
        if (items.length === 0) return;

        const titleRect = titleEl.getBoundingClientRect();
        const selectedIndex = items.findIndex((el) =>
          el.classList.contains('ant-menu-item-selected')
        );

        // Antd's own .ant-menu-submenu-selected class fires whenever ANY
        // descendant item is selected — that matches what we want (path
        // highlighting all the way from the header down), so drive our own
        // class the same way for consistency with the trunk/hook coloring.
        submenuEl.classList.toggle('connector-header-active', selectedIndex >= 0);

        const toY = (clientY) => clientY - containerRect.top + container.scrollTop;
        const toX = (clientX) => clientX - containerRect.left + container.scrollLeft;

        const itemRects = items.map((el) => el.getBoundingClientRect());
        const baseX = toX(itemRects[0].left);
        const trunkX = baseX + TRUNK_OFFSET;
        const hookX = baseX + HOOK_LEFT_OFFSET;

        const segments = [];

        // Header stub: header's own bottom edge down to the first item's top.
        // Green whenever ANY item in this group is selected — the path
        // always starts at the header, so item 1 and item n both show the
        // same connected-from-the-top look, not just whichever item happens
        // to be first.
        segments.push({
          x: trunkX,
          y1: toY(titleRect.bottom),
          y2: toY(itemRects[0].top),
          active: selectedIndex >= 0,
        });

        // One trunk segment per item (except the last) — that item's own
        // top edge down to the next item's top edge, so segments always
        // meet edge-to-edge with zero gap regardless of item height. This
        // segment leads INTO item i+1, and it's green whenever the selected
        // item is at or past that point — so there's an unbroken green line
        // from the header all the way down to whichever item is clicked.
        for (let i = 0; i < items.length - 1; i++) {
          segments.push({
            x: trunkX,
            y1: toY(itemRects[i].top),
            y2: toY(itemRects[i + 1].top),
            active: i + 1 <= selectedIndex,
          });
        }

        // Last item: trunk stops at its own hook attach point — green
        // whenever the path reaches this far (the last item is selected).
        const lastIndex = items.length - 1;
        segments.push({
          x: trunkX,
          y1: toY(itemRects[lastIndex].top),
          y2: toY(itemRects[lastIndex].top) + (HOOK_HEIGHT - HOOK_RADIUS),
          active: lastIndex <= selectedIndex,
        });

        const hooks = items.map((el, i) => ({
          x: hookX,
          top: toY(itemRects[i].top),
          // Deliberately strict equality here, UNLIKE the segments above:
          // the trunk line shows the full path down to whichever item is
          // clicked, but the curve into each item's own text should only
          // highlight for that specific item — items the path merely
          // passes behind keep their default-colored hook curve.
          active: i === selectedIndex,
        }));

        nextGroups.push({ id: groupIndex, segments, hooks });
      });

      setGroups(nextGroups);
    };

    // Returns true if every open group's items report real (nonzero)
    // dimensions — i.e. antd has actually finished laying them out, not
    // still mid-mount/mid-transition with collapsed/zero-height boxes.
    const isLayoutReady = () => {
      const submenus = Array.from(container.querySelectorAll('.ant-menu-submenu-open'));
      if (submenus.length === 0) return false;
      return submenus.every((submenuEl) => {
        const subEl = submenuEl.querySelector('.ant-menu-sub');
        if (!subEl) return false;
        const items = subEl.querySelectorAll('.ant-menu-item');
        if (items.length === 0) return false;
        return Array.from(items).every((el) => el.getBoundingClientRect().height > 0);
      });
    };

    measure();

    // Fixed delays can't reliably predict when antd's own mount/layout
    // settles — it varies by device speed, font load time, and whether
    // this is a cold page load vs. a route change. Poll every frame
    // instead, up to ~3s, and re-measure as soon as real dimensions show
    // up; bail out early the moment layout looks ready so this doesn't
    // keep running forever on every frame in the common case.
    let attemptsLeft = 180; // ~3s at 60fps
    let rafId;
    const pollUntilReady = () => {
      if (attemptsLeft <= 0) return;
      attemptsLeft -= 1;
      if (isLayoutReady()) {
        measure();
        return;
      }
      measure();
      rafId = requestAnimationFrame(pollUntilReady);
    };
    rafId = requestAnimationFrame(pollUntilReady);

    window.addEventListener('load', measure);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }

    // Antd's submenu expand/collapse motion takes ~300ms, during which
    // each item's position shifts progressively as the container's height
    // animates. A single re-measure at the start (triggered by the class
    // change) leaves the lines jumping straight to the final layout instead
    // of following the animation — so once a class change is seen, keep
    // re-measuring every frame for the animation's duration before settling.
    const ANIMATION_TRACK_MS = 320;
    let trackRafId;
    let trackUntil = 0;
    const trackDuringAnimation = () => {
      measure();
      if (performance.now() < trackUntil) {
        trackRafId = requestAnimationFrame(trackDuringAnimation);
      }
    };
    const startTracking = () => {
      trackUntil = performance.now() + ANIMATION_TRACK_MS;
      cancelAnimationFrame(trackRafId);
      trackRafId = requestAnimationFrame(trackDuringAnimation);
    };

    const resizeObserver = new ResizeObserver(startTracking);
    resizeObserver.observe(container);

    const mutationObserver = new MutationObserver(startTracking);
    mutationObserver.observe(container, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class'],
    });

    // Final safety net: every other trigger here (raf polling, load event,
    // fonts.ready, resize/mutation observers) is event-driven and can in
    // principle all miss the exact moment layout becomes ready on some
    // slower device or unusual navigation path. A cheap periodic re-measure
    // guarantees the connectors self-heal within a second even if that
    // happens, at negligible cost since measure() is a handful of DOM reads.
    const safetyInterval = setInterval(measure, 100);

      cleanupFns.push(() => {
        cancelAnimationFrame(rafId);
        cancelAnimationFrame(trackRafId);
        clearInterval(safetyInterval);
        window.removeEventListener('load', measure);
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      });
    };

    setup();

    return () => {
      cancelled = true;
      cancelAnimationFrame(waitForContainerRaf);
      cleanupFns.forEach((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return groups;
}

export default function SidebarConnectors({ containerRef, deps, activeColor, defaultColor }) {
  const groups = useMenuConnectors(containerRef, deps);

  // Flatten everything into one list of drawable pieces, then split into
  // inactive vs active so active pieces render last (on top). Without this,
  // whichever item happens to come later in DOM order could paint its
  // (inactive) line over an earlier item's active green one, making the
  // highlight look broken depending on which item was clicked.
  const lines = [];
  const hookPaths = [];

  groups.forEach((group) => {
    group.segments.forEach((seg, i) => {
      lines.push({ key: `g${group.id}-seg-${i}`, ...seg });
    });
    group.hooks.forEach((hook, i) => {
      hookPaths.push({ key: `g${group.id}-hook-${i}`, ...hook });
    });
  });

  const inactiveLines = lines.filter((l) => !l.active);
  const activeLines = lines.filter((l) => l.active);
  const inactiveHooks = hookPaths.filter((h) => !h.active);
  const activeHooks = hookPaths.filter((h) => h.active);

  const renderLine = (seg) => (
    <line
      key={seg.key}
      x1={seg.x}
      y1={seg.y1}
      x2={seg.x}
      y2={seg.y2}
      stroke={seg.active ? activeColor : defaultColor}
      strokeWidth={STROKE_WIDTH}
    />
  );

  const renderHook = (hook) => {
    const color = hook.active ? activeColor : defaultColor;
    const flatY = hook.top + HOOK_HEIGHT;
    return (
      <path
        key={hook.key}
        d={`M ${hook.x} ${hook.top} L ${hook.x} ${flatY - HOOK_RADIUS} Q ${hook.x} ${flatY} ${hook.x + HOOK_RADIUS} ${flatY} L ${hook.x + HOOK_WIDTH - HOOK_RADIUS} ${flatY}`}
        fill="none"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
      />
    );
  };

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 1,
      }}
    >
      {/* Painted first = sits underneath */}
      {inactiveLines.map(renderLine)}
      {inactiveHooks.map(renderHook)}
      {/* Painted last = always on top, regardless of which item is active */}
      {activeLines.map(renderLine)}
      {activeHooks.map(renderHook)}
    </svg>
  );
}