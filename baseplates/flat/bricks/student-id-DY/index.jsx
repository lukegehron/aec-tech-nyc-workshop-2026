"use client";

import { useState } from "react";

const USER = {
  name: "Dylan",
  initials: "DY",
  title: "Agent Operator",
  github: "@dylanbquan88",
  seat: "Other",
  toolkit: "Excel · Rhino · Revit · ChatGPT · Claude · Codex",
  sticker: "🤖",
};

// Each tool becomes a mana pip.
const PIP_COLORS = [
  "bg-yellow-200 text-yellow-900",
  "bg-sky-200 text-sky-900",
  "bg-slate-300 text-slate-900",
  "bg-emerald-200 text-emerald-900",
  "bg-rose-200 text-rose-900",
  "bg-violet-200 text-violet-900",
];

function MagicCard({ expanded }) {
  const [portraitFailed, setPortraitFailed] = useState(false);
  const github = USER.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;
  const toolkit = USER.toolkit
    .split("·")
    .map((tool) => tool.trim())
    .filter(Boolean);

  return (
    <div className="flex h-full items-center justify-center">
      <div
        className={`flex aspect-[5/7] h-full max-h-full w-auto max-w-full flex-col rounded-[6%/4.5%] bg-neutral-900 p-[3.5%] shadow-lg ${
          expanded ? "text-base" : "text-[10px]"
        }`}
        style={{ minHeight: 0 }}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-[2%] rounded-[4%/3%] border-2 border-amber-600/70 bg-amber-100 p-[3%] text-stone-900">
          {/* Title bar: name + mana cost */}
          <div className="flex items-center justify-between gap-1 rounded-md border border-stone-500 bg-gradient-to-b from-amber-50 to-amber-200 px-2 py-1 shadow-sm">
            <span className="font-heading text-[1.2em] font-bold leading-none">
              {USER.name}
            </span>
            <span className="flex gap-0.5" aria-label="mana cost">
              {toolkit.slice(0, 3).map((tool, i) => (
                <span
                  key={tool}
                  title={tool}
                  className={`flex size-[1.6em] items-center justify-center rounded-full border border-stone-600 text-[0.8em] font-bold ${PIP_COLORS[i % PIP_COLORS.length]}`}
                >
                  {tool[0]}
                </span>
              ))}
            </span>
          </div>

          {/* Art window */}
          <div className="relative min-h-0 flex-[5] overflow-hidden rounded-sm border-2 border-stone-700 bg-gradient-to-b from-indigo-900 via-purple-800 to-fuchsia-700">
            {/* Arcane glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(250,204,21,0.45),transparent_60%)]" />
            <div className="absolute inset-x-0 bottom-0 flex justify-center">
              <div className="relative aspect-square h-[78%] min-h-0 w-[62%] overflow-hidden rounded-t-full border-2 border-amber-300 bg-slate-800">
                {portraitFailed ? (
                  <span className="flex size-full items-center justify-center font-heading text-4xl font-bold text-amber-200">
                    {USER.initials}
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={portraitUrl}
                    alt={`${USER.name}, hardhat-wearing spellcaster`}
                    className="size-full object-cover"
                    onError={() => setPortraitFailed(true)}
                  />
                )}
              </div>
              {/* Hardhat, worn on top of the portrait */}
              <span
                className="absolute left-1/2 top-[-2%] -translate-x-1/2 text-[3.2em] leading-none drop-shadow"
                role="img"
                aria-label="hardhat"
              >
                ⛑️
              </span>
            </div>
            {/* Spell */}
            <span className="absolute left-1.5 top-1 text-[1.6em] drop-shadow" aria-hidden>
              ✨
            </span>
            <span className="absolute right-1.5 top-1 text-[1.6em] drop-shadow" aria-hidden>
              {USER.sticker}
            </span>
          </div>

          {/* Type line */}
          <div className="flex items-center justify-between rounded-md border border-stone-500 bg-gradient-to-b from-amber-50 to-amber-200 px-2 py-0.5 shadow-sm">
            <span className="text-[1em] font-semibold leading-tight">
              Creature — Spellcaster ({USER.title})
            </span>
            <span className="ml-1 text-[0.9em]" title={`Set: ${USER.seat}`}>
              ◆
            </span>
          </div>

          {/* Rules text */}
          <div className="min-h-0 flex-[3] overflow-hidden rounded-sm border border-stone-400 bg-amber-50 px-2 py-1.5">
            <p className="text-[0.95em] leading-snug">
              <span className="font-semibold">Hard Hat</span> — Dylan has
              protection from falling deadlines.
            </p>
            <p className="mt-1 text-[0.95em] leading-snug">
              <span className="font-semibold">Cast:</span>{" "}
              {toolkit.join(", ")}.
            </p>
            {expanded && (
              <p className="mt-1 text-[0.9em] italic leading-snug text-stone-600">
                “The model is only as good as the one wearing the hardhat.”
              </p>
            )}
          </div>

          {/* Bottom: artist credit + power/toughness */}
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[0.8em] italic text-stone-700">
              Illus. {USER.github}
            </span>
            <span className="rounded-md border border-stone-600 bg-gradient-to-b from-amber-50 to-amber-200 px-2 py-0.5 text-[1em] font-bold shadow-sm">
              {toolkit.length}/{USER.title.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const studentIdDY = {
  id: "student-id-DY",
  label: "Spell Card",
  cards: [
    {
      id: "student-id",
      label: USER.name,
      order: 91,
      span: 1,
      hint: USER.github,
      Card: MagicCard,
    },
  ],
};
