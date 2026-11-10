"use client";

import { useEffect, useState } from "react";


const USER = {
  name: "Luke G",
  initials: "LG",
  title: "Agent Operator",
  github: "@pwluke",
  seat: "Developer",
  toolkit: "JavaScript · Rhino · v0 · Claude Code · Cursor · other-aec",
  sticker: "🤖",
};

function HudBadge({ expanded }) {
  const you = USER; 

  const [now, setNow] = useState(null);
  const [portraitFailed, setPortraitFailed] = useState(false);

  // Never read the clock during render — mount, then tick.
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const github = (you.github || "").replace(/^@/, "");
  const portraitUrl = github ? `https://github.com/${github}.png` : null;

  // The toolkit may arrive as a " · " separated string (the person shape) or,
  // defensively, as an array.
  const toolkit = Array.isArray(you.toolkit)
    ? you.toolkit.map((tool) => String(tool))
    : String(you.toolkit ?? "")
        .split("·")
        .map((tool) => tool.trim())
        .filter(Boolean);

  const time = now ? now.toLocaleTimeString([], { hour12: false }) : "--:--:--";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-emerald-900/60 bg-black font-mono text-xs text-emerald-300">
      {/* Blink keyframes injected here so the cursor stays self-contained. */}
      <style>{`@keyframes hud-lg-blink{0%,49%{opacity:1}50%,100%{opacity:0}}.hud-lg-cursor{animation:hud-lg-blink 1s step-end infinite}`}</style>

      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-emerald-900/60 bg-emerald-950/30 px-3 py-1.5">
        <span className="size-2 rounded-full bg-red-500/80" />
        <span className="size-2 rounded-full bg-yellow-500/80" />
        <span className="size-2 rounded-full bg-emerald-500/80" />
        <span className="ml-1 text-[10px] tracking-widest text-emerald-500/70">
          ops://{github || (you.initials || "hud").toLowerCase()}-hud
        </span>
        <span className="ml-auto tabular-nums text-emerald-400">{time}</span>
      </div>

      {/* Identity */}
      <div className="flex items-center gap-3 px-3 pt-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border border-emerald-800 bg-emerald-950 font-heading text-sm font-bold text-emerald-300">
          {portraitUrl && !portraitFailed ? (
            <img
              src={portraitUrl}
              alt={you.name}
              className="size-full object-cover"
              onError={() => setPortraitFailed(true)}
            />
          ) : (
            you.initials
          )}
        </div>
        <div className="min-w-0">
          <p
            className={`truncate font-semibold leading-tight text-emerald-400 ${
              expanded ? "text-lg" : "text-sm"
            }`}
          >
            {you.name}
          </p>
          <p className="truncate text-[10px] text-emerald-600">
            {you.seat} · {you.github}
          </p>
        </div>
        <span className="ml-auto text-lg" title={you.title}>
          {you.sticker}
        </span>
      </div>

      {/* Status line → title */}
      <div className="px-3 pt-2 text-[11px]">
        <span className="text-emerald-600">[</span>
        <span className="text-emerald-300">STATUS</span>
        <span className="text-emerald-600">]</span>
        <span className="ml-2 text-emerald-400">{you.title}</span>
        {expanded ? (
          <span className="ml-1 text-emerald-600">
            · all systems nominal
          </span>
        ) : null}
      </div>

      {/* Toolkit → running processes */}
      <div className="mt-2 flex-1 space-y-0.5 overflow-y-auto border-t border-emerald-900/40 px-3 py-2">
        <p className="mb-1 text-[10px] uppercase tracking-widest text-emerald-600">
          running processes
        </p>
        {toolkit.length === 0 ? (
          <p className="text-emerald-700">— no processes —</p>
        ) : (
          toolkit.map((tool, i) => (
            <div key={`${tool}-${i}`} className="flex items-center gap-2">
              <span className="text-emerald-600">[{String(1000 + i * 13)}]</span>
              <span className="text-emerald-300">{tool}</span>
              <span className="ml-auto">
                <span className="text-emerald-400">●</span>{" "}
                <span className="text-emerald-600">up</span>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Prompt with blinking cursor */}
      <div className="border-t border-emerald-900/40 px-3 py-2">
        <p className="truncate leading-none">
          <span className="text-emerald-500">operator@{github || "hud"}</span>
          <span className="text-emerald-600">:~$</span>{" "}
          <span className="hud-lg-cursor inline-block h-3 w-2 translate-y-0.5 bg-emerald-400" />
        </p>
      </div>
    </div>
  );
}

export const hudLG = {
  id: "hud-LG",
  label: USER.name,
  cards: [
    {
      id: "hud",
      label: USER.name,
      order: 25,
      span: 1,
      hint: USER.github,
      Card: HudBadge,
    },
  ],
};