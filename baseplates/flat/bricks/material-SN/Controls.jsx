"use client";

// Shape / lighting / material / tiling controls for the material viewer.

import { LIGHTS, SHAPES } from "./scene";

export const DEFAULT_TILING = { repeatX: 2, repeatY: 2, offsetX: 0, offsetY: 0, rotation: 0, wrap: "repeat" };
export const DEFAULT_MATERIAL = { tint: "#ffffff", roughness: 1, metalness: 0, normal: 1, bump: 0.6 };
export const DEFAULT_LIGHT = { preset: "studio", angle: 0, power: 1 };

const chip = (on) =>
  `rounded-md border px-2 py-1 text-xs transition-colors ${on ? "border-baseplate bg-baseplate text-white" : "bg-background hover:bg-muted"}`;

function Row({ label, value, min, max, step = 0.05, onChange, suffix = "" }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="w-20 shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="min-w-0 flex-1" />
      <span className="w-12 text-right tabular-nums text-foreground">
        {Number.isInteger(value) ? value : value.toFixed(2)}
        {suffix}
      </span>
    </label>
  );
}

function Group({ title, children }) {
  return (
    <fieldset className="flex flex-col gap-1.5 rounded-md border p-2">
      <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</legend>
      {children}
    </fieldset>
  );
}

export function Controls({ shape, setShape, light, setLight, m, setM, tiling, setTiling, linked, setLinked, spin, setSpin }) {
  const T = (patch) => setTiling({ ...tiling, ...patch });
  return (
    <div className="flex flex-col gap-2">
      <Group title="Shape / surface">
        <div className="flex flex-wrap gap-1">
          {Object.entries(SHAPES).map(([k, label]) => (
            <button key={k} type="button" onClick={() => setShape(k)} className={chip(shape === k)}>
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input type="checkbox" checked={spin} onChange={(e) => setSpin(e.target.checked)} /> Auto-rotate (drag to orbit)
        </label>
      </Group>

      <Group title="Lighting">
        <div className="flex flex-wrap gap-1">
          {Object.entries(LIGHTS).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setLight({ ...light, preset: k })} className={chip(light.preset === k)}>
              {l.label}
            </button>
          ))}
        </div>
        <Row label="Light angle" value={light.angle} min={0} max={360} step={5} suffix="°" onChange={(v) => setLight({ ...light, angle: v })} />
        <Row label="Brightness" value={light.power} min={0.2} max={2.5} onChange={(v) => setLight({ ...light, power: v })} />
      </Group>

      <Group title="Material">
        <Row label="Roughness" value={m.roughness} min={0} max={1} onChange={(v) => setM({ ...m, roughness: v })} />
        <Row label="Metalness" value={m.metalness} min={0} max={1} onChange={(v) => setM({ ...m, metalness: v })} />
        <Row label="Normal str." value={m.normal} min={0} max={3} onChange={(v) => setM({ ...m, normal: v })} />
        <Row label="Bump" value={m.bump} min={0} max={3} onChange={(v) => setM({ ...m, bump: v })} />
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-20">Tint</span>
          <input type="color" value={m.tint} onChange={(e) => setM({ ...m, tint: e.target.value })} className="size-6 cursor-pointer rounded border p-0" />
        </label>
      </Group>

      <Group title="Tiling">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input type="checkbox" checked={linked} onChange={(e) => setLinked(e.target.checked)} /> Link X and Y
        </label>
        <Row label="Repeat X" value={tiling.repeatX} min={0.25} max={12} step={0.25} onChange={(v) => T(linked ? { repeatX: v, repeatY: v } : { repeatX: v })} suffix="×" />
        <Row label="Repeat Y" value={tiling.repeatY} min={0.25} max={12} step={0.25} onChange={(v) => T(linked ? { repeatX: v, repeatY: v } : { repeatY: v })} suffix="×" />
        <Row label="Offset X" value={tiling.offsetX} min={0} max={1} onChange={(v) => T({ offsetX: v })} />
        <Row label="Offset Y" value={tiling.offsetY} min={0} max={1} onChange={(v) => T({ offsetY: v })} />
        <Row label="Rotation" value={tiling.rotation} min={0} max={360} step={5} suffix="°" onChange={(v) => T({ rotation: v })} />
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <span className="w-20">Edges</span>
          {[["repeat", "Repeat"], ["mirror", "Mirror"], ["clamp", "Clamp"]].map(([k, label]) => (
            <button key={k} type="button" onClick={() => T({ wrap: k })} className={chip(tiling.wrap === k)}>
              {label}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setTiling(DEFAULT_TILING)} className={`${chip(false)} self-start`}>
          Reset tiling
        </button>
      </Group>
    </div>
  );
}
