"use client";

// Speech-bubble sticker: name = sender, title = message, toolkit = reactions.

import { useState } from "react";

const PERSON = {
  name: "Ashlyn",
  title: "Agent Operator",
  github: "winslow52",
  seat: "Engineer",
  toolkit: ["Excel", "Revit", "Grasshopper", "JavaScript", "ChatGPT", "Claude"],
  sticker: "🤖",
  initials: "AS",
};

function Avatar() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-300 text-xs font-bold text-neutral-700">
      {failed ? (
        PERSON.initials
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://github.com/${PERSON.github}.png`}
          alt={PERSON.name}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function BubbleCard({ expanded }) {
  return (
    <div className="flex h-full flex-col justify-center gap-2 p-1">
      <div className="flex items-end gap-2">
        <Avatar />
        <div className="min-w-0">
          <p className="mb-0.5 ml-3 text-[11px] text-muted-foreground">
            {PERSON.name} · {PERSON.seat}
          </p>
          <div className="relative">
            <div
              className={`rounded-3xl rounded-bl-md bg-blue-500 px-4 py-2.5 font-medium text-white shadow-sm ${
                expanded ? "text-2xl" : "text-base"
              }`}
            >
              {PERSON.title}
            </div>
            <span
              className={`absolute -right-2 -top-3 rounded-full bg-background shadow ring-1 ring-border ${
                expanded ? "px-2 py-1 text-3xl" : "px-1.5 py-0.5 text-xl"
              }`}
              aria-label="sticker"
            >
              {PERSON.sticker}
            </span>
          </div>
        </div>
      </div>
      <ul className="ml-11 flex flex-wrap gap-1.5">
        {PERSON.toolkit.map((tool) => (
          <li
            key={tool}
            className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-foreground ring-1 ring-border"
          >
            {tool}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const bubbleAS = {
  id: "bubble-AS",
  label: "Bubble sticker",
  cards: [
    {
      id: "bubble-card",
      label: "Ashlyn",
      order: 95,
      span: 1,
      hint: "@winslow52",
      Card: BubbleCard,
    },
  ],
};
