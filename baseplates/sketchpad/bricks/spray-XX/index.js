// Scatters dots in a disc around the cursor. Density is per-frame, so holding
// still builds up colour the way a real airbrush does.

const DOTS_PER_FRAME = 14;

export const sprayBrush = {
  id: "spray-XX",
  label: "Spray",
  order: 20,
  hint: "Airbrush — hold still to build up density",

  stroke(p, { color, weight, to }) {
    const radius = weight * 3;
    p.noStroke();
    p.fill(color);
    for (let i = 0; i < DOTS_PER_FRAME; i++) {
      // Polar, with sqrt on the radius so dots spread evenly over the disc
      // instead of clumping in the middle.
      const angle = p.random(p.TWO_PI);
      const r = radius * Math.sqrt(p.random(1));
      p.circle(to.x + Math.cos(angle) * r, to.y + Math.sin(angle) * r, weight * 0.4);
    }
  },
};
