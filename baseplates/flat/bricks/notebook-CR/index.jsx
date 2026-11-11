"use client";

import { useState } from "react";

const USER = {
  name: "Craig",
  initials: "CR",
  title: "AEC AI Scout",
  github: "@dcdixon",
  seat: "Other",
  toolkit: "Excel · Rhino · Revit · Grasshopper · JavaScript · Claude",
  sticker: "🏗️",
};

// Fluent 2 (web light theme) tokens, inlined so the brick stays self-contained.
const F = {
  font: '"Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
  mono: 'Consolas, "Cascadia Mono", "Courier New", monospace',
  brand: "#0F6CBD", // colorBrandBackground
  brandTint: "#EBF3FC", // colorBrandBackground2
  brandFg: "#0F548C", // colorBrandForeground2-ish
  fg1: "#242424", // colorNeutralForeground1
  fg2: "#424242", // colorNeutralForeground2
  fg3: "#616161", // colorNeutralForeground3
  bg1: "#FFFFFF", // colorNeutralBackground1
  bg2: "#FAFAFA", // colorNeutralBackground2
  bg3: "#F5F5F5", // colorNeutralBackground3
  stroke1: "#D1D1D1", // colorNeutralStroke1
  stroke2: "#E0E0E0", // colorNeutralStroke2
  success: "#107C10",
  successBg: "#DFF6DD",
  radius: 4, // borderRadiusMedium
  radiusLg: 8, // borderRadiusLarge
  shadow4: "0 0 2px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.14)", // shadow4
};

function CellLabel({ children, tone = "in" }) {
  return (
    <span
      className="w-14 shrink-0 select-none pr-2 text-right text-[11px]"
      style={{
        fontFamily: F.mono,
        color: tone === "in" ? F.brand : F.fg3,
      }}
    >
      {children}
    </span>
  );
}

function NotebookCell({ expanded }) {
  const you = USER;
  const [portraitFailed, setPortraitFailed] = useState(false);

  const github = you.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;
  const toolkit = you.toolkit
    .split("·")
    .map((tool) => tool.trim())
    .filter(Boolean);

  return (
    <div
      className="flex h-full flex-col gap-3 overflow-auto p-3 text-sm"
      style={{
        fontFamily: F.font,
        color: F.fg1,
        background: F.bg1,
        border: `1px solid ${F.stroke2}`,
        borderRadius: F.radiusLg,
        boxShadow: F.shadow4,
      }}
    >
      {/* Cell 1 — code: the name as a comment-style heading */}
      <div
        className="flex items-start py-2 pr-3"
        style={{
          background: F.bg3,
          border: `1px solid ${F.stroke2}`,
          borderRadius: F.radius,
        }}
      >
        <CellLabel>In [1]:</CellLabel>
        <code style={{ fontFamily: F.mono, color: F.fg1 }}>
          <span style={{ color: F.fg3 }}># </span>
          {you.name}
        </code>
      </div>

      {/* Cell 2 — markdown: title and toolkit list */}
      <div className="flex items-start py-1 pr-2">
        <CellLabel>md</CellLabel>
        <div className="min-w-0">
          <h3
            className={`font-semibold ${expanded ? "text-2xl" : "text-xl"}`}
            style={{ color: F.fg1, lineHeight: 1.25 }}
          >
            {you.title}
          </h3>
          <p
            className="mt-2 text-xs font-semibold uppercase"
            style={{ color: F.fg3, letterSpacing: "0.04em" }}
          >
            Toolkit
          </p>
          <ul
            className="mt-1 list-disc pl-5"
            style={{ color: F.fg2, lineHeight: 1.5 }}
          >
            {toolkit.map((tool) => (
              <li key={tool} style={{ paddingLeft: 2 }}>
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Output — the seat */}
      <div
        className="flex items-start pt-3 pr-2"
        style={{ borderTop: `1px solid ${F.stroke2}` }}
      >
        <CellLabel tone="out">Out[1]:</CellLabel>
        <div className="flex min-w-0 items-center gap-3">
          {portraitFailed ? (
            <span
              role="img"
              aria-label={`${you.name} initials`}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              style={{ background: F.brand, color: "#FFFFFF" }}
            >
              {you.initials}
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portraitUrl}
              alt={`${you.name} (@${github})`}
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full object-cover"
              style={{ border: `1px solid ${F.stroke1}` }}
              onError={() => setPortraitFailed(true)}
            />
          )}
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs" style={{ color: F.fg3 }}>
              Seat
            </span>
            <span className="flex items-center gap-2">
              <span
                className="inline-flex items-center px-2 text-xs font-semibold"
                style={{
                  height: 22,
                  borderRadius: 9999,
                  background: F.brandTint,
                  color: F.brandFg,
                  border: `1px solid ${F.brand}`,
                }}
              >
                {you.seat}
              </span>
              <span aria-hidden="true" className="text-base">
                {you.sticker}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const notebookCR = {
  id: "notebook-CR",
  label: "Notebook",
  cards: [
    {
      id: "notebook-card",
      label: USER.name,
      order: 92,
      span: 1,
      hint: USER.github,
      Card: NotebookCell,
    },
  ],
};
