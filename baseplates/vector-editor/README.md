# vector-editor — Vector Editor

A working 2D drafting app: pen, pencil, shapes, dimensions, selection, node
editing, layers, undo, SVG in and out, and a panel that turns a sentence into
geometry via Claude. **Twelve bricks on one canvas** — the deepest example in
the repo, and worth reading even if you're not on it.

> **The building is Navy Yard Commons** — one fictional scheme in
> `public/sample-data/project.json`, seen four ways. This baseplate opens
> `floor-plan.svg` of it; the 3D Viewer orbits it, the Building Dashboard charts
> it, and the PDF Markup opens its Level 01 sheet. Same numbers, four surfaces.

**The contract is at the top of [`bricks/bricks.js`](./bricks/bricks.js).** That
docstring is the authority — every field on a tool and on a panel — and it is
the shortest useful file here. Read it before you write anything. This page is
only the things it doesn't say.

## What to watch out for

- **`ctx` is rebuilt for every event.** Read values off the `ctx` your handler
  was given; never cache it in a module variable. A pointermove fires far more
  often than React re-renders, so a captured value is a frame stale — and the
  symptom is geometry that's the right *shape* in the wrong *place*.
  `toolContext.js` says so at the top, and it's the single most common bug on
  this baseplate.
- **Finish shapes with `ctx.addElements(...)`**, not `setElements`. It adds,
  selects and pushes one history entry, so undo works and undoes the whole
  shape. Do it yourself and it won't.
- **Pick a `shortcut` nobody's using.** The taken ones are visible in the rail;
  there's no check.
- **Guard the zero-size click.** A click with no drag creates an invisible
  element that then shows up in the layers panel looking like someone else's
  bug. `shapes-XX` has the three-line guard, with a comment.

## Which brick to copy

| You want | Copy |
|---|---|
| a tool with no state | `bricks/pan-XX/` |
| a click-drag-release shape, with a live preview | `bricks/shapes-XX/` |
| a side panel | `bricks/document-XX/` |
| a panel that calls Claude | `bricks/ai-XX/` — **read this one anyway** |
| a blank start | `bricks/_your-brick-here-XX/` — unregistered, already runs |

`ai-XX` is about forty lines and it is the best forty lines in the repo. The
interesting part isn't the fetch — it's the system prompt. Asking for
JSON-wrapped SVG path data *in the document's own coordinate system* turns a
chat model into a geometry generator whose output drops straight into the
element model as editable, undoable elements. **Constrain the output shape and
the model becomes a component.** That idea generalises everywhere.

## Ideas

Hatch or fill · polygon and star · a text label · a "total length of selection"
panel · grid and snap settings · offset a path · a DXF import
(`dxf-parser`, installed) · boolean union/subtract on the selection
(`polygon-clipping`, installed) · measure-to-scale using the document's
`mmPerUnit`.
