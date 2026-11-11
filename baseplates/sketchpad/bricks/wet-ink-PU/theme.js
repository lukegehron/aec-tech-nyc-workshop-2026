// Wet-ink UI theme — a brush-only workaround.
//
// The brick contract gives a brush no say over the toolbar, and this brick
// must not edit the baseplate. So while Wet ink is the active brush, this file
// restyles the page from the outside:
//
//   • warm paper-toned background, cards and borders (theme CSS variables)
//   • a thin, minimal type treatment
//   • swatches recoloured black / plum / emerald / silver / gold
//   • the "Size" label reads "Flow"
//   • "Dry canvas" and "Download JPEG" buttons appear next to Clear
//
// How it knows Wet ink is active: the baseplate prints the active brush's
// `hint` under the canvas. If a <p> with exactly our hint is on the page, we
// are the active brush. Everything is keyed off `html[data-wet-ink]`, so
// switching brush or leaving the page removes it all.
//
// Fragile by nature: it depends on the baseplate's markup (swatch aria-labels,
// the "Size" label, the hint line). If those change, the theme quietly stops
// applying — drawing is unaffected.

import { INK_HEX, INK_ORDER, INK_SHEEN, SWATCH_FOR_INK } from "./inks";

const ATTR = "data-wet-ink";
const FLOW_ATTR = "data-wet-ink-flow";
const STYLE_ID = "wet-ink-PU-theme";
const DRY_ID = "wet-ink-PU-dry";
const SAVE_ID = "wet-ink-PU-save";

const KEPT = new Set(Object.values(SWATCH_FOR_INK));
const FIRST_SPECIAL = Object.keys(INK_SHEEN).sort(
  (a, b) => INK_ORDER.indexOf(a) - INK_ORDER.indexOf(b)
)[0];

function css() {
  const swatch = (hex) => `html[${ATTR}] button[aria-label="Brush color ${hex}"]`;
  const recolor = Object.entries(SWATCH_FOR_INK)
    .map(([ink, hex]) => {
      const sheen = INK_SHEEN[ink] ? ` background-image: ${INK_SHEEN[ink]} !important;` : "";
      // Swatches sit in a flex row, so `order` lays them out as INK_ORDER:
      // the pigments first, then the metals, set off by a small gap.
      const order = INK_ORDER.indexOf(ink);
      const gap = ink === FIRST_SPECIAL ? " margin-left: 0.75rem !important;" : "";
      return `${swatch(hex)} { background-color: ${INK_HEX[ink]} !important;${sheen} order: ${order};${gap} }`;
    })
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

export function installWetInkTheme(hint, { onDry, onDownload, onActive } = {}) {
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
      onActive?.();
      if (onDry && !document.getElementById(DRY_ID)) {
        addButton(DRY_ID, "Dry canvas", "Dried", "Let the wet ink dry — new ink becomes a separate layer on top", onDry);
      }
      if (onDownload && !document.getElementById(SAVE_ID)) {
        addButton(SAVE_ID, "Download JPEG", "Saved", "Save your artwork as a .jpeg", onDownload);
      }
    } else {
      if (root.hasAttribute(ATTR)) root.removeAttribute(ATTR);
      document.getElementById(DRY_ID)?.remove();
      document.getElementById(SAVE_ID)?.remove();
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

// Cloned from the baseplate's Clear button so it matches the toolbar. Each new
// button goes after the last one we added, so the order stays Dry → Download.
function addButton(id, label, done, title, onClick) {
  const clear = [...document.querySelectorAll("button")].find(
    (b) => b.textContent === "Clear"
  );
  if (!clear) return;
  const anchor =
    id === SAVE_ID ? document.getElementById(DRY_ID) ?? clear : clear;
  const button = document.createElement("button");
  button.id = id;
  button.type = "button";
  button.className = clear.className;
  button.textContent = label;
  button.title = title;
  button.addEventListener("click", () => {
    onClick();
    button.textContent = done;
    setTimeout(() => {
      button.textContent = label;
    }, 900);
  });
  anchor.after(button);
}
