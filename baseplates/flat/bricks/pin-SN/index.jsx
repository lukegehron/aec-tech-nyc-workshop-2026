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
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full p-[3px] text-xs font-semibold text-baseplate"
      style={{
        width: size,
        height: size,
        background: "#e0e5ec",
        boxShadow: "inset 3px 3px 6px #a3b1c6, inset -3px -3px 6px #ffffff",
      }}
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
          className="h-full w-full rounded-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

// Neumorphism: one soft surface colour, a light and a dark shadow from
// opposite corners. Raised = outer shadows, recessed = gradient/inset.
const SURFACE = "#e0e5ec";
const SHADOW_DARK = "#a3b1c6";
const SHADOW_LIGHT = "#ffffff";
const INK = "#6b7a94";

function PinCard({ expanded }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl p-4 text-baseplate"
      style={{
        background: SURFACE,
        boxShadow: `inset 3px 3px 6px ${SHADOW_DARK}66, inset -3px -3px 6px ${SHADOW_LIGHT}`,
      }}
    >
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={`${PERSON.name} — ${PERSON.title}`}
        className={expanded ? "w-80 max-w-full" : "w-40 max-w-full"}
      >
        <defs>
          <path id="pin-sn-rim" d="M 100 100 m -66 0 a 66 66 0 1 1 132 0 a 66 66 0 1 1 -132 0" />
          <filter id="pin-sn-raised" filterUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="240">
            <feDropShadow in="SourceGraphic" dx="7" dy="7" stdDeviation="6" floodColor={SHADOW_DARK} result="dark" />
            <feDropShadow in="SourceGraphic" dx="-7" dy="-7" stdDeviation="6" floodColor={SHADOW_LIGHT} result="light" />
            <feMerge>
              <feMergeNode in="light" />
              <feMergeNode in="dark" />
            </feMerge>
          </filter>
          <filter id="pin-sn-emboss" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1.2" dy="1.2" stdDeviation="0.6" floodColor={SHADOW_LIGHT} />
          </filter>
          <linearGradient id="pin-sn-dish" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={SHADOW_DARK} stopOpacity="0.55" />
            <stop offset="1" stopColor={SHADOW_LIGHT} />
          </linearGradient>
          <linearGradient id="pin-sn-face" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d3dae6" />
            <stop offset="1" stopColor="#eef2f8" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill={SURFACE} filter="url(#pin-sn-raised)" />
        <circle cx="100" cy="100" r="76" fill="none" stroke="url(#pin-sn-dish)" strokeWidth="3" />
        <circle cx="100" cy="100" r="56" fill="url(#pin-sn-face)" />
        <circle cx="100" cy="100" r="56" fill="none" stroke="url(#pin-sn-dish)" strokeWidth="2.5" />
        <text
          fill={INK}
          fontSize="11.5"
          fontWeight="700"
          letterSpacing="2.5"
          textAnchor="middle"
          filter="url(#pin-sn-emboss)"
        >
          <textPath href="#pin-sn-rim" startOffset="25%">
            {PERSON.title.toUpperCase()}
          </textPath>
        </text>
        <text
          x="100"
          y="112"
          fill="currentColor"
          fontSize="64"
          fontWeight="800"
          textAnchor="middle"
          filter="url(#pin-sn-emboss)"
        >
          ?
        </text>
        <text
          x="100"
          y="138"
          fill={INK}
          fontSize="20"
          fontWeight="700"
          letterSpacing="3"
          textAnchor="middle"
          filter="url(#pin-sn-emboss)"
        >
          {PERSON.initials}
        </text>
      </svg>
      <div className="flex items-center gap-3">
        <Portrait size={expanded ? 44 : 32} />
        <p className="rounded-full px-3 py-1 text-xs font-medium" style={{
          color: INK,
          background: SURFACE,
          boxShadow: `3px 3px 6px ${SHADOW_DARK}, -3px -3px 6px ${SHADOW_LIGHT}`,
        }}>
          {PERSON.seat} {PERSON.sticker}
        </p>
      </div>
      {expanded && (
        <p
          className="rounded-xl px-4 py-2 text-sm"
          style={{
            color: INK,
            background: SURFACE,
            boxShadow: `inset 3px 3px 6px ${SHADOW_DARK}, inset -3px -3px 6px ${SHADOW_LIGHT}`,
          }}
        >
          {PERSON.toolkit}
        </p>
      )}
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
