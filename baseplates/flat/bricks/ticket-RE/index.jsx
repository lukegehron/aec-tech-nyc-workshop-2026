"use client";

// ─── TICKET STUB ─────────────────────────────────────────────────────────────
// A perforated admit-one ticket. name = label, title = event, seat = row,
// toolkit = venue. Portrait from GitHub, falling back to initials.

import { useState } from "react";

const USER = {
  name: "Reza",
  initials: "RE",
  title: "Agent Operator",
  github: "@rh-6",
  seat: "Other",
  toolkit: "Excel · Rhino · Revit · JavaScript · Python · Claude",
  sticker: "🤖",
};

function Portrait({ size }) {
  const [failed, setFailed] = useState(false);
  const handle = USER.github.replace(/^@/, "");
  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-800 bg-neutral-900 font-heading font-semibold text-neutral-500"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {failed ? (
        USER.initials
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://github.com/${handle}.png`}
          alt={USER.name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest text-neutral-600">
        {label}
      </p>
      <p className="text-sm font-medium leading-snug text-neutral-500 break-words">{children}</p>
    </div>
  );
}

function TicketCard({ expanded }) {
  return (
    <div className="flex h-full rotate-180 items-center justify-center">
      <div
        className={`flex w-full items-stretch rounded-lg border-2 border-neutral-700 bg-black ${
          expanded ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        {/* Main stub */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Admit One
          </p>
          <div className="flex items-center gap-3">
            <Portrait size={expanded ? 72 : 52} />
            <div className="min-w-0">
              <p
                className={`font-heading font-semibold tracking-tight text-neutral-500 ${
                  expanded ? "text-3xl" : "text-xl"
                }`}
              >
                {USER.name}
              </p>
              <p className="text-xs text-neutral-600">{USER.github}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Event">{USER.title}</Field>
            <Field label="Row">{USER.seat}</Field>
          </div>
          <Field label="Venue">{USER.toolkit}</Field>
        </div>

        {/* Tear line */}
        <div
          aria-hidden
          className="relative w-0 self-stretch border-l-2 border-dashed border-neutral-700"
        >
          <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full border-2 border-neutral-700 bg-background" />
          <span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full border-2 border-neutral-700 bg-background" />
        </div>

        {/* Tear-off stub */}
        <div className="flex w-20 shrink-0 flex-col items-center justify-between gap-2 p-3">
          <span className="text-3xl" role="img" aria-label="sticker">
            {USER.sticker}
          </span>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-600"
            style={{ writingMode: "vertical-rl" }}
          >
            Admit One · {USER.initials}
          </p>
        </div>
      </div>
    </div>
  );
}

export const ticketRE = {
  id: "ticket-RE",
  label: "Ticket",
  cards: [
    {
      id: "ticket-card",
      label: "Reza",
      order: 90,
      span: 2,
      hint: "@rh-6",
      Card: TicketCard,
    },
  ],
};
