"use client";

// Enamel pin / parts-bin tile: a pin on a backing card, toolkit as mini pins.

import { useState } from "react";

const PERSON = {
  name: "Angel",
  title: "BIM Power User",
  github: "aangel1221",
  seat: "Architect",
  toolkit: ["Revit"],
  sticker: "🏢",
  initials: "AN",
};

const PORTRAIT = `https://github.com/${PERSON.github}.png`;

function Portrait({ size }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-amber-300 bg-slate-800 font-heading font-bold text-amber-200"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {failed ? (
        PERSON.initials
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={PORTRAIT}
          alt={`${PERSON.name} portrait`}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function MiniPin({ label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/70 bg-indigo-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100 shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)]">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
      {label}
    </span>
  );
}

function PinSetCard({ expanded }) {
  const size = expanded ? 120 : 64;
  return (
    <div className="flex h-full items-center justify-center p-1">
      <div
        className={`flex w-full flex-col items-center gap-2 rounded-lg border border-stone-400 bg-stone-200 p-3 text-slate-900 shadow-inner ${
          expanded ? "max-w-md gap-4 p-6" : ""
        }`}
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
          backgroundSize: "8px 8px",
        }}
      >
        {/* Main pin */}
        <div className="relative">
          <div className="flex items-center justify-center rounded-full border-4 border-amber-400 bg-indigo-600 p-1.5 shadow-[0_2px_0_#92400e,0_4px_6px_rgba(0,0,0,0.35)]">
            <Portrait size={size} />
          </div>
          <span
            className="absolute -bottom-1 -right-2 flex items-center justify-center rounded-full border-2 border-amber-400 bg-white shadow"
            style={{ width: size * 0.42, height: size * 0.42, fontSize: size * 0.24 }}
            aria-label="sticker"
          >
            {PERSON.sticker}
          </span>
        </div>

        {/* Name on the backing */}
        <div className="text-center leading-tight">
          <p
            className={`font-heading font-bold uppercase tracking-widest ${
              expanded ? "text-2xl" : "text-sm"
            }`}
          >
            {PERSON.name}
          </p>
          <p className={`text-slate-600 ${expanded ? "text-sm" : "text-[10px]"}`}>
            {PERSON.title}
          </p>
        </div>

        {/* Parts bin: seat + toolkit as mini pins */}
        <div className="flex flex-wrap justify-center gap-1">
          <span className="inline-flex items-center rounded-full border border-slate-500 bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            {PERSON.seat}
          </span>
          {PERSON.toolkit.map((tool) => (
            <MiniPin key={tool} label={tool} />
          ))}
        </div>
      </div>
    </div>
  );
}

export const pinSetAN = {
  id: "pin-set-AN",
  label: "Pin set",
  cards: [
    {
      id: "pin-set-card",
      label: PERSON.name,
      order: 92,
      span: 1,
      hint: `@${PERSON.github}`,
      Card: PinSetCard,
    },
  ],
};
