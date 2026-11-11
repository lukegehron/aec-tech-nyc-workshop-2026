"use client";

// Engineering data sheet for one person. Title block, revision A. Dry on purpose.

import { useState } from "react";

const PERSON = {
  name: "luke",
  title: "Coding Rockstar",
  github: "@lukegehron",
  seat: "Other",
  toolkit: [],
  sticker: "⚡",
  initials: "LU",
};

// Pastel rainbow so the dark text stays legible on top of it.
const RAINBOW =
  "linear-gradient(135deg, #fca5a5, #fdba74, #fde68a, #bef264, #86efac, #67e8f9, #93c5fd, #c4b5fd, #f0abfc)";

const PORTRAIT_URL = "https://github.com/lukegehron.png";

function SpecSheet({ expanded }) {
  const [portraitFailed, setPortraitFailed] = useState(false);

  // [no., parameter, value, unit]
  const rows = [
    ["01", "Name", PERSON.name, "string"],
    ["02", "Title", PERSON.title, "string"],
    ["03", "GitHub", PERSON.github, "handle"],
    ["04", "Seat", PERSON.seat, "category"],
    [
      "05",
      "Toolkit",
      PERSON.toolkit.length ? PERSON.toolkit.join(", ") : "—",
      `items (n=${PERSON.toolkit.length})`,
    ],
    ["06", "Sticker", PERSON.sticker, "glyph"],
  ];

  return (
    <div
      style={{ backgroundImage: RAINBOW }}
      className={`flex h-full flex-col overflow-hidden border border-neutral-800/60 font-mono text-neutral-900 ${
        expanded ? "text-sm" : "text-[11px]"
      }`}
    >
      <div className="flex items-center justify-between border-b border-neutral-800/60 px-2 py-1 uppercase tracking-widest">
        <span className="font-semibold">Data Sheet</span>
        <span>Rev A</span>
      </div>

      <div className="flex items-center gap-2 border-b border-neutral-800/60 px-2 py-2">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden border border-neutral-800/60 font-heading text-sm font-bold">
          {!portraitFailed ? (
            <img
              src={PORTRAIT_URL}
              alt={PERSON.name}
              className="size-full object-cover"
              onError={() => setPortraitFailed(true)}
            />
          ) : (
            PERSON.initials
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold uppercase">{PERSON.name}</p>
          <p className="truncate text-neutral-600">{PERSON.title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white/70">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-neutral-800/60 text-left uppercase tracking-wider text-neutral-600">
              <th className="px-2 py-1 font-normal">No.</th>
              <th className="px-2 py-1 font-normal">Parameter</th>
              <th className="px-2 py-1 font-normal">Value</th>
              <th className="px-2 py-1 font-normal">Unit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([no, param, value, unit]) => (
              <tr key={no} className="border-b border-neutral-800/20">
                <td className="px-2 py-1 text-neutral-600">{no}</td>
                <td className="px-2 py-1">{param}</td>
                <td className="px-2 py-1 font-semibold">{value}</td>
                <td className="px-2 py-1 text-neutral-600">{unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 border-t border-neutral-800/60 uppercase tracking-wider text-neutral-600">
        <span className="border-r border-neutral-800/20 px-2 py-1">Sheet 1/1</span>
        <span className="border-r border-neutral-800/20 px-2 py-1">Rev A</span>
        <span className="truncate px-2 py-1">Dwg {PERSON.initials}-001</span>
      </div>
    </div>
  );
}

export const specSheetLU = {
  id: "spec-sheet-LU",
  label: PERSON.name,
  cards: [
    {
      id: "spec-sheet",
      label: PERSON.name,
      order: 26,
      span: 1,
      hint: PERSON.github,
      Card: SpecSheet,
    },
  ],
};
