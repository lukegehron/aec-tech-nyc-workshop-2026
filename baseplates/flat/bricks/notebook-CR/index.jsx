"use client";

import { useState } from "react";

const USER = {
  name: "Craig",
  initials: "CR",
  title: "Archi+Tech",
  github: "@dcdixon",
  seat: "Technology Strategy",
  avatarGif:
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzJqdmlnd2dzOGNzemFndGk4eWU5ZGdneDRwcHl4dnlrYm1najVsciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H5C8CevNMbpBqNqFjl/giphy.gif",
  toolkit: "Excel · Rhino · Revit · Grasshopper · JavaScript · Claude",
  sticker: "🤓",
};

// Fluent 2 "Web UI Kit" look: pale blue→lavender wash, white floating cards,
// periwinkle accent, soft diffuse shadows. Inlined so the brick is self-contained.
const F = {
  font: '"Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
  accent: "#7F85F5",
  accentDeep: "#4F52B2",
  accentTint: "#E8EBFA",
  fg1: "#242424",
  fg2: "#424242",
  fg3: "#707070",
  wash: "linear-gradient(135deg, #EEF3FD 0%, #F3F1FD 45%, #EBD9F6 100%)",
  shadowCard: "0 8px 24px rgba(79,82,178,0.12), 0 1px 3px rgba(0,0,0,0.06)",
  shadowSoft: "0 4px 12px rgba(79,82,178,0.10)",
};

function SectionHeading({ children }) {
  return (
    <h4
      className="text-xs font-semibold uppercase"
      style={{ color: F.accentDeep, letterSpacing: "0.08em" }}
    >
      {children}
    </h4>
  );
}

function NotebookCell({ expanded }) {
  const you = USER;
  // 0 = GIF, 1 = GitHub portrait, 2 = initials
  const [stage, setStage] = useState(0);

  const github = you.github.replace(/^@/, "");
  const portraitUrl = `https://github.com/${github}.png`;
  const avatarUrl = stage === 0 ? you.avatarGif : portraitUrl;
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
        background: F.wash,
        borderRadius: 12,
      }}
    >
      {/* Profile — avatar, name, title */}
      <div
        className="flex items-center gap-3 bg-white p-3"
        style={{ borderRadius: 8, boxShadow: F.shadowCard }}
      >
        {stage >= 2 ? (
          <span
            role="img"
            aria-label={`${you.name} initials`}
            className="flex size-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
            style={{
              background: `linear-gradient(135deg, ${F.accent}, #C084D8)`,
              boxShadow: F.shadowSoft,
            }}
          >
            {you.initials}
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={avatarUrl}
            src={avatarUrl}
            alt={`${you.name} (@${github})`}
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-full object-cover"
            style={{ boxShadow: F.shadowSoft }}
            onError={() => setStage((s) => s + 1)}
          />
        )}
        <div className="min-w-0">
          <h3
            className={`truncate font-semibold ${expanded ? "text-2xl" : "text-xl"}`}
            style={{ color: F.fg1, lineHeight: 1.2 }}
          >
            {you.name}
          </h3>
          <p className="truncate" style={{ color: F.fg3 }}>
            {you.title}
          </p>
        </div>
      </div>

      {/* Toolkit — list */}
      <div
        className="bg-white p-3"
        style={{ borderRadius: 8, boxShadow: F.shadowCard }}
      >
        <SectionHeading>Toolkit</SectionHeading>
        <ul
          className="mt-2 list-disc pl-5 marker:text-[#7F85F5]"
          style={{ color: F.fg2, lineHeight: 1.6 }}
        >
          {toolkit.map((tool) => (
            <li key={tool} style={{ paddingLeft: 2 }}>
              {tool}
            </li>
          ))}
        </ul>
      </div>

      {/* Seat — tinted banner */}
      <div
        className="flex items-center gap-3 px-3 py-2.5"
        style={{
          background: F.accentTint,
          borderRadius: 8,
          boxShadow: F.shadowSoft,
        }}
      >
        <span aria-hidden="true" className="text-2xl">
          {you.sticker}
        </span>
        <div className="min-w-0">
          <SectionHeading>Role</SectionHeading>
          <p className="text-base font-semibold" style={{ color: F.accentDeep }}>
            {you.seat}
          </p>
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
