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

function Prompt({ children, tone = "in" }) {
  return (
    <span
      className={`w-14 shrink-0 select-none pr-2 text-right font-mono text-[11px] ${
        tone === "in" ? "text-blue-600" : "text-orange-600"
      }`}
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
    <div className="flex h-full flex-col gap-3 overflow-auto rounded-md border border-border bg-background p-2 text-sm">
      {/* Cell 1 — code: the name as a comment-style heading */}
      <div className="flex items-start rounded border border-border bg-muted/40 py-1.5 pr-2">
        <Prompt>In [1]:</Prompt>
        <code className="font-mono text-foreground">
          <span className="text-muted-foreground"># </span>
          {you.name}
        </code>
      </div>

      {/* Cell 2 — markdown: title and toolkit list */}
      <div className="flex items-start py-1 pr-2">
        <Prompt>md</Prompt>
        <div className="min-w-0">
          <h3
            className={`font-heading font-semibold tracking-tight ${
              expanded ? "text-2xl" : "text-lg"
            }`}
          >
            {you.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">Toolkit</p>
          <ul className="mt-0.5 list-disc pl-5">
            {toolkit.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Output — the seat */}
      <div className="flex items-start pr-2">
        <Prompt tone="out">Out[1]:</Prompt>
        <div className="flex min-w-0 items-center gap-3">
          {portraitFailed ? (
            <span
              role="img"
              aria-label={`${you.name} initials`}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold"
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
              onError={() => setPortraitFailed(true)}
            />
          )}
          <p className="font-mono text-sm">
            <span className="text-muted-foreground">seat = </span>
            <span className="text-emerald-700">&quot;{you.seat}&quot;</span>{" "}
            <span aria-hidden="true">{you.sticker}</span>
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
