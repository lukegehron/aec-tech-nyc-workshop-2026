"use client";

// A travel luggage tag: loop at the top, name, destination (title),
// airline (toolkit), and GitHub as the contact line.

import { useState } from "react";

const person = {
  name: "Sean",
  title: "BIM Power User",
  github: "@ummm-right",
  seat: "Architect",
  toolkit: "Excel · Revit · ChatGPT · Claude",
  sticker: "🏢",
  initials: "SH",
  photo: "https://github.com/ummm-right.png",
};

function Portrait({ size }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-baseplate bg-muted font-heading font-semibold text-baseplate"
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {failed ? (
        person.initials
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={person.photo}
          alt={person.name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function LuggageCard({ expanded }) {
  return (
    <div className="flex h-full flex-col items-center">
      {/* Loop */}
      <div
        className={`rounded-full border-4 border-dashed border-muted-foreground/60 ${
          expanded ? "h-10 w-20" : "h-6 w-12"
        }`}
        aria-hidden="true"
      />
      <div className="-mt-1 h-3 w-1 bg-muted-foreground/60" aria-hidden="true" />

      {/* Tag body */}
      <div className="relative flex w-full max-w-sm flex-1 flex-col gap-2 rounded-lg border-2 border-baseplate bg-card p-3">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          <span>{person.toolkit}</span>
          <span>Seat {person.seat}</span>
        </div>

        <div className="flex items-center gap-3">
          <Portrait size={expanded ? 96 : 56} />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Passenger
            </p>
            <p
              className={`font-heading font-semibold tracking-tight text-baseplate ${
                expanded ? "text-4xl" : "text-2xl"
              }`}
            >
              {person.name}
            </p>
          </div>
          <span
            className={`ml-auto ${expanded ? "text-5xl" : "text-3xl"}`}
            role="img"
            aria-label="sticker"
          >
            {person.sticker}
          </span>
        </div>

        <div className="border-t border-dashed border-muted-foreground/50 pt-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Destination
          </p>
          <p
            className={`font-heading font-semibold ${
              expanded ? "text-2xl" : "text-base"
            }`}
          >
            {person.title}
          </p>
        </div>

        <p className="mt-auto text-xs text-muted-foreground">
          If found, contact {person.github}
        </p>
      </div>
    </div>
  );
}

export const luggageSH = {
  id: "luggage-SH",
  label: "Luggage tag",
  cards: [
    {
      id: "luggage-tag",
      label: "Sean",
      order: 92,
      span: 1,
      hint: "@ummm-right",
      Card: LuggageCard,
    },
  ],
};
