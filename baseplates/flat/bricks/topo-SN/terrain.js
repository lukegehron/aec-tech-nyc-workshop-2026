// Pure terrain helpers for the topography maker: a heightmap is a flat array
// of GW*GH numbers in 0..1. No React in here.

export const GW = 96;
export const GH = 60;
export const PW = 480; // render resolution (CSS scales it up)
export const PH = 300;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const rand = () => Math.random();

export const TOOLS = [
  { key: "raise", label: "Raise", hint: "build hills" },
  { key: "lower", label: "Lower", hint: "dig valleys" },
  { key: "smooth", label: "Smooth", hint: "soften slopes" },
  { key: "flatten", label: "Flatten", hint: "level to the height where you start" },
  { key: "noise", label: "Rough", hint: "add random bumps" },
  { key: "terrace", label: "Terrace", hint: "snap to stepped levels" },
];

export function generate(kind) {
  const h = new Array(GW * GH).fill(0.3);
  const ox = rand() * 100;
  const oy = rand() * 100;
  for (let y = 0; y < GH; y += 1) {
    for (let x = 0; x < GW; x += 1) {
      const wave =
        0.5 +
        0.22 * Math.sin((x + ox) * 0.11) * Math.cos((y + oy) * 0.15) +
        0.14 * Math.sin((x + ox) * 0.27 + (y + oy) * 0.19) +
        0.07 * Math.cos((x - y + ox) * 0.43);
      let v = wave;
      if (kind === "island") {
        const dx = (x - GW / 2) / (GW / 2);
        const dy = (y - GH / 2) / (GH / 2);
        v = wave * Math.max(0, 1 - Math.hypot(dx, dy) ** 1.6) + 0.02;
      } else if (kind === "flat") {
        v = 0.35;
      }
      h[y * GW + x] = clamp01(v);
    }
  }
  return h;
}

export const DEFAULT_HEIGHTS = generate("hills");

export function sample(h, gx, gy) {
  const x = Math.max(0, Math.min(GW - 1.001, gx));
  const y = Math.max(0, Math.min(GH - 1.001, gy));
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const i = y0 * GW + x0;
  const top = h[i] * (1 - fx) + h[i + 1] * fx;
  const bot = h[i + GW] * (1 - fx) + h[i + GW + 1] * fx;
  return top * (1 - fy) + bot * fy;
}

// Returns a new heightmap with one brush dab applied at grid position cx, cy.
export function applyBrush(h, tool, cx, cy, radius, strength, hardness, target) {
  const src = h;
  const out = h.slice();
  const s = strength / 5;
  const x0 = Math.max(0, Math.floor(cx - radius));
  const x1 = Math.min(GW - 1, Math.ceil(cx + radius));
  const y0 = Math.max(0, Math.floor(cy - radius));
  const y1 = Math.min(GH - 1, Math.ceil(cy + radius));
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const d = Math.hypot(x - cx, y - cy) / radius;
      if (d >= 1) continue;
      const w = d < hardness ? 1 : 1 - (d - hardness) / (1 - hardness + 1e-6);
      const i = y * GW + x;
      const v = src[i];
      let next = v;
      if (tool === "raise") next = v + 0.03 * s * w;
      else if (tool === "lower") next = v - 0.03 * s * w;
      else if (tool === "smooth") {
        const avg =
          (src[Math.max(0, y - 1) * GW + x] +
            src[Math.min(GH - 1, y + 1) * GW + x] +
            src[y * GW + Math.max(0, x - 1)] +
            src[y * GW + Math.min(GW - 1, x + 1)] +
            v) /
          5;
        next = v + (avg - v) * Math.min(1, 0.5 * s) * w;
      } else if (tool === "flatten") next = v + (target - v) * Math.min(1, 0.3 * s) * w;
      else if (tool === "noise") next = v + (rand() - 0.5) * 0.08 * s * w;
      else if (tool === "terrace") {
        const snapped = Math.round(v * 8) / 8;
        next = v + (snapped - v) * Math.min(1, 0.4 * s) * w;
      }
      out[i] = clamp01(next);
    }
  }
  return out;
}

function ramp(t, water) {
  if (t < water) {
    const k = t / Math.max(water, 0.001);
    return [30 + 40 * k, 90 + 70 * k, 160 + 50 * k];
  }
  const stops = [
    [0, [226, 210, 160]],
    [0.12, [120, 170, 90]],
    [0.5, [70, 125, 70]],
    [0.75, [140, 110, 80]],
    [0.92, [235, 235, 240]],
  ];
  const u = (t - water) / Math.max(1 - water, 0.001);
  for (let i = 0; i < stops.length - 1; i += 1) {
    const [a, ca] = stops[i];
    const [b, cb] = stops[i + 1];
    if (u <= b) {
      const f = (u - a) / (b - a);
      return ca.map((c, j) => c + (cb[j] - c) * f);
    }
  }
  return stops[stops.length - 1][1];
}

// Paints the heightmap into a canvas: colour ramp + hillshade + contour lines.
export function render(canvas, h, { water, contour, shade }) {
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(PW, PH);
  const sx = GW / PW;
  const sy = GH / PH;
  const level = (hh) => Math.floor(hh / contour);
  const heightAt = (px, py) => sample(h, px * sx, py * sy);
  for (let py = 0; py < PH; py += 1) {
    for (let px = 0; px < PW; px += 1) {
      const t = heightAt(px, py);
      const [r, g, b] = ramp(t, water);
      const dx = heightAt(px + 1, py) - heightAt(px - 1, py);
      const dy = heightAt(px, py + 1) - heightAt(px, py - 1);
      const light = t < water ? 0 : (-dx - dy) * 14 * shade;
      let k = 1 + Math.max(-0.5, Math.min(0.5, light));
      const l = level(t);
      if (contour > 0 && (l !== level(heightAt(px + 1, py)) || l !== level(heightAt(px, py + 1)))) {
        k *= t < water ? 0.9 : 0.62;
      }
      const o = (py * PW + px) * 4;
      img.data[o] = Math.min(255, r * k);
      img.data[o + 1] = Math.min(255, g * k);
      img.data[o + 2] = Math.min(255, b * k);
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}
