"use client";

// Small UI controls for the asset menu.

export function Btn({ active, onClick, children, swatch }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors ${
        active ? "border-baseplate bg-baseplate text-white" : "bg-background hover:bg-muted"
      }`}
    >
      {swatch && <span className="size-2.5 rounded-sm border" style={{ background: swatch }} />}
      {children}
    </button>
  );
}

export function Slider({ label, value, min, max, onChange, suffix = "" }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24"
      />
      <span className="w-12 tabular-nums text-foreground">
        {value}
        {suffix}
      </span>
    </label>
  );
}
