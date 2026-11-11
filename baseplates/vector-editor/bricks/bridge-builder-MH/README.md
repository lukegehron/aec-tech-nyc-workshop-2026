# bridge-builder-MH

A Vector Editor tool by Marshall Hayward (MH): drag from one abutment to the
other and it drops a complete bridge drawing.

A bridge is a set of **pieces**, not one drawing. Every member, deck segment,
support and joint is its own element with a `bridge` tag, so each can be
selected, moved or deleted on its own.

- **Member tool (`M`):** add one piece at a time. Drag from joint to joint.
  Each end snaps to an existing joint first, then to the grid. `Shift` locks
  to 45° steps. `1`–`4` pick member, deck, cable or pin support (a support is
  placed with a click).
- **Bridge tool (`G`):** drag between two abutments to drop a whole preset,
  already split into pieces. `1`–`5` pick Pratt, Howe, Warren, tied arch or
  suspension. The span rounds to whole bays.
- **Bridge mode:** while either tool is active the canvas turns yellow and the
  other tools are greyed out and disabled. `Esc` cancels the piece in hand, or
  leaves the mode.
- **Panel:** Bridge, with a start/exit button, the piece picker, a piece count
  and the preset settings. Lengths follow the Sheet scale.

Files:

- `bridge.js`: pure geometry, joint finding and snapping maths
- `pieces.js`: turns geometry into tagged elements and commits them
- `Mode.jsx`: the bridge-mode look, the snap marker and the shared keys
- `MemberTool.jsx`: the Member tool
- `index.jsx`: the Bridge (preset) tool and the brick export
- `Panel.jsx`: the Bridge tab
- `atoms.js`: this brick's own settings

Bridge mode is styled from inside the brick, because a brick may not edit the
baseplate. `Mode.jsx` targets the rail buttons by their `aria-label` and the
sheet as the first `<rect>` in the canvas. If the baseplate changes either,
the mode loses its look but the tools still work.
