# sketchpad — Sketch Canvas

A p5 drawing surface. The lowest-ceremony baseplate in the repo, and the best
place to write your first brick.

## The baseplate

| File | What it does |
|---|---|
| `Screen.jsx` | Toolbar: brush buttons, colours, size, clear |
| `sketch.js` | The p5 sketch — looks up the active brush each frame and hands it two points |

`Screen.jsx` has **no list of brushes**. It loops `bricks/bricks.js`.

## A brick here is a brush

One function. That's the whole contract:

```js
export const myBrush = {
  id: "my-brush",
  label: "My Brush",
  order: 50,
  hint: "What it does",

  stroke(p, { color, weight, from, to }) {
    p.stroke(color);
    p.strokeWeight(weight);
    p.line(from.x, from.y, to.x, to.y);
  },
};
```

`stroke` is called once per frame while the pointer is down and inside the
canvas. `p` is the p5 instance, so the whole p5 API is yours. **A brush never
handles events** — the baseplate does that.

## Bricks (4)

| Brick | What it does |
|---|---|
| `pen-XX` | a plain line — **six lines of code, copy this one** |
| `spray-XX` | scattered dots; hold still to build up density |
| `calligraphy-XX` | broad nib at 45°, so direction changes the thickness |
| `mirror-XX` | draws the stroke and its reflection — shows a brush can mark twice |

## Ideas

- Pressure or speed-sensitive width (`p.dist(pmouseX, pmouseY, mouseX, mouseY)`)
- Radial symmetry with N axes instead of `mirror`'s one
- A stamp brush that scatters a shape

## Watch out

`@p5-wrapper/react` is **v5**: the component is **`P5Canvas`**, not
`ReactP5Wrapper`. It's a lazy component, so wrap it in `<Suspense>`. React
state reaches the sketch through `updateWithProps`, not re-rendering — p5 owns
its own canvas and render loop.
