// ─── THE STUB ────────────────────────────────────────────────────────────────
// A working brush that draws a dotted line. It is NOT registered yet — snapping
// it on is your job, and it takes two lines. See the README next to this file.
//
// Copy this whole folder, rename it to end in YOUR two initials, and you have a
// running brick before you've decided what it does.

export const yourBrush = {
  // Two things, one name: this id and the folder. Swap `_your-brick-here-XX`
  // for `<something>-<your initials>`. Your git branch is your GitHub username.
  id: "_your-brick-here-XX",
  label: "Your brush",
  order: 90,
  hint: "A dotted line — change me",

  // The whole contract: draw one frame's worth of mark. Called once per frame
  // while the pointer is down. A brush never handles events, only marks.
  stroke(p, { color, weight, from, to }) {
    p.stroke(color);
    p.strokeWeight(weight);
    p.strokeCap(p.ROUND);

    // Instead of a solid line from `from` to `to`, drop a dot every few pixels.
    const distance = p.dist(from.x, from.y, to.x, to.y);
    const step = weight * 2.5;
    for (let d = 0; d <= distance; d += step) {
      const t = distance === 0 ? 0 : d / distance;
      p.point(p.lerp(from.x, to.x, t), p.lerp(from.y, to.y, t));
    }
  },
};
