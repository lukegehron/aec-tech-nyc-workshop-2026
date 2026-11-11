import { getBrush } from "./bricks/bricks";

/**
 * The p5 sketch — part of the BASEPLATE.
 *
 * Its whole job is to turn pointer movement into a call on whichever brush
 * brick is selected. It knows nothing about any individual brush; it looks the
 * active one up in the registry every frame, so a new brick is live the moment
 * it's registered.
 *
 * `p.updateWithProps` is how React state (the brush, colour, weight, and the
 * clear signal) reaches the sketch — p5 owns its own canvas and render loop,
 * so props flow in rather than the sketch re-rendering.
 *
 * `@p5-wrapper/react` calls `remove()` without awaiting it, and p5 2's
 * `remove()` is async. React Strict Mode remounts immediately, so two full
 * sketches can sit in the same node: the leftover one never gets later
 * `updateWithProps` (always Pen) and the new one is the real pad. Hide
 * sibling canvases — do not delete them — and keep drawing with p5's own
 * mouseX/mouseY on the live instance.
 */

export const CANVAS = { width: 720, height: 460 };

export function sketch(p) {
  let brushId = null;
  let color = "#111827";
  let weight = 4;
  let lastClear = 0;

  p.setup = () => {
    p.createCanvas(CANVAS.width, CANVAS.height);
    hideSiblingCanvases(p);
    p.background(255);
  };

  p.updateWithProps = (props) => {
    if (props.brushId) brushId = props.brushId;
    if (props.color) color = props.color;
    if (props.weight) weight = props.weight;
    if (props.clearSignal !== lastClear) {
      lastClear = props.clearSignal;
      p.background(255);
    }
  };

  p.draw = () => {
    if (!p.mouseIsPressed) return;
    if (p.mouseX < 0 || p.mouseX > p.width) return;
    if (p.mouseY < 0 || p.mouseY > p.height) return;

    getBrush(brushId).stroke(p, {
      color,
      weight,
      from: { x: p.pmouseX, y: p.pmouseY },
      to: { x: p.mouseX, y: p.mouseY },
    });
  };
}

function hideSiblingCanvases(p) {
  const elt = p.canvas?.elt ?? p.canvas;
  if (!(elt instanceof HTMLCanvasElement) || !elt.parentElement) return;
  for (const node of elt.parentElement.querySelectorAll("canvas")) {
    if (node === elt) continue;
    node.style.display = "none";
    node.style.pointerEvents = "none";
  }
}
