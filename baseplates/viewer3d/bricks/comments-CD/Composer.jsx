"use client";

import { useRef, useState } from "react";
import { SendHorizontal, Trash2 } from "lucide-react";
import {
  AUTHOR,
  Avatar,
  FLUENT_FONT,
  FLUENT_VARS,
  ICON_BUTTON,
  SHADOW_16,
  SHADOW_8,
  SHIELD,
} from "./fluent";
import { handleOf, queryAt } from "./mentions";
import { targetText } from "./targets";

// Both components render inside drei's <Html>, which is its own React root:
// no context reaches them, so they take plain props and keep local state only.

/** The marker left on the model: a numbered comment bubble. */
export function Pin({ label, title, resolved = false, selected = false, onClick }) {
  const tone = resolved
    ? "border-[color:var(--f-stroke1)] bg-[var(--f-bg3)] text-[color:var(--f-fg3)]"
    : "border-white bg-[var(--f-brand-bg)] text-white";
  const emphasis = selected
    ? "scale-125 ring-2 ring-[color:var(--f-brand-fg)] ring-offset-1"
    : "hover:scale-110";
  return (
    <div className={FLUENT_VARS} style={{ fontFamily: FLUENT_FONT }} {...SHIELD}>
      <button
        type="button"
        title={title}
        aria-label={title}
        onClick={onClick}
        className={`flex size-6 items-center justify-center rounded-full rounded-bl-none border text-[11px] font-semibold leading-none transition-transform ${tone} ${emphasis}`}
        style={{ boxShadow: SHADOW_8 }}
      >
        {label}
      </button>
    </div>
  );
}

/** The draft card that opens where you clicked. */
export function Composer({ target, team = [], onSubmit, onDiscard }) {
  const [text, setText] = useState("");
  const [caret, setCaret] = useState(0);
  const [choice, setChoice] = useState(0);
  const ref = useRef(null);
  const value = text.trim();

  // The @partial being typed, and the teammates that match it.
  const mention = queryAt(text, caret);
  const matches = mention
    ? team
        .filter((m) => handleOf(m).toLowerCase().startsWith(mention.query.toLowerCase()))
        .slice(0, 5)
    : [];
  const active = Math.min(choice, Math.max(matches.length - 1, 0));

  // Re-read the text and caret from the textarea itself rather than from this
  // render's closure: a click on the list or an Enter can arrive after state
  // has moved on, when there is no @query any more. No query, nothing to do.
  const pick = (member) => {
    const el = ref.current;
    const current = el ? el.value : text;
    const at = el ? el.selectionStart : caret;
    const found = queryAt(current, at);
    if (!found) return;
    const handle = `@${handleOf(member)} `;
    const next = current.slice(0, found.start) + handle + current.slice(at);
    const nextCaret = found.start + handle.length;
    setText(next);
    setCaret(nextCaret);
    setChoice(0);
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(nextCaret, nextCaret);
    });
  };
  const send = () => {
    if (value) onSubmit(value);
  };

  return (
    <div
      className={`${FLUENT_VARS} ml-5 -mt-4 w-72 rounded-[8px] border border-b-2 border-[color:var(--f-stroke2)] bg-[var(--f-bg1)] p-3 text-[color:var(--f-fg1)] focus-within:border-b-[color:var(--f-brand-fg)]`}
      style={{ fontFamily: FLUENT_FONT, boxShadow: SHADOW_16 }}
      {...SHIELD}
    >
      <div className="flex items-center gap-2">
        <Avatar />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold leading-5">{AUTHOR}</div>
          <div className="truncate text-[12px] leading-4 text-[color:var(--f-fg3)]">
            {targetText(target)}
          </div>
        </div>
        <span className="text-[12px] leading-4 text-[color:var(--f-fg3)]">Draft</span>
      </div>

      <textarea
        autoFocus
        rows={2}
        ref={ref}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setCaret(event.target.selectionStart);
          setChoice(0);
        }}
        onSelect={(event) => setCaret(event.target.selectionStart)}
        onKeyDown={(event) => {
          if (matches.length > 0) {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              const step = event.key === "ArrowDown" ? 1 : -1;
              setChoice((active + step + matches.length) % matches.length);
              return;
            }
            if (event.key === "Enter" || event.key === "Tab") {
              event.preventDefault();
              pick(matches[active]);
              return;
            }
          }
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            send();
          } else if (event.key === "Escape") {
            onDiscard();
          }
        }}
        placeholder="Add a comment…"
        aria-label={`Comment on ${targetText(target)}`}
        className="mt-2 block w-full resize-none bg-transparent text-[14px] leading-5 outline-none placeholder:text-[color:var(--f-fg3)]"
      />

      {matches.length > 0 ? (
        <ul
          role="listbox"
          aria-label="Mention a teammate"
          className="mt-1 overflow-hidden rounded-[4px] border border-[color:var(--f-stroke2)] bg-[var(--f-bg1)]"
          style={{ boxShadow: SHADOW_8 }}
        >
          {matches.map((member, i) => (
            <li key={member.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  pick(member);
                }}
                className={`flex w-full items-center gap-2 px-2 py-1 text-left ${
                  i === active ? "bg-[var(--f-brand-bg2)]" : "hover:bg-[var(--f-bg3)]"
                }`}
              >
                <Avatar name={member.name} size={20} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] leading-5">{member.name}</span>
                  <span className="block truncate text-[12px] leading-4 text-[color:var(--f-fg3)]">
                    {member.email}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : mention && team.length === 0 ? (
        <div className="mt-1 text-[12px] leading-4 text-[color:var(--f-fg3)]">
          No team yet — add people in the Comments panel.
        </div>
      ) : null}

      <div className="mt-1 flex items-center justify-between">
        <button
          type="button"
          className={ICON_BUTTON}
          onClick={onDiscard}
          title="Discard draft (Esc)"
          aria-label="Discard draft"
        >
          <Trash2 className="size-4" />
        </button>
        <button
          type="button"
          className={`${ICON_BUTTON} text-[color:var(--f-brand-fg)]`}
          onClick={send}
          disabled={!value}
          title="Post comment (Enter)"
          aria-label="Post comment"
        >
          <SendHorizontal className="size-4" />
        </button>
      </div>
    </div>
  );
}
