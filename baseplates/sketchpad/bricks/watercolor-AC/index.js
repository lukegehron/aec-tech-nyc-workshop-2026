// Watercolor: soft, translucent washes that pool and darken where they overlap.
// Each frame lays a few wobbly low-alpha blobs along the stroke, plus a faint
// darker rim, so strokes bleed and layer like wet paint on paper.

const BLOBS_PER_STEP = 3;
const POINTS = 14;

function hexToRgb(hex) {
  let h = String(hex).replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// One irregular blob: a circle whose radius wobbles per vertex.
function blob(p, cx, cy, radius, wobble) {
  p.beginShape();
  for (let i = 0; i < POINTS; i++) {
    const a = (i / POINTS) * p.TWO_PI;
    const r = radius * (1 + p.random(-wobble, wobble));
    p.vertex(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  p.endShape(p.CLOSE);
}

export const watercolorBrush = {
  id: "watercolor-AC",
  label: "Watercolor",
  order: 50,
  hint: "Translucent wet washes — go over an area again to deepen it",

  stroke(p, { color, weight, from, to }) {
    const [r, g, b] = hexToRgb(color);
    const radius = weight * 2.5;
    const distance = p.dist(from.x, from.y, to.x, to.y);
    const step = Math.max(2, radius / 3);
    const steps = Math.max(1, Math.ceil(distance / step));

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const x = p.lerp(from.x, to.x, t);
      const y = p.lerp(from.y, to.y, t);

      // Soft wash body: several faint blobs, slightly offset and varied in size.
      p.noStroke();
      for (let i = 0; i < BLOBS_PER_STEP; i++) {
        p.fill(r, g, b, 6);
        blob(
          p,
          x + p.random(-radius * 0.25, radius * 0.25),
          y + p.random(-radius * 0.25, radius * 0.25),
          radius * p.random(0.7, 1.1),
          0.18,
        );
      }

      // Pigment pooling at the edge — occasional darker, thin ring.
      if (p.random() < 0.15) {
        p.noFill();
        p.stroke(r * 0.8, g * 0.8, b * 0.8, 10);
        p.strokeWeight(1);
        blob(p, x, y, radius * p.random(0.9, 1.1), 0.12);
      }
    }
  },
};
