"use client";

import { useState } from "react";

const USER = {
  name: "HSE",
  initials: "HS",
  title: "Spreadsheet Wizard",
  github: "@HolgerEhring",
  seat: "Engineer",
  toolkit: "Excel · Rhino · ChatGPT · Claude",
  sticker: "📊",
};

// Two typefaces only: the sans (font-sans) and the mono (font-mono).
function PosterCard({ expanded }) {
  const you = USER;
  const [portraitFailed, setPortraitFailed] = useState(false);

  const github = you.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;
  const seatRun = Array.from({ length: 6 }, () => you.seat.toUpperCase()).join(
    " — ",
  );

  return (
    <div className="relative flex h-full min-h-64 flex-col overflow-hidden bg-white p-5 font-sans text-black">
      {/* Top rule: small title + sticker */}
      <div className="flex items-start justify-between border-t-4 border-black pt-2">
        <p
          className={`font-sans font-medium uppercase tracking-widest ${
            expanded ? "text-sm" : "text-[10px]"
          }`}
        >
          {you.title}
        </p>
        <span className={expanded ? "text-3xl" : "text-xl"} aria-hidden>
          {you.sticker}
        </span>
      </div>

      {/* Huge name, lots of air around it */}
      <div className="flex flex-1 items-center py-6">
        <div className="flex items-end gap-4">
          <h2
            className={`font-sans font-black leading-[0.8] tracking-tighter ${
              expanded ? "text-[10rem]" : "text-8xl"
            }`}
          >
            {you.name}
          </h2>
          <div
            className={`shrink-0 overflow-hidden bg-black text-white ${
              expanded ? "size-20" : "size-10"
            }`}
          >
            {portraitFailed ? (
              <div className="flex size-full items-center justify-center font-sans text-sm font-bold">
                {you.initials}
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt={`${you.name} portrait`}
                className="size-full object-cover grayscale"
                onError={() => setPortraitFailed(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Toolkit as a caption */}
      <p
        className={`mb-3 max-w-[28ch] font-sans text-neutral-500 ${
          expanded ? "text-sm" : "text-[10px]"
        }`}
      >
        {you.toolkit}
      </p>

      {/* Seat as a running footer */}
      <div className="overflow-hidden whitespace-nowrap border-t border-black pt-1.5">
        <p
          className={`font-mono uppercase tracking-[0.25em] ${
            expanded ? "text-xs" : "text-[9px]"
          }`}
        >
          {seatRun}
        </p>
      </div>
    </div>
  );
}

export const posterHS = {
  id: "poster-HS",
  label: "Poster",
  cards: [
    {
      id: "poster-card",
      label: "HSE",
      order: 94,
      span: 1,
      hint: "@HolgerEhring",
      Card: PosterCard,
    },
  ],
};
