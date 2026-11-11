// Base geometry helpers. Turns project.json plan polygons into the boxes the
// scene draws.
//
// Footprints are axis-aligned rectangles written as [x, z] in metres, so a box
// is fully described by its plan bounds plus a height — no triangulation, no
// extrude geometry, no loaders.
//
// ---------------------------------------------------------------------------
// THIS SCENE IS Z-UP
// ---------------------------------------------------------------------------
// AEC tools are Z-up (Rhino, Revit, IFC, DWG), three.js defaults to Y-up, and
// project.json predates the decision — its plan coordinates are named [x, z]
// because they were authored for a Y-up scene, and `lib/projectData.js` is
// shared workshop code, so those names stay.
//
// The conversion therefore lives HERE, in one function, and it is the only
// place in this baseplate that knows about it:
//
//     project.json          three.js (Z-up)
//     ------------          ---------------
//     x  (east)       ->    x
//     z  (north)      ->    y
//     height          ->    z
//
// Every brick spreads `boxFromOutline()` into its box, so every brick came
// along for the ride without changing a line. That's the point of having one
// primitive — don't do the swap yourself in a brick.
//
// This file holds only what EVERY view mode needs. The actual box builders —
// one per mode — live in the bricks that use them (`bricks/massing-XX/`,
// `bricks/floors-XX/`, `bricks/spaces-XX/`).

import { outlineBounds } from "@/lib/projectData";

// A hair off each box so neighbouring rooms read as separate volumes instead of
// one merged mass, and floors show a slab line between them.
export const PLAN_INSET = 0.12;
export const SLAB_GAP = 0.25;

/**
 * The one primitive every brick builds on: a plan outline plus a height in, a
 * positioned box out. Returns `{ position, size }` — spread it into your box
 * object and add `key` and `meta`.
 *
 * `base` and `height` are elevations in metres, and in a Z-up scene that makes
 * them the Z axis. `size` is `[width, depth, height]`.
 */
export function boxFromOutline(outline, { base, height, inset = 0, verticalGap = 0 }) {
  const b = outlineBounds([outline]);
  const w = Math.max(b.width - inset * 2, 0.1);
  const d = Math.max(b.depth - inset * 2, 0.1);
  const h = Math.max(height - verticalGap, 0.1);
  return {
    position: [b.minX + b.width / 2, b.minZ + b.depth / 2, base + h / 2],
    size: [w, d, h],
  };
}

/** Camera framing and grid extent derived from the site, not hardcoded. */
export function sceneFraming(project) {
  const b = outlineBounds([project.site.outline]);
  // Ground centre, Z-up: the third component is the elevation, so it's 0.
  const center = [b.minX + b.width / 2, b.minZ + b.depth / 2, 0];
  const span = Math.max(b.width, b.depth);
  return {
    center,
    span,
    target: [center[0], center[1], project.project.metrics.maxHeight * 0.35],
    position: [center[0] + span * 0.75, center[1] + span * 0.85, span * 0.6],
    gridSize: Math.ceil(span * 1.4),
    // Top of the tallest thing on site — the Z slice needs a ceiling, and the
    // camera framing already had to know it.
    maxHeight: project.project.metrics.maxHeight,
  };
}
