"use client";

// App icon + splash tile — a phone home-screen tile for Alex.

import { useState } from "react";

const USER = {
  name: "Alex",
  initials: "AT",
  title: "AEC AI Scout",
  github: "@alexmthomas",
  seat: "Architect",
  toolkit: "Rhino · Revit · Grasshopper · Excel · Hypar · Forma",
  sticker: "🏗️",
};

// Wooden panel background — pure CSS, no assets.
const WOOD_BACKGROUND = [
  "repeating-linear-gradient(90deg, rgba(60,30,10,0) 0px, rgba(60,30,10,0.12) 1px, rgba(60,30,10,0) 3px, rgba(255,220,170,0.06) 5px, rgba(60,30,10,0) 9px)",
  "repeating-linear-gradient(90deg, rgba(90,50,20,0.18) 0px, rgba(90,50,20,0) 22px, rgba(140,90,45,0.14) 41px, rgba(90,50,20,0) 67px)",
  "repeating-linear-gradient(90deg, rgba(30,15,5,0.55) 0px, rgba(30,15,5,0.55) 2px, transparent 2px, transparent 96px)",
  "linear-gradient(180deg, #b9854f 0%, #a8733f 50%, #96653a 100%)",
].join(", ");

function AppIconTile({ expanded }) {
  const [portraitFailed, setPortraitFailed] = useState(false);

  const github = USER.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;
  const toolkit = USER.toolkit
    .split("·")
    .map((tool) => tool.trim())
    .filter(Boolean);

  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl p-4 shadow-[inset_0_0_40px_rgba(0,0,0,0.45)]"
      style={{ background: WOOD_BACKGROUND }}
    >
      {/* App icon */}
      <div className="flex flex-col items-center gap-1.5">
        <div
          className={`relative flex items-center justify-center overflow-hidden rounded-[22%] bg-gradient-to-br from-indigo-500 to-fuchsia-500 font-heading font-bold text-white shadow-lg ring-1 ring-black/10 ${
            expanded ? "size-32 text-5xl" : "size-20 text-3xl"
          }`}
        >
          {portraitFailed ? (
            USER.initials
          ) : (
            <img
              src={portraitUrl}
              alt={USER.initials}
              className="size-full object-cover"
              onError={() => setPortraitFailed(true)}
            />
          )}
          <span
            className="absolute -bottom-0.5 -right-0.5 rounded-tl-xl bg-white/90 px-1 text-sm leading-tight"
            aria-hidden="true"
          >
            {USER.sticker}
          </span>
        </div>
        <p className="text-xs font-medium text-amber-50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
          {USER.name}
        </p>
      </div>

      {/* Tiny splash */}
      <div className="flex flex-col items-center gap-0.5 text-center">
        <p
          className={`font-heading font-semibold tracking-tight text-amber-50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] ${
            expanded ? "text-xl" : "text-[11px]"
          }`}
        >
          {USER.title}
        </p>
        <p className="text-[9px] uppercase tracking-widest text-amber-100/90">
          {USER.seat}
        </p>
      </div>

      {expanded ? (
        <div className="flex flex-wrap justify-center gap-1.5">
          {toolkit.map((tool) => (
            <span
              key={tool}
              className="rounded-full bg-amber-50/80 px-2 py-0.5 text-xs text-amber-950"
            >
              {tool}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const appIconAT = {
  id: "app-icon-AT",
  label: USER.name,
  cards: [
    {
      id: "app-icon",
      label: USER.name,
      order: 26,
      span: 1,
      hint: USER.github,
      Card: AppIconTile,
    },
  ],
};
