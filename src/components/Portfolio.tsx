"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Sections from "./Sections";
import GridConsole from "./GridConsole";
import GridEngine from "../lib/engine/engine";
import { computeGeom, frameBox, snapRectToFrame } from "../lib/engine/grid";
import { DEFAULT_PARAMS, type Params } from "../lib/config";
import { SECTIONS } from "../content";
import type { FrameRect, GridGeom } from "../lib/types";

// Section-to-section navigation tuning. One gesture advances one section; the
// page is locked (input swallowed, lines suppressed) for scrollMs + cooldownMs.
const NAV = {
  scrollMs: 560, // programmatic scroll animation to the next section
  cooldownMs: 300, // extra pause after arrival before lines may (re)spawn
  wheelIdle: 140, // trackpad momentum must go quiet this long before a new move
  swipe: 40, // min vertical travel (px) for a touch swipe to count
};

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Smoothly scroll the window to `to` over `duration` ms; returns a canceller.
 * A hand-rolled rAF tween (not `scrollTo({behavior})`) so the duration is exact
 * and identical across browsers — the nav lock is timed against it. */
function animateScroll(to: number, duration: number): () => void {
  const start = window.scrollY;
  const dist = to - start;
  if (duration <= 0 || Math.abs(dist) < 1) {
    window.scrollTo(0, to);
    return () => {};
  }
  let raf = 0;
  const t0 = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, start + dist * easeInOutCubic(p));
    if (p < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

export default function Portfolio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GridEngine | null>(null);
  const frameEls = useRef<Record<string, HTMLDivElement | null>>({});
  const sectionEls = useRef<Record<string, HTMLElement | null>>({});
  const paramsRef = useRef<Params>(DEFAULT_PARAMS);
  const geomRef = useRef<GridGeom | null>(null);
  const activeRef = useRef<string>(SECTIONS[0].id);

  // --- section-to-section scroll lock ---------------------------------------
  const indexRef = useRef(0); // current section index (single source of truth)
  const lockRef = useRef(false); // true while a move animates + cools down
  const readyRef = useRef(true); // false until trackpad momentum goes quiet
  const lockTimerRef = useRef(0); // release-lock / settle timer
  const cancelScrollRef = useRef<() => void>(() => {});

  // Debug tools (the Grid Console) are only available with ?debug=1 in the URL.
  // Guarded for SSR: `location` is undefined while Next prerenders on the server.
  const debug =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "1";

  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  const [consoleOpen, setConsoleOpen] = useState(debug);
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

  const patchParams = useCallback(
    (patch: Partial<Params>) => setParams((p) => ({ ...p, ...patch })),
    [],
  );

  // The engine's single source of truth for where content is: the section's
  // *real* frame box, measured live and snapped to the grid so lines route
  // around it. Returns null while unmeasurable (before layout).
  const measureFrame = useCallback((id: string): FrameRect | null => {
    const g = geomRef.current;
    const el = frameEls.current[id];
    if (!g || !el) return null;
    const r = el.getBoundingClientRect();
    return snapRectToFrame(g, r);
  }, []);

  // Recompute grid geometry, position the DOM frames (width + horizontal
  // offset only — height/vertical is natural flow), then re-settle the engine.
  const relayout = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const w = window.innerWidth;
    const mobile = w < 720;
    // On phones the desktop cell is too coarse (~9 columns) to fit a comfortable
    // content column AND routing gutters. Use a denser grid (~16 columns) so the
    // frame can be near-full-width and still leave gutters for the lines.
    const sp = mobile
      ? Math.max(20, Math.min(paramsRef.current.gridSpacing, Math.round(w / 16)))
      : paramsRef.current.gridSpacing;
    const geom = computeGeom(w, window.innerHeight, sp);
    geomRef.current = geom;
    for (const s of SECTIONS) {
      const el = frameEls.current[s.id];
      if (!el) continue;
      // Mobile: one near-full-width column for every section (handoff §3).
      // Width is grid-snapped (whole columns); the frame is then centered in the
      // viewport rather than pinned to a grid node — snapping the *column* can't
      // divide the viewport symmetrically (an off-by-half-cell shift, ~12px and
      // very visible on phones). The engine re-measures this real rect and snaps
      // it outward for line routing, so centering doesn't affect the lines.
      const box = frameBox(geom, mobile ? 0.82 : s.frameWidth);
      el.style.setProperty("--fx", `${Math.round((geom.w - box.w) / 2)}px`);
      el.style.setProperty("--fw", `${box.w}px`);
    }
    engine.setGeom(geom);
    engine.settle(activeRef.current);
  }, []);

  // The scrollY that puts section `id` in the vertical center of the viewport.
  // Section-center (not top) so a section slightly taller than the viewport is
  // still framed symmetrically instead of clipped only at the bottom.
  const targetForId = useCallback((id: string): number => {
    const el = sectionEls.current[id];
    if (!el) return window.scrollY;
    const r = el.getBoundingClientRect();
    const center = r.top + window.scrollY + r.height / 2;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return Math.max(0, Math.min(max, Math.round(center - window.innerHeight / 2)));
  }, []);

  // Which section is closest to the viewport center right now (used to seed the
  // index on mount and to re-center after a stray/manual scroll).
  const nearestIndex = useCallback((): number => {
    const vc = window.scrollY + window.innerHeight / 2;
    let best = 0;
    let bestD = Infinity;
    SECTIONS.forEach((s, i) => {
      const el = sectionEls.current[s.id];
      if (!el) return;
      const r = el.getBoundingClientRect();
      const c = r.top + window.scrollY + r.height / 2;
      const d = Math.abs(c - vc);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  }, []);

  // The one entry point for changing sections. Clamps to range, centers the
  // target, and locks all input + suppresses lines until the scroll finishes and
  // the cooldown elapses — then settles the engine so lines respawn against the
  // now-stationary frame. All gestures, rail dots, and CTAs route through here.
  const goToIndex = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(SECTIONS.length - 1, i));
      const id = SECTIONS[clamped].id;
      indexRef.current = clamped;
      activeRef.current = id;
      setActive(id);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dur = reduced ? 0 : NAV.scrollMs;

      engineRef.current?.setScrolling(); // hide lines for the whole transition
      lockRef.current = true;
      cancelScrollRef.current();
      cancelScrollRef.current = animateScroll(targetForId(id), dur);

      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = window.setTimeout(() => {
        lockRef.current = false;
        engineRef.current?.settle(activeRef.current);
      }, dur + NAV.cooldownMs);
    },
    [targetForId],
  );

  // Reflect theme / frame-border to <html> and push params to the engine.
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.theme = params.theme;
    el.dataset.frameBorder = params.frameBorder;
    paramsRef.current = params;
    engineRef.current?.setParams(params);
  }, [params]);

  // Grid spacing changes the lattice → full re-layout.
  useEffect(() => {
    relayout();
  }, [params.gridSpacing, relayout]);

  // Engine lifecycle: create, lay out, observe sections, wire scroll + keys.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GridEngine(canvas, {
      frameProvider: measureFrame,
    });
    engineRef.current = engine;
    engine.setParams(paramsRef.current);
    engine.start();
    relayout(); // sets geom + first settle

    // Seed the index from wherever the browser restored the scroll position.
    indexRef.current = nearestIndex();

    // Rail highlight + current section id. The root is collapsed to a thin band
    // at the viewport's vertical center (rootMargin -48%/-48%), so the active
    // section is whichever one is crossing the centerline. A visible-ratio
    // threshold does NOT work here: sections taller than ~1.8x the viewport can
    // never reach it, so they'd never become active. Kept alongside the index
    // model as the source of truth for the *highlight* and to reconcile the
    // index after any stray/manual scroll (scrollbar drag).
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            activeRef.current = e.target.id;
            indexRef.current = SECTIONS.findIndex((s) => s.id === e.target.id);
            setActive(e.target.id);
          }
        }
      },
      { rootMargin: "-48% 0px -48% 0px", threshold: 0 },
    );
    for (const s of SECTIONS) {
      const el = sectionEls.current[s.id];
      if (el) io.observe(el);
    }

    // Guards for input that shouldn't be hijacked.
    const inConsole = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest(".grid-console");
    const isTyping = (el: Element | null) => {
      const tag = el?.tagName;
      return tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
    };
    const isActivatable = (el: Element | null) =>
      !!el &&
      (["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(el.tagName) ||
        !!el.closest("[role='tablist']"));

    // Move one section in `dir` (±1) if that stays in range and we're not locked.
    const step = (dir: number) => {
      if (lockRef.current) return;
      const next = indexRef.current + dir;
      if (next < 0 || next >= SECTIONS.length || next === indexRef.current) return;
      goToIndex(next);
    };

    // Lines are suppressed for the whole locked transition (goToIndex settles
    // them after the cooldown). This handler only keeps the hero cue / back-to-
    // top in sync and, for any scroll that slipped past the lock (scrollbar
    // drag), snaps back to center the nearest section — the page must never rest
    // between two sections.
    let settleTimer = 0;
    const onScroll = () => {
      engineRef.current?.setScrolling();
      if (!lockRef.current) {
        clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => {
          if (!lockRef.current) goToIndex(nearestIndex());
        }, 140);
      }
      const s = window.scrollY > 40;
      if (s !== scrolledRef.current) {
        scrolledRef.current = s;
        setScrolled(s);
      }
    };

    // Wheel: one discrete gesture = one move. `readyRef` gates on trackpad
    // momentum going quiet (wheelIdle) so a single flick can't cascade sections.
    let wheelIdleTimer = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom — leave it to the browser
      if (inConsole(e.target)) return; // the debug console scrolls normally
      e.preventDefault();
      clearTimeout(wheelIdleTimer);
      wheelIdleTimer = window.setTimeout(() => {
        readyRef.current = true;
      }, NAV.wheelIdle);
      if (lockRef.current || !readyRef.current || Math.abs(e.deltaY) < 4) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      const next = indexRef.current + dir;
      if (next < 0 || next >= SECTIONS.length) return;
      readyRef.current = false; // consume until momentum stops
      goToIndex(next);
    };

    // Touch: block native scroll and turn each swipe into a single section move.
    let touchY = 0;
    let touchX = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
      touchX = e.touches[0].clientX;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (inConsole(e.target)) return;
      e.preventDefault(); // no native scroll / overscroll / pull-to-refresh
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (inConsole(e.target)) return;
      const t = e.changedTouches[0];
      const dy = touchY - t.clientY;
      const dx = touchX - t.clientX;
      if (Math.abs(dy) < NAV.swipe || Math.abs(dy) < Math.abs(dx)) return; // tap / horizontal
      step(dy > 0 ? 1 : -1);
    };

    const onResize = () => {
      relayout();
      // Keep the active section centered across a viewport / address-bar change.
      cancelScrollRef.current();
      animateScroll(targetForId(SECTIONS[indexRef.current].id), 0);
    };

    const onKey = (e: KeyboardEvent) => {
      if (debug && (e.key === "h" || e.key === "H") && !e.metaKey && !e.ctrlKey) {
        if (!isTyping(e.target as Element)) {
          setConsoleOpen((o) => !o);
          return;
        }
      }
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (isTyping(el)) return;
      let dir = 0;
      let jump = -1;
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          dir = 1;
          break;
        case "ArrowUp":
        case "PageUp":
          dir = -1;
          break;
        case " ":
          if (isActivatable(el)) return; // Space activates a focused button/link
          dir = e.shiftKey ? -1 : 1;
          break;
        case "Home":
          jump = 0;
          break;
        case "End":
          jump = SECTIONS.length - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      if (jump >= 0) {
        if (jump !== indexRef.current && !lockRef.current) goToIndex(jump);
      } else {
        step(dir);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);

    return () => {
      engine.stop();
      io.disconnect();
      clearTimeout(settleTimer);
      clearTimeout(wheelIdleTimer);
      clearTimeout(lockTimerRef.current);
      cancelScrollRef.current();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      engineRef.current = null;
    };
  }, [relayout, measureFrame, debug, goToIndex, nearestIndex, targetForId]);

  const goTo = (id: string) => {
    const i = SECTIONS.findIndex((s) => s.id === id);
    if (i >= 0) goToIndex(i);
  };

  return (
    <>
      <canvas ref={canvasRef} className="grid-canvas" aria-hidden="true" />

      <nav className="rail" aria-label="sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={s.id === active ? "active" : ""}
            aria-label={s.label}
            aria-current={s.id === active}
            onClick={() => goTo(s.id)}
          />
        ))}
      </nav>

      <Sections
        setFrameEl={(id, el) => (frameEls.current[id] = el)}
        setSectionEl={(id, el) => (sectionEls.current[id] = el)}
      />

      <button
        className={`scroll-cta ${scrolled ? "hidden" : ""}`}
        onClick={() => goTo(SECTIONS[1].id)}
        aria-label="Scroll down"
      >
        <span>scroll</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <button
        className={`to-top ${scrolled ? "" : "hidden"}`}
        onClick={() => goTo(SECTIONS[0].id)}
        aria-label="Back to top"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>

      {debug && consoleOpen && (
        <GridConsole
          params={params}
          onChange={patchParams}
          onClose={() => setConsoleOpen(false)}
        />
      )}
    </>
  );
}
