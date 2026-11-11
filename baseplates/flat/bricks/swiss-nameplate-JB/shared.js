// Palette and motion helper shared by the nine contact-sheet frames.
export const RED = "#e30613";
export const INK = "#111111";
export const GREY = "#c8c8c8";
export const FONT =
  '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif';

const EASE = "cubic-bezier(.2,.8,.2,1)";

// Style for a moving SVG part. `tr` is a CSS transform (px = SVG user units),
// `origin` is the pivot relative to the part's own box, `delay` staggers it.
export function mv(tr, { origin = "50% 50%", ms = 500, delay = 0, opacity } = {}) {
  return {
    transform: tr,
    transformBox: "fill-box",
    transformOrigin: origin,
    transition: `transform ${ms}ms ${EASE} ${delay}ms, fill 350ms ease ${delay}ms, opacity 350ms ease ${delay}ms`,
    ...(opacity === undefined ? {} : { opacity }),
  };
}
