# shared-space-DY

A live board that everyone using the same running app can draw on together.

- **Roster:** everyone's name-card portrait (GitHub avatar, with initials as
  the fallback). Pick who you are; anyone sending a heartbeat lights up.
- **Tools:** Text (type, then click), Line (drag), Icon (pick, then click),
  Erase (click an item), and Clear all.
- Every item is tagged with its author's initials and drawn in their colour.

## ⚠️ Needs facilitator approval

This brick depends on **`app/api/shared-space/route.js`**, which lives
outside the brick folder. Under the workshop rules that is an app-shell change.

- The board is held **in the dev server's memory**, so the whole room has to
  open the **same** app URL (one Codespace's forwarded port, set to Public or
  Org visibility). Separate Codespaces don't share a board.
- The board **resets** when the dev server restarts.
- Clients poll once a second, which is fine for a room-sized group.
- Anyone can erase anything. There is no auth.

To add a person, add a row to `PEOPLE` in `people.jsx`.
