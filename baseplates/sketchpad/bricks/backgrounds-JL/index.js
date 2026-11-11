// Backgrounds — four "brushes" that fill the whole canvas with a drawing
// surface instead of making a mark: a square grid, a dot grid, an isometric
// grid and tinted paper. Pick one, click the canvas once, then switch to any
// other brush and sketch over it.
//
// They use the baseplate's controls the way every brush does:
//   colour  the colour of the grid / dots / paper tint
//   size    the spacing of the grid (and the grain of the paper)
//
// A background REPLACES whatever is on the canvas, so lay it down first.
// Clear still resets to plain white.

// The baseplate calls `stroke` every frame the pointer is down. A background
// should be laid once per click, not repainted every frame, so each brush
// remembers the last frame it ran on: a gap of more than one frame means the
// pointer was lifted and this is a new click.
function oncePerClick(paint) {
  let lastFrame = -10;
  return (p, ctx) => {
    const isNewClick = p.frameCount - lastFrame > 1;
    lastFrame = p.frameCount;
    if (isNewClick) paint(p, ctx);
  };
}

function rgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Size 1–24 → spacing 12–104 px.
function spacingFor(weight) {
  return 8 + weight * 4;
}

export const gridBackground = {
  id: "grid-bg-JL",
  label: "Grid",
  order: 50,
  hint: "Background: click once to lay a square grid (size = spacing), then sketch over it",

  stroke: oncePerClick((p, { color, weight }) => {
    const [r, g, b] = rgb(color);
    const s = spacingFor(weight);
    p.background(255);
    for (let i = 0, x = 0; x <= p.width; i++, x += s) {
      // Every fifth line is a heavier major line, like engineering paper.
      p.stroke(r, g, b, i % 5 === 0 ? 120 : 50);
      p.strokeWeight(i % 5 === 0 ? 1.5 : 1);
      p.line(x, 0, x, p.height);
    }
    for (let i = 0, y = 0; y <= p.height; i++, y += s) {
      p.stroke(r, g, b, i % 5 === 0 ? 120 : 50);
      p.strokeWeight(i % 5 === 0 ? 1.5 : 1);
      p.line(0, y, p.width, y);
    }
  }),
};

export const dotsBackground = {
  id: "dots-bg-JL",
  label: "Dot grid",
  order: 60,
  hint: "Background: click once to lay a dot grid (size = spacing), then sketch over it",

  stroke: oncePerClick((p, { color, weight }) => {
    const [r, g, b] = rgb(color);
    const s = spacingFor(weight);
    p.background(255);
    p.noStroke();
    p.fill(r, g, b, 140);
    for (let x = s / 2; x <= p.width; x += s) {
      for (let y = s / 2; y <= p.height; y += s) {
        p.circle(x, y, 3);
      }
    }
  }),
};

// A triangular grid of three line families — rising 30°, falling 30° and
// vertical — at equal spacing, so every line passes through the intersections.
export const isometricBackground = {
  id: "iso-bg-JL",
  label: "Isometric",
  order: 70,
  hint: "Background: click once to lay a 30° isometric grid (size = spacing), then sketch over it",

  stroke: oncePerClick((p, { color, weight }) => {
    const [r, g, b] = rgb(color);
    const s = spacingFor(weight);
    const t = Math.tan(Math.PI / 6);
    const rise = p.width * t;
    p.background(255);
    p.stroke(r, g, b, 60);
    p.strokeWeight(1);
    for (let c = -Math.ceil(rise / s) * s; c <= p.height; c += s) {
      p.line(0, c, p.width, c + rise);
    }
    for (let c = 0; c <= p.height + rise; c += s) {
      p.line(0, c, p.width, c - rise);
    }
    for (let x = 0; x <= p.width; x += s / (2 * t)) {
      p.line(x, 0, x, p.height);
    }
  }),
};

// A pale wash of the selected colour with a speckled grain, like trace or
// kraft paper. Pick a light-ish colour for a subtle tint; size sets the grain.
export const paperBackground = {
  id: "paper-bg-JL",
  label: "Paper",
  order: 80,
  hint: "Background: click once to lay tinted paper in the selected colour (size = grain), then sketch over it",

  stroke: oncePerClick((p, { color, weight }) => {
    const [r, g, b] = rgb(color);
    // 82% white, 18% colour: tinted, but light enough to draw on.
    const mix = (c) => Math.round(255 * 0.82 + c * 0.18);
    p.background(mix(r), mix(g), mix(b));
    p.noStroke();
    const grain = Math.max(1, weight / 6);
    const specks = Math.round((p.width * p.height) / 120);
    for (let i = 0; i < specks; i++) {
      p.fill(r * 0.6, g * 0.6, b * 0.6, p.random(8, 28));
      p.circle(p.random(p.width), p.random(p.height), p.random(0.5, 1.5) * grain);
    }
  }),
};
