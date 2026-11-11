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

// Deterministic bar widths (1–3) derived from the handle, so the barcode is stable.
function barsFor(text) {
  const bars = [];
  let seed = 7;
  for (let i = 0; i < 40; i++) {
    seed = (seed * 31 + text.charCodeAt(i % text.length) + i) % 9973;
    bars.push((seed % 3) + 1);
  }
  return bars;
}

function StudentId({ expanded }) {
  const [portraitFailed, setPortraitFailed] = useState(false);
  const github = USER.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;
  const toolkit = USER.toolkit
    .split("·")
    .map((tool) => tool.trim())
    .filter(Boolean);
  const bars = barsFor(github);

  return (
    <div className="flex h-full items-center justify-center">
      <div
        className={`relative flex aspect-[3/4] h-full max-h-full w-auto max-w-full flex-col overflow-hidden rounded-xl border border-border bg-white text-slate-900 shadow-md ${
          expanded ? "text-base" : "text-xs"
        }`}
        style={{ minHeight: 0 }}
      >
        {/* Header band */}
        <div className="flex items-center justify-between bg-blue-900 px-3 py-2 text-white">
          <span className="font-heading text-[0.8em] font-semibold uppercase tracking-widest">
            University ID
          </span>
          <span aria-hidden>{USER.sticker}</span>
        </div>

        {/* Portrait */}
        <div className="flex justify-center px-3 pt-3">
          <div className="flex aspect-[4/5] w-1/2 min-w-16 items-center justify-center overflow-hidden rounded-md border-2 border-blue-900 bg-slate-200">
            {portraitFailed ? (
              <span className="font-heading text-3xl font-bold text-blue-900">
                {USER.initials}
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt={`${USER.name} portrait`}
                className="size-full object-cover"
                onError={() => setPortraitFailed(true)}
              />
            )}
          </div>
        </div>

        {/* Identity */}
        <div className="px-3 pt-2 text-center">
          <p className="font-heading text-[1.3em] font-bold leading-tight">
            {USER.name}
          </p>
          <p className="text-[0.85em] text-slate-600">
            Major: <span className="font-semibold">{USER.title}</span>
          </p>
          <p className="text-[0.85em] text-slate-600">
            School year: <span className="font-semibold">{USER.seat}</span>
          </p>
        </div>

        {/* Toolkit as courses */}
        {expanded && (
          <div className="flex flex-wrap justify-center gap-1 px-3 pt-2">
            {toolkit.map((tool) => (
              <span
                key={tool}
                className="rounded bg-blue-50 px-1.5 py-0.5 text-[0.75em] text-blue-900"
              >
                {tool}
              </span>
            ))}
          </div>
        )}

        {/* Barcode + caption */}
        <div className="mt-auto px-3 pb-2 pt-2">
          <div className="flex h-8 items-stretch justify-center gap-px" aria-hidden>
            {bars.map((w, i) => (
              <span
                key={i}
                className={i % 2 === 0 ? "bg-slate-900" : "bg-transparent"}
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
          <p className="mt-1 text-center font-mono text-[0.75em] tracking-wider text-slate-700">
            {USER.github}
          </p>
        </div>
      </div>
    </div>
  );
}

export const studentIdDY = {
  id: "student-id-DY",
  label: "Student ID",
  cards: [
    {
      id: "student-id",
      label: USER.name,
      order: 91,
      span: 1,
      hint: USER.github,
      Card: StudentId,
    },
  ],
};
