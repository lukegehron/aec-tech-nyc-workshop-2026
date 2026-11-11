# bridge-builder-MH

A Vector Editor tool by Marshall Hayward (MH): drag from one abutment to the
other and it drops a complete bridge drawing.

A bridge is a set of **pieces**, not one drawing. Every member, deck segment,
support and joint is its own element with a `bridge` tag, so each can be
selected, moved or deleted on its own.

- **One tool:** Bridge (`G`), or the "Build a bridge" button in the Bridge
  tab. Picking it puts the editor in bridge mode.
- **Bridge mode:** the canvas turns yellow, the other tools are greyed out and
  disabled, and a piece palette appears on the canvas. `Esc` cancels the piece
  in hand, or leaves the mode.
- **Pieces:** click a palette chip or press `1`-`5` for member, deck, cable,
  pin support or whole bridge. Drag from joint to joint to place a piece. Each
  end snaps to an existing joint first, then to the grid. `Shift` locks to 45°
  steps. A support is placed with a click.
- **Whole bridge:** drag between two abutments to drop a preset, already split
  into pieces. Pick the chip again (or press `5` again) to step through Pratt,
  Howe, Warren, tied arch and suspension. The span rounds to whole bays.
- **Panel:** Bridge, with the start/exit button, the piece picker, a piece
  count and the preset settings. Lengths follow the Sheet scale.

Files:

- `bridge.js`: pure geometry, joint finding and snapping maths
- `pieces.js`: turns geometry into tagged elements and commits them
- `Mode.jsx`: the bridge-mode look, the on-canvas palette and the mode keys
- `Overlay.jsx`: the previews drawn while the tool is active
- `index.jsx`: the Bridge tool and the brick export
- `Panel.jsx`: the Bridge tab
- `atoms.js`: this brick's own settings

Bridge mode is styled from inside the brick, because a brick may not edit the
baseplate. `Mode.jsx` targets the rail buttons by their `aria-label` and the
sheet as the first `<rect>` in the canvas. If the baseplate changes either,
the mode loses its look but the tools still work.
