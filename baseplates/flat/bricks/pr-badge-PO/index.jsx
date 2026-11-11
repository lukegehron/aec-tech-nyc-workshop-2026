"use client";

// A conference badge styled as a GitHub pull-request card.
//   author = name, PR title = job title, files changed = toolkit,
//   reviewer = seat, green button = merge.

import { useState } from "react";
import { Cat } from "lucide-react";

const PERSON = {
  name: "Polina",
  title: "Agent Operator",
  github: "polinaustinova00",
  seat: "Engineer",
  toolkit: ["Excel", "Rhino", "Revit", "Grasshopper", "ChatGPT", "Claude"],
  sticker: "🤖",
  initials: "PO",
};

const PORTRAIT = `https://github.com/${PERSON.github}.png`;

function Avatar({ size }) {
  const [failed, setFailed] = useState(false);
  const box = size === "lg" ? "size-12 text-base" : "size-6 text-[10px]";

  if (failed) {
    return (
      <span
        className={`${box} flex shrink-0 items-center justify-center rounded-full border border-[#ff00ff] bg-black font-semibold text-[#ff00ff]`}
      >
        {PERSON.initials}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={PORTRAIT}
      alt={PERSON.name}
      className={`${box} shrink-0 rounded-full object-cover`}
      onError={() => setFailed(true)}
    />
  );
}

function PrBadgeCard() {
  const [merged, setMerged] = useState(false);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-[#ff00ff] bg-black p-3 text-[#ff00ff]">
      <div className="flex items-center gap-3">
        <Avatar size="lg" />
        <Cat className="size-8" aria-label="cat" />
        <span className="text-3xl leading-none" aria-hidden="true">
          {PERSON.sticker}
        </span>
      </div>
      <p className="font-heading text-xl font-semibold">{PERSON.name}</p>
      <button
        type="button"
        onClick={() => setMerged((m) => !m)}
        className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
      >
        {merged ? "Merged" : "Merge"}
      </button>
    </div>
  );
}

export const prBadgePO = {
  id: "pr-badge-PO",
  label: "PR badge",
  cards: [
    {
      id: "pr-badge",
      label: "Polina",
      order: 91,
      span: 1,
      hint: "@polinaustinova00",
      Card: PrBadgeCard,
    },
  ],
};
