# Your brick goes here

## 1 · What this stub does today

It's a **card** that shows the current time, ticking once a second, and gets
bigger when you expand it. React and Tailwind — no libraries, nothing to load,
nothing that can fail on venue Wi-Fi.

It is **not registered**, so it doesn't appear in the app yet. That's on purpose:
snapping it on is the first thing you do, and it's the whole lesson.

## 2 · Snap it on — the two lines

Open [`../bricks.js`](../bricks.js). Add one import at the top and one entry to
the array. **Nothing else in that file changes.**

```js
import { lanyardME } from "./lanyard-ME";
```

```js
export const bricks = [notesBrick, checklistBrick, lanyardME];
```

Save, look at the browser. There's a new card in the grid. **That's a brick,
snapped onto a baseplate, and those two lines are the studs.**

Nobody edited `Screen.jsx`. The grid found it by itself.

## 3 · Now make it yours

Rename first — folder and `id` to the same name ending in your two initials.
Stay on your initials branch (e.g. `LG`) — it already exists. Open a new PR for
this folder; facilitators merge.

```
folder   bricks/sprint-timer-LG/
id       "sprint-timer-LG"
```

Then give Cline this, which is tested and works in one go:

> In `baseplates/flat/bricks/sprint-timer-LG/`, turn this clock into a countdown
> to 3:50pm today — the end of the build sprint — showing hours, minutes and
> seconds remaining. Keep the big number style it already has. Don't change the
> baseplate.

Three more, in increasing order of trouble:

> Add a unit converter to this card: a number input, a from/to dropdown pair for
> metres / feet / millimetres / inches, and the converted result underneath. Use
> the `Input` and `Select` components from `@/components/ui/`. Don't change the
> baseplate.

> Make this card remember its state across a page reload using
> `useCardState(key, fallback)` from `../../storage` — the notes brick next door
> shows how. Don't change the baseplate.

> Turn this into a punch list where each row has a photo you can drag and drop
> onto it, held as a data URL. Set `span: 2` so it's wide enough. Don't change
> the baseplate.

## The rules, in one line each

- Everything you write stays **inside this folder**.
- `../../storage` and `../../atoms` are the baseplate. Never import another brick.
- `useCardState` is `localStorage` — **this browser only**. If the whole room
  needs to see it, that's a conversation with a facilitator.
- The full contract is at the top of [`../bricks.js`](../bricks.js). Read it.
