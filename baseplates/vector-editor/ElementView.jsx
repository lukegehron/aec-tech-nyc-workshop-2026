"use client";

import { DASH_PATTERNS, dimensionGeometry, elementPathD, formatLength } from "./model";

/**
 * How one element becomes SVG.
 *
 * Each element renders twice: the visible path, and an invisible fat-stroked
 * copy underneath it that catches pointer events. That's what makes a 1px
 * hairline clickable — and it's why `Canvas` can hit-test with
 * `event.target.closest("[data-element-id]")` instead of doing geometry.
 */

const HIT_WIDTH = 12; // screen px of grab tolerance around a stroke

function PathView({ element, zoom, interactive, hovered, selected }) {
  const { style } = element;
  const d = elementPathD(element);
  const dash = DASH_PATTERNS[style.dash] ?? null;

  return (
    <g data-element-id={element.id}>
      {hovered && !selected ? (
        <path
          d={d}
          fill="none"
          stroke="var(--color-primary)"
          strokeOpacity={0.35}
          strokeWidth={style.strokeWidth + 6 / zoom}
          strokeLinejoin="round"
          strokeLinecap="round"
          pointerEvents="none"
        />
      ) : null}
      <path
        d={d}
        fill={style.fill}
        fillRule="evenodd"
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeDasharray={dash ?? undefined}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={style.opacity}
        pointerEvents="none"
      />
      {interactive && !element.locked ? (
        <path
          d={d}
          fill={style.fill === "none" ? "none" : "transparent"}
          stroke="transparent"
          strokeWidth={Math.max(style.strokeWidth, HIT_WIDTH / zoom)}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}
    </g>
  );
}

function DimensionView({ element, zoom, mmPerUnit, interactive, hovered, selected }) {
  const { style } = element;
  const g = dimensionGeometry(element);
  const label = formatLength(g.length * mmPerUnit);
  const color = hovered || selected ? "var(--color-primary)" : style.stroke;
  const hair = 1.2 / zoom;

  return (
    <g data-element-id={element.id} opacity={style.opacity}>
      <path
        d={`${g.lineD} ${g.ticksD} ${g.extensionsD}`.trim()}
        fill="none"
        stroke={color}
        strokeWidth={hair}
        pointerEvents="none"
      />
      <text
        x={g.labelAt.x}
        y={g.labelAt.y - 7 / zoom}
        fontSize={13 / zoom}
        textAnchor="middle"
        fill={color}
        // A background-coloured stroke painted first gives the label a halo,
        // so it stays readable over the drawing without measuring text.
        stroke="var(--color-card)"
        strokeWidth={4 / zoom}
        paintOrder="stroke"
        transform={`rotate(${g.labelAngle} ${g.labelAt.x} ${g.labelAt.y})`}
        pointerEvents="none"
        style={{ fontFamily: "var(--font-mono, monospace)", userSelect: "none" }}
      >
        {label}
      </text>
      {interactive && !element.locked ? (
        <path
          d={g.lineD}
          fill="none"
          stroke="transparent"
          strokeWidth={HIT_WIDTH / zoom}
        />
      ) : null}
    </g>
  );
}

export default function ElementView(props) {
  if (props.element.hidden) return null;
  return props.element.type === "dimension" ? (
    <DimensionView {...props} />
  ) : (
    <PathView {...props} />
  );
}
