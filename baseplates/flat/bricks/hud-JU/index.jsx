"use client";

import { useState } from "react";

const PERSON = {
  name: "jun",
  title: "Agent Operator",
  github: "@junngt520-ui",
  seat: "Architect",
  toolkit: ["Excel", "Rhino", "Revit", "Grasshopper", "ChatGPT", "Claude"],
  sticker: "🤖",
  initials: "JU",
  portrait: "https://github.com/junngt520-ui.png",
};

function Portrait({ size }) {
  const [failed, setFailed] = useState(false);
  const box = `flex shrink-0 items-center justify-center overflow-hidden border border-green-500/60 bg-black ${size}`;
  if (failed) {
    return (
      <div className={`${box} font-mono font-bold text-green-400`}>
        {PERSON.initials}
      </div>
    );
  }
  return (
    <div className={box}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PERSON.portrait}
        alt={`${PERSON.name} portrait`}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function HudCard({ expanded }) {
  return (
    <div
      className={`flex h-full flex-col gap-3 rounded-sm border border-green-500/40 bg-[#050805] p-3 font-mono text-green-400 shadow-[inset_0_0_24px_rgba(34,197,94,0.12)] ${
        expanded ? "text-base" : "text-xs"
      }`}
    >
      <style>{`@keyframes hudJUBlink{0%,49%{opacity:1}50%,100%{opacity:0}}`}</style>

      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-green-600">
        <span>● monitor // operator</span>
        <span>{PERSON.sticker}</span>
      </div>

      <div className="flex items-center gap-3">
        <Portrait size={expanded ? "h-20 w-20 text-2xl" : "h-12 w-12 text-base"} />
        <div className="min-w-0">
          <p
            className={`truncate font-bold text-green-400 ${
              expanded ? "text-4xl" : "text-2xl"
            }`}
          >
            {PERSON.name}
            <span
              aria-hidden
              className="ml-1 inline-block h-[1em] w-[0.5em] translate-y-[0.15em] bg-green-400"
              style={{ animation: "hudJUBlink 1s steps(1) infinite" }}
            />
          </p>
          <p className="truncate text-green-300/80">{PERSON.github}</p>
        </div>
      </div>

      <div className="border-y border-green-500/30 py-1 text-green-300">
        <span className="text-green-600">STATUS</span> {PERSON.title}{" "}
        <span className="text-green-600">| SEAT</span> {PERSON.seat}
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="flex gap-3 text-[10px] uppercase tracking-widest text-green-600">
          <span className="w-8">PID</span>
          <span className="flex-1">PROCESS</span>
          <span>STAT</span>
        </p>
        {PERSON.toolkit.map((tool, i) => (
          <p key={tool} className="flex gap-3 tabular-nums">
            <span className="w-8 text-green-700">{1001 + i}</span>
            <span className="flex-1 truncate">{tool.toLowerCase()}</span>
            <span className="text-green-300">running</span>
          </p>
        ))}
      </div>

      <p className="mt-auto text-green-600">
        $ <span className="text-green-400">whoami</span> → {PERSON.name}
      </p>
    </div>
  );
}

export const hudJU = {
  id: "hud-JU",
  label: "Operator HUD",
  cards: [
    {
      // hud-LG already uses card id "hud", so this one is distinct.
      id: "operator-hud",
      label: "jun",
      order: 92,
      span: 1,
      hint: "@junngt520-ui",
      Card: HudCard,
    },
  ],
};
