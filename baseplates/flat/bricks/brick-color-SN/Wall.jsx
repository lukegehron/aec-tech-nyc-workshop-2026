"use client";

// The brick wall: an SVG of rows × columns bricks in a bond pattern. Each brick
// gets its tone's colour plus a little per-brick variation ("shift"), so the
// wall reads as fired clay rather than flat paint.

import { rng, tint } from "./color";

export const BRICK_W = 44;
export const BRICK_H = 16;
export const JOINT = 3;

export function Wall({ cols, rows, bond, mortar, shift, seed, tones, assignment }) {
  const cw = BRICK_W + JOINT;
  const rh = BRICK_H + JOINT;
  const width = cols * cw + cw / 2 + JOINT;
  const height = rows * rh + JOINT;
  const jitter = rng(seed + 7);
  const cells = [];
  for (let r = 0; r < rows; r += 1) {
    const offset = bond === "running" && r % 2 === 1 ? cw / 2 : 0;
    for (let c = 0; c < cols; c += 1) {
      const idx = assignment[r * cols + c];
      const tone = tones[idx];
      const v = (jitter() - 0.5) * 2 * shift;
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={JOINT + offset + c * cw}
          y={JOINT + (rows - 1 - r) * rh}
          width={BRICK_W}
          height={BRICK_H}
          rx={1.5}
          fill={tone ? tint(tone.color, v) : "#999"}
        />
      );
    }
  }
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Brick wall, ${rows} courses of ${cols} bricks`}
      className="w-full rounded-md border"
    >
      <rect width={width} height={height} fill={mortar} />
      {cells}
    </svg>
  );
}
