"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCardState } from "../../storage";

/**
 * A punch list. The second brick on this baseplate, and it exists mostly to
 * prove the point: two bricks, two folders, two lines in `bricks.js`, and
 * neither one knows the other is there.
 *
 * Note the different `span` — this card asks for two columns on a wide screen.
 * That's the only thing the baseplate lets a card negotiate about its box.
 */
function ChecklistCard() {
  const [items, setItems] = useCardState("checklist-XX", []);
  const [draft, setDraft] = useState("");

  const add = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setItems([...items, { id: `${items.length}-${text.slice(0, 12)}`, text, done: false }]);
    setDraft("");
  };

  const toggle = (id) =>
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );

  const done = items.filter((item) => item.done).length;

  return (
    <div className="flex h-full flex-col gap-3">
      <form onSubmit={add} className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add an item…"
          className="text-sm"
        />
        <Button type="submit" size="sm">
          Add
        </Button>
      </form>

      {items.length === 0 ? (
        <p className="font-hand text-lg text-muted-foreground">
          empty punch list — the best kind
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-1.5">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-2">
                {/* The checkbox carries the accessible name; the text beside it
                    is just a bigger click target for a mouse. */}
                <Checkbox
                  checked={item.done}
                  aria-label={item.text}
                  onCheckedChange={() => toggle(item.id)}
                />
                <span
                  onClick={() => toggle(item.id)}
                  className={`flex-1 cursor-pointer text-sm ${
                    item.done
                      ? "text-muted-foreground line-through"
                      : "text-foreground/90"
                  }`}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {done} of {items.length} done
            </span>
            {done > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setItems(items.filter((item) => !item.done))}
              >
                Clear done
              </Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

export const checklistBrick = {
  id: "checklist-XX",
  label: "Punch list",
  cards: [
    {
      id: "checklist",
      label: "Punch list",
      order: 20,
      span: 2,
      hint: "saved on this machine",
      Card: ChecklistCard,
    },
  ],
};
