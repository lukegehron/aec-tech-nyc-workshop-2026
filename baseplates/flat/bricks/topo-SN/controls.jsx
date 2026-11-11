"use client";

// Small UI controls for the topography maker.

export function Btn({ active, onClick, children, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-md border px-2 py-1 text-xs transition-colors ${
        active ? "border-baseplate bg-baseplate text-white" : "bg-background hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, format }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24"
      />
      <span className="w-10 tabular-nums text-foreground">{format ? format(value) : value}</span>
    </label>
  );
}
