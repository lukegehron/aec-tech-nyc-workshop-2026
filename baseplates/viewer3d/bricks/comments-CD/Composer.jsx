"use client";

import { useState } from "react";
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
export function Composer({ target, onSubmit, onDiscard }) {
  const [text, setText] = useState("");
  const value = text.trim();
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
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
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
