// Draws the stroke and its reflection across the vertical centreline. Good for
// elevations, plans and anything symmetrical — and it shows that a brush can
// draw more than once per frame.

export const mirrorBrush = {
  id: "mirror-XX",
  label: "Mirror",
  order: 40,
  hint: "Symmetrical about the vertical centreline",

  stroke(p, { color, weight, from, to }) {
    p.stroke(color);
    p.strokeWeight(weight);
    p.strokeCap(p.ROUND);
    p.line(from.x, from.y, to.x, to.y);
    p.line(p.width - from.x, from.y, p.width - to.x, to.y);
  },
};
