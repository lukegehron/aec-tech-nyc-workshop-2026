# bridge-builder-MH

A Vector Editor tool by Marshall Hayward (MH): drag from one abutment to the
other and it drops a complete bridge drawing.

- **Tool:** Bridge (`G`). Drag between the two abutments. `1`–`5` switch type
  while the tool is active, and `Esc` cancels a drag.
- **Types:** Pratt, Howe and Warren trusses, a tied arch, and a suspension bridge.
- **Snapping:** the start abutment snaps to a grid node. The span rounds to a
  whole number of bays, and a bay is a whole number of grid squares, so deck
  and chord nodes sit on grid intersections. Arch and cable nodes follow a
  parabola, so only their x is on the grid.
- **Output:** ordinary path elements (deck, members, supports, nodes) plus a
  span dimension, which you can select, restyle, node-edit and export as SVG.
- **Panel:** Bridge, for the type, bay width, height and toggles. Lengths
  follow the Sheet scale.

Files: `bridge.js` is the pure geometry, `atoms.js` is this brick's own
settings and `index.jsx` is the tool, its preview and the panel.
