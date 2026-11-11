"use client";

// A conference badge styled as a GitHub pull-request card.
//   author = name, PR title = job title, files changed = toolkit,
//   reviewer = seat, green button = merge.

import { useState } from "react";

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
        className={`${box} flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground`}
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

function PrBadgeCard({ expanded }) {
  const [merged, setMerged] = useState(false);

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto text-sm">
      <div className="flex items-start gap-3">
        <Avatar size="lg" />
        <div className="min-w-0 flex-1">
          <p
            className={`font-heading font-semibold leading-tight ${
              expanded ? "text-2xl" : "text-base"
            }`}
          >
            {PERSON.title}{" "}
            <span className="font-normal text-muted-foreground">#{PERSON.initials}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{PERSON.name}</span>{" "}
            wants to merge into <code>main</code> · @{PERSON.github}
          </p>
        </div>
        <span className="text-3xl leading-none" aria-hidden="true">
          {PERSON.sticker}
        </span>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          Files changed · {PERSON.toolkit.length}
        </p>
        <ul className="flex flex-col gap-0.5 font-mono text-xs">
          {PERSON.toolkit.map((tool) => (
            <li key={tool} className="flex items-center gap-2">
              <span className="font-semibold text-green-600">+</span>
              <span>{tool}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Reviewer</span>
        <Avatar size="sm" />
        <span className="font-medium">{PERSON.seat}</span>
      </div>

      <button
        type="button"
        onClick={() => setMerged((m) => !m)}
        className="mt-auto rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
      >
        {merged ? "Merged ✓" : "Merge pull request"}
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
