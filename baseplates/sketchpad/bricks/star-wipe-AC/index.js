// Star wipe: clears the sketch with a hard-edged scene transition like the
// ones in the original Star Wars — a straight edge sweeping across, a slanted
// edge, a clock hand sweeping round, or an iris closing in.
//
// It is a brush only because that's how a brick reaches the p5 instance:
// press on the pad and the wipe runs. It animates with requestAnimationFrame
// on p5's own canvas context, so it keeps going after the pointer is released.

const DURATION_MS = 900; // linear, like an optical printer — no easing
const NEW_PRESS_GAP_MS = 150; // no frames for this long = pointer was released

// Each wipe paints white over the region swept so far (t goes 0 → 1).
// Coordinates are logical canvas pixels; p5 already applies pixel density.
const WIPES = {
  horizontal(ctx, w, h, t) {
    ctx.beginPath();
    ctx.rect(0, 0, w * t, h);
    ctx.fill();
  },

  diagonal(ctx, w, h, t) {
    const slant = h * 0.6;
    const edge = -slant + t * (w + 2 * slant);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(edge + slant, 0);
    ctx.lineTo(edge - slant, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  },

  // Clockwise from 12 o'clock.
  clock(ctx, w, h, t) {
    const radius = Math.hypot(w, h);
    const start = -Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2);
    ctx.arc(w / 2, h / 2, radius, start, start + Math.PI * 2 * t);
    ctx.closePath();
    ctx.fill();
  },

  // The old picture shrinks to a circle, then closes to nothing.
  iris(ctx, w, h, t) {
    const radius = (Math.hypot(w, h) / 2) * (1 - t);
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.arc(w / 2, h / 2, Math.max(radius, 0), 0, Math.PI * 2);
    ctx.fill("evenodd");
  },
};

const NAMES = Object.keys(WIPES);

let running = false;
let lastFrameAt = -Infinity;

function runWipe(p) {
  const ctx = p.drawingContext;
  const w = p.width;
  const h = p.height;
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const flip = name !== "clock" && name !== "iris" && Math.random() < 0.5;
  const startedAt = performance.now();
  running = true;

  const frame = (now) => {
    const t = Math.min((now - startedAt) / DURATION_MS, 1);

    ctx.save();
    ctx.fillStyle = "#ffffff";
    if (flip) {
      // Mirror to wipe right-to-left.
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    WIPES[name](ctx, w, h, t);
    ctx.restore();

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      p.background(255); // no antialiased fringe left behind
      running = false;
    }
  };
  requestAnimationFrame(frame);
}

export const starWipeBrush = {
  id: "star-wipe-AC",
  label: "Star wipe",
  order: 60,
  hint: "Click the pad to clear the sketch with a Star Wars-style scene wipe",

  stroke(p) {
    const now = performance.now();
    const isNewPress = now - lastFrameAt > NEW_PRESS_GAP_MS;
    lastFrameAt = now;
    if (isNewPress && !running) runWipe(p);
  },
};
