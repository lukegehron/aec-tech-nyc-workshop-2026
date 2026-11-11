"use client";

import { useState } from "react";
import { useCardState } from "../../storage";

const USER = {
  name: "Jasmine",
  initials: "JA",
  title: "Computational Designer",
  github: "@jasminelee5170-ctrl",
  seat: "Designer",
  toolkit: "Rhino · Revit · Grasshopper · JavaScript · Python · Claude",
  sticker: "🟢",
};

// Badge colour themes. Each one recolours the survey-grid paper, its grid
// lines, the clipboard frame, the mud splatter and the title. "mud" is the
// original look, so it's the default.
const THEMES = [
  {
    id: "mud",
    label: "Mud",
    paper: "#fffbeb",
    grid: "rgba(120,90,50,0.12)",
    frame: "rgba(69,26,3,0.8)",
    border: "rgba(120,53,15,0.5)",
    splat: "rgba(120,53,15,0.4)",
    accent: "#78350f",
  },
  {
    id: "blueprint",
    label: "Blueprint",
    paper: "#e8f1fb",
    grid: "rgba(37,99,235,0.15)",
    frame: "rgba(23,37,84,0.85)",
    border: "rgba(30,58,138,0.5)",
    splat: "rgba(30,58,138,0.35)",
    accent: "#1e3a8a",
  },
  {
    id: "moss",
    label: "Moss",
    paper: "#f0f7ee",
    grid: "rgba(22,101,52,0.14)",
    frame: "rgba(20,46,26,0.85)",
    border: "rgba(22,101,52,0.5)",
    splat: "rgba(22,101,52,0.35)",
    accent: "#166534",
  },
  {
    id: "hi-vis",
    label: "Hi-vis",
    paper: "#fefce8",
    grid: "rgba(234,88,12,0.15)",
    frame: "rgba(194,65,12,0.85)",
    border: "rgba(154,52,18,0.5)",
    splat: "rgba(154,52,18,0.35)",
    accent: "#c2410c",
  },
  {
    id: "concrete",
    label: "Concrete",
    paper: "#f4f4f5",
    grid: "rgba(82,82,91,0.14)",
    frame: "rgba(63,63,70,0.85)",
    border: "rgba(82,82,91,0.5)",
    splat: "rgba(82,82,91,0.35)",
    accent: "#3f3f46",
  },
];

// Survey-grid paper: faint lines in the theme's tint.
function gridStyle(theme) {
  return {
    backgroundColor: theme.paper,
    backgroundImage: `linear-gradient(${theme.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.grid} 1px, transparent 1px)`,
    backgroundSize: "16px 16px",
  };
}

function SurveyBadge({ expanded }) {
  const you = USER;
  const [portraitFailed, setPortraitFailed] = useState(false);
  const [themeId, setThemeId] = useCardState("survey-JA", THEMES[0].id);
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  const github = you.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;
  const toolkit = you.toolkit
    .split("·")
    .map((tool) => tool.trim())
    .filter(Boolean);

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-lg border-2 p-2 pt-4 text-stone-800 shadow-inner transition-colors"
      style={{ backgroundColor: theme.frame, borderColor: theme.border }}
    >
      {/* Mud splatter */}
      <span
        className="pointer-events-none absolute -bottom-3 -left-2 size-14 rounded-full blur-sm"
        style={{ backgroundColor: theme.splat }}
      />
      <span
        className="pointer-events-none absolute bottom-2 right-6 size-4 rounded-full"
        style={{ backgroundColor: theme.splat }}
      />
      <span
        className="pointer-events-none absolute bottom-6 right-2 size-2 rounded-full"
        style={{ backgroundColor: theme.splat }}
      />

      {/* Clip */}
      <div className="absolute left-1/2 top-0 z-10 h-5 w-16 -translate-x-1/2 rounded-b-md border border-stone-500 bg-gradient-to-b from-stone-300 to-stone-500 shadow">
        <div className="mx-auto mt-1 h-1.5 w-8 rounded-full bg-stone-700/70" />
      </div>

      {/* Paper */}
      <div
        className="relative flex flex-1 flex-col gap-2 overflow-auto rounded-sm p-3 font-mono transition-colors"
        style={gridStyle(theme)}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-sm border-2 border-stone-700 bg-stone-200 font-bold text-stone-700 ${
              expanded ? "size-24 text-3xl" : "size-16 text-xl"
            }`}
          >
            {portraitFailed ? (
              you.initials
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt={`${you.name} portrait`}
                className="size-full object-cover"
                onError={() => setPortraitFailed(true)}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-stone-500">
              Site survey · Surveyor
            </p>
            <p
              className={`truncate font-heading font-bold leading-tight ${
                expanded ? "text-3xl" : "text-xl"
              }`}
            >
              {you.name}
            </p>
            <p className="text-xs font-semibold" style={{ color: theme.accent }}>
              {you.title}
            </p>
            <p className="truncate text-[10px] text-stone-500">{you.github}</p>
          </div>
          <span className="text-xl" title="status">
            {you.sticker}
          </span>
        </div>

        <div className="flex items-center gap-2 border-y border-dashed border-stone-500 py-1 text-xs">
          <span className="uppercase tracking-widest text-stone-500">Seat</span>
          <span className="font-bold">{you.seat}</span>
        </div>

        <div>
          <p className="mb-1 text-[10px] uppercase tracking-widest text-stone-500">
            Site notes · toolkit
          </p>
          <ul className={`grid gap-x-3 gap-y-0.5 text-xs ${expanded ? "grid-cols-3" : "grid-cols-2"}`}>
            {toolkit.map((tool) => (
              <li key={tool} className="flex items-center gap-1.5">
                <span className="flex size-3.5 shrink-0 items-center justify-center border border-stone-700 bg-white text-[11px] font-bold leading-none text-emerald-700">
                  ✓
                </span>
                <span className="truncate">{tool}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Badge colour — click a swatch; the choice survives a reload. */}
        <div className="mt-auto flex items-center gap-1.5 border-t border-dashed border-stone-500 pt-1.5">
          <span className="text-[10px] uppercase tracking-widest text-stone-500">
            Colour
          </span>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setThemeId(t.id)}
              aria-label={`${t.label} badge colour`}
              aria-pressed={theme.id === t.id}
              title={t.label}
              className={`size-4 rounded-full border-2 transition-transform hover:scale-110 ${
                theme.id === t.id ? "border-stone-800" : "border-white/70"
              }`}
              style={{ backgroundColor: t.frame }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const surveyJA = {
  id: "survey-JA",
  label: "Site survey badge",
  cards: [
    {
      id: "survey-badge",
      label: "Jasmine",
      order: 92,
      span: 2,
      hint: "@jasminelee5170-ctrl",
      Card: SurveyBadge,
    },
  ],
};
