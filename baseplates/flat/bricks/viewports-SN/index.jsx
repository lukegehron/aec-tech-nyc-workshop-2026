"use client";

// Viewports: the same site plan rendered side by side in different art styles
// (blueprint, watercolor, pixel, ink noir, neon, pencil sketch). It reads the
// layout saved by the Asset menu card (storage key "assets-SN-items"); when
// that is empty it draws a built-in sample. Click a viewport to focus it.

import { useState } from "react";
import { readAllCardState, useCardState } from "../../storage";
import { STYLES, StyleDefs, StyledItem } from "./styles";

const W = 800;
const H = 480;
const LAYER = { road: 0, building: 1, car: 2, tree: 3 };

function sampleScene() {
  const out = [];
  let n = 0;
  const add = (type, x, y, rot = 0, extra = {}) => out.push({ id: `s${n++}`, type, x, y, rot, ...extra });
  for (let i = 0; i < 12; i += 1) add("road", 70 + i * 60, 240);
  for (let i = 0; i < 5; i += 1) add("road", 400, 40 + i * 60, 90);
  for (let c = 0; c < 6; c += 1) {
    add("building", 90 + c * 60, 150, 0, { w: 40, d: 40 + (c % 3) * 8 });
    add("building", 90 + c * 60, 330, 0, { w: 44, d: 36 });
    add("building", 560 + (c % 3) * 60, 90 + Math.floor(c / 3) * 60, 0, { w: 38, d: 38 });
  }
  [[150, 225], [300, 255], [470, 225], [610, 255], [405, 120], [395, 370]].forEach(([x, y], i) =>
    add("car", x, y, i > 3 ? 90 : 0)
  );
  for (let i = 0; i < 14; i += 1) add("tree", 60 + i * 52, i % 2 ? 420 : 40, 0, { r: 9 + (i % 3) * 2 });
  return out;
}
const SAMPLE = sampleScene();

function Viewport({ s, items, focused, onClick }) {
  const sorted = [...items].sort((a, b) => LAYER[a.type] - LAYER[b.type]);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={focused}
      className={`group relative block overflow-hidden rounded-md border text-left ${
        focused ? "ring-2 ring-baseplate" : ""
      }`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={`${s.label} viewport`}>
        <rect width={W} height={H} fill={s.bg} />
        {s.grid && (
          <g stroke={s.grid} strokeWidth={1}>
            {Array.from({ length: 19 }, (_, i) => (
              <line key={`v${i}`} x1={i * 44} x2={i * 44} y1={0} y2={H} />
            ))}
            {Array.from({ length: 12 }, (_, i) => (
              <line key={`h${i}`} y1={i * 44} y2={i * 44} x1={0} x2={W} />
            ))}
          </g>
        )}
        <g filter={s.filter ? `url(#${s.filter})` : undefined} opacity={s.opacity ?? 1}>
          {sorted.map((it) => (
            <StyledItem key={it.id} item={it} s={s} />
          ))}
        </g>
      </svg>
      <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
        {s.label}
      </span>
    </button>
  );
}

function ViewportsCard({ expanded }) {
  const [focus, setFocus] = useCardState("viewports-SN-focus", null);
  const [items, setItems] = useState(() => {
    const saved = readAllCardState()["assets-SN-items"];
    return Array.isArray(saved) && saved.length ? saved : null;
  });

  function reload() {
    const saved = readAllCardState()["assets-SN-items"];
    setItems(Array.isArray(saved) && saved.length ? saved : null);
  }

  const scene = items ?? SAMPLE;
  const shown = focus ? STYLES.filter((s) => s.key === focus) : STYLES;

  return (
    <div className="flex h-full flex-col gap-2">
      <StyleDefs />
      <div
        className={`grid gap-2 ${
          focus ? "grid-cols-1" : expanded ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2"
        }`}
      >
        {shown.map((s) => (
          <Viewport
            key={s.key}
            s={s}
            items={scene}
            focused={focus === s.key}
            onClick={() => setFocus(focus === s.key ? null : s.key)}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <button type="button" onClick={reload} className="rounded-md border bg-background px-2 py-1 hover:bg-muted">
          Reload from Asset menu
        </button>
        {focus && (
          <button type="button" onClick={() => setFocus(null)} className="rounded-md border bg-background px-2 py-1 hover:bg-muted">
            Show all
          </button>
        )}
        <span className="ml-auto">
          {items ? `${items.length} assets from your site plan` : "sample scene — place assets in the Asset menu"}
        </span>
      </div>
    </div>
  );
}

export const viewportsSN = {
  id: "viewports-SN",
  label: "Art-style viewports",
  cards: [
    {
      id: "art-viewports",
      label: "Art-style viewports",
      order: 96,
      span: 3,
      hint: "one plan · six styles · click to focus",
      Card: ViewportsCard,
    },
  ],
};
