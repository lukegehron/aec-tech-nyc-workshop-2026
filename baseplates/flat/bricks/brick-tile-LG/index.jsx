"use client";

// ─── BRICK TILE ──────────────────────────────────────────────────────────────
// A 2×4 LEGO brick seen from above. Title printed on the top, name printed on
// the side, toolkit as the colour. React + Tailwind only — no libraries.

import { useState } from "react";

const USER = {
  name: "Luke Gehron",
  initials: "LG",
  title: "Agent Operator",
  github: "@pwluke",
  seat: "Developer",
  toolkit: "Revit · Excel · Rhino · Grasshopper · ChatGPT · v0",
  sticker: "🤖",
};

// Toolkit → colour. Each tool gets a LEGO-ish colour; `ink` is the readable
// text colour on top of it. Unknown tools fall back to the spare palette.
const TOOL_COLOURS = {
  revit: { bg: "#0055BF", ink: "#FFFFFF" },
  excel: { bg: "#237841", ink: "#FFFFFF" },
  rhino: { bg: "#05131D", ink: "#FFFFFF" },
  grasshopper: { bg: "#A5CA18", ink: "#1B2A34" },
  chatgpt: { bg: "#069D9F", ink: "#FFFFFF" },
  v0: { bg: "#F2CD37", ink: "#1B2A34" },
};

const SPARE_COLOURS = [
  { bg: "#C91A09", ink: "#FFFFFF" },
  { bg: "#FE8A18", ink: "#1B2A34" },
  { bg: "#A83D8F", ink: "#FFFFFF" },
  { bg: "#F785B1", ink: "#1B2A34" },
];

function colourFor(tool, index) {
  const key = tool.toLowerCase().replace(/[^a-z0-9]/g, "");
  return TOOL_COLOURS[key] ?? SPARE_COLOURS[index % SPARE_COLOURS.length];
}

// The toolkit may arrive as a " · " separated string (the person shape) or,
// defensively, as an array.
function parseToolkit(toolkit) {
  const list = Array.isArray(toolkit)
    ? toolkit.map((tool) => String(tool))
    : String(toolkit ?? "").split("·");
  return list.map((tool) => tool.trim()).filter(Boolean);
}

const ROWS = 2;
const COLS = 4;

// One round stud: a lit dome with a hard little shadow underneath.
function Stud({ base, children }) {
  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-full"
      style={{
        background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${base} 65%, white), ${base} 65%)`,
        boxShadow: `0 3px 0 color-mix(in srgb, ${base} 60%, black), inset 0 -3px 0 rgb(0 0 0 / 0.14)`,
      }}
    >
      {children}
    </div>
  );
}

function BrickTile({ expanded }) {
  const you = USER;
  const [portraitFailed, setPortraitFailed] = useState(false);

  const github = (you.github || "").replace(/^@/, "");
  const portraitUrl = github ? `https://github.com/${github}.png` : null;
  const showPortrait = portraitUrl && !portraitFailed;

  const toolkit = parseToolkit(you.toolkit);
  const body = toolkit.length ? colourFor(toolkit[0], 0).bg : SPARE_COLOURS[0].bg;
  const dark = `color-mix(in srgb, ${body} 70%, black)`;
  const darker = `color-mix(in srgb, ${body} 50%, black)`;
  const light = `color-mix(in srgb, ${body} 75%, white)`;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-1">
      <div
        className="w-full"
        style={{ maxWidth: expanded ? 640 : 420 }}
        role="img"
        aria-label={`${you.name}, ${you.title} — a 2 by 4 brick`}
      >
        {/* Top face: title plate + studs */}
        <div
          className="rounded-t-2xl rounded-b-md p-3"
          style={{
            background: body,
            boxShadow: `inset 0 3px 0 ${light}, inset 0 0 0 2px ${dark}`,
          }}
        >
          {/* Title, printed on the top */}
          <div
            className={`mb-3 flex items-center justify-center gap-2 rounded-lg bg-white px-2 py-1 text-center font-heading font-black uppercase leading-tight tracking-widest text-neutral-900 ${
              expanded ? "text-lg" : "text-xs"
            }`}
            style={{ boxShadow: `0 2px 0 ${darker}` }}
          >
            <span aria-hidden="true">{you.sticker}</span>
            <span className="truncate">{you.title}</span>
            <span aria-hidden="true">{you.sticker}</span>
          </div>

          {/* 2×4 studs. The first stud wears the portrait. */}
          <div
            className="grid gap-3 px-1 pb-1"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: ROWS * COLS }, (_, i) => (
              <Stud key={i} base={body}>
                {i === 0 ? (
                  <div
                    className="flex size-full items-center justify-center font-heading text-sm font-black text-white"
                    style={{ background: darker }}
                  >
                    {showPortrait ? (
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
                ) : null}
              </Stud>
            ))}
          </div>
        </div>

        {/* Side face: name, printed on the side */}
        <div
          className="rounded-b-2xl px-3 py-2 text-center"
          style={{ background: dark, boxShadow: `inset 0 -4px 0 ${darker}` }}
        >
          <p
            className={`truncate font-heading font-black uppercase tracking-[0.2em] text-white ${
              expanded ? "text-3xl" : "text-lg"
            }`}
            style={{ textShadow: `0 2px 0 ${darker}` }}
          >
            {you.name}
          </p>
          {expanded ? (
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              {you.seat} · {you.github}
            </p>
          ) : null}
        </div>
      </div>

      {/* Toolkit: one little tile per tool, each in its own colour */}
      <ul className="flex flex-wrap justify-center gap-1.5">
        {toolkit.map((tool, i) => {
          const { bg, ink } = colourFor(tool, i);
          return (
            <li
              key={`${tool}-${i}`}
              className="rounded-md px-2 py-0.5 text-[11px] font-bold"
              style={{
                background: bg,
                color: ink,
                boxShadow: `0 2px 0 color-mix(in srgb, ${bg} 60%, black)`,
              }}
            >
              {tool}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const brickTileLG = {
  // Folder and id end in the owner's initials.
  id: "brick-tile-LG",
  label: USER.name,
  cards: [
    {
      // Ids INSIDE the brick stay plain — they belong to the baseplate's
      // contract, not to the owner.
      id: "brick-tile",
      label: USER.name,
      order: 30,
      span: 2,
      hint: USER.github,
      Card: BrickTile,
    },
  ],
};
