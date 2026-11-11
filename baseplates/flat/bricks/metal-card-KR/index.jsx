"use client";

// Black metal membership card: name embossed, title as the card network,
// GitHub handle as the (masked) number. No libraries, no baseplate edits.

import { useState } from "react";

const USER = {
  name: "Krishna",
  initials: "KR",
  title: "Computational Designer",
  github: "@krisharchitect",
  seat: "Architect",
  toolkit: "Rhino · Revit · Grasshopper · ChatGPT · Claude",
  sticker: "🟢",
};

// Mask the middle of the handle, keep the ends: krisharchitect -> kri•••••••ect
function maskHandle(handle) {
  const h = handle.replace(/^@/, "");
  if (h.length <= 6) return h;
  return `${h.slice(0, 3)}${"•".repeat(h.length - 6)}${h.slice(-3)}`;
}

const METAL = {
  background:
    "linear-gradient(115deg, #0b0b0c 0%, #1a1a1c 22%, #0d0d0e 38%, #1c1c1f 58%, #090909 78%, #151517 100%)",
  boxShadow:
    "inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 24px rgba(0,0,0,0.45)",
};

const BRUSH = {
  backgroundImage:
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)",
};

const EMBOSS = {
  color: "#2b2b2e",
  textShadow:
    "0 1px 0 rgba(255,255,255,0.28), 0 -1px 0 rgba(0,0,0,0.9), 0 0 1px rgba(255,255,255,0.1)",
};

function MetalCard({ expanded }) {
  const you = USER;
  const [portraitFailed, setPortraitFailed] = useState(false);

  const github = you.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;
  const toolkit = you.toolkit.split("·").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="flex h-full items-center justify-center p-1">
      <div
        className="relative flex aspect-[1.586/1] w-full max-w-[28rem] flex-col justify-between overflow-hidden rounded-2xl p-4 text-neutral-400"
        style={METAL}
      >
        <div className="pointer-events-none absolute inset-0" style={BRUSH} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.05) 48%, transparent 60%)",
          }}
        />

        {/* Top: chip + portrait, network (title) */}
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="h-7 w-10 rounded-md"
              style={{
                background: "linear-gradient(135deg, #5b5b5f, #2a2a2d 55%, #4a4a4e)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
              }}
            />
            <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-neutral-900 text-[11px] font-medium tracking-widest text-neutral-400 ring-1 ring-white/10">
              {portraitFailed ? (
                <span>{you.initials}</span>
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
          <p className="text-right text-[10px] font-medium uppercase tracking-[0.25em] text-neutral-300">
            {you.title}
          </p>
        </div>

        {/* Middle: masked number */}
        <p
          className={`relative font-mono tracking-[0.18em] text-neutral-300 ${
            expanded ? "text-xl" : "text-sm"
          }`}
          style={{ textShadow: "0 1px 0 rgba(0,0,0,0.8)" }}
        >
          @{maskHandle(you.github)}
        </p>

        {/* Bottom: embossed name, seat, sticker */}
        <div className="relative flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p
              className={`truncate font-heading font-semibold uppercase tracking-[0.2em] ${
                expanded ? "text-3xl" : "text-xl"
              }`}
              style={EMBOSS}
            >
              {you.name}
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-neutral-500">
              {you.seat}
              {expanded ? ` · ${toolkit.join(" · ")}` : ""}
            </p>
          </div>
          <span className="text-sm opacity-80" aria-hidden="true">
            {you.sticker}
          </span>
        </div>
      </div>
    </div>
  );
}

export const metalCardKR = {
  id: "metal-card-KR",
  label: "Metal card",
  cards: [
    {
      id: "metal-card",
      label: "Krishna",
      order: 91,
      span: 1,
      hint: "@krisharchitect",
      Card: MetalCard,
    },
  ],
};
