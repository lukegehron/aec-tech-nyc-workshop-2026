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
// Colour is written straight into an ImageData as pixels change, and only the
// changed rectangle is uploaded each frame.

import { INK_ORDER, INKS } from "./inks";

const ABSORB = INK_ORDER.map((k) => INKS[k].map((c) => 1 - c / 255));
const FREE = 0.03; // below this a pixel counts as empty paper
const MAX_DENSITY = 6;

export function createWet(devW, devH, dpr) {
  const canvas = document.createElement("canvas");
  canvas.width = devW;
  canvas.height = devH;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(devW, devH);
  const w = {
    W: devW,
    H: devH,
    dpr,
    canvas,
    ctx,
    img,
    dens: new Float32Array(devW * devH),
    owner: new Uint16Array(devW * devH),
    passInk: new Uint8Array(65536),
    pass: 0,
    dirty: null,
    wet: false,
  };
  clearWet(w);
  return w;
}

export function clearWet(w) {
  w.dens.fill(0);
  w.owner.fill(0);
  w.img.data.fill(255); // white = no ink under multiply
  w.ctx.putImageData(w.img, 0, 0);
  w.pass = 0;
  w.dirty = null;
  w.wet = false;
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

  const edge = Math.max(1, rr * 0.35);
  const ab = ABSORB[w.passInk[pass]];
  const { dens, owner } = w;
  const d = w.img.data;
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
      const t = 1 - Math.exp(-v);
      const j = i * 4;
      d[j] = 255 * (1 - ab[0] * t);
      d[j + 1] = 255 * (1 - ab[1] * t);
      d[j + 2] = 255 * (1 - ab[2] * t);
      touched = true;
    }
  }

  if (!touched) return;
  w.wet = true;
  const r0 = w.dirty;
  w.dirty = r0
    ? [Math.min(r0[0], x0), Math.min(r0[1], y0), Math.max(r0[2], x1), Math.max(r0[3], y1)]
    : [x0, y0, x1, y1];
}

// Upload this frame's changed pixels to the layer canvas.
export function flush(w) {
  if (!w.dirty) return;
  const [x0, y0, x1, y1] = w.dirty;
  w.ctx.putImageData(w.img, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
  w.dirty = null;
}
