"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Sections from "./Sections";
import GridConsole from "./GridConsole";
import GridEngine from "../lib/engine/engine";
import { computeGeom, frameBox, snapRectToFrame } from "../lib/engine/grid";
import { DEFAULT_PARAMS, type Params } from "../lib/config";
import { SECTIONS } from "../content";
import type { FrameRect, GridGeom } from "../lib/types";

export default function Portfolio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GridEngine | null>(null);
  const frameEls = useRef<Record<string, HTMLDivElement | null>>({});
  const sectionEls = useRef<Record<string, HTMLElement | null>>({});
  const paramsRef = useRef<Params>(DEFAULT_PARAMS);
  const geomRef = useRef<GridGeom | null>(null);
  const activeRef = useRef<string>(SECTIONS[0].id);

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

  // The section's on-screen band (viewport px) — the engine clips that section's
  // lines to it so they never paint over a neighbour sharing the viewport.
  const measureSectionBand = useCallback((id: string) => {
    const el = sectionEls.current[id];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom };
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
      sectionBand: measureSectionBand,
    });
    engineRef.current = engine;
    engine.setParams(paramsRef.current);
    engine.start();
    relayout(); // sets geom + first settle

    // Rail highlight + current section id (used by scroll-settle below).
    // The root is collapsed to a thin band at the viewport's vertical center
    // (rootMargin -50%/-50% + a small slice), so the active section is simply
    // whichever one is crossing the centerline. A visible-ratio threshold does
    // NOT work here: sections taller than ~1.8x the viewport (e.g. Experience on
    // a narrow phone) can never reach it, so they'd never become active and the
    // engine would trace a stale, mismeasured frame across their content.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            activeRef.current = e.target.id;
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

    // Lines are hidden while scrolling and (re)spawned once the page settles,
    // so they never draw against a mid-scroll (misaligned) frame.
    let settleTimer = 0;
    const onScroll = () => {
      engineRef.current?.setScrolling();
      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(
        () => engineRef.current?.settle(activeRef.current),
        160,
      );
      // Toggle the hero scroll-cue / back-to-top affordances at a threshold.
      const s = window.scrollY > 40;
      if (s !== scrolledRef.current) {
        scrolledRef.current = s;
        setScrolled(s);
      }
    };
    const onResize = () => relayout();
    const onKey = (e: KeyboardEvent) => {
      if (!debug) return; // H is a no-op unless debug mode is enabled
      if ((e.key === "h" || e.key === "H") && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
        setConsoleOpen((o) => !o);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);

    return () => {
      engine.stop();
      io.disconnect();
      clearTimeout(settleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      engineRef.current = null;
    };
  }, [relayout, measureFrame, measureSectionBand, debug]);

  const goTo = (id: string) =>
    sectionEls.current[id]?.scrollIntoView({ behavior: "smooth" });

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
