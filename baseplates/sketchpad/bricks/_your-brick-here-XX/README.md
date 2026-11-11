# Your brick goes here

## 1 · What this stub does today

It's a **brush** that draws a dotted line instead of a solid one — it walks from
where the pointer was to where it is, dropping a dot every few pixels. Six lines
of actual drawing code, and it already works.

It is **not registered**, so it doesn't appear in the app yet. That's on purpose:
snapping it on is the first thing you do, and it's the whole lesson.

## 2 · Snap it on — the two lines

Open [`../bricks.js`](../bricks.js). Add one import at the top and one entry to
the array. **Nothing else in that file changes.**

```js
import { yourBrush } from "./_your-brick-here-XX";
```

```js
export const bricks = [penBrush, sprayBrush, calligraphyBrush, mirrorBrush, yourBrush];
```

Save, look at the browser. There's a new button in the brush row. **That's a
brick, snapped onto a baseplate, and those two lines are the studs.**

Everything else in the app found it by itself. Nobody edited `Screen.jsx`.

## 3 · Now make it yours

Rename first — folder and `id` to the same name ending in your two initials.
Stay on the git branch named after your GitHub username. Open a new PR for
this folder; facilitators merge.

```
folder   bricks/stipple-LG/
id       "stipple-LG"
```

Then give Claude this, which is tested and works in one go:

> In `baseplates/sketchpad/bricks/stipple-LG/`, change this brush so the dots
> scatter randomly around the line instead of sitting exactly on it — like a
> stipple or a spray. Use `p.random()`. Keep it to the `stroke` function.
> Don't change the baseplate.

Three more, in increasing order of trouble:

> Make the stroke width follow how fast the pointer is moving — fast strokes
> thin, slow strokes fat. `from` and `to` are one frame apart, so the distance
> between them *is* the speed. Don't change the baseplate.

> Draw a short perpendicular tick at each dot instead of a round dot, so it
> reads like hatching. Don't change the baseplate.

> Make every mark also draw a mirrored copy across the vertical centre line of
> the canvas — `p.width` is the canvas width. Don't change the baseplate.

## The rules, in one line each

- Everything you write stays **inside this folder**.
- `../../` reaches the baseplate. Never import another brick.
- The full contract is at the top of [`../bricks.js`](../bricks.js). Read it.
