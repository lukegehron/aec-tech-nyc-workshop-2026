"use client";

// A round question-mark pin: a ?, initials, and the title around the rim.
// One colour (the baseplate colour), no libraries.

import { useState } from "react";

const PERSON = {
  name: "Sanobar N",
  initials: "SN",
  title: "All-In Subscriber",
  github: "@snazirova",
  seat: "Architect",
  toolkit: "Rhino · ChatGPT · Claude · xFigura · Veras",
  sticker: "💎",
  portrait: "https://github.com/snazirova.png",
};

function Portrait({ size }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-baseplate bg-background text-xs font-semibold text-baseplate"
      style={{ width: size, height: size }}
    >
      {failed ? (
        PERSON.initials
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={PERSON.portrait}
          alt={PERSON.name}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

function PinCard({ expanded }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-baseplate">
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={`${PERSON.name} — ${PERSON.title}`}
        className={expanded ? "w-80 max-w-full" : "w-40 max-w-full"}
      >
        <defs>
          <path id="pin-sn-rim" d="M 100 100 m -76 0 a 76 76 0 1 1 152 0 a 76 76 0 1 1 -152 0" />
        </defs>
        <circle cx="100" cy="100" r="96" fill="currentColor" />
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <text fill="white" fontSize="15" fontWeight="600" letterSpacing="3" textAnchor="middle">
          <textPath href="#pin-sn-rim" startOffset="25%">
            {PERSON.title.toUpperCase()}
          </textPath>
        </text>
        <text x="100" y="112" fill="white" fontSize="82" fontWeight="700" textAnchor="middle">
          ?
        </text>
        <text
          x="100"
          y="150"
          fill="white"
          fontSize="26"
          fontWeight="700"
          letterSpacing="3"
          textAnchor="middle"
        >
          {PERSON.initials}
        </text>
      </svg>
      <div className="flex items-center gap-2">
        <Portrait size={expanded ? 40 : 28} />
        <p className="text-xs text-muted-foreground">
          {PERSON.seat} {PERSON.sticker}
        </p>
      </div>
      {expanded && <p className="text-sm text-muted-foreground">{PERSON.toolkit}</p>}
    </div>
  );
}

export const pinSN = {
  id: "pin-SN",
  label: "Question-mark pin",
  cards: [
    {
      id: "pin",
      label: PERSON.name,
      order: 90,
      span: 1,
      hint: PERSON.github,
      Card: PinCard,
    },
  ],
};
