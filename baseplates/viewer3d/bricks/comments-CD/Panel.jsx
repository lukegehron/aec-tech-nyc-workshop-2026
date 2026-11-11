"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Check, MessageSquare, RotateCcw, Trash2, X } from "lucide-react";
import { commentPanelOpenAtom, commentSelectedAtom, commentsAtom, teamAtom } from "./atoms";
import {
  Avatar,
  FLUENT_FONT,
  FLUENT_VARS,
  ICON_BUTTON,
  SHADOW_16,
  SHADOW_2,
  formatTime,
} from "./fluent";
import { findMentions, splitMentions } from "./mentions";
import { TeamEditor } from "./Team";
import { targetText } from "./targets";

/**
 * The side panel: every comment, open ones first. It is a non-modal Fluent
 * drawer pinned to the right edge of the window, so the model stays usable
 * while it is open. Portalled to <body> because a brick's `Toolbar` only owns
 * a slot in the toolbar row — the page layout belongs to the baseplate.
 */
export function CommentPanel() {
  const [comments, setComments] = useAtom(commentsAtom);
  const [selected, setSelected] = useAtom(commentSelectedAtom);
  const setOpen = useSetAtom(commentPanelOpenAtom);
  const team = useAtomValue(teamAtom);
  const listRef = useRef(null);

  // Clicking a pin in the model brings its card into view.
  useEffect(() => {
    if (!selected) return;
    listRef.current
      ?.querySelector(`[data-comment="${selected}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);

  const numbered = comments.map((comment, index) => ({ ...comment, number: index + 1 }));
  const ordered = [
    ...numbered.filter((c) => !c.resolved),
    ...numbered.filter((c) => c.resolved),
  ];
  const openCount = numbered.filter((c) => !c.resolved).length;

  const setResolved = (id, resolved) =>
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, resolved } : c)));
  const remove = (id) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    if (selected === id) setSelected(null);
  };

  return createPortal(
    <aside
      aria-label="Comments"
      className={`${FLUENT_VARS} fixed inset-y-0 right-0 z-50 flex w-80 max-w-[90vw] flex-col border-l border-[color:var(--f-stroke2)] bg-[var(--f-bg2)] text-[color:var(--f-fg1)]`}
      style={{ fontFamily: FLUENT_FONT, boxShadow: SHADOW_16 }}
    >
      <header className="flex items-center gap-2 border-b border-[color:var(--f-stroke2)] bg-[var(--f-bg1)] px-4 py-3">
        <h2 className="text-[16px] font-semibold leading-[22px]">Comments</h2>
        <span className="text-[12px] leading-4 text-[color:var(--f-fg3)]">
          {openCount} open · {comments.length - openCount} resolved
        </span>
        <button
          type="button"
          className={`${ICON_BUTTON} ml-auto`}
          onClick={() => setOpen(false)}
          title="Close comments"
          aria-label="Close comments"
        >
          <X className="size-4" />
        </button>
      </header>

      <TeamEditor />

      <div ref={listRef} className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {ordered.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <MessageSquare className="size-8 text-[color:var(--f-fg3)]" />
            <div className="text-[14px] font-semibold leading-5">No comments yet</div>
            <div className="text-[12px] leading-4 text-[color:var(--f-fg3)]">
              Turn on Comment, then click a building, floor or space in the model.
            </div>
          </div>
        ) : null}

        {ordered.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            team={team}
            active={comment.id === selected}
            onSelect={() => setSelected(comment.id === selected ? null : comment.id)}
            onResolve={() => setResolved(comment.id, !comment.resolved)}
            onDelete={() => remove(comment.id)}
          />
        ))}
      </div>
    </aside>,
    document.body,
  );
}

function CommentCard({ comment, team, active, onSelect, onResolve, onDelete }) {
  return (
    <article
      data-comment={comment.id}
      className={`rounded-[8px] border bg-[var(--f-bg1)] p-3 ${
        active
          ? "border-[color:var(--f-brand-fg)]"
          : "border-[color:var(--f-stroke2)] hover:border-[color:var(--f-stroke1)]"
      } ${comment.resolved ? "opacity-70" : ""}`}
      style={{ boxShadow: SHADOW_2 }}
    >
      <button
        type="button"
        className="block w-full rounded-[4px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--f-fg1)]"
        onClick={onSelect}
        aria-pressed={active}
        title="Highlight this comment's pin in the model"
      >
        <span className="flex items-center gap-2">
          <Avatar name={comment.author} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold leading-5">
              {comment.author}
            </span>
            <span className="block text-[12px] leading-4 text-[color:var(--f-fg3)]">
              {formatTime(comment.createdAt)}
              {comment.resolved ? " · Resolved" : ""}
            </span>
          </span>
          <span className="flex size-5 items-center justify-center rounded-full bg-[var(--f-brand-bg2)] text-[11px] font-semibold text-[color:var(--f-brand-fg)]">
            {comment.number}
          </span>
        </span>
        <span className="mt-2 block truncate text-[12px] font-semibold leading-4 text-[color:var(--f-brand-fg)]">
          {targetText(comment.target)}
        </span>
        <span className="mt-1 block whitespace-pre-wrap break-words text-[14px] leading-5">
          {splitMentions(comment.text, team).map((part, i) =>
            part.mention ? (
              <span key={i} className="font-semibold text-[color:var(--f-brand-fg)]">
                {part.text}
              </span>
            ) : (
              part.text
            ),
          )}
        </span>
        {findMentions(comment.text, team).length > 0 ? (
          <span className="mt-1 block text-[12px] leading-4 text-[color:var(--f-fg3)]">
            Mentioned: {findMentions(comment.text, team).map((m) => m.name).join(", ")}
          </span>
        ) : null}
      </button>

      <div className="mt-2 flex justify-end gap-1">
        <button
          type="button"
          className={ICON_BUTTON}
          onClick={onResolve}
          title={comment.resolved ? "Reopen" : "Resolve"}
          aria-label={comment.resolved ? "Reopen comment" : "Resolve comment"}
        >
          {comment.resolved ? <RotateCcw className="size-4" /> : <Check className="size-4" />}
        </button>
        <button
          type="button"
          className={ICON_BUTTON}
          onClick={onDelete}
          title="Delete"
          aria-label="Delete comment"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </article>
  );
}
