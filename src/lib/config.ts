// Themes + the live tweak params (the "Grid Console"). Themes are CSS custom
// property sets; the canvas mirrors the same palette in JS so it can draw with
// the active colors without reading computed styles every frame.

export type ThemeName = "blueprint" | "terminal";
export type ImpactFx = "ripple" | "frame" | "burst" | "snap";
export type FrameBorder = "impact" | "always" | "off";
/** Scripted line choreographies, playable from the console. "none" = the
 * ambient wandering lines run as usual; any other value pauses them and plays
 * the named sequence (looping) until set back to "none". */
export type SequenceName = "none" | "cometChase" | "drawHold" | "pulseLaps" | "brackets";

export interface Palette {
  bg: string;
  dot: string;
  line: string;
  accent: string;
  text: string;
  dim: string;
  frame: string;
  panel: string;
}

export const THEMES: Record<ThemeName, Palette> = {
  blueprint: {
    bg: "#08182b",
    dot: "#123a5e",
    line: "#37c8ff",
    accent: "#37c8ff",
    text: "#cfe8ff",
    dim: "#5b86a8",
    frame: "#1c4a72",
    panel: "rgba(8,20,36,.82)",
  },
  terminal: {
    bg: "#04060a",
    dot: "#123a1f",
    line: "#3dff88",
    accent: "#3dff88",
    text: "#c9f5d8",
    dim: "#5a7a66",
    frame: "#164a2c",
    panel: "rgba(6,14,10,.82)",
  },
};

export const THEME_LABEL: Record<ThemeName, string> = {
  blueprint: "Blueprint",
  terminal: "Terminal",
};

export interface Params {
  theme: ThemeName;
  impactFx: ImpactFx;
  frameBorder: FrameBorder;
  /** 0–100; scales line motion speed. */
  motion: number;
  /** 1 or 2 concurrent lines. */
  activeLines: number;
  /** Fire all active lines together: they re-draw in unison after every line
   * has exited, instead of each cycling on its own timer. */
  syncLines: boolean;
  /** Seconds to idle before lines fire again. In sync mode this is measured
   * once from the moment the last line exits; otherwise it's each line's own
   * gap between cycles. */
  respawnDelay: number;
  /** Head travel speed, px/s. */
  lineSpeed: number;
  /** Undraw (retract) speed multiplier. */
  undrawSpeed: number;
  /** Per-side minimum trace length scaler (nodes). */
  traceLength: number;
  /** 0–1 stroke glow (shadowBlur) amount. */
  lineGlow: number;
  /** 0–1 comet-tail heat: how hot/bright the head runs vs the tail. */
  cometHeat: number;
  /** 0–1 extra glow on the leading filled cell (grid fill). */
  edgeBloom: number;
  /** 0–1 shatter-particle intensity as the tail retracts. */
  shatter: number;
  /** Grid node spacing, px. */
  gridSpacing: number;
  /** 0–1 base dot alpha. */
  gridVisibility: number;
  /** Canvas background blur, px. */
  backgroundBlur: number;
  gridFill: boolean;
  cornerPulse: boolean;
  mobilePreview: boolean;
  /** Active scripted line choreography ("none" = ambient lines). */
  sequence: SequenceName;
}

export const DEFAULT_PARAMS: Params = {
  theme: "terminal",
  impactFx: "ripple",
  frameBorder: "impact",
  motion: 55,
  activeLines: 2,
  syncLines: true,
  respawnDelay: 1.7,
  lineSpeed: 520,
  undrawSpeed: 3,
  traceLength: 14,
  lineGlow: 2,
  cometHeat: 0,
  edgeBloom: 0.9,
  shatter: 0.6,
  gridSpacing: 28,
  gridVisibility: 0.55,
  backgroundBlur: 0,
  gridFill: false,
  cornerPulse: false,
  mobilePreview: false,
  sequence: "none",
};

export const IMPACT_FX: ImpactFx[] = ["ripple", "frame", "burst", "snap"];
export const IMPACT_FX_LABEL: Record<ImpactFx, string> = {
  ripple: "Ripple",
  frame: "Draw frame",
  burst: "Particle burst",
  snap: "Snap",
};

export const FRAME_BORDERS: FrameBorder[] = ["impact", "always", "off"];
export const FRAME_BORDER_LABEL: Record<FrameBorder, string> = {
  impact: "On impact",
  always: "Always",
  off: "Off",
};

export const SEQUENCE_NAMES: SequenceName[] = [
  "none",
  "cometChase",
  "drawHold",
  "pulseLaps",
  "brackets",
];
export const SEQUENCE_LABEL: Record<SequenceName, string> = {
  none: "None (ambient)",
  cometChase: "Corner chase — comets",
  drawHold: "Corner chase — draw & hold",
  pulseLaps: "Corner chase — pulse laps",
  brackets: "Brackets — snap & hold",
};
