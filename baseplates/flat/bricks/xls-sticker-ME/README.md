# xls-sticker-ME

Megan's nametag on the `flat` baseplate, shaped like the tool that actually
runs the industry: a spreadsheet.

- **Name in A1** — big type, in the selected cell, with the green selection
  outline around it.
- **Title in the formula bar** — `fx  =AgentOperator()`.
- **Seat + GitHub handle** in row 2, **toolkit** one tool per row from row 3.
- **One joke**, big type, in the band where the sum would go.
- **Excel green** (`#217346`) ribbon, sheet tab and status bar.
- **Portrait** is `https://github.com/meganrsalazar5-collab.png`; if it fails to
  load, the avatar falls back to the initials `ME`.

`expanded` makes the name and the joke much larger; everything else keeps its
size so the sheet still reads as a sheet.

## Snapped on with two lines

In [`../bricks.js`](../bricks.js) — and nothing else in that file:

```js
import { xlsStickerME } from "./xls-sticker-ME";
```

```js
  xlsStickerME,
```

## Rules this brick follows

- Everything lives inside this folder. No baseplate, app shell or other brick
  was touched.
- No libraries — React + Tailwind only, which is the point of this baseplate.
- No persisted state, so `../../storage` isn't needed here.
