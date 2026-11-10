# Flat Baseplate

A blank surface. **On this baseplate, a brick is one card.**

Every other baseplate is moulded: a drafting canvas, a 3D scene, a chat
thread. Each of those decides a lot for you before you write a line — which is
useful right up until your idea isn't a drawing, a model, a chart or a message.
Then it's in the way.

This one decides almost nothing. It's a board of cards you can collapse,
remove, resize and reorder. Export the workspace to keep that arrangement
(and the cards' contents); a hard refresh throws the layout away and the
default grid comes back. Other baseplates can be dropped onto the same board
once they unlock.

**Reach for this instead of starting a new baseplate.** Nine times out of ten,
"I need a different surface" turns out to mean "I need a blank card", and a new
baseplate is a much bigger commitment than a new brick.

## No libraries. That's the feature.

The other baseplates carry three.js, p5, Recharts, pdf.js. Nothing here does.
No wasm to fetch, no canvas to size, nothing that can fail on venue Wi-Fi. If a
card here misbehaves, it's your card — which makes this the fastest baseplate
to start on and the easiest one to debug.

(You may still use anything already in `package.json`. Just don't assume you
need to.)

## The moulded surface — what the baseplate gives you

| File | What it is |
|---|---|
| `Screen.jsx` | The board: card frames, collapse / remove / resize / reorder. Reads the registry; holds no card list. |
| `Workspace.jsx` | The chrome around each tile, the Export / Import / Reset bar, the drop tray. |
| `SceneFilters.jsx` | Board-level building / floor strip. Hidden until a `usesScene` tile is docked. |
| `workspace.js` | Layout model — serialisable JSON (v2: layout + scene + kit), no React. |
| `storage.js` | `useCardState(key, fallback)` — state that survives a reload. Export includes it. |
| `atoms.js` | Board layout (in-memory) and which tile is filling the surface. |

Shared, not only this surface: `lib/scene.js` (what you are looking at), `lib/bricks.js` (kit visibility).

## The bricks already here

| Brick | Contributes | Shows you |
|---|---|---|
| `notes-XX` | one card | the smallest useful brick — a text box that remembers. Copy this one |
| `checklist-XX` | one card, two columns wide | `span`, and that two bricks never know about each other |

## The contract

```js
export const myBrick = {
  id: "unit-converter-LG",
  label: "Unit converter",
  cards: [
    {
      id: "converter",     // unique on this baseplate
      label: "Converter",  // the card header
      order: 30,           // position in the grid, low to high
      span: 1,             // 1, 2 or 3 columns on a wide screen
      hint: "mm ↔ inches", // optional, next to the header
      Card: MyCard,        // props: { expanded }
    },
  ],
};
```

Add your two lines to `bricks/bricks.js` and you're done — the grid picks it
up. The full contract is documented at the top of that file.

## Remembering things

```js
const [notes, setNotes] = useCardState("notes-LG", []);
```

That's `localStorage`, keyed by your brick id: **this browser, this machine,
nobody else.** Cross-baseplate data goes through `lib/artifacts.js`.

## Things worth building

A unit converter · a sprint countdown · a daily-rate/fee calculator · a
markdown scratchpad · a colour-palette picker · a "what's my brick called
again" name-tag card · a random-pairing wheel for the demo order · a
timezone strip for a distributed team · a QR code for your PR link.
