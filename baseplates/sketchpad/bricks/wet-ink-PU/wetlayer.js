// The WET layer — one layer for every ink, at full device resolution.
//
// Each pixel remembers which PASS (one press-drag-release) put ink there and
// how much. A pass may only add ink to empty paper or to its own ink, so:
//
//   • wet inks never mix — a pixel always holds exactly one pass's ink;
//   • a pass can't bleed across another — its threads are blocked at the
//     boundary and turn to run along it, which is what makes them intertwine;
//   • while the flow keeps going it fills whatever free paper it can reach.
//
// Two images come out of it:
//   ink     pigment passes, drawn with multiply (they darken the paper)
//   metal   silver/gold passes, drawn opaque on top. The amount of metal is
//           read as a height field, so pooled metal gets a soft highlight on
//           one rim and shade on the other — it reads as a liquid surface.
//           Silver is shaded as pearl: pale, soft, with a nacre shimmer.
//
// Pigment colour is written as pixels change; metal is shaded in `flush`
// (it needs neighbours). Only the changed rectangle is uploaded each frame.

import { INK_ORDER, INKS, METAL_RAMP, PEARL, isMetal } from "./inks";

const ABSORB = INK_ORDER.map((k) => INKS[k].map((c) => 1 - c / 255));
const RAMP = INK_ORDER.map((k) => METAL_RAMP[k] ?? null);
const METAL = INK_ORDER.map((_, i) => isMetal(i));
const IS_PEARL = INK_ORDER.map((k) => PEARL.has(k));
const FREE = 0.03; // below this a pixel counts as empty paper
const MAX_DENSITY = 6;

// Light from the upper left, a little in front.
const L = normalize([-0.55, -0.65, 0.55]);
const HALF = normalize([L[0], L[1], L[2] + 1]);

export function createWet(devW, devH, dpr) {
  const layer = () => {
    const canvas = document.createElement("canvas");
    canvas.width = devW;
    canvas.height = devH;
    const ctx = canvas.getContext("2d");
    return { canvas, ctx, img: ctx.createImageData(devW, devH), dirty: null };
  };
  const w = {
    W: devW,
    H: devH,
    dpr,
    ink: layer(),
    metal: layer(),
    dens: new Float32Array(devW * devH),
    owner: new Uint16Array(devW * devH),
    passInk: new Uint8Array(65536),
    pass: 0,
    wet: false,
    hasMetal: false,
  };
  clearWet(w);
  return w;
}

export function clearWet(w) {
  w.dens.fill(0);
  w.owner.fill(0);
  w.ink.img.data.fill(255); // white = no ink under multiply
  w.ink.ctx.putImageData(w.ink.img, 0, 0);
  w.metal.img.data.fill(0); // transparent = no metal
  w.metal.ctx.putImageData(w.metal.img, 0, 0);
  w.ink.dirty = w.metal.dirty = null;
  w.pass = 0;
  w.wet = false;
  w.hasMetal = false;
}

export function newPass(w, ink) {
  w.pass = w.pass >= 65535 ? 1 : w.pass + 1;
  w.passInk[w.pass] = ink;
  return w.pass;
}

// Would ink from `pass` be stopped at this css-px point?
export function blocked(w, x, y, pass) {
  const ix = Math.floor(x * w.dpr);
  const iy = Math.floor(y * w.dpr);
  if (ix < 0 || iy < 0 || ix >= w.W || iy >= w.H) return true;
  const i = iy * w.W + ix;
  return w.dens[i] > FREE && w.owner[i] !== pass;
}

// Lay ink in a disc (css px). `soft` = feathered blot; otherwise a flat core
// with a short soft edge. Pixels held by another pass are skipped.
export function stamp(w, x, y, r, amt, pass, soft) {
  if (amt <= 0) return;
  const cx = x * w.dpr;
  const cy = y * w.dpr;
  const rr = Math.max(0.6, r * w.dpr);
  const x0 = Math.max(0, Math.floor(cx - rr));
  const y0 = Math.max(0, Math.floor(cy - rr));
  const x1 = Math.min(w.W - 1, Math.ceil(cx + rr));
  const y1 = Math.min(w.H - 1, Math.ceil(cy + rr));
  if (x0 > x1 || y0 > y1) return;

  const inkIndex = w.passInk[pass];
  const metal = METAL[inkIndex];
  const edge = Math.max(1, rr * 0.35);
  const ab = ABSORB[inkIndex];
  const { dens, owner } = w;
  const d = w.ink.img.data;
  let touched = false;

  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) {
      const dist = Math.hypot(px + 0.5 - cx, py + 0.5 - cy);
      if (dist > rr) continue;
      const i = py * w.W + px;
      if (dens[i] > FREE && owner[i] !== pass) continue;
      const f = soft ? (1 - (dist / rr) ** 2) ** 2 : Math.min(1, (rr - dist) / edge);
      if (f <= 0) continue;
      owner[i] = pass;
      const v = Math.min(MAX_DENSITY, dens[i] + amt * f);
      dens[i] = v;
      touched = true;
      if (metal) continue; // shaded in flush()
      const t = 1 - Math.exp(-v);
      const j = i * 4;
      d[j] = 255 * (1 - ab[0] * t);
      d[j + 1] = 255 * (1 - ab[1] * t);
      d[j + 2] = 255 * (1 - ab[2] * t);
    }
  }

  if (!touched) return;
  w.wet = true;
  if (metal) w.hasMetal = true;
  const layer = metal ? w.metal : w.ink;
  layer.dirty = grow(layer.dirty, x0, y0, x1, y1);
}

// Upload this frame's changed pixels to the layer canvases.
export function flush(w) {
  if (w.ink.dirty) {
    const [x0, y0, x1, y1] = w.ink.dirty;
    w.ink.ctx.putImageData(w.ink.img, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    w.ink.dirty = null;
  }
  if (w.metal.dirty) {
    // Shading reads neighbours, so redo a 2px margin around the change.
    const [a, b, c, e] = w.metal.dirty;
    const x0 = Math.max(1, a - 2);
    const y0 = Math.max(1, b - 2);
    const x1 = Math.min(w.W - 2, c + 2);
    const y1 = Math.min(w.H - 2, e + 2);
    shadeMetal(w, x0, y0, x1, y1);
    w.metal.ctx.putImageData(w.metal.img, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    w.metal.dirty = null;
  }
}

// ── metal shading ────────────────────────────────────────────────────────────

function shadeMetal(w, x0, y0, x1, y1) {
  const { dens, owner, passInk, W } = w;
  const d = w.metal.img.data;
  // height of a neighbour, counting only metal of the same pass
  const h = (i, pass) => (owner[i] === pass ? Math.min(2.5, dens[i]) : 0);
  const slope = 1.6 / w.dpr; // css-px scale, so retina looks the same

  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) {
      const i = py * W + px;
      const j = i * 4;
      const pass = owner[i];
      const inkIndex = passInk[pass];
      const ramp = RAMP[inkIndex];
      const v = dens[i];
      if (!ramp || v <= FREE) {
        d[j + 3] = 0;
        continue;
      }

      const gx = (h(i + 1, pass) - h(i - 1, pass)) * slope;
      const gy = (h(i + W, pass) - h(i - W, pass)) * slope;
      const m = 1 / Math.sqrt(gx * gx + gy * gy + 1);
      const nx = -gx * m;
      const ny = -gy * m;
      const nz = m;
      const diffuse = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
      const pearl = IS_PEARL[inkIndex];
      // Liquid: smooth, broad highlight, no grain. Pearl: softer still.
      const half = Math.max(0, nx * HALF[0] + ny * HALF[1] + nz * HALF[2]);
      const spec = pearl ? half ** 18 * 0.45 : half ** 30 * 0.8;
      // Fake environment: tilted surfaces reflect darker / brighter bands.
      const env = 0.5 + 0.5 * Math.sin(ny * 4 + nx * 2.5);
      const t = pearl
        ? clamp01(0.35 + diffuse * 0.5 + env * 0.15)
        : clamp01(0.05 + diffuse * 0.8 + env * 0.15);
      // tone ramp, inlined
      const x = t * (ramp.length - 1);
      const k = Math.min(ramp.length - 2, Math.floor(x));
      const f = x - k;
      const lo = ramp[k];
      const hi = ramp[k + 1];
      const s = spec * 255;
      // Pearl iridescence: a faint pink → green → blue shimmer that follows
      // the tilt of the surface (nacre), strongest on the slopes.
      let ir = 0;
      let ig = 0;
      let ib = 0;
      if (pearl) {
        const phase = nx * 6 + ny * 4 + v * 0.8;
        const amp = 10 + 22 * (1 - nz);
        ir = Math.sin(phase) * amp;
        ig = Math.sin(phase + 2.1) * amp;
        ib = Math.sin(phase + 4.2) * amp;
      }
      d[j] = clamp255(lo[0] + (hi[0] - lo[0]) * f + s + ir);
      d[j + 1] = clamp255(lo[1] + (hi[1] - lo[1]) * f + s + ig);
      d[j + 2] = clamp255(lo[2] + (hi[2] - lo[2]) * f + s + ib);
      d[j + 3] = Math.min(255, v * 3 * 255); // opaque almost at once — it's liquid
    }
  }
}

// ── small helpers ────────────────────────────────────────────────────────────

function grow(r, x0, y0, x1, y1) {
  return r
    ? [Math.min(r[0], x0), Math.min(r[1], y0), Math.max(r[2], x1), Math.max(r[3], y1)]
    : [x0, y0, x1, y1];
}

function normalize([x, y, z]) {
  const m = Math.hypot(x, y, z) || 1;
  return [x / m, y / m, z / m];
}

function clamp255(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
