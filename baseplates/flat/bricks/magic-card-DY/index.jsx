"use client";

import { useState } from "react";

const CARD = {
  name: "Dylan, Agent Operator",
  initials: "DY",
  type: "Legendary Creature — Human Artificer",
  github: "@dylanbquan88",
  origin: "Other",
  toolkit: "Excel · Rhino · Revit · ChatGPT · Claude · Codex",
  emblem: "🤖",
};

const PIPS = [
  "bg-emerald-200 text-emerald-900",
  "bg-amber-200 text-amber-900",
  "bg-sky-200 text-sky-900",
  "bg-violet-200 text-violet-900",
  "bg-rose-200 text-rose-900",
  "bg-stone-300 text-stone-900",
];

function Plate({ children, className = "" }) {
  return (
    <div
      className={`rounded-md border border-amber-900/60 bg-gradient-to-b from-amber-50 to-amber-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function MagicCard({ expanded }) {
  const [portraitFailed, setPortraitFailed] = useState(false);
  const github = CARD.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;
  const toolkit = CARD.toolkit
    .split("·")
    .map((tool) => tool.trim())
    .filter(Boolean);

  return (
    <div className="flex h-full items-center justify-center">
      <div
        className={`flex aspect-[5/7] h-full max-h-full w-auto max-w-full flex-col rounded-[6%/4.5%] bg-gradient-to-br from-stone-900 via-neutral-800 to-stone-950 p-[3%] shadow-xl ${
          expanded ? "text-base" : "text-[10px]"
        }`}
        style={{ minHeight: 0 }}
      >
        {/* Ornate gilded frame */}
        <div className="flex min-h-0 flex-1 flex-col gap-[1.5%] rounded-[4%/3%] border-[3px] border-double border-amber-500 bg-gradient-to-b from-amber-100 via-orange-100 to-amber-200 p-[3%] text-stone-900 shadow-[inset_0_0_0_2px_rgba(120,53,15,0.5)]">
          {/* Name + mana pips */}
          <Plate className="flex items-center justify-between gap-1 px-2 py-1">
            <span className="font-heading text-[1.15em] font-bold leading-tight">
              {CARD.name}
            </span>
            <span className="flex shrink-0 gap-0.5" aria-label="mana cost">
              {toolkit.slice(0, 3).map((tool, i) => (
                <span
                  key={tool}
                  title={tool}
                  className={`flex size-[1.7em] items-center justify-center rounded-full border border-stone-700 text-[0.8em] font-bold ${PIPS[i % PIPS.length]}`}
                >
                  {tool[0]}
                </span>
              ))}
            </span>
          </Plate>

          {/* Large portrait window */}
          <div className="relative min-h-0 flex-[6] overflow-hidden rounded-sm border-[3px] border-amber-900/80 bg-slate-800 shadow-[inset_0_0_12px_rgba(0,0,0,0.6)]">
            {portraitFailed ? (
              <div className="flex size-full items-center justify-center bg-gradient-to-b from-indigo-900 via-purple-800 to-fuchsia-700">
                <span className="font-heading text-6xl font-bold text-amber-200 drop-shadow">
                  {CARD.initials}
                </span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt={`Portrait of ${CARD.name}`}
                className="size-full object-cover"
                onError={() => setPortraitFailed(true)}
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_55%,rgba(30,10,60,0.45))]" />
            <span
              className="absolute right-1.5 top-1 text-[1.8em] drop-shadow"
              role="img"
              aria-label="emblem"
            >
              {CARD.emblem}
            </span>
          </div>

          {/* Type line + origin symbol */}
          <Plate className="flex items-center justify-between gap-1 px-2 py-0.5">
            <span className="text-[0.95em] font-semibold leading-tight">
              {CARD.type}
            </span>
            <span
              className="shrink-0 text-[0.9em] text-amber-800"
              title={`Origin: ${CARD.origin}`}
            >
              ◆
            </span>
          </Plate>

          {/* Abilities + flavor */}
          <div className="min-h-0 flex-[4] overflow-hidden rounded-sm border border-amber-900/50 bg-amber-50/90 px-2 py-1.5">
            <p className="text-[0.9em] leading-snug">
              <span className="font-bold">Tool Tap</span> — · : Tap Excel,
              Rhino or Revit to untap a spreadsheet nobody trusted.
            </p>
            <p className="mt-1 text-[0.9em] leading-snug">
              <span className="font-bold">Prompt Chain</span> — When ChatGPT,
              Claude or Codex enters, automate one tedious AEC task.
            </p>
            {expanded && (
              <p className="mt-1 text-[0.9em] leading-snug">
                <span className="font-bold">Coordination</span> — Clashes
                you don’t resolve are summarized by an agent instead.
              </p>
            )}
            <p className="mt-1.5 border-t border-amber-900/30 pt-1 text-[0.85em] italic leading-snug text-stone-700">
              “{toolkit.join(", ")} — six tools, one very calm schedule.”
            </p>
          </div>

          {/* Creator credit + power/toughness */}
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[0.75em] italic text-stone-700">
              Illus. {CARD.github}
            </span>
            <Plate className="px-2.5 py-0.5 text-[1.05em] font-bold">
              {toolkit.length}/{toolkit.length + 1}
            </Plate>
          </div>
        </div>
      </div>
    </div>
  );
}

export const magicCardDY = {
  id: "magic-card-DY",
  label: "Magic card",
  cards: [
    {
      id: "magic-card",
      label: CARD.name,
      order: 92,
      span: 1,
      hint: CARD.github,
      Card: MagicCard,
    },
  ],
};
