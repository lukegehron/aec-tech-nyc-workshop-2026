// A drafting wrapper. Snap doesn't draw marks itself — it turns the pointer's
// wandering path into a path of grid points joined by 0° / 45° / 90° … segments,
// then hands each segment to a real brush (pen, spray, calligraphy, …).
//
// The direction is re-evaluated continuously, so one drag can turn corners:
// right, down, left, up is a square. The stroke only ever steps one grid unit
// at a time along one of 8 directions.
//
// Choose which brush Snap draws with by pressing a number key: 1 = first other
// brush on the rail, 2 = second, … (default 1).
//
// The registry (`../bricks`) is the baseplate's, not another brick's. The
// import is circular (bricks.js imports this file) but safe: the registry is
// only read inside `stroke`, after both modules have finished loading.

import { kitBrushes } from "../bricks";

const GRID = 20; // px between grid points
const NEW_STROKE_GAP_MS = 100; // no frames for this long = pointer was released
const KEEP_DIR_DEG = 30; // keep heading unless the pointer is this far off it
const MAX_STEPS_PER_FRAME = 40;

// Index k is the direction at k * 45° (screen coordinates, y points down).
const DIRS = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

const snapToGrid = (v) => Math.round(v / GRID) * GRID;

// Smallest absolute difference between two angles, in degrees.
function angleDiff(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

let state = null; // { last, dir, at }
let delegateIndex = 0;

export const snapBrush = {
  id: "snap-AT",
  label: "Snap",
  order: 50,
  hint: "Snaps to a 20px grid and 0°/45°/90° — turn corners mid-stroke. Press 1, 2, 3… to pick the brush",

  stroke(p, { color, weight, from, to }) {
    const now = p.millis();

    if (p.keyIsPressed) {
      const n = Number.parseInt(p.key, 10);
      if (n >= 1) delegateIndex = n - 1;
    }
    const others = kitBrushes().filter((b) => b.id !== snapBrush.id);
    const brush = others[Math.min(delegateIndex, others.length - 1)];
    if (!brush) return;

    if (!state || now - state.at > NEW_STROKE_GAP_MS) {
      state = {
        last: { x: snapToGrid(from.x), y: snapToGrid(from.y) },
        dir: null,
        at: now,
      };
    }
    state.at = now;

    for (let i = 0; i < MAX_STEPS_PER_FRAME; i++) {
      const dx = to.x - state.last.x;
      const dy = to.y - state.last.y;
      const heading = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Keep the current direction unless the pointer has clearly turned away.
      let dir = state.dir;
      if (dir === null || angleDiff(heading, dir * 45) > KEEP_DIR_DEG) {
        dir = ((Math.round(heading / 45) % 8) + 8) % 8;
      }

      const [ux, uy] = DIRS[dir];
      const stepLen = Math.hypot(ux, uy) * GRID;
      // Only advance once the pointer has clearly reached the next grid point.
      if (Math.hypot(dx, dy) < stepLen * 0.75) break;

      const next = { x: state.last.x + ux * GRID, y: state.last.y + uy * GRID };
      if (next.x < 0 || next.x > p.width || next.y < 0 || next.y > p.height) break;

      brush.stroke(p, { color, weight, from: state.last, to: next });
      state.last = next;
      state.dir = dir;
    }
  },
};
