// The pixel front shared by the theme switch and the hero's scroll dissolve: a
// ragged edge of square cells that spreads out from a point, flashing the lamp
// colour as it passes. Both draw from the same schedule so they read as one
// system.

const BAND = 0.22; // how ragged the front is, as a share of the sweep
export const FLASH = 0.018; // how long a cell glows as the front passes it

// When each cell's moment comes, from 0 to 1: its distance from the origin over
// the farthest corner's, pushed about by jitter. 2x2 blocks share their jitter,
// so the front breaks into chunky steps rather than noise.
export function pixelGrid(w: number, h: number, origin: { x: number; y: number }, span = window.innerWidth < 640 ? 10 : 14) {
  const cols = Math.ceil(w / span);
  const rows = Math.ceil(h / span);
  const ox = origin.x / span, oy = origin.y / span;
  const far = Math.max(...[[0, 0], [cols, 0], [0, rows], [cols, rows]].map(([x, y]) => Math.hypot(x - ox, y - oy)));
  const half = Math.ceil(cols / 2);
  const jit = new Float32Array(half * Math.ceil(rows / 2)).map(() => Math.random());
  const due = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const reach = Math.hypot(c + 0.5 - ox, r + 0.5 - oy) / far;
      const j = (jit[(r >> 1) * half + (c >> 1)] + Math.random() * 0.35) / 1.35;
      due[r * cols + c] = reach * (1 - BAND) + j * BAND;
    }
  return { span, cols, rows, due };
}

// The open cells as an SVG mask, one path run per unbroken stretch of a row,
// so it stays a few hundred bytes however many cells are open.
export function maskFor(due: Float32Array, cols: number, rows: number, open: (due: number) => boolean) {
  let d = "";
  for (let r = 0; r < rows; r++) {
    let start = -1;
    for (let c = 0; c <= cols; c++) {
      const on = c < cols && open(due[r * cols + c]);
      if (on && start < 0) start = c;
      else if (!on && start >= 0) { d += `M${start} ${r}h${c - start}v1h${start - c}z`; start = -1; }
    }
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${cols} ${rows}' preserveAspectRatio='none' shape-rendering='crispEdges'><path d='${d}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
