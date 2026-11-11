# Re-create the Wet Ink drawing experience

Paste this whole file into a new chat and say: **"Build this."** It is written
so an assistant can rebuild the brush from scratch: as a brick in this repo,
or as a standalone p5 / Canvas 2D page (see the last section).

---

## 1 · What it is

A brush that simulates **ink dropped onto damp, warm-toned paper**.

- The ink **keeps flowing for as long as the mouse button is held**, even if the
  pointer doesn't move. Holding still makes it pool and send out more bleed.
  Releasing freezes the flow.
- Wet inks **never mix**; they **intertwine**. A new stroke can't bleed across
  another wet stroke. It winds round it and fills whatever free paper it can reach.
- **Dry canvas** fixes the wet ink in place. After that, new ink is a new layer
  on top and can't disturb what's beneath.
- The bleed is **mostly thin thread lines**, with only the odd soft spot.
- Inks: **black, plum, emerald** (pigments), plus **pearl silver and gold**
  (opaque liquid metals).
- While the brush is selected, the UI turns **warm and minimal**: a cream
  background, a thin font, only the five ink swatches, a **Flow** slider in
  place of Size, and **Dry canvas** and **Download JPEG** buttons.

---

## 2 · Where it lives (in this repo)

- Folder: `baseplates/sketchpad/bricks/wet-ink-<INITIALS>/`. The id is the same
  as the folder name.
- Register it with **two lines** in `baseplates/sketchpad/bricks/bricks.js`: one
  import, and one entry at the end of the `bricks` array.
- **Do not edit the Sketchpad itself** (`Screen.jsx`, `sketch.js`). Everything
  below is done from inside the brick folder.
- The brick contract: export `{ id, label, order, hint, stroke(p, ctx) }`.
  `stroke` is called **once per frame while the pointer is down** inside the
  canvas. `ctx = { color, weight, from, to }`. `p` is the p5 v2 instance;
  `p.drawingContext` is the Canvas 2D context.
- The toolbar swatches are fixed: `#111827 #ef4444 #3b82f6 #22c55e #f59e0b`.
  The Size slider gives `weight` from 1 to 24.
- Initialed bricks start hidden. Enable the brush in the **"Add to this surface"** tray.

Files:

| File | Job |
|---|---|
| `index.js` | the brush: stroke logic, particles, layers, drying, download, auto-paper |
| `wetlayer.js` | the pixel-level wet layer: ownership, density, pigment colour, metal shading |
| `inks.js` | ink colours, swatch mapping, metal tone ramps |
| `paper.js` | blank-canvas check and the warm paper texture |
| `theme.js` | restyles the page while the brush is active, and injects the buttons |

---

## 3 · Layers and drawing loop

Keep three offscreen canvases the same size as the main canvas, in device pixels:

- **dry**: paper, dried ink, and anything other brushes drew.
- **wet**: produced by `wetlayer.js` as two images, **ink** (multiply) and **metal** (opaque).
- **last**: a copy of what we last drew, used to spot another brush drawing in between.

Every frame of a stroke:
1. Advance the simulation (stamps into the wet layer).
2. Upload the changed rectangle of the wet images (`putImageData` with a dirty rect).
3. **Compose** the main canvas with an identity transform:
   - `copy` the dry canvas;
   - `multiply` the ink image;
   - if there's metal: a glow pass, the metal image blurred (`ctx.filter =
     "blur(6·dpr px) brightness(1.15)"`) at `screen` and alpha 0.55, guarded by
     `typeof ctx.filter === "string"`; then the metal image at `source-over`;
   - copy the result into **last**.

**Start of a stroke** (a stroke is "new" if `p.frameCount - lastFrame > 2`; set
`from = to` because pmouse is stale):
- If the canvas is blank (pure white in two opposite corners), lay the paper,
  then dry.
- Else, if the canvas doesn't match **last**, dry. Compare with
  `getImageData`: sample every 7th pixel, tolerance 3 per channel, mismatch
  allowed on at most 0.1% of samples. A mismatch means another brush drew,
  which counts as drying.
- Start a new **pass** (an id from 1 to 65535) tagged with the selected ink.

**Dry** = copy main into dry, clear the wet layer, drop particles, copy main into last.

---

## 4 · The wet layer (`wetlayer.js`): the "never mix" rule

Per device pixel:
- `dens` (Float32): how much ink is there.
- `owner` (Uint16): the pass that inked it.
- `passInk[pass]` (Uint8): which ink that pass uses.

**The rule:** a pixel with `dens > 0.03` that belongs to another pass is
**off-limits**. A pass may only ink empty paper or its own pixels. Density is
capped at 6.

- `blocked(x, y, pass)` (css px) returns true off-canvas, or when the pixel is held by another pass.
- `stamp(x, y, r, amt, pass, soft)`: a disc in css px (radius at least 0.6
  device px) that skips blocked pixels.
  - Soft falloff: `(1 − (d/r)²)²`.
  - Flat core: `min(1, (r − d) / max(1, 0.35r))`.
  - Adds `amt·falloff` to `dens` and sets `owner`.
  - **Pigment colour** is written straight into the ink image:
    `t = 1 − e^(−dens)`, `rgb = 255·(1 − absorb·t)`, where
    `absorb = 1 − inkRGB/255`. Empty pixels are white.
  - **Metal** pixels are shaded later, in `flush`.
  - Track a dirty rect for each image.
- Metal shading (in `flush`, over the dirty rect plus a 2 px margin):
  - Treat `min(2.5, dens)`, counting only this pass's pixels, as a **height field**.
  - Normal: `(−gx, −gy, 1)` normalised, with central differences scaled by `1.6/dpr`.
  - Light: `normalize(−0.55, −0.65, 0.55)`. Use Blinn half-vector specular.
  - Environment bands: `env = 0.5 + 0.5·sin(4·ny + 2.5·nx)`.
  - **Gold**: `t = 0.05 + 0.8·diffuse + 0.15·env` into a 4-stop ramp
    `[92,60,14] → [190,138,42] → [246,210,116] → [255,248,220]`, plus
    `spec = half^30 · 0.8`.
  - **Pearl silver**: `t = 0.35 + 0.5·diffuse + 0.15·env` into the ramp
    `[168,164,178] → [214,210,220] → [238,235,240] → [255,253,250]`, plus
    `spec = half^18 · 0.45`.
    - Nacre shimmer: `phase = 6·nx + 4·ny + 0.8·dens`, `amp = 10 + 22·(1 − nz)`.
    - Add `amp·sin(phase)`, `amp·sin(phase+2.1)` and `amp·sin(phase+4.2)` to R, G and B.
  - Alpha: `min(255, dens·3·255)`. Metal is opaque almost at once.

---

## 5 · The stroke (`index.js`)

`flow = (weight − 1) / 23` (0 to 1). `size = 5 + 5·flow`. Higher flow means
more ink everywhere.

Pass behaviour:

| | pigment | metal |
|---|---|---|
| core radius × | 1 | 1 |
| core load | `0.05 + 0.3·flow` | `0.3 + 0.5·flow` |
| spot chance | 0.12 (the rest are threads) | 0.12 |
| thread kick | `0.8 + rand·0.9` | same |
| thread life (frames) | `60 + rand·110` | same |
| thread radius (css px) | `0.35 + rand·0.6` | `0.6 + rand·0.7` |
| thread momentum (drag) | 0.94 | 0.94 |
| thread amount | `0.16 + 0.34·flow` | `0.4 + 0.4·flow` |
| end bead radius | 0.7 | 1.0 |

Each frame:
1. **Core:** walk from `from` to `to` in steps of `size·0.5`.
   - At each step, stamp a flat disc of radius `size·(0.9..1.2)` with
     `load / (1 + dist·0.04)`, so fast strokes carry less ink.
   - Spawn `1 + round(2·flow)` particles.
2. **Holding still** (moved less than 0.8 px): soft-stamp a pool of radius
   `size·(1 + min(still,120)·0.008)` with amount `0.01 + 0.04·flow`, and spawn
   `2 + round(3·flow)` particles.
3. **Particles** (cap 900), each frame:
   - Velocity += the direction from `p.noise(x·0.015, y·0.015, frame·0.006)·4π`
     times `pull` (0.22 for threads, 0.15 for spots), then times `drag`.
   - **If the next position is blocked, steer:** try turning the heading by
     ±0.5, ±1.1 and ±1.7 rad, starting on the particle's preferred `side` (±1,
     random at spawn). Take the first free direction. If none is free, the
     particle dies.
   - **Threads:** stamp soft discs every 0.5 px along the move. Radius is
     `r·(0.45 + 0.55·fade)`, amount is `threadAmt·fade`, and `fade = life/max`.
   - **Spots:** soft stamp with radius shrinking ×0.975 per frame, amount
     `(0.015 + 0.04·flow)·fade`, ×5 for metal.
   - **On death:** a darker grain, a soft stamp of `bead` radius with amount
     `0.5 + 0.4·flow`.
   - Spawn: offset `±size·0.4`, plus 4% of the stroke velocity.
4. Flush, then compose.

---

## 6 · Paper (`paper.js`)

- Blank check: pixels `(0,0)` and `(w−1,h−1)` are both exactly 255,255,255.
- Texture at device resolution, drawn with `multiply` and an identity transform:
  - Base colour is cream `[238,224,198]`.
  - Per-pixel value `v = mottle + grain`:
    - `mottle = noise(x·0.004, y·0.004)·22 − 11`, using a small built-in smooth
      value noise (no p5 needed).
    - `grain = (rand − 0.5)·14`.
  - Channels: R+v, G+v, B+1.1v.
  - Add 260 faint fibres: wandering polylines 6–24 segments long, 1.5 px steps,
    `rgba(150,120,85, 0.05–0.13)`, width 0.5–1.5.
- **Paper by default:** while the brush is active, check every 250 ms. If the
  canvas is blank, lay the paper, and dry if we already hold that canvas.
  Stop checking when the brush isn't active.
- Find the canvas with `canvas.p5Canvas` that is not `display:none` and has an
  `offsetParent`. React Strict Mode can leave a hidden duplicate canvas.

---

## 7 · UI while Wet ink is active (`theme.js`)

There are no toolbar hooks in the contract, so restyle from the outside:

- **Detect active:** the Sketchpad prints the active brush's `hint` in a `<p>`
  under the canvas. Watch with a `MutationObserver` on `body` (subtree,
  childList, characterData), throttled with `requestAnimationFrame`. When a
  `<p>` matches the hint exactly, set `html[data-wet-ink]`; otherwise remove it.
  On hot reload, disconnect the previous observer, stored on `window`.
- **One injected `<style>`**, scoped to `html[data-wet-ink]`:
  - Theme variables, warm: `--background #f3eadb`, `--card #f8f1e4`,
    `--foreground #2b2420`, `--secondary #e7d9c2`, `--muted #ebdfcb`,
    `--muted-foreground #8a7a68`, `--border #ddcdb4`, `--primary #2b2420`,
    `--ring #b8a183`. Apply them to `.dark` too.
  - Every element: the Geist sans font, `font-weight: 200 !important`,
    `letter-spacing: 0.04em`. No card shadow.
  - Swatches, `button[aria-label="Brush color <hex>"]`: recolour them with
    `!important`. A stylesheet `!important` beats React's inline style.
    - `#111827` → black `#1a1614`
    - `#ef4444` → plum `#5c224e`
    - `#22c55e` → emerald `#0c6e4e`
    - `#3b82f6` → pearl silver `#ece8f0`, with a pearly gradient
      `#fffdfb → #f1e6ee → #e6eef0 → #f6f0e4 → #bdb8c4`
    - `#f59e0b` → gold `#d4a537`, with a gradient `#fff1b8 → #c9952e → #f6d77a → #7a5416`
    - Order them with flex `order` as black, plum, emerald, then silver and
      gold, with `margin-left: 0.75rem` before silver.
    - Make them smaller (1.1 rem) with a 1 px border.
  - Slider: a 1 px track and a small thumb. Tag the `<span>` whose text is
    "Size" with a data attribute, then `font-size:0` and `::before { content:"Flow" }`.
- **Buttons:** clone the Clear button's `className` and insert after Clear:
  **Dry canvas**, then **Download JPEG**. Each briefly shows "Dried" or "Saved".
  Remove them when the brush is inactive.
- **Download JPEG:** `canvas.toBlob(..., "image/jpeg", 0.92)` saved as
  `wet-ink-YYYYMMDDHHMM.jpeg` through a temporary `<a download>`.
- Swatch → ink mapping in the brush: use the table above; anything unknown is black.

---

## 8 · Gotchas learned the hard way

- **Don't simulate on a coarse grid.** At 2 px cells the ink went blurry and
  looked like airbrush, and the thin threads were lost. Work at full device
  resolution.
- **Don't let new ink lift or overwrite old ink**, and don't blend wet inks.
  Ownership per pixel is what gives "intertwine, never mix".
- Creating an array per pixel in the shading loop causes stutter. Inline the maths.
- The Base UI single-thumb Slider sends a **plain number** to `onValueChange`
  on drag. The Sketchpad now handles both shapes (`Array.isArray(v) ? v[0] : v`);
  keep that fix if you're rebuilding the baseplate.
- Animated effects that repaint the canvas between strokes (we tried sparkles)
  fight with Clear and with other brushes. If you add one, stop it when the
  brush isn't active and when the canvas goes blank.
- `next/dynamic(..., { ssr:false })` and DOM access: the brush module loads on
  the server too, so guard any `window`/`document` use.

---

## 9 · Acceptance checks

1. Select Wet ink, and warm paper appears with no click. Press Clear, and paper
   returns within about 250 ms.
2. Hold the button still: ink keeps blooming and sending out threads. Release,
   and it stops.
3. Draw black, then drag plum across it while wet. The black stays intact: no
   pixels lost, and no brown mixing. Plum threads stop at the black edge and
   run along it.
4. Press Dry canvas, then draw over the dried area. The new ink sits on top as a new layer.
5. Flow at 24 gives visibly more ink than Flow at 1.
6. Gold looks like opaque liquid gold with a soft glow. Silver reads as pearl:
   pale, with a faint pink, green and blue shimmer on the slopes.
7. Switch to Pen: the UI returns to normal, and the extra buttons disappear.
8. Download JPEG saves exactly what's on the canvas.

---

## 10 · Standalone (outside this repo)

Same design, minus the brick plumbing:
- Use a plain `<canvas>` or a p5 sketch.
- Call `stroke(...)` yourself in a `requestAnimationFrame` loop while
  `pointerdown` is active, passing `from` (the previous pointer position) and
  `to` (the current one).
- Make your own swatches (the five inks), a Flow slider (1–24), and Clear, Dry
  canvas and Download JPEG buttons.
- Theme the page directly instead of the observer and injected-CSS workaround.
- Replace `p.noise` with any smooth 3-D noise.
