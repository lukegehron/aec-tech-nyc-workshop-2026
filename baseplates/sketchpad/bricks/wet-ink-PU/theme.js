// Wet-ink UI theme — a brush-only workaround.
//
// The brick contract gives a brush no say over the toolbar, and this brick
// must not edit the baseplate. So while Wet ink is the active brush, this file
// restyles the page from the outside:
//
//   • warm paper-toned background, cards and borders (theme CSS variables)
//   • a thin, minimal type treatment
//   • only three swatches, recoloured black / plum / emerald
//   • the "Size" label reads "Flow"
//   • a "Dry canvas" button appears next to Clear
//
// How it knows Wet ink is active: the baseplate prints the active brush's
// `hint` under the canvas. If a <p> with exactly our hint is on the page, we
// are the active brush. Everything is keyed off `html[data-wet-ink]`, so
// switching brush or leaving the page removes it all.
//
// Fragile by nature: it depends on the baseplate's markup (swatch aria-labels,
// the "Size" label, the hint line). If those change, the theme quietly stops
// applying — drawing is unaffected.

import { INK_HEX, SWATCH_FOR_INK } from "./inks";

const ATTR = "data-wet-ink";
const FLOW_ATTR = "data-wet-ink-flow";
const STYLE_ID = "wet-ink-PU-theme";
const DRY_ID = "wet-ink-PU-dry";

const KEPT = new Set(Object.values(SWATCH_FOR_INK));

function css() {
  const swatch = (hex) => `html[${ATTR}] button[aria-label="Brush color ${hex}"]`;
  const recolor = Object.entries(SWATCH_FOR_INK)
    .map(([ink, hex]) => `${swatch(hex)} { background-color: ${INK_HEX[ink]} !important; }`)
    .join("\n");
  const hide = ["#3b82f6", "#f59e0b"]
    .filter((hex) => !KEPT.has(hex))
    .map((hex) => `${swatch(hex)} { display: none !important; }`)
    .join("\n");

  return `
html[${ATTR}], html.dark[${ATTR}] {
  --background: #f3eadb;
  --foreground: #2b2420;
  --card: #f8f1e4;
  --card-foreground: #2b2420;
  --popover: #f8f1e4;
  --popover-foreground: #2b2420;
  --primary: #2b2420;
  --primary-foreground: #f8f1e4;
  --secondary: #e7d9c2;
  --secondary-foreground: #2b2420;
  --muted: #ebdfcb;
  --muted-foreground: #8a7a68;
  --accent: #e7d9c2;
  --accent-foreground: #2b2420;
  --border: #ddcdb4;
  --input: #ddcdb4;
  --ring: #b8a183;
  color-scheme: light;
}
html[${ATTR}] body {
  background: #f3eadb;
  transition: background-color 400ms ease;
}
html[${ATTR}] body, html[${ATTR}] body * {
  font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif !important;
  font-weight: 200 !important;
  letter-spacing: 0.04em;
}
html[${ATTR}] [data-slot="card"] {
  box-shadow: none !important;
}
html[${ATTR}] button[aria-label^="Brush color"] {
  width: 1.1rem !important;
  height: 1.1rem !important;
  border-width: 1px !important;
  margin: 0 0.15rem;
}
html[${ATTR}] [data-slot="slider-track"] { height: 1px !important; }
html[${ATTR}] [data-slot="slider-thumb"] {
  width: 0.6rem !important;
  height: 0.6rem !important;
  box-shadow: none !important;
}
html[${ATTR}] [${FLOW_ATTR}] { font-size: 0 !important; }
html[${ATTR}] [${FLOW_ATTR}]::before {
  content: "Flow";
  font-size: 0.75rem;
}
${recolor}
${hide}
`;
}

export function installWetInkTheme(hint, { onDry } = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Hot reload re-runs this module; drop the previous observer first.
  window.__wetInkPU?.disconnect();

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  document.getElementById(STYLE_ID).textContent = css();

  let queued = false;
  const sync = () => {
    queued = false;
    const active = [...document.querySelectorAll("p")].some(
      (el) => el.textContent === hint
    );
    const root = document.documentElement;
    if (active) {
      if (!root.hasAttribute(ATTR)) root.setAttribute(ATTR, "");
      for (const span of document.querySelectorAll("span")) {
        if (span.textContent === "Size" && !span.hasAttribute(FLOW_ATTR)) {
          span.setAttribute(FLOW_ATTR, "");
        }
      }
      if (onDry && !document.getElementById(DRY_ID)) addDryButton(onDry);
    } else {
      if (root.hasAttribute(ATTR)) root.removeAttribute(ATTR);
      document.getElementById(DRY_ID)?.remove();
    }
  };

  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(sync);
  });
  const start = () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    sync();
  };
  if (document.body) start();
  else window.addEventListener("DOMContentLoaded", start, { once: true });

  window.__wetInkPU = observer;
}

// Cloned from the baseplate's Clear button so it matches the toolbar.
function addDryButton(onDry) {
  const clear = [...document.querySelectorAll("button")].find(
    (b) => b.textContent === "Clear"
  );
  if (!clear) return;
  const button = document.createElement("button");
  button.id = DRY_ID;
  button.type = "button";
  button.className = clear.className;
  button.textContent = "Dry canvas";
  button.title = "Let the wet ink dry — new ink becomes a separate layer on top";
  button.addEventListener("click", () => {
    onDry();
    button.textContent = "Dried";
    setTimeout(() => {
      button.textContent = "Dry canvas";
    }, 900);
  });
  clear.after(button);
}
