"use client";

// ─── XLS STICKER ─────────────────────────────────────────────────────────────
// Megan's nametag, dressed up as the only CAD tool that has ever really shipped:
// a spreadsheet. Name in cell A1, job title in the formula bar, one joke in the
// band where the sum would go. Excel green, no libraries — React + Tailwind.

import { useState } from "react";

const USER = {
  name: "Megan",
  initials: "ME",
  title: "Agent Operator",
  github: "@meganrsalazar5-collab",
  seat: "Engineer",
  toolkit: "Excel · Rhino · Revit · ChatGPT · Claude Code",
  sticker: "🤖",
};

// The one joke. Big type, bottom of the sheet.
const JOKE = "Every building is a spreadsheet that learned to stand up.";

const COLUMNS = ["A", "B", "C"];

function XlsSticker({ expanded }) {
  const you = USER;
  const [portraitFailed, setPortraitFailed] = useState(false);

  const github = (you.github || "").replace(/^@/, "");
  const portraitUrl = github ? `https://github.com/${github}.png` : null;

  // The toolkit arrives as a " · " separated string (the person shape); accept
  // an array too, defensively.
  const toolkit = Array.isArray(you.toolkit)
    ? you.toolkit.map((tool) => String(tool))
    : String(you.toolkit ?? "")
        .split("·")
        .map((tool) => tool.trim())
        .filter(Boolean);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-[#217346]/40 bg-white text-[#1f2d24]">
      {/* Title bar — the green ribbon everyone recognises */}
      <div className="flex items-center gap-2 bg-[#217346] px-3 py-1.5 text-white">
        <span className="font-heading text-[11px] font-bold leading-none">X</span>
        <span className="truncate text-[10px] tracking-wide text-white/90">
          {you.initials.toLowerCase()}-nametag.xlsx
        </span>
        <span className="ml-auto text-sm" title={you.title}>
          {you.sticker}
        </span>
      </div>

      {/* Formula bar — fx, then the job title, because that is what she is */}
      <div className="flex items-center gap-2 border-b border-[#217346]/20 bg-[#f3f6f4] px-2 py-1">
        <span className="rounded border border-[#217346]/30 bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#217346]">
          A1
        </span>
        <span className="font-serif text-[11px] italic text-[#6b7a71]">fx</span>
        <span className="min-w-0 flex-1 truncate border-l border-[#217346]/20 pl-2 font-mono text-[11px]">
          ={you.title.replace(/\s+/g, "")}()
        </span>
      </div>

      {/* Column headers */}
      <div className="flex border-b border-[#217346]/20 bg-[#f3f6f4] text-[10px] text-[#6b7a71]">
        <span className="w-6 shrink-0 border-r border-[#217346]/20 text-center">
          &nbsp;
        </span>
        {COLUMNS.map((col) => (
          <span
            key={col}
            className="flex-1 border-r border-[#217346]/20 text-center font-mono"
          >
            {col}
          </span>
        ))}
      </div>

      {/* Row 1 — the selected cell: her name, big */}
      <div className="flex items-stretch border-b border-[#217346]/15">
        <span className="flex w-6 shrink-0 items-center justify-center border-r border-[#217346]/20 bg-[#f3f6f4] font-mono text-[10px] text-[#6b7a71]">
          1
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 outline-2 -outline-offset-2 outline-[#217346]">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border border-[#217346]/40 bg-[#e6f1ea] font-heading text-sm font-bold text-[#217346]">
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
          <p
            className={`min-w-0 flex-1 truncate font-heading font-bold leading-none tracking-tight text-[#217346] ${
              expanded ? "text-6xl" : "text-3xl"
            }`}
          >
            {you.name}
          </p>
        </div>
      </div>

      {/* Row 2 — seat and handle */}
      <div className="flex items-stretch border-b border-[#217346]/15">
        <span className="flex w-6 shrink-0 items-center justify-center border-r border-[#217346]/20 bg-[#f3f6f4] font-mono text-[10px] text-[#6b7a71]">
          2
        </span>
        <p className="min-w-0 flex-1 truncate px-3 py-1.5 font-mono text-[11px] text-[#4b5a51]">
          {you.seat} · {you.github}
        </p>
      </div>

      {/* Rows 3+ — the toolkit, one tool per row, like any honest schedule */}
      <div className="flex min-h-0 flex-1 items-stretch overflow-hidden">
        <div className="flex w-6 shrink-0 flex-col border-r border-[#217346]/20 bg-[#f3f6f4]">
          {toolkit.map((tool, i) => (
            <span
              key={`row-${tool}-${i}`}
              className="border-b border-[#217346]/15 text-center font-mono text-[10px] leading-6 text-[#6b7a71]"
            >
              {i + 3}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1 overflow-y-auto">
          {toolkit.length === 0 ? (
            <p className="px-3 text-[11px] leading-6 text-[#9aa79f]">
              — empty sheet —
            </p>
          ) : (
            toolkit.map((tool, i) => (
              <div
                key={`${tool}-${i}`}
                className="flex items-center gap-2 border-b border-[#217346]/15 px-3 leading-6"
              >
                <span className="truncate font-mono text-[11px]">{tool}</span>
                <span className="ml-auto font-mono text-[10px] text-[#217346]">
                  ✓
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* The joke — big type, where the sum would go */}
      <div className="border-t border-[#217346]/20 bg-[#e6f1ea] px-3 py-2">
        <p
          className={`font-heading font-bold leading-tight text-[#217346] ${
            expanded ? "text-2xl" : "text-sm"
          }`}
        >
          {JOKE}
        </p>
      </div>

      {/* Status bar — sheet tabs, as it should be */}
      <div className="flex items-center gap-2 bg-[#217346] px-3 py-1 text-[10px] text-white/90">
        <span className="rounded-t bg-white px-2 font-mono text-[#217346]">
          Sheet1
        </span>
        <span className="font-mono">+</span>
        <span className="ml-auto font-mono tabular-nums">
          Ready · {toolkit.length} tools
        </span>
      </div>
    </div>
  );
}

export const xlsStickerME = {
  id: "xls-sticker-ME",
  label: USER.name,
  cards: [
    {
      // Card ids stay plain — they belong to the baseplate's contract.
      id: "xls-sticker",
      label: USER.name,
      order: 26,
      span: 1,
      hint: USER.github,
      Card: XlsSticker,
    },
  ],
};
