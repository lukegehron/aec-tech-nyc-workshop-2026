"use client";

// App icon + splash tile — a phone home-screen tile for Alex.

import { useState } from "react";

const USER = {
  name: "Alex",
  initials: "AL",
  title: "AEC AI Scout",
  github: "@alexmthomas",
  seat: "Architect",
  toolkit: "Rhino · Revit · Grasshopper · Excel · Hypar · Forma",
  sticker: "🏗️",
};

function AppIconTile({ expanded }) {
  const [portraitFailed, setPortraitFailed] = useState(false);

  const github = USER.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;
  const toolkit = USER.toolkit
    .split("·")
    .map((tool) => tool.trim())
    .filter(Boolean);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-indigo-200 p-4 dark:from-slate-800 dark:to-indigo-950">
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
        <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
          {USER.name}
        </p>
      </div>

      {/* Tiny splash */}
      <div className="flex flex-col items-center gap-0.5 text-center">
        <p
          className={`font-heading font-semibold tracking-tight text-slate-900 dark:text-white ${
            expanded ? "text-xl" : "text-[11px]"
          }`}
        >
          {USER.title}
        </p>
        <p className="text-[9px] uppercase tracking-widest text-slate-600 dark:text-slate-300">
          {USER.seat}
        </p>
      </div>

      {expanded ? (
        <div className="flex flex-wrap justify-center gap-1.5">
          {toolkit.map((tool) => (
            <span
              key={tool}
              className="rounded-full bg-white/70 px-2 py-0.5 text-xs text-slate-700 dark:bg-white/10 dark:text-slate-200"
            >
              {tool}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const appIconAL = {
  id: "app-icon-AL",
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
