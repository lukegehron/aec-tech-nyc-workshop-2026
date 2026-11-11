// A nib held at a fixed angle: the mark is wide when you move across the nib
// and thin when you move along it. Drawn as a quad between the two nib ends
// rather than a thick line, which is what gives the stroke its taper.

const NIB_ANGLE = -Math.PI / 4; // 45°, like a broad-edge pen

export const calligraphyBrush = {
  id: "calligraphy-XX",
  label: "Calligraphy",
  order: 30,
  hint: "Broad nib at 45° — direction changes the thickness",

  stroke(p, { color, weight, from, to }) {
    const dx = (Math.cos(NIB_ANGLE) * weight * 2) / 2;
    const dy = (Math.sin(NIB_ANGLE) * weight * 2) / 2;

    p.noStroke();
    p.fill(color);
    p.quad(
      from.x - dx, from.y - dy,
      from.x + dx, from.y + dy,
      to.x + dx, to.y + dy,
      to.x - dx, to.y - dy
    );
  },
};
