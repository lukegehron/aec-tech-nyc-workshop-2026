// The simplest possible brick in the repo — a straight line from where the
// pointer was to where it is. Copy this folder to start a new brush.

export const penBrush = {
  id: "pen-XX",
  label: "Pen",
  order: 10,
  hint: "A plain line that follows the cursor",

  stroke(p, { color, weight, from, to }) {
    p.stroke(color);
    p.strokeWeight(weight);
    p.strokeCap(p.ROUND);
    p.line(from.x, from.y, to.x, to.y);
  },
};
