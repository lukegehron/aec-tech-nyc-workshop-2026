"use client";

import { useState } from "react";

const USER = {
  name: "Jeff",
  initials: "JE",
  title: "AEC AI Scout",
  github: "@JFFBLY3",
  seat: "Other",
  toolkit: "Excel · Rhino · Revit · Grasshopper · ChatGPT · Claude",
  sticker: "🏗️",
};

const LINE = "border-white/80";

function BlueprintNameplate({ expanded }) {
  const [portraitFailed, setPortraitFailed] = useState(false);
  const github = USER.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;
  const toolkit = USER.toolkit
    .split("·")
    .map((tool) => tool.trim())
    .filter(Boolean);

  return (
    <div className="relative flex h-full min-h-48 flex-col overflow-hidden bg-[#1b4fa3] p-2 text-white">
      {/* Grid paper */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      {/* Sheet border */}
      <div className={`relative flex flex-1 flex-col border-2 ${LINE}`}>
        {/* Drawing area */}
        <div className="relative flex flex-1 items-center gap-3 p-3">
          <div
            className={`flex shrink-0 items-center justify-center overflow-hidden border-2 border-dashed ${LINE} bg-[#1b4fa3] ${
              expanded ? "size-32" : "size-20"
            }`}
          >
            {portraitFailed ? (
              <span className="font-mono text-2xl font-bold tracking-widest">
                {USER.initials}
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt={`${USER.name} portrait`}
                className="size-full object-cover grayscale contrast-125"
                onError={() => setPortraitFailed(true)}
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">
              Drawing title
            </p>
            <p
              className={`font-heading font-semibold uppercase tracking-wide ${
                expanded ? "text-5xl" : "text-3xl"
              }`}
            >
              {USER.name}
            </p>
            <p className="font-mono text-xs text-white/80">
              {USER.github} · {USER.seat}
            </p>
          </div>
          <span
            aria-hidden
            className="absolute right-3 top-2 text-2xl"
            title="sticker"
          >
            {USER.sticker}
          </span>
        </div>

        {/* Title block */}
        <div className={`grid grid-cols-[1fr_auto] border-t-2 ${LINE} font-mono`}>
          <div className={`border-r-2 ${LINE} p-2`}>
            <p className="text-[9px] uppercase tracking-widest text-white/70">
              Toolkit
            </p>
            <p className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px]">
              {toolkit.map((tool) => (
                <span key={tool} className={`border-b border-dashed ${LINE}`}>
                  {tool}
                </span>
              ))}
            </p>
          </div>
          <div className="flex min-w-24 flex-col items-center justify-center p-2 text-center">
            <p className="text-[9px] uppercase tracking-widest text-white/70">
              Sheet no.
            </p>
            <p className="text-sm font-bold leading-tight">{USER.title}</p>
          </div>
        </div>
      </div>
      {/* Folded corner */}
      <div
        aria-hidden
        className="absolute bottom-0 right-0 size-5 bg-white/90"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      />
    </div>
  );
}

export const blueprintJE = {
  id: "blueprint-JE",
  label: "Blueprint nameplate",
  cards: [
    {
      id: "blueprint-nameplate",
      label: USER.name,
      order: 92,
      span: 2,
      hint: USER.github,
      Card: BlueprintNameplate,
    },
  ],
};
