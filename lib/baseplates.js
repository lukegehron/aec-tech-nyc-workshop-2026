import { flatBaseplate } from "@/baseplates/flat";

/**
 * The baseplate registry — the outer studs.
 *
 * One import above, one array entry below. That is the whole contract, and
 * those are the ONLY lines in this file you should touch.
 *
 * Friday: do not add a baseplate. Snap a brick onto one that already exists.
 * Facilitators merge the phase PRs that unlock new surfaces.
 *
 * A baseplate object in this file:
 *
 *   id, color, label, description, icon, navOrder, Screen
 *   usesScene   true if docking this surface should show the board Filters
 *               strip (building / floor). Flat is false. Dashboard / 3D / PDF
 *               are true. Set this when you add the surface.
 *   listBricks  () => bricks array, so the board tray can offer individual
 *               bricks as well as the whole surface. Copy Flat's
 *               `listBricks: () => bricks`.
 *   Host        optional. Renders one non-card brick (e.g. a 3D mode) as a
 *               tile. Add on remix if you want massing without the full tool
 *               rail.
 *
 * There are two levels in this repo, and it matters which one you're on:
 *
 *   BASEPLATE  a moulded surface with studs all over it — a drafting canvas,
 *              a 3D scene, a dashboard, a blank card grid. Registered in this
 *              file. You add a new one only when you need a surface none of
 *              the existing ones gives you. That is rare, and `flat` — the
 *              blank one — is usually the answer instead.
 *   BRICK      one feature snapped onto ONE baseplate. Registered in that
 *              baseplate's own `bricks/bricks.js`, never here.
 *
 * A baseplate is everything in `baseplates/<id>/` that is NOT in `bricks/`.
 * There is no third layer and no other word for it — the moulded surface IS
 * the baseplate. Bricks snap onto it; it never holds a list of them.
 *
 * See `baseplates/flat/` for the surface that is in the tree this morning.
 *
 * When two teams add a baseplate at once, the merge conflict lands right
 * here: keep both import lines, keep both array entries, done.
 */

export const baseplates = [flatBaseplate];

/**
 * `navOrder` and `color` must both be UNIQUE across the array above.
 *
 * `navOrder` decides the order of the nav; a tie makes the order depend on
 * where you happened to add your import. `color` is a baseplate's identity —
 * it colours the nav item, the landing card, the baseplate wall and every
 * `text-baseplate` / `bg-baseplate/10` inside the baseplate — so two baseplates
 * sharing one makes them indistinguishable.
 *
 * This is exactly the thing two teams adding a baseplate at the same time will
 * collide on, so it fails loudly in dev instead of quietly in the nav. The
 * available colours are listed in `app/globals.css` (and in CLAUDE.md); add one
 * there if you need a ninth.
 */
if (process.env.NODE_ENV !== "production") {
  for (const key of ["navOrder", "color"]) {
    const seen = new Map();
    for (const b of baseplates) {
      const clash = seen.get(b[key]);
      if (clash) {
        console.error(
          `[baseplates] ${clash} and ${b.id} share ${key}: ${b[key]}. ` +
          `Every baseplate needs its own — see the note in lib/baseplates.js.`
        );
      }
      seen.set(b[key], b.id);
    }
  }
}

// Sorted for nav rendering; look up by URL segment for the dynamic route.
export const baseplatesByNavOrder = [...baseplates].sort(
  (a, b) => a.navOrder - b.navOrder
);

export function getBaseplate(id) {
  return baseplates.find((b) => b.id === id);
}
