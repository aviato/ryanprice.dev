import { DEFAULT_PARAMS, type Params, type Palette, THEMES } from "../config";
import type { FrameRect, GridGeom, Node, Plan, Pt, Region } from "../types";
import { interiorNodes, key, nodeToPx } from "./grid";
import { planLine } from "./planner";
import { type LineSequence, type SeqMotion, SEQUENCES } from "./sequences";

interface Line {
  plan: Plan;
  region: Region;
  reserved: string[];
  head: number; // float node-index progress
  tail: number;
  phase: "draw" | "undraw" | "wait";
  wait: number;
  lastCorner: number; // last integer index crossed (for corner pulses)
}

/** A line running an authored sequence path (see sequences.ts). Distances are
 * in node-index units along `lead` (length P) followed by the closed `ring`
 * (length Q); in "loop" motion the head runs past P+Q and wraps within the ring. */
interface ScriptedLine {
  lead: Node[];
  ring: Node[];
  P: number; // lead length (index where the ring begins)
  Q: number; // ring length
  end: number; // draw/undraw extent: hold/lap → P+Q/2 (antipode); snap → whole path
  tailLen: number; // comet tail length in nodes (loop motion)
  delay: number; // seconds to wait before drawing starts (staggered sweeps)
  head: number;
  tail: number;
  phase: "draw" | "undraw" | "hold" | "wait";
  wait: number;
}

interface Ripple {
  x: number;
  y: number;
  t: number;
  life: number;
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  life: number;
}
interface Pulse {
  x: number;
  y: number;
  t: number;
}

export interface EngineHooks {
  /**
   * Return the section's *real* content box as a grid-snapped frame, measured
   * live from the DOM. This is the single source of truth for where content is,
   * so lines always route around it. Null if the section can't be measured.
   */
  frameProvider: (id: string) => FrameRect | null;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default class GridEngine {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private hooks: EngineHooks;
  private params: Params = { ...DEFAULT_PARAMS };
  private pal: Palette = THEMES.blueprint;

  private geom: GridGeom | null = null;
  private activeId: string | null = null;

  private occupied = new Set<string>();
  private lines: Line[] = [];
  private spawnGate = 0; // seconds until lines may (re)spawn after a section swap
  private respawnGate = -1; // sync-mode shared idle timer; <0 means "not armed"

  // Scripted sequence state. When `seqMotion` is set, the ambient lines above
  // are paused and these authored lines own the canvas until "none" is selected.
  private scripted: ScriptedLine[] = [];
  private seqMotion: SeqMotion | null = null;
  private scrolling = false; // lines are hidden while the page is in motion

  private ripples: Ripple[] = [];
  private particles: Particle[] = [];
  private pulses: Pulse[] = [];

  private raf = 0;
  private last = 0;
  private reduced = false;
  private dpr = 1;

  constructor(canvas: HTMLCanvasElement, hooks: EngineHooks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.hooks = hooks;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // --- public API -----------------------------------------------------------

  setParams(p: Params): void {
    const linesChanged = p.activeLines !== this.params.activeLines;
    const seqChanged = p.sequence !== this.params.sequence;
    this.pal = THEMES[p.theme];
    this.params = p;
    this.canvas.style.filter = p.backgroundBlur ? `blur(${p.backgroundBlur}px)` : "";
    if (this.reduced) {
      this.renderStatic();
    } else if (seqChanged && this.geom) {
      // Switching sequence (or back to ambient) restarts the lines from scratch.
      this.restartLines();
    } else if (linesChanged && this.geom && p.sequence === "none") {
      this.clearLines();
      this.trySpawn(true);
    }
  }

  /** Grid geometry changed (mount / resize / spacing). Re-measure on settle. */
  setGeom(geom: GridGeom): void {
    this.geom = geom;
    this.resizeCanvas(geom.w, geom.h);
    this.clearLines();
    this.scripted = [];
    if (this.reduced) {
      this.renderStatic();
    } else if (this.params.sequence !== "none" && this.activeId) {
      // Re-author the scripted path against the resized frame.
      this.buildScripted(SEQUENCES[this.params.sequence]);
    }
  }

  /** The page started moving: hide lines so they never draw against a frame
   * that is mid-scroll (and thus misaligned with content). This is also the
   * "interrupt" that stops a running sequence until the page settles again. */
  setScrolling(): void {
    if (this.scrolling) return;
    this.scrolling = true;
    this.clearLines();
    this.scripted = [];
  }

  /** The page settled on `id`. (Re)start whichever lines are active — the
   * ambient wanderers, or the selected scripted sequence entering from
   * off-screen. */
  settle(id: string): void {
    this.scrolling = false;
    if (this.reduced || !this.geom) {
      this.renderStatic();
      return;
    }
    const changed = id !== this.activeId;
    this.activeId = id;
    this.clearLines();
    this.scripted = [];
    if (this.params.sequence !== "none") {
      // Scripted sequence owns the lines; it enters right away.
      this.buildScripted(SEQUENCES[this.params.sequence]);
    } else if (changed) {
      this.seqMotion = null;
      this.spawnGate = 0.55; // ambient lines resume just after arrival
    } else {
      this.seqMotion = null;
      this.trySpawn(true);
    }
  }

  start(): void {
    if (this.reduced) {
      this.renderStatic();
      return;
    }
    this.last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.frame(dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
  }

  // --- line lifecycle -------------------------------------------------------

  private clearLines(): void {
    for (const l of this.lines) for (const k of l.reserved) this.occupied.delete(k);
    this.lines = [];
    this.respawnGate = -1;
  }

  private activeFrame(): FrameRect | null {
    return this.activeId ? this.hooks.frameProvider(this.activeId) : null;
  }

  private trySpawn(reset = false): void {
    if (!this.geom) return;
    const fr = this.activeFrame();
    if (!fr) return;
    const want = Math.max(1, Math.min(2, this.params.activeLines));
    if (reset) this.lines = [];
    const interior = interiorNodes(fr);
    const regions: Region[] = ["A", "B"];
    for (let i = this.lines.length; i < want; i++) {
      this.spawnOne(fr, regions[i % 2], interior);
    }
  }

  private spawnOne(fr: FrameRect, region: Region, interior: Set<string>): void {
    const plan = planLine(
      this.geom!,
      fr,
      region,
      this.occupied,
      interior,
      this.params.traceLength,
      Math.random,
    );
    if (!plan) return; // couldn't route; retried next tick via wait
    const reserved: string[] = [];
    for (const n of plan.nodes) {
      if (n.c < 0 || n.r < 0 || n.c >= this.geom!.cols || n.r >= this.geom!.rows) continue;
      reserved.push(key(n.c, n.r));
    }
    this.lines.push({
      plan,
      region,
      reserved,
      head: 0,
      tail: 0,
      phase: "draw",
      wait: 0,
      lastCorner: 0,
    });
  }

  private advanceLine(l: Line, dt: number): void {
    const g = this.geom!;
    const nps = (this.params.lineSpeed / g.sp) * (0.4 + this.params.motion / 100);
    const end = l.plan.nodes.length - 1;
    if (l.phase === "draw") {
      const prev = l.head;
      l.head = Math.min(end, l.head + nps * dt);
      if (this.params.cornerPulse) this.emitCorners(l, prev, l.head);
      if (l.head >= end) l.phase = "undraw";
    } else if (l.phase === "undraw") {
      l.tail = Math.min(end, l.tail + nps * this.params.undrawSpeed * dt);
      if (l.tail >= end) {
        for (const k of l.reserved) this.occupied.delete(k);
        l.phase = "wait";
        l.wait = Math.max(0, this.params.respawnDelay);
      }
    }
    // The "wait" phase (idle before re-firing) is driven by coordinateRespawn,
    // which either times each line independently or gates them all together.
  }

  /** Route a fresh path onto an existing line and start it drawing. The plan's
   * nodes are already reserved in `occupied` by planLine. */
  private applyPlan(l: Line, plan: Plan): void {
    const g = this.geom!;
    l.plan = plan;
    l.reserved = plan.nodes
      .filter((n) => n.c >= 0 && n.r >= 0 && n.c < g.cols && n.r < g.rows)
      .map((n) => key(n.c, n.r));
    l.head = 0;
    l.tail = 0;
    l.lastCorner = 0;
    l.phase = "draw";
  }

  /** Drive lines out of the "wait" phase. In sync mode, hold every line until
   * they have all exited, wait `respawnDelay` once, then re-fire them together.
   * Otherwise each line counts its own delay and re-fires on its own. */
  private coordinateRespawn(dt: number): void {
    const g = this.geom;
    const fr = this.activeFrame();
    if (!g || !fr || !this.lines.length) return;

    if (this.params.syncLines && this.lines.length > 1) {
      if (!this.lines.every((l) => l.phase === "wait")) {
        this.respawnGate = -1; // a line is still on-screen; disarm the gate
        return;
      }
      if (this.respawnGate < 0) this.respawnGate = Math.max(0, this.params.respawnDelay);
      this.respawnGate -= dt;
      if (this.respawnGate <= 0) {
        // Re-fire all-or-nothing so they truly start in unison; if any line
        // can't route, keep them all waiting and retry shortly.
        this.respawnGate = this.syncRespawn(g, fr) ? -1 : 0.3;
      }
      return;
    }

    const interior = interiorNodes(fr);
    for (const l of this.lines) {
      if (l.phase !== "wait") continue;
      l.wait -= dt;
      if (l.wait > 0) continue;
      const plan = planLine(g, fr, l.region, this.occupied, interior, this.params.traceLength, Math.random);
      if (plan) this.applyPlan(l, plan);
      else l.wait = 0.3;
    }
  }

  /** Plan every line before committing. planLine reserves into `occupied` as a
   * side effect, so on failure we release the paths we already planned. */
  private syncRespawn(g: GridGeom, fr: FrameRect): boolean {
    const interior = interiorNodes(fr);
    const plans: Plan[] = [];
    for (const l of this.lines) {
      const plan = planLine(g, fr, l.region, this.occupied, interior, this.params.traceLength, Math.random);
      if (!plan) {
        for (const p of plans)
          for (const n of p.nodes) this.occupied.delete(key(n.c, n.r));
        return false;
      }
      plans.push(plan);
    }
    this.lines.forEach((l, i) => this.applyPlan(l, plans[i]));
    return true;
  }

  // --- scripted sequences ---------------------------------------------------

  /** Clear all lines and (re)start whichever kind the current params select. */
  private restartLines(): void {
    this.clearLines();
    this.scripted = [];
    this.respawnGate = -1;
    if (this.params.sequence === "none") {
      this.seqMotion = null;
      this.trySpawn(true);
    } else {
      this.buildScripted(SEQUENCES[this.params.sequence]);
    }
  }

  /** Author the sequence's paths against the live content frame. Leaves
   * `scripted` empty (retried in frame()) if the frame can't be measured yet. */
  private buildScripted(seq: LineSequence): void {
    this.seqMotion = seq.motion;
    this.clearLines(); // the sequence owns the canvas; pause ambient wanderers
    const fr = this.activeFrame();
    if (!fr) {
      this.scripted = [];
      return;
    }
    this.scripted = seq.build(fr).map((p) => {
      const P = p.lead.length;
      const Q = p.ring.length;
      // "snap" draws the whole open path; the ring motions meet at the antipode.
      const end = seq.motion === "snap" ? P + Q - 1 : P + Math.floor(Q / 2);
      return {
        lead: p.lead,
        ring: p.ring,
        P,
        Q,
        end,
        tailLen: Math.max(6, Math.min(16, Math.round(Q * 0.3))),
        delay: p.delay ?? 0,
        head: 0,
        tail: 0,
        phase: "draw" as const,
        wait: 0,
      };
    });
  }

  private advanceScripted(s: ScriptedLine, dt: number): void {
    const g = this.geom!;
    const nps = (this.params.lineSpeed / g.sp) * (0.4 + this.params.motion / 100);
    if (this.seqMotion === "loop") {
      s.head += nps * dt; // unbounded; scriptedPos wraps it within the ring
      s.tail = Math.max(0, s.head - s.tailLen);
      return;
    }
    if (s.delay > 0) {
      s.delay -= dt; // hold at the start for staggered sweeps
      if (s.delay > 0) return;
    }
    if (this.seqMotion === "snap") {
      // Draw the path in once, then stop — the sequence ends here (terminal).
      if (s.phase === "draw") {
        s.head = Math.min(s.end, s.head + nps * dt);
        if (s.head >= s.end) s.phase = "hold";
      }
      return;
    }
    if (s.phase === "draw") {
      s.head = Math.min(s.end, s.head + nps * dt);
      if (s.head >= s.end) s.phase = this.seqMotion === "hold" ? "hold" : "undraw";
    } else if (s.phase === "undraw") {
      s.tail = Math.min(s.end, s.tail + nps * this.params.undrawSpeed * dt);
      if (s.tail >= s.end) {
        s.phase = "wait";
        s.wait = Math.max(0, this.params.respawnDelay);
      }
    } else if (s.phase === "wait") {
      s.wait -= dt;
      if (s.wait <= 0) {
        s.head = 0;
        s.tail = 0;
        s.phase = "draw";
      }
    }
    // "hold": fully drawn, holds until the sequence is dismissed or interrupted.
  }

  /** Pixel position at node-index distance `d` along lead(P) + ring(Q). Past the
   * ring start the distance wraps within the ring, so loop motion runs forever. */
  private scriptedPos(s: ScriptedLine, d: number): Pt {
    const g = this.geom!;
    const { P, Q, lead, ring } = s;
    let a: Node;
    let b: Node;
    let f: number;
    if (d < P) {
      const i = Math.floor(d);
      f = d - i;
      a = lead[i];
      b = i + 1 < P ? lead[i + 1] : ring[0];
    } else {
      const e = (d - P) % Q;
      const i0 = Math.floor(e) % Q;
      f = e - Math.floor(e);
      a = ring[i0];
      b = ring[(i0 + 1) % Q];
    }
    const pa = nodeToPx(g, a.c, a.r);
    const pb = nodeToPx(g, b.c, b.r);
    return { x: pa.x + (pb.x - pa.x) * f, y: pa.y + (pb.y - pa.y) * f };
  }

  private drawScripted(s: ScriptedLine): void {
    let lo: number;
    let hi: number;
    let showHead: boolean;
    if (this.seqMotion === "loop") {
      lo = s.tail;
      hi = s.head;
      showHead = true;
    } else if (s.phase === "undraw") {
      lo = s.tail;
      hi = s.end;
      showHead = false;
    } else if (s.phase === "wait") {
      return; // fully retracted between laps
    } else {
      lo = 0;
      hi = s.head;
      showHead = s.phase === "draw";
    }
    if (hi - lo < 0.01) return;

    const ctx = this.ctx;
    const pts: Pt[] = [this.scriptedPos(s, lo)];
    for (let i = Math.ceil(lo); i <= Math.floor(hi); i++) pts.push(this.scriptedPos(s, i));
    pts.push(this.scriptedPos(s, hi));

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = this.pal.line;
    ctx.shadowColor = this.pal.accent;
    ctx.shadowBlur = 10 * this.params.lineGlow;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (showHead) {
      const h = this.scriptedPos(s, hi);
      const heat = this.params.cometHeat;
      ctx.fillStyle = this.mix(this.pal.line, "#ffffff", heat * 0.7);
      ctx.shadowColor = this.pal.accent;
      ctx.shadowBlur = 14 * this.params.lineGlow;
      ctx.beginPath();
      ctx.arc(h.x, h.y, 3 + heat * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  private emitCorners(l: Line, prev: number, cur: number): void {
    const g = this.geom!;
    for (let i = Math.floor(prev) + 1; i <= Math.floor(cur); i++) {
      if (i <= 0 || i >= l.plan.nodes.length - 1) continue;
      const a = l.plan.nodes[i - 1];
      const b = l.plan.nodes[i];
      const c = l.plan.nodes[i + 1];
      const turned = (b.c - a.c) !== (c.c - b.c) || (b.r - a.r) !== (c.r - b.r);
      if (turned) {
        const p = nodeToPx(g, b.c, b.r);
        this.pulses.push({ x: p.x, y: p.y, t: 0 });
      }
    }
  }

  // --- frame ----------------------------------------------------------------

  private frame(dt: number): void {
    if (!this.geom) return;
    // While the page is in motion, draw only the grid — no lines/seeker/FX are
    // run against a scrolling (misaligned) frame.
    if (this.scrolling) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.geom.w, this.geom.h);
      this.drawDots();
      return;
    }
    if (this.spawnGate > 0) {
      this.spawnGate -= dt;
      if (this.spawnGate <= 0) this.trySpawn(true);
    }
    for (const l of this.lines) this.advanceLine(l, dt);
    this.coordinateRespawn(dt);
    // A sequence was selected but couldn't author yet (frame not measured at
    // settle time) — retry now that the frame is available.
    if (this.seqMotion && !this.scripted.length && this.params.sequence !== "none") {
      this.buildScripted(SEQUENCES[this.params.sequence]);
    }
    for (const s of this.scripted) this.advanceScripted(s, dt);
    this.updateFx(dt);
    this.draw();
  }

  private updateFx(dt: number): void {
    this.ripples = this.ripples.filter((r) => (r.t += dt) < r.life);
    this.particles = this.particles.filter((p) => {
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      return p.t < p.life;
    });
    this.pulses = this.pulses.filter((p) => (p.t += dt) < 0.5);
  }

  // --- drawing --------------------------------------------------------------

  private draw(): void {
    const ctx = this.ctx;
    const g = this.geom!;
    ctx.clearRect(0, 0, g.w, g.h);
    this.drawDots();
    if (this.params.frameBorder === "always") this.drawFrames();
    for (const l of this.lines) this.drawLine(l);
    for (const s of this.scripted) this.drawScripted(s);
    this.drawFx();
  }

  private drawDots(): void {
    const ctx = this.ctx;
    const g = this.geom!;
    const rad = Math.max(1, g.sp / 34);
    ctx.fillStyle = this.pal.dot;
    ctx.globalAlpha = this.params.gridVisibility;
    for (let c = 0; c < g.cols; c++) {
      for (let r = 0; r < g.rows; r++) {
        const x = g.offX + c * g.sp;
        const y = g.offY + r * g.sp;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  private drawFrames(): void {
    const fr = this.activeFrame();
    if (!fr) return;
    const ctx = this.ctx;
    ctx.strokeStyle = this.pal.frame;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.7;
    ctx.strokeRect(fr.x, fr.y, fr.w, fr.h);
    ctx.globalAlpha = 1;
  }

  private linePoint(l: Line, idx: number): Pt {
    const g = this.geom!;
    const nodes = l.plan.nodes;
    const i = Math.max(0, Math.min(nodes.length - 1, Math.floor(idx)));
    const j = Math.min(nodes.length - 1, i + 1);
    const t = idx - i;
    const a = nodeToPx(g, nodes[i].c, nodes[i].r);
    const b = nodeToPx(g, nodes[j].c, nodes[j].r);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  private drawLine(l: Line): void {
    const ctx = this.ctx;
    // During the inter-cycle gap the line is fully retracted; head still parks
    // at the plan end, so drawing here would flash the whole path. Skip it.
    if (l.phase === "wait") return;
    const from = l.phase === "undraw" ? l.tail : 0;
    const to = l.phase === "undraw" ? l.plan.nodes.length - 1 : l.head;
    if (to - from < 0.01) return;

    const pts: Pt[] = [this.linePoint(l, from)];
    for (let i = Math.ceil(from); i <= Math.floor(to); i++)
      pts.push(this.linePoint(l, i));
    pts.push(this.linePoint(l, to));

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = this.pal.line;
    ctx.shadowColor = this.pal.accent;
    ctx.shadowBlur = 10 * this.params.lineGlow;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Comet head: a bright hot dot leading the stroke while drawing.
    if (l.phase === "draw") {
      const h = this.linePoint(l, l.head);
      const heat = this.params.cometHeat;
      ctx.fillStyle = this.mix(this.pal.line, "#ffffff", heat * 0.7);
      ctx.shadowColor = this.pal.accent;
      ctx.shadowBlur = 14 * this.params.lineGlow;
      ctx.beginPath();
      ctx.arc(h.x, h.y, 3 + heat * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  private drawFx(): void {
    const ctx = this.ctx;
    // ripples
    for (const rp of this.ripples) {
      const k = rp.t / rp.life;
      ctx.strokeStyle = this.rgba(this.pal.accent, (1 - k) * 0.8);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, 8 + k * 120, 0, Math.PI * 2);
      ctx.stroke();
    }
    // particles
    for (const p of this.particles) {
      ctx.fillStyle = this.rgba(this.pal.accent, 1 - p.t / p.life);
      ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
    }
    // corner pulses
    for (const p of this.pulses) {
      const k = p.t / 0.5;
      ctx.strokeStyle = this.rgba(this.pal.accent, (1 - k) * 0.5);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 + k * 14, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private renderStatic(): void {
    if (!this.geom) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.geom.w, this.geom.h);
    this.drawDots();
    if (this.params.frameBorder !== "off") this.drawFrames();
  }

  // --- canvas sizing --------------------------------------------------------

  private resizeCanvas(w: number, h: number): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  // --- color helpers --------------------------------------------------------

  private rgba(hex: string, a: number): string {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${clamp01(a)})`;
  }

  private mix(hexA: string, hexB: string, t: number): string {
    const a = parseInt(hexA.slice(1), 16);
    const b = parseInt(hexB.slice(1), 16);
    const m = (sh: number) =>
      Math.round((((a >> sh) & 255) * (1 - t) + ((b >> sh) & 255) * t));
    return `rgb(${m(16)},${m(8)},${m(0)})`;
  }
}
