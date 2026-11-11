"use client";

// A plain, understated employee ID card. Almost boring. That's the joke.

import { useState } from "react";

const PERSON = {
  name: "Zarina",
  title: "BIM Power User",
  github: "zarinagran1",
  seat: "Engineer",
  toolkit: "Excel · Revit",
  sticker: "🏢",
  initials: "ZA",
};

function Portrait({ size }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };

  if (failed) {
    return (
      <div
        style={style}
        className="flex shrink-0 items-center justify-center rounded-sm border border-border bg-muted font-heading text-lg font-semibold text-muted-foreground"
      >
        {PERSON.initials}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://github.com/${PERSON.github}.png`}
      alt={`${PERSON.name} (${PERSON.initials})`}
      style={style}
      className="shrink-0 rounded-sm border border-border object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function Field({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-xs text-foreground">{value}</span>
    </div>
  );
}

function SpyIdCard({ expanded }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative flex w-full max-w-xs flex-col gap-3 rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm">
        <span className="absolute right-3 top-3 text-base" aria-hidden>
          {PERSON.sticker}
        </span>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Employee ID
        </p>
        <div className="flex items-center gap-3">
          <Portrait size={expanded ? 96 : 64} />
          <div className="flex min-w-0 flex-col">
            <p
              className={`font-heading font-semibold tracking-tight ${
                expanded ? "text-2xl" : "text-lg"
              }`}
            >
              {PERSON.name}
            </p>
            <p className="text-xs font-medium tracking-widest text-muted-foreground [font-variant:small-caps]">
              {PERSON.title}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
          <Field label="Seat" value={PERSON.seat} />
          <Field label="Toolkit" value={PERSON.toolkit} />
        </div>
        <p className="text-[10px] text-muted-foreground">@{PERSON.github}</p>
      </div>
    </div>
  );
}

export const spyIdZA = {
  id: "spy-id-ZA",
  label: "Spy ID",
  cards: [
    {
      id: "spy-id",
      label: "Zarina",
      order: 90,
      span: 1,
      hint: "@zarinagran1",
      Card: SpyIdCard,
    },
  ],
};
