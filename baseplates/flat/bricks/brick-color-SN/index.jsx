"use client";

// Brick colour study: mix brick tones for a wall. Every tone has a colour and
// an amount; the wall gets exactly that share of each. Shuffle re-lays the
// bricks, Randomize tones invents a new palette (and 🎲 on a row re-rolls just
// that colour), Randomize amounts re-rolls the mix. Saved per browser.

import { useState } from "react";
import { useCardState } from "../../storage";
import { DEFAULT_TONES, allocate, assign, hslToHex, newTone } from "./color";
import { ToneRow } from "./ToneRow";
import { Wall } from "./Wall";

const MAX_TONES = 8;
const btn = "rounded-md border bg-background px-2.5 py-1 text-xs hover:bg-muted";

function Slider({ label, value, min, max, onChange, suffix = "" }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {label}
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-24" />
      <span className="w-10 tabular-nums text-foreground">
        {value}
        {suffix}
      </span>
    </label>
  );
}

function BrickColorCard({ expanded }) {
  const [tones, setTones] = useCardState("brick-color-SN-tones", DEFAULT_TONES);
  const [seed, setSeed] = useCardState("brick-color-SN-seed", 1);
  const [cols, setCols] = useCardState("brick-color-SN-cols", 12);
  const [rows, setRows] = useCardState("brick-color-SN-rows", 14);
  const [shift, setShift] = useCardState("brick-color-SN-shift", 0.06);
  const [bond, setBond] = useCardState("brick-color-SN-bond", "running");
  const [mortar, setMortar] = useCardState("brick-color-SN-mortar", "#d9d5cc");
  const [copied, setCopied] = useState(false);

  const count = cols * rows;
  const assignment = assign(tones, count, seed);
  const counts = allocate(tones, count);
  const total = tones.reduce((s, t) => s + t.amount, 0) || 1;

  const patch = (id, change) => setTones((cur) => cur.map((t) => (t.id === id ? { ...t, ...change } : t)));
  const shuffle = () => setSeed(Math.floor(Math.random() * 1e9));

  function randomizeTones() {
    const hue = Math.random() * 40;
    setTones((cur) => cur.map((t) => ({ ...t, color: hslToHex((hue + Math.random() * 25) % 50, 0.2 + Math.random() * 0.5, 0.25 + Math.random() * 0.45) })));
    shuffle();
  }

  function randomizeAmounts() {
    setTones((cur) => cur.map((t) => ({ ...t, amount: Math.round(Math.random() * 100) })));
  }

  async function copyPalette() {
    const text = tones.map((t, i) => `${t.name} ${t.color} ${((t.amount / total) * 100).toFixed(0)}% (${counts[i]} bricks)`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (permissions / insecure context) — nothing to do.
    }
  }

  return (
    <div className={`grid gap-3 ${expanded ? "lg:grid-cols-2" : "md:grid-cols-2"}`}>
      <div className="flex flex-col gap-2">
        <Wall cols={cols} rows={rows} bond={bond} mortar={mortar} shift={shift} seed={seed} tones={tones} assignment={assignment} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Slider label="Columns" value={cols} min={4} max={24} onChange={setCols} />
          <Slider label="Courses" value={rows} min={4} max={30} onChange={setRows} />
          <Slider label="Variation" value={Math.round(shift * 100)} min={0} max={20} onChange={(v) => setShift(v / 100)} suffix="%" />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button type="button" onClick={() => setBond(bond === "running" ? "stack" : "running")} className={btn}>
            Bond: {bond === "running" ? "running" : "stack"}
          </button>
          <label className="flex items-center gap-1.5 text-muted-foreground">
            Mortar
            <input type="color" value={mortar} onChange={(e) => setMortar(e.target.value)} className="size-6 cursor-pointer rounded border p-0" />
          </label>
          <span className="ml-auto text-muted-foreground tabular-nums">{count} bricks</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={shuffle} className={btn}>🔀 Shuffle bricks</button>
          <button type="button" onClick={randomizeTones} className={btn}>🎲 Randomize tones</button>
          <button type="button" onClick={randomizeAmounts} className={btn}>🎲 Randomize amounts</button>
        </div>
        <div className="flex max-h-[26rem] flex-col gap-1.5 overflow-y-auto pr-1">
          {tones.map((t, i) => (
            <ToneRow
              key={t.id}
              tone={t}
              share={(t.amount / total) * 100}
              bricks={counts[i]}
              onChange={(change) => patch(t.id, change)}
              onRemove={() => setTones((cur) => cur.filter((x) => x.id !== t.id))}
              canRemove={tones.length > 1}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={tones.length >= MAX_TONES} onClick={() => setTones((cur) => [...cur, newTone()])} className={`${btn} disabled:opacity-40`}>
            + Add tone
          </button>
          <button type="button" onClick={() => setTones(DEFAULT_TONES)} className={btn}>Reset</button>
          <button type="button" onClick={copyPalette} className={btn}>{copied ? "Copied ✓" : "Copy palette"}</button>
        </div>
      </div>
    </div>
  );
}

export const brickColorSN = {
  id: "brick-color-SN",
  label: "Brick color study",
  cards: [
    {
      id: "brick-color-study",
      label: "Brick color study",
      order: 99,
      span: 3,
      hint: "mix tones · set amounts · randomize",
      Card: BrickColorCard,
    },
  ],
};
