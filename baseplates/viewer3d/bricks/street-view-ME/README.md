# street-view-ME

Click any part of the model and drop to a ground-level, eye-height view of it.

A **tool**, not a view mode — it builds no boxes, so it never joins the mode
rail and it works whichever mode is showing. `Toolbar` is the control,
`Scene3d` does the picking and drives the camera.

## How it behaves

1. Hit **Street view**. A dot follows the cursor showing where you'd land.
2. Click a facade, a roof, a drawn wall, an imported mesh, or open pavement.
3. The camera drops to **1.7 m** — standing eye height — a sensible distance
   back from what you clicked, looking at it.
4. Orbit normally to look around from where you're standing.
5. **Back to orbit** returns to the *exact* view you left.

The readout shows your eye height and compass heading. **Esc** cancels while
armed. One click, one walk — re-arm to move again.

## The decisions worth knowing

**Where to stand.** Clicking a facade steps *out* along that surface's normal,
flattened into plan so you never float up or sink into the ground. The standoff
scales with what you clicked — a 19 m tower gets ~17 m of breathing room,
clamped to 4–45 m — because standing 4 m from a tower shows you a wall, and
standing 45 m from a doorway shows you nothing.

**Roofs and floors** have vertical normals, which flatten to zero. Those fall
back to stepping outward from the object's centre, and a dead-centre roof click
falls back again to a fixed direction, so the stance is always finite and
deterministic rather than NaN.

**Looking up.** The target sits a quarter of the way up the clicked object, so a
tall facade reads as tall. Ground clicks look at the horizon instead.

**Clamped to the site**, so clicking the far edge of a building can't strand you
out in the void.

**Returning home.** The orbit camera — position, target, near and far — is
stashed on the *first* walk only, so hopping from street to street doesn't
overwrite the way back.

Clicks use a plain DOM listener on the canvas rather than an r3f `onClick`, for
the same two reasons `measure-XX` does it: the view-mode boxes call
`stopPropagation()` on theirs, which would eat every pick over a building, and a
tool that should work on *anything* shouldn't need every object to opt in. So it
shoots its own ray and falls back to the Z = 0 ground plane — which is what makes
open pavement clickable.

The near plane tightens to 0.1 m at street level so you can stand close to a
facade without it being clipped away, and is restored on the way out.

## Limits

- The camera is `OrbitControls`, so from street level you **orbit around the
  look-at point** rather than turning your head in place. Close enough to feel
  like standing there; it is not a first-person walk, and there's no WASD.
- No collision — orbiting from a stance can pass through a wall.
- Eye height is fixed at 1.7 m (`EYE_HEIGHT` in `atoms.js`).

## Files

- `index.jsx` — `Toolbar` + `Scene3d`, and the brick export.
- `stance.js` — where to stand and what to look at. Pure maths, no React.
- `atoms.js` — this tool's own state.

## Snapped on with two lines

In [`../bricks.js`](../bricks.js), and nothing else in that file:

```js
import { streetViewME } from "./street-view-ME";
```

```js
  streetViewME,
```

Its id ends in initials, so per the kit rule it defaults **off** — reveal it with
**Add to this surface** on the viewer Screen.
