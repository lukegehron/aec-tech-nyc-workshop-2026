"use client";

import { useAtom, useAtomValue } from "jotai";
import { MessageSquarePlus, MessagesSquare } from "lucide-react";
import { commentArmedAtom, commentPanelOpenAtom, commentsAtom } from "./atoms";
import { FLUENT_FONT, FLUENT_VARS, SUBTLE_BUTTON, SUBTLE_CHECKED, SUBTLE_REST } from "./fluent";
import { CommentPanel } from "./Panel";
import { CommentScene } from "./Scene3d";

/**
 * COMMENTS — hover an item, click it, leave a note; read them all in a panel.
 *
 * A TOOL, like `measure-XX`: it builds no boxes, so it works in whichever view
 * mode is showing. `Scene3d` does the picking (its own ray, from plain DOM
 * listeners, because the baseplate's boxes stop propagation on theirs), draws
 * the hover outline, the pins and the draft card. `Toolbar` holds the two
 * buttons and portals the side panel.
 *
 * Styled as Fluent 2 from the tokens in `./fluent.jsx`. Comments are saved in
 * this browser's localStorage — they are not shared with anyone else.
 */

function CommentToolbar() {
  const [armed, setArmed] = useAtom(commentArmedAtom);
  const [open, setOpen] = useAtom(commentPanelOpenAtom);
  const comments = useAtomValue(commentsAtom);
  const openCount = comments.filter((c) => !c.resolved).length;

  return (
    <div
      className={`${FLUENT_VARS} flex items-center gap-0.5 rounded-[4px] border border-[color:var(--f-stroke1)] bg-[var(--f-bg1)] p-0.5`}
      style={{ fontFamily: FLUENT_FONT }}
    >
      <button
        type="button"
        className={`${SUBTLE_BUTTON} ${armed ? SUBTLE_CHECKED : SUBTLE_REST}`}
        onClick={() => setArmed(!armed)}
        aria-pressed={armed}
        title="Click an item in the model to comment on it. Esc discards a draft."
      >
        <MessageSquarePlus className="size-4" />
        Comment
      </button>

      <button
        type="button"
        className={`${SUBTLE_BUTTON} ${open ? SUBTLE_CHECKED : SUBTLE_REST}`}
        onClick={() => setOpen(!open)}
        aria-pressed={open}
        title="Show every comment in the side panel"
      >
        <MessagesSquare className="size-4" />
        Comments
        {openCount > 0 ? (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--f-brand-bg)] px-1 text-[10px] leading-none text-white">
            {openCount}
          </span>
        ) : null}
      </button>

      {armed ? (
        <span className="px-1.5 text-[12px] leading-4 text-[color:var(--f-fg3)]">
          click an item
        </span>
      ) : null}

      {open ? <CommentPanel /> : null}
    </div>
  );
}

export const commentsBrick = {
  id: "comments-CD",
  label: "Comments",
  hint: "Click an item to comment on it; read every comment in the side panel",
  order: 70,
  Toolbar: CommentToolbar,
  Scene3d: CommentScene,
};
