"use client";

import { ContactSheet } from "./ContactSheet";
import { RED, INK, FONT } from "./shared";

// Mid-century Swiss (International Typographic Style): strict grid, flush-left
// ragged-right sans-serif, one red accent, white ground, heavy rules, no ornament.
const USER = {
  name: "Jeff",
  initials: "JB",
  title: "AEC AI Scout",
  github: "@JFFBLY3",
  seat: "Other",
  toolkit: "Excel · Rhino · Revit · Grasshopper · ChatGPT · Claude",
};

function SwissNameplate({ expanded }) {
  const toolkit = USER.toolkit
    .split("·")
    .map((tool) => tool.trim())
    .filter(Boolean);

  return (
    <div
      className="flex h-full min-h-48 flex-col bg-white p-4"
      style={{ fontFamily: FONT, color: INK }}
    >
      {/* Heavy top rule + running head */}
      <div className="flex items-baseline justify-between border-t-[6px] border-[#111] pt-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">
        <span>{USER.seat}</span>
        <span style={{ color: RED }}>{USER.initials}</span>
      </div>

      {/* 12-col grid: name spans 8, contact sheet spans 4 */}
      <div className="mt-3 grid flex-1 grid-cols-12 gap-x-3">
        <div className="col-span-8 flex flex-col justify-between">
          <h2
            className={`font-bold leading-[0.9] tracking-tighter ${
              expanded ? "text-8xl" : "text-5xl"
            }`}
          >
            {USER.name}
          </h2>
          <div>
            <div className="mb-2 h-1 w-10" style={{ background: RED }} />
            <p
              className={`font-medium leading-tight ${
                expanded ? "text-2xl" : "text-base"
              }`}
            >
              {USER.title}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">{USER.github}</p>
          </div>
        </div>

        <div className="col-span-4">
          <ContactSheet />
        </div>
      </div>

      {/* Toolkit: thin rule, small caps-style list aligned to the grid */}
      <div className="mt-3 grid grid-cols-12 gap-x-3 border-t border-[#111] pt-1.5">
        <p className="col-span-4 text-[10px] font-bold uppercase tracking-[0.2em]">
          Toolkit
        </p>
        <ul className="col-span-8 text-xs leading-snug">
          {toolkit.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export const swissNameplateJB = {
  id: "swiss-nameplate-JB",
  label: "Swiss nameplate",
  cards: [
    {
      id: "swiss-nameplate",
      label: USER.name,
      order: 93,
      span: 2,
      hint: USER.github,
      Card: SwissNameplate,
    },
  ],
};
