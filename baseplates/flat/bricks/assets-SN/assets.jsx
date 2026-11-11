"use client";

// Asset definitions, item factory and SVG drawing for the asset menu.

export const W = 800;
export const H = 480;

export const ASSETS = {
  building: { label: "Buildings", color: "#94a3b8", gap: 52 },
  road: { label: "Roads", color: "#475569", gap: 62 },
  car: { label: "Cars", color: "#ef4444", gap: 22 },
  tree: { label: "Trees", color: "#16a34a", gap: 26 },
};
export const ASSET_KEYS = Object.keys(ASSETS);

const CAR_COLORS = ["#ef4444", "#3b82f6", "#facc15", "#f8fafc", "#1e293b", "#22c55e"];
const BUILDING_COLORS = ["#94a3b8", "#a8a29e", "#cbd5e1", "#fbbf24", "#93c5fd"];

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const rand = (a, b) => a + Math.random() * (b - a);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// `uniform` = fixed size (placing / grids); otherwise sizes vary (scatter).
export function makeItem(type, x, y, rot, uniform) {
  const item = { id: newId(), type, x: Math.round(x), y: Math.round(y), rot };
  if (type === "car") item.color = pick(CAR_COLORS);
  if (type === "building") {
    item.color = pick(BUILDING_COLORS);
    item.w = uniform ? 40 : Math.round(rand(30, 56));
    item.d = uniform ? 40 : Math.round(rand(30, 56));
  }
  if (type === "tree") item.r = uniform ? 10 : Math.round(rand(7, 13));
  return item;
}

// Roads under everything, then buildings, cars, trees on top.
export const LAYER = { road: 0, building: 1, car: 2, tree: 3 };

export function Asset({ item }) {
  const { type, x, y, rot } = item;
  const t = `translate(${x} ${y}) rotate(${rot})`;
  if (type === "tree") {
    return (
      <g transform={t}>
        <circle r={item.r} fill="#15803d" />
        <circle r={item.r * 0.6} cx={-1} cy={-1} fill="#4ade80" />
      </g>
    );
  }
  if (type === "car") {
    return (
      <g transform={t}>
        <rect x={-9} y={-4.5} width={18} height={9} rx={2.5} fill={item.color} stroke="#0f172a" strokeWidth={0.7} />
        <rect x={-3} y={-3.4} width={7} height={6.8} rx={1.5} fill="#bae6fd" opacity={0.85} />
      </g>
    );
  }
  if (type === "road") {
    return (
      <g transform={t}>
        <rect x={-30} y={-8} width={60} height={16} fill="#475569" />
        <line x1={-26} x2={26} y1={0} y2={0} stroke="#fde68a" strokeWidth={1.5} strokeDasharray="6 5" />
      </g>
    );
  }
  return (
    <g transform={t}>
      <rect x={-item.w / 2} y={-item.d / 2} width={item.w} height={item.d} fill={item.color} stroke="#334155" strokeWidth={1} />
      <rect x={-item.w / 2 + 5} y={-item.d / 2 + 5} width={item.w - 10} height={item.d - 10} fill="#e2e8f0" opacity={0.7} />
    </g>
  );
}
