# curtain-wall-KR

A **tool** brick for the 3D Viewer: click any vertical face to clad it with a
curtain wall that has a parametric mullion and transom grid.

## Use it

1. Turn it on from the **Add to this surface** tray. Initialed bricks default
   off on this surface.
2. Press **Curtain wall** in the toolbar. The face under the cursor is
   outlined in the accent colour.
3. Click a vertical face. Roofs and ground are ignored, and dragging still
   orbits. In massing mode one click clads a whole building side. In floors
   mode it clads a single floor plate.
4. Adjust the parameters. Every placed wall re-grids live:
   - **Mullions**: target spacing between vertical mullions, centre to
     centre (0.6–4 m)
   - **Transoms**: target spacing between horizontal transoms (1–6 m)
   - **Profile**: face width of the mullions and transoms (40–400 mm)
5. Undo removes the last wall, and × clears them all. **Esc** stops placing.

The spacings are targets. The bay count is rounded so the grid closes on both
corners, and the toolbar reports the actual bay size.

## Files

- `index.jsx`: the brick object (`curtainWallKR`)
- `Toolbar.jsx`: the HTML controls
- `Scene3d.jsx`: picking plus the r3f glass, mullions and hover outline
- `geometry.js`: face picking, grid layout and orientation maths (no React)
- `atoms.js`: the brick's own state

## Limits

- Walls live in memory, so they are gone after a reload.
- Faces are sized from the hit object's bounding box. That is exact for the
  axis-aligned boxes this scene draws, and approximate for curved or
  non-rectangular imported geometry.
