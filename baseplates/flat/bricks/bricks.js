/**
 * This baseplate's brick registry — the inner studs.
 *
 * `lib/baseplates.js` snaps the BASEPLATES into the app.
 * This file snaps this baseplate's BRICKS onto this baseplate.
 *
 * One import above, one array entry below. Nothing else needs to know your
 * brick exists — the grid reads this list.
 *
 * ---------------------------------------------------------------------------
 * ON THIS BASEPLATE, A BRICK IS ONE CARD ON A BLANK SURFACE.
 * ---------------------------------------------------------------------------
 * This is the surface with nothing moulded into it. There's no canvas, no 3D
 * scene, no thread — so a brick here isn't a tool or a message type, it's just
 * *a thing that lives in a box*. A note pad. A punch list. A converter. A
 * countdown. If your idea starts with "it's basically a little app that…",
 * it goes here.
 *
 * A BRICK is a plain object:
 *
 *   id      unique string, ending in your two initials
 *   label   human name, shown in the card's header
 *   cards   [ { id, label, order, span, hint, Card } ]
 *       id     unique across the baseplate
 *       label  the card header
 *       order  default position on the board, low to high
 *       span   1 (default), 2 or 3 — the card's width *until the user
 *              resizes it*. The workspace owns the live layout.
 *       hint   optional one-liner next to the header
 *       Card   your component. Props: { expanded } — true when the user has
 *              blown your card up to fill the surface. Use it to show more,
 *              or ignore it entirely.
 *
 * The board around your card (collapse, remove, resize, reorder, export)
 * belongs to the baseplate. Removing a card tucks it into the Add tray; it
 * does not unregister your brick. A hard refresh restores the default grid
 * from this file; card *contents* still survive via `storage.js`.
 *
 * What a brick may import from the BASEPLATE:
 *   ../../storage   useCardState(key, fallback) — state that survives reload
 *   ../../atoms     expandedCardIdAtom, workspaceLayoutAtom
 * Plus anything in `components/ui/` and `lib/`. Bricks don't import each other.
 *
 * ---------------------------------------------------------------------------
 * NO LIBRARIES. THAT IS THE POINT OF THIS ONE.
 * ---------------------------------------------------------------------------
 * The other baseplates carry three.js, p5, Recharts, pdf.js. Nothing here does,
 * and nothing here needs to. That makes this the fastest baseplate to start on
 * and the hardest one to break: if your card is misbehaving, it's your card.
 * (You may still reach for anything already in `package.json` — just don't
 * assume you need to.)
 *
 * ---------------------------------------------------------------------------
 * NAMING — folder and id end in your two initials
 * ---------------------------------------------------------------------------
 *   branch   <your initials>, e.g. LG    already created. Do not make a new branch.
 *   folder   bricks/unit-converter-LG/
 *   id       "unit-converter-LG"
 *   PR       that folder + two lines in this file. Facilitators merge.
 *
 * The starter bricks below end in `-XX` — nobody's initials — because they
 * ship as examples. The card ids inside them stay plain: those belong to this
 * baseplate's contract, not to you.
 *
 * ---------------------------------------------------------------------------
 * KIT — on the canvas vs in the tray (`lib/bricks.js`)
 * ---------------------------------------------------------------------------
 * On THIS surface, every brick defaults ON. Flat is the social wall: a
 * nametag ending in your initials should appear after a merge, not hide.
 * Hide a card with the tile X if the wall gets loud.
 *
 * On later surfaces (dashboard, 3D, vector), the naming rule is the kit:
 * `-XX` starter bricks default on; initialed remix proofs default off.
 * After rebase, those Screens call `visibleBricks(baseplateId, bricks, hidden)`.
 * Do not put scene selection (building / floor) in this file — that is
 * `lib/scene.js`. Do not put published objects here — that is artifacts.
 */

// ── Every brick on this baseplate is imported here, and only here. Yours goes
// ── at the end of the list, then at the end of the array below. Two lines.
import { notesBrick } from "./notes-XX";
import { checklistBrick } from "./checklist-XX";
import { hudLG } from "./hud-LG";
import { studentIdDY } from "./student-id-DY";
import { notebookCR } from "./notebook-CR";
import { posterMH } from "./poster-MH";
import { magicCardDY } from "./magic-card-DY";
import { sharedSpaceDY } from "./shared-space-DY";

export const bricks = [
  notesBrick,
  checklistBrick,
  hudLG,
  studentIdDY,
  notebookCR,
  posterMH,
  magicCardDY,
  sharedSpaceDY,
];

export const cardsByOrder = bricks
  .flatMap((brick) => brick.cards ?? [])
  .sort((a, b) => a.order - b.order);

export function getCard(id) {
  return cardsByOrder.find((card) => card.id === id) ?? null;
}
