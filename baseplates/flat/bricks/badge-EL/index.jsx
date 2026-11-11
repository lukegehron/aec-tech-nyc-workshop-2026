"use client";

import { useState } from "react";

const person = {
  name: "Elif",
  title: "Agent Operator",
  github: "@uns-elif",
  seat: "Designer",
  toolkit: ["Python", "Grasshopper", "Revit", "Rhino", "Excel", "JavaScript"],
  sticker: "🤖",
  initials: "EL",
  portrait: "https://github.com/uns-elif.png",
};

function BadgeCard({ expanded }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      {failed ? (
        <div
          className={`flex items-center justify-center rounded-full bg-muted font-heading font-semibold text-baseplate ${
            expanded ? "size-28 text-4xl" : "size-16 text-xl"
          }`}
        >
          {person.initials}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={person.portrait}
          alt={`${person.name} portrait`}
          onError={() => setFailed(true)}
          className={`rounded-full object-cover ${
            expanded ? "size-28" : "size-16"
          }`}
        />
      )}
      <p
        className={`font-heading font-semibold tracking-tight text-baseplate ${
          expanded ? "text-6xl" : "text-4xl"
        }`}
      >
        {person.name} <span aria-hidden>{person.sticker}</span>
      </p>
      <p className="text-xs text-muted-foreground">{person.title}</p>
      {expanded && (
        <div className="mt-2 flex flex-col items-center gap-1 text-sm">
          <p>Seat: {person.seat}</p>
          <p className="text-muted-foreground">{person.toolkit.join(" · ")}</p>
        </div>
      )}
    </div>
  );
}

export const badgeEL = {
  id: "badge-EL",
  label: "Badge",
  cards: [
    {
      id: "badge-card-EL",
      label: person.name,
      order: 91,
      span: 1,
      hint: person.github,
      Card: BadgeCard,
    },
  ],
};
