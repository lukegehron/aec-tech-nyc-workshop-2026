# xls-sticker-ME

Megan's nametag on the `flat` baseplate, shaped like the tool that actually
runs the industry: a spreadsheet.

- **Name in A1** — big type, in the selected cell, with the green selection
  outline around it.
- **Title in the formula bar** — `fx  =AgentOperator()`.
- **Seat + GitHub handle** in row 2, **toolkit** one tool per row from row 3.
- **One joke**, big type, in the band where the sum would go — with **Blue the
  Australian Shepherd** sitting next to it, in the slot the paperclip assistant
  used to occupy. She's hand-drawn inline SVG (`AussieShepherd.jsx`): blue merle
  coat, white blaze, copper cheeks, one blue eye and one brown, and the nub tail.
  No image request, so nothing to fail on venue Wi-Fi. She grows to `size-24`
  when the card is expanded.
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
