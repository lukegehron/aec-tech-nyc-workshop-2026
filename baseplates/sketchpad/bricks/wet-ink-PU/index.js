// Wet ink — ink dropped onto damp, warm-toned paper.
//
// The contract only hands us `stroke(p, ctx)` once per frame while the pointer
// is down, so everything lives in that call.
//
// LAYERS
//   dry   an offscreen copy of the canvas: paper, dried ink, other brushes.
//   wet   wetlayer.js — ONE layer shared by every ink. Each press-drag-release
//         is a PASS; a pass owns the pixels it inks and nothing else may ink
//         them while they're wet. So wet inks never mix: a new pass winds its
//         threads round the old ones and fills the free paper it can reach.
// Every frame the canvas is redrawn as dry × wet (multiply).
//
// "Dry canvas" (a button theme.js adds next to Clear) bakes wet into dry and
// frees every pixel, so the next pass lays a new layer over the dried ink.
// Using another brush, or Clear, also counts as drying.
//
// INK keeps flowing while the button is held: mostly thin threads that wander
// the paper fibres, with the odd soft spot. Holding still feeds the pool and
// sends out more threads.
//
// FLOW — the slider's 1–24 value sets how much ink the brush lets go.
//
// METAL INKS — pearl-silver and gold flow just like the pigment inks (same
// wet layer, no mixing, they wind round other passes, same long bleed) but
// stay opaque, with slightly fuller threads. wetlayer.js shades them as a lit
// liquid surface; compose() adds a soft glow.

import { INK_ORDER, inkFor, isMetal } from "./inks";
import { isBlankCanvas, layPaper } from "./paper";
import { installWetInkTheme } from "./theme";
import { blocked, clearWet, createWet, flush, newPass, stamp } from "./wetlayer";

const HINT = "Wet ink — new ink swirls through wet ink. Dry canvas to start a new layer.";
const MAX_PARTICLES = 900;
const TURNS = [0.5, -0.5, 1.1, -1.1, 1.7, -1.7]; // how a blocked thread looks for a way round

// How a pass behaves. Metal flows like ink; it just carries more (opaque) and
// its threads are a little fuller.
const PIGMENT = {
  core: 1,
  load: (flow) => 0.05 + flow * 0.3,
  spot: 0.12,
  kick: [0.8, 0.9],
  life: [60, 110],
  threadR: [0.35, 0.6],
  drag: 0.94,
  threadAmt: (flow) => 0.16 + flow * 0.34,
  bead: 0.7,
};
const METAL = {
  ...PIGMENT,
  load: (flow) => 0.3 + flow * 0.5,
  threadR: [0.6, 0.7],
  threadAmt: (flow) => 0.4 + flow * 0.4,
  bead: 1,
};

// Module state — one canvas.
let state = null; // { main, dpr, dry, last, wet }
let particles = [];
let pass = 0;
let lastFrame = -10;
let still = 0;
let kind = PIGMENT;

export const wetInkBrush = {
  id: "wet-ink-PU",
  label: "Wet ink",
  order: 60,
  hint: HINT,

  stroke(p, { color, weight, from, to }) {
    const g = p.drawingContext;
    const ink = INK_ORDER.indexOf(inkFor(color));
    const newStroke = p.frameCount - lastFrame > 2;
    lastFrame = p.frameCount;

    if (newStroke) {
      particles = [];
      still = 0;
      from = to; // pmouse is stale from the last stroke
      begin(p, g);
      pass = newPass(state.wet, ink);
      kind = isMetal(ink) ? METAL : PIGMENT;
    }

    const w = state.wet;
    const flow = Math.min(1, Math.max(0, (weight - 1) / 23)); // 0…1
    const size = 5 + flow * 5;
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    still = dist < 0.8 ? still + 1 : 0;

    // ── Core along the path (skips any pixel another pass holds) ───────────
    const steps = Math.max(1, Math.ceil(dist / (size * 0.5)));
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      const load = kind.load(flow) / (1 + dist * 0.04); // fast = less ink
      const r = size * kind.core * (0.9 + Math.random() * 0.3);
      stamp(w, x, y, r, load, pass, false);
      spawn(x, y, to.x - from.x, to.y - from.y, size, 1 + Math.round(flow * 2));
    }

    // ── Holding still: the pool swells a little and keeps sending threads ──
    if (still > 0) {
      const pool = size * (1 + Math.min(still, 120) * 0.008);
      stamp(w, to.x, to.y, pool, 0.01 + flow * 0.04, pass, true);
      spawn(to.x, to.y, 0, 0, size, 2 + Math.round(flow * 3));
    }

    // ── Bleed ──────────────────────────────────────────────────────────────
    const z = p.frameCount * 0.006;
    const next = [];
    for (const q of particles) {
      const a = p.noise(q.x * 0.015, q.y * 0.015, z) * Math.PI * 4;
      q.vx = (q.vx + Math.cos(a) * q.pull) * q.drag;
      q.vy = (q.vy + Math.sin(a) * q.pull) * q.drag;

      // Another pass in the way? Turn along its edge rather than cross it.
      if (blocked(w, q.x + q.vx, q.y + q.vy, pass) && !steer(w, q)) {
        q.life = 0;
      } else {
        const px = q.x;
        const py = q.y;
        q.x += q.vx;
        q.y += q.vy;
        q.life--;
        const fade = q.life / q.max;
        if (q.spot) {
          q.r *= 0.975;
          stamp(w, q.x, q.y, q.r, (0.015 + flow * 0.04) * fade * (kind === METAL ? 5 : 1), pass, true);
        } else {
          thread(w, px, py, q.x, q.y, q.r * (0.45 + 0.55 * fade), kind.threadAmt(flow) * fade);
        }
      }

      if (q.life > 0) next.push(q);
      // Pigment settles where the water stops: a darker grain at the tip.
      else stamp(w, q.x, q.y, kind.bead, 0.5 + flow * 0.4, pass, true);
    }
    particles = next;

    flush(w);
    compose();
  },
};

installWetInkTheme(HINT, { onDry: dryCanvas, onDownload: downloadJpeg, onActive: watchPaper });

// ── paper on by default ──────────────────────────────────────────────────────

// While Wet ink is selected, a white canvas never stays white: lay the paper
// the moment the brush is picked, and again right after Clear. A light check
// (two pixels, a few times a second) that stops when another brush is chosen.
let paperTimer = null;
function watchPaper() {
  ensurePaper();
  if (paperTimer) return;
  paperTimer = setInterval(() => {
    if (!document.documentElement.hasAttribute("data-wet-ink")) {
      clearInterval(paperTimer);
      paperTimer = null;
      return;
    }
    ensurePaper();
  }, 250);
}

function ensurePaper() {
  const canvas = state?.main?.isConnected ? state.main : findSketchCanvas();
  const g = canvas?.getContext("2d");
  if (!g || !isBlankCanvas(g)) return;
  layPaper(g);
  if (state?.main === canvas) dryCanvas(); // Clear: drop any wet ink too
}

// The sketchpad's live p5 canvas (p5 tags its canvases "p5Canvas"; Strict
// Mode can leave a hidden duplicate, so skip hidden ones).
function findSketchCanvas() {
  return [...document.querySelectorAll("canvas.p5Canvas")].find(
    (c) => c.style.display !== "none" && c.offsetParent !== null
  );
}

// ── drying & layers ──────────────────────────────────────────────────────────

// Save exactly what's on the canvas — paper, dried and wet ink — as a .jpeg.
// Before the first wet-ink stroke we don't hold the canvas yet, so find the
// sketchpad's visible one.
export function downloadJpeg() {
  const canvas =
    state?.main ??
    findSketchCanvas();
  if (!canvas) return;
  const stampNow = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wet-ink-${stampNow}.jpeg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    "image/jpeg",
    0.92
  );
}

// The canvas already shows dry × wet, so drying = "the canvas is the new dry".
// Another brush and Clear count as drying too.
export function dryCanvas() {
  if (!state) return;
  copyInto(state.dry, state.main);
  clearWet(state.wet);
  particles = [];
  copyInto(state.last, state.main);
}

function begin(p, g) {
  const main = g.canvas;
  if (!state || state.main !== main || state.dry.width !== main.width || state.dry.height !== main.height) {
    const dpr = main.width / p.width;
    state = {
      main,
      dpr,
      dry: makeCanvas(main.width, main.height),
      last: makeCanvas(main.width, main.height),
      wet: createWet(main.width, main.height, dpr),
    };
    if (isBlankCanvas(g)) layPaper(g);
    copyInto(state.dry, main);
    copyInto(state.last, main);
    return;
  }
  if (isBlankCanvas(g)) {
    layPaper(g); // Clear was pressed
    dryCanvas();
  } else if (!matchesLastFrame(g)) {
    dryCanvas(); // another brush drew in the meantime — that dries the wet ink
  }
}

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function copyInto(target, source) {
  const c = target.getContext("2d");
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = "copy";
  c.drawImage(source, 0, 0);
  c.restore();
}

// Redraw the canvas: dry × wet ink, then glowing metal.
// `last` keeps a copy so we can tell if another brush draws in between.
function compose() {
  const c = state.main.getContext("2d");
  const w = state.wet;
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = "copy";
  c.drawImage(state.dry, 0, 0);
  if (w.wet) {
    c.globalCompositeOperation = "multiply";
    c.drawImage(w.ink.canvas, 0, 0);
  }
  if (w.hasMetal) {
    // Glow: a blurred, brightened copy of the metal, screened onto the paper.
    if (typeof c.filter === "string") {
      c.globalCompositeOperation = "screen";
      c.globalAlpha = 0.55;
      c.filter = `blur(${6 * state.dpr}px) brightness(1.15)`;
      c.drawImage(w.metal.canvas, 0, 0);
      c.filter = "none";
      c.globalAlpha = 1;
    }
    c.globalCompositeOperation = "source-over";
    c.drawImage(w.metal.canvas, 0, 0);
  }
  c.restore();
  copyInto(state.last, state.main);
}

// Is the canvas still exactly what we last drew? (If not, something else drew.)
function matchesLastFrame(g) {
  const { width, height } = state.main;
  const a = state.last.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, width, height).data;
  const b = g.getImageData(0, 0, width, height).data;
  let off = 0;
  let seen = 0;
  for (let i = 0; i < a.length; i += 4 * 7) {
    seen++;
    if (Math.abs(a[i] - b[i]) > 3 || Math.abs(a[i + 1] - b[i + 1]) > 3 || Math.abs(a[i + 2] - b[i + 2]) > 3) off++;
  }
  return off <= seen * 0.001;
}

// ── particles ────────────────────────────────────────────────────────────────

function spawn(x, y, dx, dy, size, n) {
  for (let i = 0; i < n && particles.length < MAX_PARTICLES; i++) {
    const spot = Math.random() < kind.spot;
    const a = Math.random() * Math.PI * 2;
    const kick = spot ? 0.4 + Math.random() * 0.6 : kind.kick[0] + Math.random() * kind.kick[1];
    const max = spot ? 20 + Math.random() * 25 : kind.life[0] + Math.random() * kind.life[1];
    particles.push({
      x: x + (Math.random() - 0.5) * size * 0.8,
      y: y + (Math.random() - 0.5) * size * 0.8,
      vx: Math.cos(a) * kick + dx * 0.04,
      vy: Math.sin(a) * kick + dy * 0.04,
      r: spot ? size * (0.4 + Math.random() * 0.4) : kind.threadR[0] + Math.random() * kind.threadR[1],
      pull: spot ? 0.15 : 0.22,
      drag: spot ? 0.9 : kind.drag, // pigment threads keep momentum and run long
      side: Math.random() < 0.5 ? 1 : -1,
      life: max,
      max,
      spot,
    });
  }
}

// Rotate a blocked particle's heading until it finds free paper (or its own
// ink). Each thread prefers one side, so it hugs the other pass's edge.
function steer(w, q) {
  const speed = Math.hypot(q.vx, q.vy) || 1;
  const heading = Math.atan2(q.vy, q.vx);
  for (const turn of TURNS) {
    const h = heading + turn * q.side;
    const vx = Math.cos(h) * speed;
    const vy = Math.sin(h) * speed;
    if (!blocked(w, q.x + vx, q.y + vy, pass)) {
      q.vx = vx;
      q.vy = vy;
      return true;
    }
  }
  return false;
}

// A thin line: closely spaced tiny stamps from (ax, ay) to (bx, by).
function thread(w, ax, ay, bx, by, r, amt) {
  const len = Math.hypot(bx - ax, by - ay);
  const n = Math.max(1, Math.ceil(len / 0.5));
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    stamp(w, ax + (bx - ax) * t, ay + (by - ay) * t, r, amt, pass, true);
  }
}
