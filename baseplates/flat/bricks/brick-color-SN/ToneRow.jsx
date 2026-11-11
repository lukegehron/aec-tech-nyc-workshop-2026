"use client";

// One tone in the mix: colour swatch, name, amount slider and a per-tone
// randomize / remove. `share` is its actual percentage of the whole mix.

import { hslToHex, luma } from "./color";

export function ToneRow({ tone, share, bricks, onChange, onRemove, canRemove }) {
  function randomizeTone() {
    onChange({ color: hslToHex(Math.random() * 45, 0.25 + Math.random() * 0.45, 0.28 + Math.random() * 0.38) });
  }
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border p-2 text-xs">
      <input
        type="color"
        aria-label={`${tone.name} colour`}
        value={tone.color}
        onChange={(e) => onChange({ color: e.target.value })}
        className="size-8 shrink-0 cursor-pointer rounded border bg-transparent p-0"
      />
      <input
        type="text"
        aria-label="Tone name"
        value={tone.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className="w-28 rounded border bg-background px-1.5 py-1"
      />
      <label className="flex min-w-40 flex-1 items-center gap-1.5 text-muted-foreground">
        Amount
        <input
          type="range"
          min={0}
          max={100}
          value={tone.amount}
          onChange={(e) => onChange({ amount: Number(e.target.value) })}
          className="flex-1"
        />
        <span className="w-8 tabular-nums text-foreground">{tone.amount}</span>
      </label>
      <span
        className="rounded px-1.5 py-0.5 tabular-nums"
        style={{ background: tone.color, color: luma(tone.color) > 140 ? "#111" : "#fff" }}
        title="Share of the wall"
      >
        {share.toFixed(0)}% · {bricks}
      </span>
      <button type="button" onClick={randomizeTone} title="Random colour for this tone" className="rounded border bg-background px-1.5 py-1 hover:bg-muted">
        🎲
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label={`Remove ${tone.name}`}
        className="rounded border bg-background px-1.5 py-1 hover:bg-muted disabled:opacity-40"
      >
        ✕
      </button>
    </div>
  );
}
