import type { SequenceName } from "../config";
import type { FrameRect, Node } from "../types";

// Scripted line choreographies — deterministic, authored paths that trace the
// active content frame's border, as opposed to the procedural ambient lines
// (see planner.ts) or the per-section entrance strokes (see choreo.ts). Each
// sequence is a first-class object: a label, a motion style, and a builder that
// turns the measured content frame into one path per participating line. They
// are played from the Grid Console and loop until dismissed.

/** How a scripted line animates along its path once built. */
export type SeqMotion =
  | "loop" // fixed-length comet head circles the ring forever
  | "hold" // draw the ring's near half in once, then stay lit
  | "lap" // draw in, retract, repeat (pulsing)
  | "snap"; // draw the whole (open) path in once, then stop — a terminating step

/** One line's authored route: an off-screen lead-in that hands off to a `ring`.
 * For looping motions the ring is a closed clockwise perimeter (`ring[0]` is the
 * start corner); for "snap" it's just an open polyline drawn end to end. */
export interface ScriptedPath {
  lead: Node[];
  ring: Node[];
  /** Seconds to wait before this line starts drawing (for staggered sweeps). */
  delay?: number;
}

export interface LineSequence {
  label: string;
  motion: SeqMotion;
  /** Build one path per line from the (grid-snapped) content frame. */
  build: (fr: FrameRect) => ScriptedPath[];
}

/** How many grid nodes of off-screen run-up each line enters with. */
const LEAD = 2;

/**
 * The clockwise ring of border nodes hugging the frame, starting at the
 * bottom-left corner. Length = 2·(cols+rows); corners land at indices
 * 0 (BL), rows (TL), rows+cols (TR), 2·rows+cols (BR).
 */
function perimeterRing(fr: FrameRect): Node[] {
  const { col0, row0, cols, rows } = fr;
  const c1 = col0 + cols;
  const r1 = row0 + rows;
  const ring: Node[] = [];
  for (let r = r1; r > row0; r--) ring.push({ c: col0, r }); // left edge, BL → up to TL
  for (let c = col0; c < c1; c++) ring.push({ c, r: row0 }); // top edge, TL → right to TR
  for (let r = row0; r < r1; r++) ring.push({ c: c1, r }); // right edge, TR → down to BR
  for (let c = c1; c > col0; c--) ring.push({ c, r: r1 }); // bottom edge, BR → left to BL
  return ring;
}

/** Rotate a ring so it begins at `start`, preserving order (direction). */
function rotate<T>(arr: T[], start: number): T[] {
  const k = ((start % arr.length) + arr.length) % arr.length;
  return arr.slice(k).concat(arr.slice(0, k));
}

/**
 * The shared "corner chase": two lines enter antipodally and trace the frame
 * clockwise, staying diametrically opposite forever.
 *  • Line A enters from the left, lands on the bottom-left corner, runs up.
 *  • Line B enters from the right, lands on the top-right corner, runs down.
 * Only the motion style differs between the three sequences below.
 */
function cornerChase(fr: FrameRect): ScriptedPath[] {
  const ring = perimeterRing(fr);
  const trIndex = fr.rows + fr.cols; // top-right corner: halfway around
  const c1 = fr.col0 + fr.cols;
  const r1 = fr.row0 + fr.rows;

  // Line A: off-screen left → bottom-left corner (ring[0]), then up.
  const leadA: Node[] = [];
  for (let i = LEAD; i >= 1; i--) leadA.push({ c: fr.col0 - i, r: r1 });

  // Line B: off-screen right → top-right corner (ring rotated to start there).
  const leadB: Node[] = [];
  for (let i = LEAD; i >= 1; i--) leadB.push({ c: c1 + i, r: fr.row0 });

  return [
    { lead: leadA, ring },
    { lead: leadB, ring: rotate(ring, trIndex) },
  ];
}

/** An L-shaped corner bracket hugging one corner of the frame, `pad` nodes
 * outside it, each arm `len` nodes long. Drawn arm → corner → arm. */
function bracket(fr: FrameRect, corner: "tl" | "tr" | "bl" | "br", pad: number, len: number): Node[] {
  const l = fr.col0 - pad;
  const rt = fr.col0 + fr.cols + pad;
  const t = fr.row0 - pad;
  const b = fr.row0 + fr.rows + pad;
  switch (corner) {
    case "tl": return [{ c: l, r: t + len }, { c: l, r: t }, { c: l + len, r: t }];
    case "tr": return [{ c: rt - len, r: t }, { c: rt, r: t }, { c: rt, r: t + len }];
    case "bl": return [{ c: l, r: b - len }, { c: l, r: b }, { c: l + len, r: b }];
    case "br": return [{ c: rt - len, r: b }, { c: rt, r: b }, { c: rt, r: b - len }];
  }
}

/**
 * Four corner brackets that snap in around the content, sweeping clockwise from
 * the top-left, then hold as a static frame. A terminating sequence — nothing
 * loops; the last step is the held brackets.
 */
function brackets(fr: FrameRect): ScriptedPath[] {
  const PAD = 1;
  const LEN = 3;
  const corners: Array<"tl" | "tr" | "br" | "bl"> = ["tl", "tr", "br", "bl"];
  return corners.map((corner, i) => ({
    lead: [],
    ring: bracket(fr, corner, PAD, LEN),
    delay: i * 0.09, // staggered sweep around the frame
  }));
}

export const SEQUENCES: Record<Exclude<SequenceName, "none">, LineSequence> = {
  cometChase: { label: "Corner chase — comets", motion: "loop", build: cornerChase },
  drawHold: { label: "Corner chase — draw & hold", motion: "hold", build: cornerChase },
  pulseLaps: { label: "Corner chase — pulse laps", motion: "lap", build: cornerChase },
  brackets: { label: "Brackets — snap & hold", motion: "snap", build: brackets },
};
