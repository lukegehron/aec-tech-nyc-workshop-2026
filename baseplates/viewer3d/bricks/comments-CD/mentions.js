import { targetText } from "./targets";

/**
 * @mentions. A team member is `{ id, name, email }`; the thing you type after
 * the @ is their "handle" — the name with spaces removed ("Luke Gehron" is
 * @LukeGehron). Matching is case-insensitive.
 */

const WORD = "[\\p{L}\\p{N}_]+";
const HANDLE_BODY = `${WORD}(?:[.-]${WORD})*`;

export const HANDLE_PATTERN = new RegExp(`^${HANDLE_BODY}$`, "u");
const MENTION = new RegExp(`@(${HANDLE_BODY})`, "gu");
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const handleOf = (member) => member.name.replace(/\s+/g, "");

/** Distinct team members mentioned in `text`, in the order they appear. */
export function findMentions(text, team) {
  const byHandle = new Map(team.map((m) => [handleOf(m).toLowerCase(), m]));
  const found = new Map();
  for (const [, handle] of text.matchAll(MENTION)) {
    const member = byHandle.get(handle.toLowerCase());
    if (member) found.set(member.id, member);
  }
  return [...found.values()];
}

/** Split text into plain runs and mention runs, for highlighting. */
export function splitMentions(text, members) {
  const known = new Set(members.map((m) => handleOf(m).toLowerCase()));
  const parts = [];
  let last = 0;
  for (const match of text.matchAll(MENTION)) {
    if (!known.has(match[1].toLowerCase())) continue;
    if (match.index > last) parts.push({ text: text.slice(last, match.index) });
    parts.push({ text: match[0], mention: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

/** The `@partial` being typed just before the caret, or null. */
export function queryAt(text, caret) {
  const match = new RegExp(`@(${WORD}(?:[.-]${WORD})*|)$`, "u").exec(text.slice(0, caret));
  return match ? { start: match.index, query: match[1] } : null;
}

/** One pre-filled email to everyone mentioned. Opens in the user's mail app. */
export function mailtoFor({ members, author, target, text }) {
  const to = members.map((m) => m.email).join(",");
  const where = targetText(target);
  const subject = `${author} mentioned you in a comment on ${where}`;
  const body = `${author} mentioned you in a comment on ${where}:\n\n"${text}"\n`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Hand the link to the OS mail client without navigating this page away. */
export function openMail(url) {
  const link = document.createElement("a");
  link.href = url;
  link.click();
}
