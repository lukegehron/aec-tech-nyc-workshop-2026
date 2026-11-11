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
  const box = `flex shrink-0 items-center justify-center overflow-hidden border border-[color:var(--ju-fg)] bg-[color:var(--ju-bg)] ${size}`;
  if (failed) {
    return (
      <div className={`${box} font-mono font-bold text-[color:var(--ju-fg)]`}>
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

function Role({ label, children, big }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--ju-fg)]">{label}</p>
      <p className={`text-[color:var(--ju-fg)] ${big ? "text-xl" : ""}`}>{children}</p>
    </div>
  );
}

function HudCard({ expanded }) {
  return (
    <div
      className={`relative h-full min-h-[300px] overflow-hidden rounded-sm border border-[color:var(--ju-fg)] bg-[color:var(--ju-bg)] font-mono text-[color:var(--ju-fg)] transition-colors duration-500 hudJU-card ${
        expanded ? "text-base" : "text-xs"
      }`}
      style={{ containerType: "size" }}
    >
      <style>{`
        .hudJU-card{--ju-bg:#bc002d;--ju-fg:#ffffff;--ju-shadow:rgba(0,0,0,0.9)}
        .hudJU-card:hover{--ju-bg:#ffffff;--ju-fg:#bc002d;--ju-shadow:rgba(255,255,255,0.95)}
        @keyframes hudJURoll{from{transform:translateY(0)}to{transform:translateY(calc(-100% - 100cqh))}}
        @keyframes hudJUBlink{0%,49%{opacity:1}50%,100%{opacity:0}}
        .hudJU-roll{animation:hudJURoll 24s linear infinite}
        @media (prefers-reduced-motion: reduce){.hudJU-roll{animation:none;position:static!important}}
      `}</style>

      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMax slice"
      >
        <rect width="400" height="300" style={{ fill: "var(--ju-bg)", transition: "fill 0.5s" }} />
        <circle cx="200" cy="120" r="62" style={{ fill: "var(--ju-fg)", transition: "fill 0.5s" }} />
        <g fill="none" style={{ stroke: "var(--ju-fg)", transition: "stroke 0.5s" }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M40 235 L170 130 L188 114 H212 L230 130 L360 235" />
          <path d="M170 130 L182 138 L192 126 L202 140 L212 126 L220 138 L230 130" />
          <path d="M20 235 H380" />
        </g>
        <path d="M70 250 H330 M110 264 H290 M150 278 H250" style={{ stroke: "var(--ju-fg)", transition: "stroke 0.5s" }} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      </svg>

      <div className="hudJU-roll absolute inset-x-0 flex flex-col items-center gap-8 px-4 pb-8" style={{ top: "100%", textShadow: "0 1px 4px var(--ju-shadow), 0 0 2px var(--ju-shadow)" }}>
        <p className="text-[10px] uppercase tracking-[0.5em] text-[color:var(--ju-fg)]">
          a film by
        </p>

        <Portrait size={expanded ? "h-28 w-28 text-3xl" : "h-20 w-20 text-xl"} />

        <p className={`font-bold tracking-[0.3em] text-[color:var(--ju-fg)] ${expanded ? "text-5xl" : "text-3xl"}`}>
          {PERSON.name.toUpperCase()}
          <span
            aria-hidden
            className="ml-1 inline-block h-[1em] w-[0.5em] translate-y-[0.15em] bg-[color:var(--ju-fg)]"
            style={{ animation: "hudJUBlink 1s steps(1) infinite" }}
          />
        </p>

        <Role label="starring" big>{PERSON.title}</Role>
        <Role label="seat">{PERSON.seat}</Role>
        <Role label="github">{PERSON.github}</Role>

        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--ju-fg)]">
            featuring
          </p>
          {PERSON.toolkit.map((tool) => (
            <p key={tool} className="tracking-[0.2em] text-[color:var(--ju-fg)]">
              {tool.toUpperCase()}
            </p>
          ))}
        </div>

        <p className="text-4xl">{PERSON.sticker}</p>
        <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--ju-fg)]">
          no agents were harmed
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[color:var(--ju-bg)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[color:var(--ju-bg)] to-transparent" />
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
