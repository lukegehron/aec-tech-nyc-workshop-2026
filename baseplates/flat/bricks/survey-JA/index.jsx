"use client";

import { useState } from "react";

const USER = {
  name: "Jasmine",
  initials: "JA",
  title: "Computational Designer",
  github: "@jasminelee5170-ctrl",
  seat: "Designer",
  toolkit: "Rhino · Revit · Grasshopper · JavaScript · Python · Claude",
  sticker: "🟢",
};

// Survey-grid paper: faint lines, mud-brown tint.
const GRID = {
  backgroundImage:
    "linear-gradient(rgba(120,90,50,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(120,90,50,0.12) 1px, transparent 1px)",
  backgroundSize: "16px 16px",
};

function SurveyBadge({ expanded }) {
  const you = USER;
  const [portraitFailed, setPortraitFailed] = useState(false);

  const github = you.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;
  const toolkit = you.toolkit
    .split("·")
    .map((tool) => tool.trim())
    .filter(Boolean);

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-lg border-2 border-amber-900/50 bg-amber-950/80 p-2 pt-4 text-stone-800 shadow-inner">
      {/* Mud splatter */}
      <span className="pointer-events-none absolute -bottom-3 -left-2 size-14 rounded-full bg-amber-900/40 blur-sm" />
      <span className="pointer-events-none absolute bottom-2 right-6 size-4 rounded-full bg-amber-900/40" />
      <span className="pointer-events-none absolute bottom-6 right-2 size-2 rounded-full bg-amber-900/50" />

      {/* Clip */}
      <div className="absolute left-1/2 top-0 z-10 h-5 w-16 -translate-x-1/2 rounded-b-md border border-stone-500 bg-gradient-to-b from-stone-300 to-stone-500 shadow">
        <div className="mx-auto mt-1 h-1.5 w-8 rounded-full bg-stone-700/70" />
      </div>

      {/* Paper */}
      <div
        className="relative flex flex-1 flex-col gap-2 overflow-auto rounded-sm bg-amber-50 p-3 font-mono"
        style={GRID}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-sm border-2 border-stone-700 bg-stone-200 font-bold text-stone-700 ${
              expanded ? "size-24 text-3xl" : "size-16 text-xl"
            }`}
          >
            {portraitFailed ? (
              you.initials
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt={`${you.name} portrait`}
                className="size-full object-cover"
                onError={() => setPortraitFailed(true)}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-stone-500">
              Site survey · Surveyor
            </p>
            <p
              className={`truncate font-heading font-bold leading-tight ${
                expanded ? "text-3xl" : "text-xl"
              }`}
            >
              {you.name}
            </p>
            <p className="text-xs font-semibold text-amber-900">{you.title}</p>
            <p className="truncate text-[10px] text-stone-500">{you.github}</p>
          </div>
          <span className="text-xl" title="status">
            {you.sticker}
          </span>
        </div>

        <div className="flex items-center gap-2 border-y border-dashed border-stone-500 py-1 text-xs">
          <span className="uppercase tracking-widest text-stone-500">Seat</span>
          <span className="font-bold">{you.seat}</span>
        </div>

        <div>
          <p className="mb-1 text-[10px] uppercase tracking-widest text-stone-500">
            Site notes · toolkit
          </p>
          <ul className={`grid gap-x-3 gap-y-0.5 text-xs ${expanded ? "grid-cols-3" : "grid-cols-2"}`}>
            {toolkit.map((tool) => (
              <li key={tool} className="flex items-center gap-1.5">
                <span className="flex size-3.5 shrink-0 items-center justify-center border border-stone-700 bg-white text-[11px] font-bold leading-none text-emerald-700">
                  ✓
                </span>
                <span className="truncate">{tool}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export const surveyJA = {
  id: "survey-JA",
  label: "Site survey badge",
  cards: [
    {
      id: "survey-badge",
      label: "Jasmine",
      order: 92,
      span: 2,
      hint: "@jasminelee5170-ctrl",
      Card: SurveyBadge,
    },
  ],
};
