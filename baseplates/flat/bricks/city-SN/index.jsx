"use client";

// City builder: an isometric grid of city blocks separated by streets. Pick a
// building type, click a block to build it, click again with Demolish (or the
// same type) to clear it. Stats update live. Saved per browser (useCardState).

import { useState } from "react";
import { useCardState } from "../../storage";

const TW = 72; // tile width
const TH = 36; // tile height
const TOP_PAD = 90;

const TYPES = {
  house: { label: "House", h: 14, color: "#f59e0b", fp: 0.5, people: 4, jobs: 0 },
  apartment: { label: "Apartments", h: 34, color: "#60a5fa", fp: 0.62, people: 40, jobs: 0 },
  office: { label: "Office tower", h: 70, color: "#94a3b8", fp: 0.55, people: 0, jobs: 120 },
  shop: { label: "Shops", h: 12, color: "#f472b6", fp: 0.68, people: 0, jobs: 20 },
  factory: { label: "Factory", h: 20, color: "#a8a29e", fp: 0.7, people: 0, jobs: 60 },
  school: { label: "School", h: 16, color: "#ef4444", fp: 0.66, people: 0, jobs: 25 },
  hospital: { label: "Hospital", h: 38, color: "#f8fafc", fp: 0.62, people: 0, jobs: 80 },
  park: { label: "Park", h: 0, color: "#4ade80", fp: 0.72, people: 0, jobs: 0 },
};
const ORDER = Object.keys(TYPES);

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(v * amount)));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `rgb(${r},${g},${b})`;
}

function pts(list) {
  return list.map((p) => p.join(",")).join(" ");
}

function diamond(cx, cy, hw, hh) {
  return [
    [cx, cy - hh],
    [cx + hw, cy],
    [cx, cy + hh],
    [cx - hw, cy],
  ];
}

function Building({ type, cx, cy }) {
  const t = TYPES[type];
  const hw = (TW / 2) * 0.78 * t.fp;
  const hh = (TH / 2) * 0.78 * t.fp;
  if (type === "park") {
    return (
      <g>
        <polygon points={pts(diamond(cx, cy, hw, hh))} fill={t.color} />
        {[[-8, -2], [6, 3], [0, -6]].map(([dx, dy], i) => (
          <g key={i}>
            <rect x={cx + dx - 1} y={cy + dy - 3} width={2} height={5} fill="#78350f" />
            <circle cx={cx + dx} cy={cy + dy - 6} r={4.5} fill="#15803d" />
          </g>
        ))}
      </g>
    );
  }
  const [top, right, bottom, left] = diamond(cx, cy, hw, hh);
  const up = ([x, y]) => [x, y - t.h];
  return (
    <g>
      <polygon points={pts([left, bottom, up(bottom), up(left)])} fill={shade(t.color, 0.78)} />
      <polygon points={pts([bottom, right, up(right), up(bottom)])} fill={shade(t.color, 0.6)} />
      <polygon points={pts([up(top), up(right), up(bottom), up(left)])} fill={t.color} />
      {type === "hospital" && (
        <g stroke="#dc2626" strokeWidth={2.5}>
          <line x1={cx - 4} x2={cx + 4} y1={cy - t.h} y2={cy - t.h} />
          <line x1={cx} x2={cx} y1={cy - t.h - 3} y2={cy - t.h + 3} />
        </g>
      )}
    </g>
  );
}

function Btn({ active, onClick, children, swatch }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
        active ? "bg-baseplate text-white" : "border"
      }`}
    >
      {swatch && (
        <span
          className="inline-block h-2.5 w-2.5 rounded-sm border border-black/30"
          style={{ background: swatch }}
        />
      )}
      {children}
    </button>
  );
}

function CityCard({ expanded }) {
  const [size, setSize] = useCardState("city-size", 6);
  const [blocks, setBlocks] = useCardState("city-blocks", {});
  const [tool, setTool] = useCardState("city-tool", "house");
  const [hover, setHover] = useState(null);

  const originX = (size * TW) / 2;
  const width = size * TW;
  const height = size * TH + TOP_PAD + 24;
  const center = (r, c) => ({
    x: originX + ((c - r) * TW) / 2,
    y: TOP_PAD + ((c + r) * TH) / 2 + TH / 2,
  });

  // Draw back to front so nearer buildings cover farther ones.
  const cells = [];
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) cells.push([r, c]);
  }
  cells.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));

  const placed = Object.entries(blocks).filter(([key]) => {
    const [r, c] = key.split(",").map(Number);
    return r < size && c < size;
  });
  const counts = {};
  let people = 0;
  let jobs = 0;
  placed.forEach(([, type]) => {
    counts[type] = (counts[type] ?? 0) + 1;
    people += TYPES[type].people;
    jobs += TYPES[type].jobs;
  });
  const parks = counts.park ?? 0;

  function onBlock(r, c) {
    const key = `${r},${c}`;
    setBlocks((current) => {
      const next = { ...current };
      if (tool === "demolish" || current[key] === tool) delete next[key];
      else next[key] = tool;
      return next;
    });
  }

  function fillRandom() {
    const next = {};
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        if (Math.random() < 0.8) {
          next[`${r},${c}`] = ORDER[Math.floor(Math.random() * ORDER.length)];
        }
      }
    }
    setBlocks(next);
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {ORDER.map((key) => (
          <Btn key={key} active={tool === key} swatch={TYPES[key].color} onClick={() => setTool(key)}>
            {TYPES[key].label}
          </Btn>
        ))}
        <Btn active={tool === "demolish"} onClick={() => setTool("demolish")}>
          Demolish
        </Btn>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Isometric city grid. Click a block to build."
        className={`w-full rounded-md border bg-sky-100 ${expanded ? "max-h-[70vh]" : ""}`}
      >
        {cells.map(([r, c]) => {
          const { x, y } = center(r, c);
          const type = blocks[`${r},${c}`];
          const isHover = hover === `${r},${c}`;
          return (
            <g
              key={`${r},${c}`}
              onClick={() => onBlock(r, c)}
              onMouseEnter={() => setHover(`${r},${c}`)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              <polygon points={pts(diamond(x, y, TW / 2, TH / 2))} fill="#475569" />
              <polygon
                points={pts(diamond(x, y, (TW / 2) * 0.86, (TH / 2) * 0.86))}
                fill={isHover ? "#fde68a" : "#cbd5e1"}
              />
              {type && <Building type={type} cx={x} cy={y} />}
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-muted-foreground">Grid</span>
        {[4, 6, 8].map((n) => (
          <Btn key={n} active={size === n} onClick={() => setSize(n)}>
            {n}×{n}
          </Btn>
        ))}
        <Btn onClick={fillRandom}>Random city</Btn>
        <Btn onClick={() => setBlocks({})}>Clear</Btn>
        <span className="ml-auto text-muted-foreground tabular-nums">
          {placed.length}/{size * size} blocks · {people} residents · {jobs} jobs
          {" · "}
          {parks} park{parks === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

export const citySN = {
  id: "city-SN",
  label: "City builder",
  cards: [
    {
      id: "city-builder",
      label: "City builder",
      order: 94,
      span: 2,
      hint: "pick a type · click a block",
      Card: CityCard,
    },
  ],
};
