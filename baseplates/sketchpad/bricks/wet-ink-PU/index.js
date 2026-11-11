// Wet ink — ink dropped onto damp, warm-toned paper.
//
// The contract only hands us `stroke(p, ctx)` once per frame while the pointer
// is down, so everything lives in that call:
//
//   1. PAPER. The first stroke on a fresh (pure white) canvas multiplies a warm
//      paper texture over it — base tone, grain, a few fibres. Multiply keeps
//      any marks already on the canvas. Hit Clear to get white back; the next
//      wet-ink stroke re-lays the paper.
//   2. INK. Each frame deposits a dense core along the pointer path and spawns
//      pigment particles. The particles persist between frames and wander
//      along a noise "fibre" field, fading as they bleed outward — so the ink
//      keeps flowing while the button stays down, even if you hold still
//      (holding still pools and blooms). Release and the flow freezes.
//
// Inks are fixed to sumi black, plum and emerald (see inks.js). While this
// brush is active, theme.js warms up the page, thins the type, trims the
// swatches to those three inks and renames the size slider "Flow".
//
// FLOW — the slider's 1–24 value is not a size here. It sets how much ink the
// brush lets go: higher flow = heavier core, more pigment particles, a faster
// bloom when you hold still, and a slightly wider, wetter mark.

import { INKS, inkFor } from "./inks";
import { installWetInkTheme } from "./theme";

const HINT = "Ink on wet paper — keeps bleeding while held. Flow sets how much ink.";

const PAPER = [238, 224, 198]; // warm cream
const MAX_PARTICLES = 700;

// Module state — one wet stroke at a time.
let particles = [];
let lastFrame = -10;
let still = 0; // frames the pointer has been (nearly) stationary

export const wetInkBrush = {
  id: "wet-ink-PU",
  label: "Wet ink",
  order: 60,
  hint: HINT,

  stroke(p, { color, weight, from, to }) {
    const g = p.drawingContext;
    const newStroke = p.frameCount - lastFrame > 2;
    lastFrame = p.frameCount;

    if (newStroke) {
      particles = [];
      still = 0;
      from = to; // pmouse is stale from the last stroke
      if (isBlankCanvas(g)) layPaper(p, g);
    }

    const ink = INKS[inkFor(color)];
    const flow = Math.min(1, Math.max(0, (weight - 1) / 23)); // 0…1
    const size = 5 + flow * 5;
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    still = dist < 0.8 ? still + 1 : 0;

    g.save();
    g.globalCompositeOperation = "multiply";

    // ── Core deposit along the path ────────────────────────────────────────
    const steps = Math.max(1, Math.ceil(dist / (size * 0.5)));
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      // Fast strokes carry less ink.
      const load = (0.05 + flow * 0.3) / (1 + dist * 0.04);
      blob(g, x, y, size * (0.9 + Math.random() * 0.3), ink, load);
      spawn(p, x, y, to.x - from.x, to.y - from.y, size, 1 + Math.round(flow * 3));
    }

    // ── Holding still: the drop keeps feeding the paper and blooms ─────────
    if (still > 0) {
      const bloom = size * (1 + Math.min(still, 240) * (0.015 + flow * 0.04));
      blob(g, to.x, to.y, bloom, ink, 0.008 + flow * 0.035);
      spawn(p, to.x, to.y, 0, 0, size, 1 + Math.round(flow * 4));
    }

    // ── Advance the wet pigment ────────────────────────────────────────────
    const z = p.frameCount * 0.006;
    const next = [];
    for (const q of particles) {
      const a = p.noise(q.x * 0.012, q.y * 0.012, z) * Math.PI * 4;
      q.vx = (q.vx + Math.cos(a) * q.pull) * 0.9;
      q.vy = (q.vy + Math.sin(a) * q.pull) * 0.9;
      const px = q.x;
      const py = q.y;
      q.x += q.vx;
      q.y += q.vy;
      q.life--;
      q.r *= q.tendril ? 0.992 : 0.982;

      const fade = q.life / q.max;
      if (q.tendril) {
        g.strokeStyle = rgba(ink, (0.08 + flow * 0.16) * fade);
        g.lineWidth = Math.max(0.4, q.r * 0.5);
        g.lineCap = "round";
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(q.x, q.y);
        g.stroke();
      } else {
        blob(g, q.x, q.y, q.r, ink, (0.02 + flow * 0.06) * fade);
      }

      if (q.life > 0 && q.r > 0.3) {
        next.push(q);
      } else {
        // Pigment settles where the water stops: a darker grain at the edge.
        blob(g, q.x, q.y, Math.max(0.6, q.r * 0.6), ink, 0.12);
      }
    }
    particles = next;

    g.restore();
  },
};

installWetInkTheme(HINT);

// ── helpers ──────────────────────────────────────────────────────────────────

function spawn(p, x, y, dx, dy, size, n) {
  for (let i = 0; i < n && particles.length < MAX_PARTICLES; i++) {
    const tendril = Math.random() < 0.18;
    const a = Math.random() * Math.PI * 2;
    const kick = 0.4 + Math.random() * 0.8;
    const max = tendril ? 50 + Math.random() * 70 : 25 + Math.random() * 35;
    particles.push({
      x: x + (Math.random() - 0.5) * size,
      y: y + (Math.random() - 0.5) * size,
      vx: Math.cos(a) * kick + dx * 0.05,
      vy: Math.sin(a) * kick + dy * 0.05,
      r: size * (tendril ? 0.35 : 0.45 + Math.random() * 0.4),
      pull: tendril ? 0.35 : 0.18,
      life: max,
      max,
      tendril,
    });
  }
}

// A soft, slightly irregular blot.
function blob(g, x, y, r, ink, alpha) {
  if (alpha <= 0.002 || r <= 0) return;
  g.fillStyle = rgba(ink, alpha);
  g.beginPath();
  g.ellipse(x, y, r, r * (0.85 + Math.random() * 0.3), Math.random() * Math.PI, 0, Math.PI * 2);
  g.fill();
}

function rgba([r, g, b], a) {
  return `rgba(${r},${g},${b},${a})`;
}

// Fresh canvas = pure white in two opposite corners (paper never is).
function isBlankCanvas(g) {
  const { width, height } = g.canvas;
  const white = (x, y) => {
    const d = g.getImageData(x, y, 1, 1).data;
    return d[0] === 255 && d[1] === 255 && d[2] === 255;
  };
  return white(0, 0) && white(width - 1, height - 1);
}

function layPaper(p, g) {
  const { width, height } = g.canvas; // device pixels

  // Grain: per-pixel tone variation plus low-frequency mottling.
  const tex = document.createElement("canvas");
  tex.width = width;
  tex.height = height;
  const tg = tex.getContext("2d");
  const img = tg.createImageData(width, height);
  const d = img.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const mottle = p.noise(x * 0.004, y * 0.004) * 22 - 11;
      const grain = (Math.random() - 0.5) * 14;
      const v = mottle + grain;
      const i = (y * width + x) * 4;
      d[i] = PAPER[0] + v;
      d[i + 1] = PAPER[1] + v;
      d[i + 2] = PAPER[2] + v * 1.1;
      d[i + 3] = 255;
    }
  }
  tg.putImageData(img, 0, 0);

  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = "multiply";
  g.drawImage(tex, 0, 0);

  // A few faint fibres.
  g.lineCap = "round";
  for (let i = 0; i < 260; i++) {
    let x = Math.random() * width;
    let y = Math.random() * height;
    let a = Math.random() * Math.PI * 2;
    g.strokeStyle = `rgba(150,120,85,${0.05 + Math.random() * 0.08})`;
    g.lineWidth = 0.5 + Math.random();
    g.beginPath();
    g.moveTo(x, y);
    const len = 6 + Math.random() * 18;
    for (let s = 0; s < len; s++) {
      a += (Math.random() - 0.5) * 0.5;
      x += Math.cos(a) * 1.5;
      y += Math.sin(a) * 1.5;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  g.restore();
}
