"use client";

import { StairScene } from "./Scene3d";
import { StairToolbar } from "./Toolbar";

/**
 * SWITCHBACK STAIR — click inside a building, get a stair from floor to floor.
 *
 * A TOOL, not a view mode: no `buildBoxes`, so it lives in the toolbar and
 * works over whichever mode is showing.
 *
 * Each storey is one switchback: flight 1 climbs to a half landing, turns
 * 180°, and flight 2 climbs back to the floor landing above. Storeys stack,
 * so one stair serves grade to the top floor (or the roof, if you ask). The
 * Navy Yard floors aren't all the same height, so every storey is divided on
 * its own: riser height is a MAXIMUM, each storey gets the fewest equal risers
 * that stay under it, and the toolbar reports the risers you actually got,
 * plus a 2R + G comfort check.
 *
 * Picking follows the measure brick: a plain DOM listener on the canvas that
 * casts its own ray, falling back to the ground plane. The point is matched to
 * a building footprint in project.json, and the stair is clamped to stay inside
 * it. Every parameter drives every placed stair live.
 *
 * Z-up throughout. Nothing here suspends, and nothing this brick draws is
 * raycastable, so stairs never get in the way of picking.
 */
export const switchbackStairKR = {
  id: "switchback-stair-KR",
  label: "Switchback stair",
  hint: "Click inside a building for a floor-to-floor switchback stair; riser and tread are parametric",
  order: 80,
  Toolbar: StairToolbar,
  Scene3d: StairScene,
};
