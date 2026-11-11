/**
 * This baseplate's brick registry — the inner studs.
 *
 * `lib/baseplates.js` snaps the BASEPLATES into the app.
 * This file snaps this baseplate's BRICKS onto this baseplate.
 *
 * Same two-line contract, one level in: one import above, one array entry
 * below. The brush buttons read this list — `Screen.jsx` has none of its own.
 *
 * A BRICK here is a BRUSH: one way of drawing between two points.
 *
 *   id      unique string
 *   label   the button label
 *   order   button position (10, 20, 30 … leave gaps)
 *   hint    one line under the toolbar — say what it does
 *   stroke(p, ctx)   REQUIRED. Draw one frame's worth of mark.
 *
 * `p` is the p5 instance — the whole p5 API is yours (`p.stroke`, `p.line`,
 * `p.ellipse`, `p.random`, `p.width`, `p.height`, …).
 *
 * `ctx` is `{ color, weight, from, to }`:
 *   color   the selected hex colour
 *   weight  the selected stroke weight
 *   from    {x, y} where the pointer was last frame
 *   to      {x, y} where the pointer is now
 *
 * The baseplate calls `stroke` once per frame while the pointer is down and inside
 * the canvas — so a brush never handles events, only marks. That's the whole
 * contract; the shortest brick on this baseplate is six lines.
 *
 * Bricks don't import each other.
 *
 * ---------------------------------------------------------------------------
 * NAMING — folder and id end in your two initials
 * ---------------------------------------------------------------------------
 *   branch   <your GitHub username>     all day. Do not make a new branch.
 *   folder   bricks/charcoal-LG/
 *   id       "charcoal-LG"
 *   PR       that folder + two lines in this file. Facilitators merge.
 *
 * Everything registered below ends in `-XX` — nobody's initials — because they
 * ship as examples rather than belonging to a specific author.
 *
 * Here the brick IS the brush, so that id is the brush's id as well —
 * initials and all. The button on the toolbar is someone's.
 *
 * ---------------------------------------------------------------------------
 * KIT — starter brushes stay on the rail
 * ---------------------------------------------------------------------------
 * Wrap the `bricks` array with `visibleBricks()`, never a nested id.
 * Ids ending in `-XX` default ON. Attendee brushes (ids ending in initials)
 * default OFF. Reveal them with the "Add to this surface" tray on this
 * Screen — that kit travels when you dock Sketchpad onto Flat. Scene selection is `lib/scene.js`;
 * this surface does not use it (`usesScene: false`).
 */

import { getDefaultStore } from "jotai";
import { hiddenBrickKeysAtom, visibleBricks } from "@/lib/bricks";

// ── Every brick on this baseplate is imported here, and only here. Yours goes
// ── at the end of the list, then at the end of the array below. Two lines.
import { penBrush } from "./pen-XX";
import { sprayBrush } from "./spray-XX";
import { calligraphyBrush } from "./calligraphy-XX";
import { mirrorBrush } from "./mirror-XX";
import { smileStampNI } from "./smile-stamp-NI";

export const bricks = [penBrush, sprayBrush, calligraphyBrush, mirrorBrush, smileStampNI];

function shownBricks(hiddenSet) {
  const hidden =
    hiddenSet === undefined
      ? getDefaultStore().get(hiddenBrickKeysAtom)
      : hiddenSet;
  return visibleBricks("sketchpad", bricks, hidden);
}

export const brushesByOrder = [...bricks].sort((a, b) => a.order - b.order);

export function kitBrushes(hiddenSet) {
  return [...shownBricks(hiddenSet)].sort((a, b) => a.order - b.order);
}

// Falls back to the first brush rather than throwing, so a half-finished brick
// can't leave the sketchpad unable to draw.
export function getBrush(id, hiddenSet) {
  const brushes = kitBrushes(hiddenSet);
  return brushes.find((brush) => brush.id === id) ?? brushes[0] ?? brushesByOrder[0];
}
