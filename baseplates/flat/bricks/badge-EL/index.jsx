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
  const [hue, setHue] = useState(200);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("");
  const accent = `hsl(${hue} 80% 50%)`;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      {failed ? (
        <div
          style={{ borderColor: accent }}
          className={`flex items-center justify-center rounded-full border-4 bg-muted font-heading font-semibold text-baseplate ${
            spinning ? "animate-spin" : ""
          } ${expanded ? "size-28 text-4xl" : "size-16 text-xl"}`}
        >
          {person.initials}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={person.portrait}
          alt={`${person.name} portrait`}
          onError={() => setFailed(true)}
          style={{ borderColor: accent }}
          className={`rounded-full border-4 object-cover ${
            spinning ? "animate-spin" : ""
          } ${expanded ? "size-28" : "size-16"}`}
        />
      )}
      <p
        style={{ color: accent }}
        className={`font-heading font-semibold tracking-tight ${
          expanded ? "text-6xl" : "text-4xl"
        }`}
      >
        {person.name} <span aria-hidden>{person.sticker}</span>
      </p>
      <p className="text-xs text-muted-foreground">{person.title}</p>
      {message && (
        <p className="max-w-full break-words text-sm font-medium">{message}</p>
      )}
      <div className="mt-1 flex w-full max-w-xs flex-col gap-2">
        <input
          type="range"
          min={0}
          max={360}
          value={hue}
          onChange={(e) => setHue(Number(e.target.value))}
          aria-label="Badge colour"
          className="w-full"
        />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write on the badge…"
          aria-label="Write on the badge"
          maxLength={80}
          className="w-full rounded-md border bg-background px-2 py-1 text-sm"
        />
        <button
          type="button"
          onClick={() => setSpinning((v) => !v)}
          className="rounded-md border px-2 py-1 text-sm hover:bg-muted"
        >
          {spinning ? "Stop" : "Spin"}
        </button>
      </div>
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
