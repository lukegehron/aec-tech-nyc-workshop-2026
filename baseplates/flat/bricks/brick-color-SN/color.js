// Helpers for the brick colour study. Pure functions, no React.

// Small seeded RNG so a wall is repeatable until you press Shuffle.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toHex = (v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");

export function rgbToHex([r, g, b]) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hslToHex(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return rgbToHex([f(0) * 255, f(8) * 255, f(4) * 255]);
}

// Shifts a colour lighter/darker by `t` in -1..1 (small values = subtle).
export function tint(hex, t) {
  return rgbToHex(hexToRgb(hex).map((c) => (t >= 0 ? c + (255 - c) * t : c * (1 + t))));
}

// Perceived brightness 0..255, used to pick readable label colours.
export function luma(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Splits `count` bricks between tones by their amounts (largest remainder),
// so a tone set to 30% gets 30% of the bricks, not "about" 30%.
export function allocate(tones, count) {
  const total = tones.reduce((s, t) => s + t.amount, 0);
  if (!total || !tones.length) return tones.map(() => 0);
  const raw = tones.map((t) => (t.amount / total) * count);
  const base = raw.map(Math.floor);
  let left = count - base.reduce((s, n) => s + n, 0);
  const order = raw
    .map((r, i) => [r - Math.floor(r), i])
    .sort((a, b) => b[0] - a[0]);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left -= 1) base[order[k][1]] += 1;
  return base;
}

// A shuffled list of tone indexes, one per brick, honouring the amounts.
export function assign(tones, count, seed) {
  const counts = allocate(tones, count);
  const list = [];
  counts.forEach((n, i) => {
    for (let k = 0; k < n; k += 1) list.push(i);
  });
  const rand = rng(seed);
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

const NAMES = ["Brick red", "Terracotta", "Buff", "Charcoal", "Sand", "Rust", "Umber", "Cream", "Slate", "Clay"];

let counter = 0;
export function newTone(rand = Math.random, hex) {
  counter += 1;
  const id = `t${Date.now().toString(36)}${counter}`;
  // brick-ish hues (reds → oranges → buffs) with varied lightness
  const color = hex ?? hslToHex(rand() * 45, 0.25 + rand() * 0.45, 0.28 + rand() * 0.38);
  return { id, name: NAMES[Math.floor(rand() * NAMES.length)], color, amount: Math.round(10 + rand() * 40) };
}

export const DEFAULT_TONES = [
  { id: "d1", name: "Brick red", color: "#9c4a3a", amount: 45 },
  { id: "d2", name: "Terracotta", color: "#c2693f", amount: 25 },
  { id: "d3", name: "Buff", color: "#d2b48c", amount: 20 },
  { id: "d4", name: "Charcoal", color: "#4a4540", amount: 10 },
];
