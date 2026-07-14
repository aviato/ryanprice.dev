# TODOS

- [x] **Fixing line bug** — see screenshots [`line-bug-1.png`](./line-bug-1.png) and [`line-bug-2.png`](./line-bug-2.png) at the repo root.
  - Root cause was the line's 20–28px `shadowBlur` glow bleeding across the tight
    mobile gutter onto the content, made worse by the frame sitting ~12px off-centre
    (grid-column snapping can't divide the viewport symmetrically).
  - Fixes: centre the frame in the viewport (grid-snapped *width*, centred *position*);
    cap the glow on phones; bake the dot lattice to an offscreen canvas (perf).
