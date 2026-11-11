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

// Swirling pastel blue + purple background — pure CSS, animated, no assets.
const SWIRL_CSS = `
@keyframes at-swirl-spin { to { transform: rotate(360deg); } }
@keyframes at-swirl-a { 0%,100% { transform: translate(-20%,-10%) scale(1); } 50% { transform: translate(35%,25%) scale(1.3); } }
@keyframes at-swirl-b { 0%,100% { transform: translate(30%,20%) scale(1.2); } 50% { transform: translate(-25%,-20%) scale(0.9); } }
@keyframes at-swirl-c { 0%,100% { transform: translate(0%,35%) scale(0.9); } 50% { transform: translate(15%,-30%) scale(1.25); } }
@media (prefers-reduced-motion: reduce) { .at-swirl * { animation: none !important; } }
`;

function SwirlBackground() {
  return (
    <div
      className="at-swirl pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
      style={{ background: "linear-gradient(135deg, #cfe3ff, #e0d4ff)" }}
    >
      <style>{SWIRL_CSS}</style>
      {/* slowly rotating conic swirl */}
      <div
        className="absolute left-1/2 top-1/2 size-[220%] -translate-x-1/2 -translate-y-1/2"
        style={{ animation: "at-swirl-spin 3s linear infinite" }}
      >
        <div
          className="size-full opacity-100 blur-xl"
          style={{
            background:
              "conic-gradient(from 0deg, #6fb1ff, #f1e6ff, #9b7bff, #dff0ff, #4f8dff, #c9a6ff, #6fb1ff)",
          }}
        />
      </div>
      {/* drifting pastel blobs */}
      <div
        className="absolute left-[5%] top-[5%] size-3/5 rounded-full bg-sky-400/80 blur-xl"
        style={{ animation: "at-swirl-a 3s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[0%] right-[0%] size-3/5 rounded-full bg-violet-500/70 blur-xl"
        style={{ animation: "at-swirl-b 3s ease-in-out infinite" }}
      />
      <div
        className="absolute left-[30%] top-[30%] size-1/2 rounded-full bg-white/70 blur-xl"
        style={{ animation: "at-swirl-c 3s ease-in-out infinite" }}
      />
    </div>
  );
}

// Liquid glass buttons — translucent, blurred, with inner light and a soft drop.
const GLASS_BUTTONS = ["Planner", "Architect", "Grasshopper"];
const GLASS_SHADOW = [
  "inset 0 1px 1px rgba(255,255,255,0.8)",
  "inset 0 -6px 12px rgba(255,255,255,0.12)",
  "inset 0 0 14px rgba(255,255,255,0.15)",
  "0 6px 14px rgba(80,70,160,0.25)",
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
    <div className="relative isolate flex h-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl p-4">
      <SwirlBackground />
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
        <p className="text-[36px] font-bold leading-tight text-indigo-950">
          {USER.name}
        </p>
      </div>

      {/* Tiny splash */}
      <div className="flex flex-col items-center gap-0.5 text-center">
        <p
          className={`font-heading font-semibold tracking-tight text-indigo-950 ${
            expanded ? "text-xl" : "text-[11px]"
          }`}
        >
          {USER.title}
        </p>
        <p className="text-[9px] uppercase tracking-widest text-indigo-900/70">
          {USER.seat}
        </p>
      </div>

      {/* Liquid glass buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {GLASS_BUTTONS.map((label) => (
          <button
            key={label}
            type="button"
            className={`relative overflow-hidden rounded-full border border-white/50 bg-white/10 font-medium text-indigo-950 backdrop-blur-[6px] backdrop-saturate-150 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0 active:scale-95 ${
              expanded ? "px-5 py-2 text-sm" : "px-3 py-1 text-[11px]"
            }`}
            style={{ boxShadow: GLASS_SHADOW, textShadow: "0 1px 1px rgba(255,255,255,0.6)" }}
          >
            {/* specular highlight */}
            <span
              className="pointer-events-none absolute inset-x-1 top-0.5 h-1/2 rounded-full bg-gradient-to-b from-white/50 to-transparent"
              aria-hidden="true"
            />
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      {expanded ? (
        <div className="flex flex-wrap justify-center gap-1.5">
          {toolkit.map((tool) => (
            <span
              key={tool}
              className="rounded-full bg-white/40 px-2 py-0.5 text-xs text-indigo-950 backdrop-blur-sm"
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
