# hud-LG — Operator HUD badge

A dark terminal overlay, not a card: the name in green mono, the title as a
status line, and the toolkit listed as running processes with a blinking block
cursor on a `operator@…:~$` prompt. It also keeps a live clock and pulls the
portrait from `https://github.com/<handle>.png`, falling back to the initials
when the image fails.

## Identity

## Registration

This brick is registered in [`../bricks.js`](../bricks.js) with two lines only:

```js
import { hudLG } from "./hud-LG";
```

```js
export const bricks = [notesBrick, checklistBrick, hudLG];
```

Nothing outside this folder — and nothing else in `bricks.js` — changed.