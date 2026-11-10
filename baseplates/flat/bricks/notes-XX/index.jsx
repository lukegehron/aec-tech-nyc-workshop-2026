"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCardState } from "../../storage";

/**
 * Notes — the worked example for this baseplate, and about as small as a
 * useful brick gets. Type, it saves; reload, it's still there.
 *
 * Everything it needs from the baseplate is one hook: `useCardState`. No
 * store, no atoms, no network. Copy this folder, rename it to your initials,
 * and you have a working brick before you've decided what it does.
 */
function NotesCard({ expanded }) {
  const [notes, setNotes] = useCardState("notes-XX", []);
  const [draft, setDraft] = useState("");

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    // Ids are made from the note's position and text rather than Date.now(),
    // so two notes added in the same millisecond still differ.
    setNotes([{ id: `${notes.length}-${text.slice(0, 12)}`, text }, ...notes]);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-start gap-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter makes a new line — same as the composer
            // in the chat baseplate, because that's what fingers expect.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Something you'll want at 4pm…"
          className="min-h-16 resize-none text-sm"
          rows={expanded ? 3 : 2}
        />
        <Button size="icon" aria-label="Add note" onClick={add}>
          <Plus className="size-4" />
        </Button>
      </div>

      {notes.length === 0 ? (
        <p className="font-hand text-lg text-muted-foreground">
          nothing yet — this card remembers, even after a refresh
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <li
              key={note.id}
              className="group flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2"
            >
              <span className="flex-1 whitespace-pre-wrap text-sm text-foreground/90">
                {note.text}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete note"
                className="size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                onClick={() => setNotes(notes.filter((n) => n.id !== note.id))}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const notesBrick = {
  id: "notes-XX",
  label: "Notes",
  cards: [
    {
      id: "notes",
      label: "Notes",
      order: 10,
      span: 1,
      hint: "saved on this machine",
      Card: NotesCard,
    },
  ],
};
