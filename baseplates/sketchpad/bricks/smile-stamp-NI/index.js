// Stamps a smiley face every so often along the path you draw. The face is
// yellow; the outline, eyes and smile use the selected colour. Stamp size
// follows the stroke weight.
//
// The baseplate calls `stroke` once per frame with only the last two pointer
// positions, so the distance walked since the last stamp is kept here and
// carried from frame to frame.

let carried = 0;
let lastFrame = -10;

function smiley(p, x, y, size, color) {
  const r = size / 2;
  p.push();
  p.stroke(color);
  p.strokeWeight(Math.max(1.5, size / 14));
  p.fill("#facc15");
  p.circle(x, y, size);

  // eyes
  p.noStroke();
  p.fill(color);
  p.circle(x - r * 0.35, y - r * 0.25, size * 0.14);
  p.circle(x + r * 0.35, y - r * 0.25, size * 0.14);

  // smile
  p.noFill();
  p.stroke(color);
  p.strokeWeight(Math.max(1.5, size / 14));
  p.strokeCap(p.ROUND);
  p.arc(x, y + r * 0.05, r * 1.1, r * 1.0, 0.2 * p.PI, 0.8 * p.PI);
  p.pop();
}

export const smileStampNI = {
  id: "smile-stamp-NI",
  label: "Smile",
  order: 95,
  hint: "Stamps smiley faces along your stroke — weight sets the size",

  stroke(p, { color, weight, from, to }) {
    const size = Math.max(24, weight * 4);
    const spacing = size * 1.3;
    const distance = p.dist(from.x, from.y, to.x, to.y);

    // `stroke` runs every frame while the pointer is down, so a gap in frame
    // numbers means a new stroke: stamp right at the press point.
    if (p.frameCount - lastFrame > 1) {
      smiley(p, from.x, from.y, size, color);
      carried = 0;
    }
    lastFrame = p.frameCount;
    if (distance === 0) return;

    let walked = spacing - carried;
    while (walked <= distance) {
      const t = walked / distance;
      smiley(p, p.lerp(from.x, to.x, t), p.lerp(from.y, to.y, t), size, color);
      walked += spacing;
    }
    carried = spacing - (walked - distance);
  },
};
