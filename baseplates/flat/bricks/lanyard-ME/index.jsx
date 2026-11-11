"use client";

// Weekend-pass lanyard: a conference badge with a hole punch at the top.
// Front = name, title, SAT/SUN mark. Back = toolkit. Flip with the button.

import { useState } from "react";

const USER = {
  name: "Melissa",
  initials: "ME",
  title: "All-In Subscriber",
  github: "@melissa-wastell",
  seat: "Other",
  toolkit: "Excel · Revit · Claude · ChatGPT",
  sticker: "💎",
};

function splitToolkit(toolkit) {
  return Array.isArray(toolkit)
    ? toolkit.map((tool) => String(tool))
    : String(toolkit ?? "")
        .split("·")
        .map((tool) => tool.trim())
        .filter(Boolean);
}

function Portrait({ url, initials, size }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-baseplate bg-muted font-heading font-semibold text-muted-foreground`}
    >
      {url && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`${initials} portrait`}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
}

function LanyardPass({ expanded }) {
  const you = USER;
  const [showBack, setShowBack] = useState(false);

  const github = (you.github || "").replace(/^@/, "");
  const portraitUrl = github ? `https://github.com/${github}.png` : null;
  const toolkit = splitToolkit(you.toolkit);

  return (
    <div className="flex h-full flex-col items-center gap-2">
      {/* Lanyard strap + hole punch */}
      <div className="flex flex-col items-center">
        <div className="h-4 w-3 bg-baseplate/70" />
        <div className="-mt-1 flex h-4 w-12 items-center justify-center rounded-t-lg border border-b-0 border-border bg-card">
          <span className="h-1.5 w-7 rounded-full border border-border bg-background" />
        </div>
      </div>

      {/* Pass */}
      <div
        className={`-mt-2 flex w-full flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm ${
          expanded ? "max-w-md" : "max-w-xs"
        }`}
      >
        <div className="flex items-center justify-between bg-baseplate px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
          <span>Weekend Pass</span>
          <span className="rounded bg-white/20 px-1.5 py-0.5 tracking-wider">
            SAT/SUN
          </span>
        </div>

        {showBack ? (
          <div className="flex flex-1 flex-col gap-2 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Toolkit
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {toolkit.map((tool) => (
                <li
                  key={tool}
                  className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs"
                >
                  {tool}
                </li>
              ))}
            </ul>
            <p className="mt-auto text-xs text-muted-foreground">
              {you.github} · Seat: {you.seat}
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 p-3 text-center">
            <Portrait
              url={portraitUrl}
              initials={you.initials}
              size={expanded ? "size-24 text-2xl" : "size-16 text-lg"}
            />
            <p
              className={`font-heading font-semibold tracking-tight ${
                expanded ? "text-3xl" : "text-xl"
              }`}
            >
              {you.name} <span aria-hidden="true">{you.sticker}</span>
            </p>
            <p className="text-sm text-muted-foreground">{you.title}</p>
            <p className="text-xs text-muted-foreground">{you.github}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowBack((v) => !v)}
          className="border-t border-border px-3 py-1 text-[11px] text-muted-foreground hover:bg-muted"
        >
          {showBack ? "Show front" : "Flip to toolkit"}
        </button>
      </div>
    </div>
  );
}

export const lanyardME = {
  id: "lanyard-ME",
  label: "Weekend-pass lanyard",
  cards: [
    {
      id: "lanyard",
      label: "Melissa",
      order: 91,
      span: 1,
      hint: "@melissa-wastell",
      Card: LanyardPass,
    },
  ],
};
