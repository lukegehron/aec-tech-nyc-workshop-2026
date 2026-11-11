"use client";

import { useState } from "react";
import { useCardState } from "../../storage";

const USER = {
  name: "Nicholas",
  initials: "NI",
  title: "AEC AI Scout",
  github: "@nwright234",
  seat: "Developer",
  toolkit: "Excel · Rhino · Revit · Grasshopper · Claude · ChatGPT",
  sticker: "🏗️",
};

const TOOLS = USER.toolkit
  .split("·")
  .map((tool) => tool.trim())
  .filter(Boolean);

// Fixed tilt per stamp so the card looks hand-punched (no Math.random in render).
const TILTS = [-6, 4, -3, 7, -5, 3];

function PunchCard({ expanded }) {
  const [stamped, setStamped] = useCardState("punch-card-NI", []);
  const [portraitFailed, setPortraitFailed] = useState(false);

  const github = USER.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;
  const done = TOOLS.filter((tool) => stamped.includes(tool)).length;
  const complete = done === TOOLS.length;

  const toggle = (tool) =>
    setStamped(
      stamped.includes(tool)
        ? stamped.filter((t) => t !== tool)
        : [...stamped, tool],
    );

  return (
    <div
      className="relative flex h-full flex-col gap-2 overflow-hidden rounded-md border-2 border-dashed border-amber-900/50 bg-amber-100 p-3 text-amber-950 shadow-inner"
      style={{
        backgroundImage:
          "radial-gradient(circle at 15% 20%, rgba(120,70,20,.12) 0, transparent 35%), radial-gradient(circle at 85% 90%, rgba(120,70,20,.15) 0, transparent 40%)",
      }}
    >
      {/* Header: the offer */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-amber-900/60 bg-amber-200 font-heading text-sm font-bold">
          {!portraitFailed ? (
            <img
              src={portraitUrl}
              alt={USER.name}
              className="size-full object-cover sepia"
              onError={() => setPortraitFailed(true)}
            />
          ) : (
            USER.initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`font-heading font-bold uppercase leading-tight tracking-wide ${
              expanded ? "text-xl" : "text-sm"
            }`}
          >
            Collect {TOOLS.length} tools, get 1 free {USER.title}
          </p>
          <p className="truncate text-[11px] italic text-amber-900/70">
            {USER.name} · {USER.seat} · {USER.github}
          </p>
        </div>
        <span className="-rotate-12 text-2xl" aria-hidden>
          {USER.sticker}
        </span>
      </div>

      {/* Stamps: the toolkit */}
      <div className="grid flex-1 grid-cols-3 content-center gap-2">
        {TOOLS.map((tool, i) => {
          const on = stamped.includes(tool);
          return (
            <button
              key={tool}
              type="button"
              onClick={() => toggle(tool)}
              aria-pressed={on}
              className={`flex aspect-[5/3] flex-col items-center justify-center rounded border-2 border-dashed px-1 text-center text-[11px] font-semibold leading-tight transition ${
                on
                  ? "border-red-800/70 bg-amber-50/60 text-red-800"
                  : "border-amber-900/40 text-amber-900/60 hover:bg-amber-50/50"
              }`}
              style={{
                transform: `rotate(${on ? TILTS[i % TILTS.length] : 0}deg)`,
              }}
            >
              <span className="text-base" aria-hidden>
                {on ? "◉" : "○"}
              </span>
              <span className="max-w-full truncate">{tool}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-dashed border-amber-900/40 pt-1 text-[10px] uppercase tracking-widest text-amber-900/70">
        <span>
          {complete ? "Redeemed! 🎉" : `${done}/${TOOLS.length} punched`}
        </span>
        <button
          type="button"
          onClick={() => setStamped([])}
          className="underline decoration-dotted hover:text-amber-950"
        >
          reset
        </button>
      </div>
    </div>
  );
}

export const punchCardNI = {
  id: "punch-card-NI",
  label: "Punch card",
  cards: [
    {
      id: "punch-card",
      label: USER.name,
      order: 92,
      span: 1,
      hint: USER.github,
      Card: PunchCard,
    },
  ],
};
