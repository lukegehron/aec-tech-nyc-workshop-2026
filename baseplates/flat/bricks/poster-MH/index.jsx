"use client";

import { useState } from "react";

const USER = {
  name: "Marshall",
  initials: "MH",
  title: "Agent Operator",
  github: "@Marshall-SC",
  seat: "Designer",
  toolkit: "Grasshopper · Rhino · Excel · Revit · Claude · Antigravity",
  sticker: "🤖",
};

// Two typefaces only: font-heading (name, title) and font-mono (footer, caption).
function PosterCard({ expanded }) {
  const [portraitFailed, setPortraitFailed] = useState(false);

  const github = USER.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;

  return (
    <div className="flex h-full min-h-64 flex-col justify-between bg-white p-5 text-black">
      {/* Top rule: small title left, portrait right */}
      <div className="flex items-start justify-between border-t-2 border-black pt-2">
        <p className="font-heading text-xs font-medium uppercase tracking-widest">
          {USER.title}
        </p>
        <div className="relative size-10 shrink-0 overflow-hidden bg-black">
          {portraitFailed ? (
            <span className="flex size-full items-center justify-center font-heading text-sm font-bold text-white">
              {USER.initials}
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portraitUrl}
              alt={`${USER.name} portrait`}
              className="size-full object-cover grayscale"
              onError={() => setPortraitFailed(true)}
            />
          )}
        </div>
      </div>

      {/* Huge name */}
      <h2
        className={`font-heading font-black leading-[0.85] tracking-tighter ${
          expanded ? "text-8xl" : "text-5xl"
        }`}
      >
        {USER.name}
        <span className="ml-1 align-top text-[0.35em]">{USER.sticker}</span>
      </h2>

      {/* Caption + running footer */}
      <div className="flex flex-col gap-3">
        <p className="max-w-[28ch] font-mono text-[10px] leading-snug text-neutral-500">
          {USER.toolkit}
        </p>
        <div className="flex items-center justify-between border-t border-black pt-1 font-mono text-[10px] uppercase tracking-widest">
          <span>{USER.seat}</span>
          <span>{USER.github}</span>
          <span>{USER.initials}</span>
        </div>
      </div>
    </div>
  );
}

export const posterMH = {
  id: "poster-MH",
  label: "Poster",
  cards: [
    {
      id: "poster",
      label: USER.name,
      order: 92,
      span: 1,
      hint: USER.github,
      Card: PosterCard,
    },
  ],
};
