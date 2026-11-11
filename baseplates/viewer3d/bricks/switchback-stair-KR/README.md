# switchback-stair-KR

A **tool** brick for the 3D Viewer. Click inside a building and you get a
switchback (dog-leg) stair running floor to floor from grade to the top floor.
Riser, tread and width are parametric.

## Use it

1. Turn it on from the **Add to this surface** tray. Initialed bricks default
   off on this surface.
2. Press **Stair** in the toolbar. Hovering over a building shows the stair's
   footprint at grade and at the top, in the accent colour.
3. Click inside a building to place a stair. It is clamped to stay inside that
   building's footprint. Dragging still orbits.
4. Adjust it. Every placed stair rebuilds live:
   - **Riser ≤**: maximum riser height (120–220 mm, default 180)
   - **Tread**: going (220–400 mm, default 280)
   - **Width**: clear width of one flight (0.9–2.0 m, default 1.2)
   - **↻**: rotates the stair 90° at a time
   - **Roof**: also climbs from the top floor to the roof
   - **Eye**: X-ray. When on, the stair draws through the massing so you can
     see it inside a building.
5. Undo removes the last stair, and × clears them all. **Esc** stops placing.

## How a storey is built

Flight 1 climbs to a half landing, turns 180°, and flight 2 climbs back to the
floor landing above. The last riser of each flight lands on a landing, so a
flight of _n_ risers has _n − 1_ treads.

Storey heights in `project.json` differ (for example 5.0 m at ground and
3.5 m above in the North Tower). Each storey is therefore divided on its own:
it gets the fewest **equal** risers that stay at or under the maximum. The
toolbar shows the risers you actually got, the total riser count, a
**2R + G** comfort check (shown in red outside 550–700 mm) and the plan
footprint.

North Tower at the defaults: 28 risers at 178.6 mm, then 3 × 20 risers at
175 mm, on a 2.60 × 6.04 m footprint.

## Files

- `index.jsx`: the brick object (`switchbackStairKR`)
- `Toolbar.jsx`: the HTML controls and readout
- `Scene3d.jsx`: picking and placement (r3f)
- `StairMeshes.jsx`: the treads, landings and placement preview
- `geometry.js`: stair layout, building lookup and clamping (no React)
- `atoms.js`: the brick's own state

## Limits

- Stairs live in memory, so they are gone after a reload.
- This is a massing-level stair: no handrails, no stringers, no
  nosings. Treads are solid blocks with a 150 mm waist, and landings are
  200 mm slabs.
- Buildings are located from `project.json` footprints, so the tool does not
  work on imported .3dm geometry.
- Building footprints here are axis-aligned rectangles, so rotation snaps to
  90°.
