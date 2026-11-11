"use client";

/**
 * Fluent 2, by hand.
 *
 * `@fluentui/react-components` is not installed in this repo, so this brick
 * carries the handful of Fluent 2 tokens it needs: the neutral ramp, a brand
 * ramp (the Teams/Loop purple from the reference), the type ramp, 4 px / 8 px
 * radii and the elevation shadows. Each token has a light and a dark value, so
 * nothing here reads the theme — the `dark:` variant does it.
 *
 * Put FLUENT_VARS on the root element of every separate DOM tree (toolbar,
 * panel, and each drei <Html>, which renders in its own React root).
 */

export const AUTHOR = "CD";

export const FLUENT_FONT =
  "'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif";

export const SHADOW_2 = "0 0 2px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.14)";
export const SHADOW_8 = "0 0 2px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.14)";
export const SHADOW_16 = "0 0 2px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.14)";

/** Brand colour for things drawn inside the canvas, per theme. */
export const BRAND_3D = { light: "#5b5fc7", dark: "#7f85f5" };

export const FLUENT_VARS = [
  // colorNeutralBackground1-3, colorNeutralForeground1-3, colorNeutralStroke1-2
  "[--f-bg1:#ffffff] [--f-bg2:#fafafa] [--f-bg3:#f5f5f5]",
  "[--f-fg1:#242424] [--f-fg2:#424242] [--f-fg3:#616161]",
  "[--f-stroke1:#d1d1d1] [--f-stroke2:#e0e0e0]",
  // colorBrandBackground / Hover, colorBrandForeground1, colorBrandBackground2
  "[--f-brand-bg:#5b5fc7] [--f-brand-bg-hover:#4f52b2]",
  "[--f-brand-fg:#5b5fc7] [--f-brand-bg2:#e8ebfa]",
  "dark:[--f-bg1:#292929] dark:[--f-bg2:#1f1f1f] dark:[--f-bg3:#141414]",
  "dark:[--f-fg1:#ffffff] dark:[--f-fg2:#d6d6d6] dark:[--f-fg3:#adadad]",
  "dark:[--f-stroke1:#666666] dark:[--f-stroke2:#525252]",
  "dark:[--f-brand-bg:#4f52b2] dark:[--f-brand-bg-hover:#5b5fc7]",
  "dark:[--f-brand-fg:#7f85f5] dark:[--f-brand-bg2:#2f2f4a]",
].join(" ");

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--f-fg1)]";

/** Subtle icon button — transparent until hovered. */
export const ICON_BUTTON = `inline-flex size-7 shrink-0 items-center justify-center rounded-[4px] text-[color:var(--f-fg2)] hover:bg-[var(--f-bg3)] hover:text-[color:var(--f-brand-fg)] disabled:pointer-events-none disabled:text-[color:var(--f-stroke1)] ${FOCUS}`;

/** Subtle text button, 28 px tall to sit in the viewer's toolbar row. */
export const SUBTLE_BUTTON = `inline-flex h-7 items-center gap-1.5 rounded-[4px] px-2 text-[12px] font-semibold leading-4 ${FOCUS}`;
export const SUBTLE_REST =
  "text-[color:var(--f-fg2)] hover:bg-[var(--f-bg3)] hover:text-[color:var(--f-fg1)]";
export const SUBTLE_CHECKED = "bg-[var(--f-brand-bg2)] text-[color:var(--f-brand-fg)]";

/** Fluent Avatar: initials on the brand tint. */
export function Avatar({ name = AUTHOR, size = 28 }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--f-brand-bg2)] font-semibold text-[color:var(--f-brand-fg)]"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// drei's <Html> sits inside the element OrbitControls and r3f listen on, so a
// drag or scroll over a card would orbit the model. Spread this on the card.
const stop = (event) => event.stopPropagation();
export const SHIELD = {
  onPointerDown: stop,
  onPointerUp: stop,
  onClick: stop,
  onDoubleClick: stop,
  onContextMenu: stop,
  onWheel: stop,
};
