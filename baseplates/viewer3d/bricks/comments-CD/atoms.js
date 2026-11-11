import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// A tool's state is the tool's business — none of this is in `../../atoms.js`.

/** Is the comment tool armed? While false the brick listens to nothing. */
export const commentArmedAtom = atom(false);

/** Is the side panel showing? */
export const commentPanelOpenAtom = atom(false);

/** The comment being written: `{ point: [x, y, z], target }`, or null. */
export const commentDraftAtom = atom(null);

/** Id of the comment highlighted in both the scene and the panel. */
export const commentSelectedAtom = atom(null);

/**
 * Every comment, oldest first:
 * `{ id, text, author, createdAt, resolved, point: [x, y, z], target }`
 * where `target` is `{ id, kind, label }` — the item that was clicked.
 * Kept in localStorage on this machine so a reload doesn't lose the review.
 */
export const commentsAtom = atomWithStorage("viewer3d/comments-CD", []);
