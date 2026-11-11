"use client";

/**
 * SVG in, SVG out.
 *
 * Import is deliberately forgiving: it flattens groups, bakes every transform
 * into the geometry, converts the five primitive shapes into paths, and
 * normalises H/V/S/Q/T/A commands away (see `parsePathD`). What comes out the
 * other side is always the same simple element list the tools understand.
 *
 * Export writes real-world `width`/`height` in millimetres alongside the
 * viewBox, so the file opens at true scale in Illustrator, Inkscape or a
 * plotter queue.
 */

import {
  ellipseSubPaths,
  mapSubPaths,
  parsePathD,
  polylineSubPaths,
  pt,
  rectSubPaths,
  toPathD,
  unionBounds,
} from "./geometry";
import {
  DASH_PATTERNS,
  DEFAULT_STYLE,
  createPath,
  dimensionGeometry,
  elementBounds,
  formatLength,
} from "./model";

// ---------------------------------------------------------------------------
// Matrices — [a, b, c, d, e, f], same order as the SVG `matrix()` function
// ---------------------------------------------------------------------------

const IDENTITY = [1, 0, 0, 1, 0, 0];

const multiply = (m, n) => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];

const applyMatrix = (m, p) => pt(m[0] * p.x + m[2] * p.y + m[4], m[1] * p.x + m[3] * p.y + m[5]);

/** Average scale factor of a matrix — used to keep stroke widths sensible. */
const matrixScale = (m) => Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1;

function parseTransform(value) {
  if (!value) return IDENTITY;
  let result = IDENTITY;
  const pattern = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;
  let match;

  while ((match = pattern.exec(value))) {
    const [, name, rawArgs] = match;
    const args = (rawArgs.match(/[+-]?[\d.eE+-]+/g) || []).map(Number);
    let m = IDENTITY;

    if (name === "matrix" && args.length === 6) m = args;
    else if (name === "translate") m = [1, 0, 0, 1, args[0] || 0, args[1] || 0];
    else if (name === "scale") m = [args[0] ?? 1, 0, 0, args[1] ?? args[0] ?? 1, 0, 0];
    else if (name === "rotate") {
      const rad = ((args[0] || 0) * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const rotation = [cos, sin, -sin, cos, 0, 0];
      if (args.length >= 3) {
        m = multiply(multiply([1, 0, 0, 1, args[1], args[2]], rotation), [1, 0, 0, 1, -args[1], -args[2]]);
      } else m = rotation;
    } else if (name === "skewX") m = [1, 0, Math.tan(((args[0] || 0) * Math.PI) / 180), 1, 0, 0];
    else if (name === "skewY") m = [1, Math.tan(((args[0] || 0) * Math.PI) / 180), 0, 1, 0, 0];

    result = multiply(result, m);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

const SKIP_TAGS = new Set(["defs", "clippath", "mask", "marker", "symbol", "pattern", "filter", "metadata"]);

function parseInlineStyle(value) {
  const out = {};
  for (const rule of String(value || "").split(";")) {
    const [key, ...rest] = rule.split(":");
    if (key && rest.length) out[key.trim()] = rest.join(":").trim();
  }
  return out;
}

function readStyle(node, inherited, scale) {
  const inline = parseInlineStyle(node.getAttribute("style"));
  const read = (name) => inline[name] ?? node.getAttribute(name) ?? undefined;

  const fill = read("fill");
  const stroke = read("stroke");
  const width = read("stroke-width");
  const opacity = read("opacity");
  const dashArray = read("stroke-dasharray");

  const style = { ...inherited };
  if (fill !== undefined) style.fill = fill === "currentColor" ? DEFAULT_STYLE.stroke : fill;
  if (stroke !== undefined) style.stroke = stroke === "currentColor" ? DEFAULT_STYLE.stroke : stroke;
  if (width !== undefined) style.strokeWidth = parseFloat(width) * scale;
  if (opacity !== undefined) style.opacity = parseFloat(opacity);
  if (dashArray !== undefined) style.dash = dashArray === "none" ? "none" : "dashed";

  // A shape with neither fill nor stroke anywhere up the tree would be
  // invisible; line drawings are the common case, so give it a stroke.
  if (style.stroke === "none" && style.fill === "none") style.stroke = DEFAULT_STYLE.stroke;
  return style;
}

const num = (node, name, fallback = 0) => {
  const value = parseFloat(node.getAttribute(name));
  return Number.isFinite(value) ? value : fallback;
};

const pointsOf = (node) => {
  const values = (node.getAttribute("points") || "").match(/[+-]?[\d.eE+-]+/g) || [];
  const points = [];
  for (let i = 0; i + 1 < values.length; i += 2) points.push(pt(Number(values[i]), Number(values[i + 1])));
  return points;
};

/** One SVG node -> subPaths, still in the node's own coordinate system. */
function subPathsForNode(node, tag) {
  if (tag === "path") return parsePathD(node.getAttribute("d"));
  if (tag === "rect") return rectSubPaths(num(node, "x"), num(node, "y"), num(node, "width"), num(node, "height"));
  if (tag === "circle") {
    const r = num(node, "r");
    return ellipseSubPaths(num(node, "cx"), num(node, "cy"), r, r);
  }
  if (tag === "ellipse")
    return ellipseSubPaths(num(node, "cx"), num(node, "cy"), num(node, "rx"), num(node, "ry"));
  if (tag === "line")
    return polylineSubPaths([pt(num(node, "x1"), num(node, "y1")), pt(num(node, "x2"), num(node, "y2"))]);
  if (tag === "polyline") return polylineSubPaths(pointsOf(node), false);
  if (tag === "polygon") return polylineSubPaths(pointsOf(node), true);
  return [];
}

/**
 * Parse an SVG document into editor elements.
 * `fit` (optional) rescales the result to sit inside `{ width, height, padding }`.
 */
export function parseSvg(text, { fit = null } = {}) {
  const parsed = new DOMParser().parseFromString(text, "image/svg+xml");
  if (parsed.querySelector("parsererror")) throw new Error("That file isn't valid SVG.");

  const root = parsed.documentElement;
  const elements = [];

  const walk = (node, matrix, inheritedStyle) => {
    for (const child of node.children) {
      const tag = child.tagName?.toLowerCase();
      if (!tag || SKIP_TAGS.has(tag)) continue;

      const local = multiply(matrix, parseTransform(child.getAttribute("transform")));
      const style = readStyle(child, inheritedStyle, matrixScale(local));

      if (tag === "g" || tag === "svg" || tag === "a") {
        walk(child, local, style);
        continue;
      }

      const subPaths = subPathsForNode(child, tag);
      if (!subPaths.length) continue;

      elements.push(
        createPath(
          mapSubPaths(subPaths, (p) => applyMatrix(local, p)),
          style,
          child.getAttribute("data-name") || child.getAttribute("id") || tag.replace(/^./, (c) => c.toUpperCase())
        )
      );
    }
  };

  walk(root, IDENTITY, { ...DEFAULT_STYLE, fill: "none", stroke: "none" });

  return fit ? fitElements(elements, fit) : elements;
}

/** Uniformly scale + centre a set of elements inside a box. */
export function fitElements(elements, { width, height, padding = 40 }) {
  const bounds = unionBounds(elements.map(elementBounds));
  if (!bounds) return elements;

  const boxWidth = Math.max(bounds.maxX - bounds.minX, 1e-6);
  const boxHeight = Math.max(bounds.maxY - bounds.minY, 1e-6);
  const scale = Math.min((width - padding * 2) / boxWidth, (height - padding * 2) / boxHeight);
  const dx = (width - boxWidth * scale) / 2 - bounds.minX * scale;
  const dy = (height - boxHeight * scale) / 2 - bounds.minY * scale;

  return elements.map((element) => ({
    ...element,
    subPaths: mapSubPaths(element.subPaths, (p) => pt(p.x * scale + dx, p.y * scale + dy)),
    style: { ...element.style, strokeWidth: element.style.strokeWidth * scale },
  }));
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

const escapeXml = (value) =>
  String(value).replace(/[<>&"']/g, (c) => `&${{ "<": "lt", ">": "gt", "&": "amp", '"': "quot", "'": "apos" }[c]};`);

function serializeElement(element, doc) {
  const { style } = element;
  const name = ` data-name="${escapeXml(element.name)}"`;
  const dash = DASH_PATTERNS[style.dash];
  const paint =
    `fill="${style.fill}" stroke="${style.stroke}" stroke-width="${Number(style.strokeWidth.toFixed(3))}"` +
    ` stroke-linecap="round" stroke-linejoin="round"` +
    (dash ? ` stroke-dasharray="${dash}"` : "") +
    (style.opacity < 1 ? ` opacity="${style.opacity}"` : "");

  if (element.type === "dimension") {
    const g = dimensionGeometry(element);
    // 2.5 mm of printed text, expressed in drawing units.
    const fontSize = Number((250 / doc.mmPerUnit).toFixed(2));
    return (
      `<g${name}>` +
      `<path d="${`${g.lineD} ${g.ticksD} ${g.extensionsD}`.trim()}" fill="none" stroke="${style.stroke}" stroke-width="${Number(style.strokeWidth.toFixed(3))}"/>` +
      `<text x="${g.labelAt.x.toFixed(2)}" y="${(g.labelAt.y - fontSize * 0.5).toFixed(2)}" font-family="monospace"` +
      ` font-size="${fontSize}" text-anchor="middle" fill="${style.stroke}"` +
      ` transform="rotate(${g.labelAngle.toFixed(2)} ${g.labelAt.x.toFixed(2)} ${g.labelAt.y.toFixed(2)})">` +
      `${escapeXml(formatLength(g.length * doc.mmPerUnit))}</text>` +
      `</g>`
    );
  }
  return `<path${name} d="${toPathD(element.subPaths)}" ${paint}/>`;
}

/** The whole drawing as an SVG document string. */
export function elementsToSvg(elements, doc, { padding = 40 } = {}) {
  const visible = elements.filter((e) => !e.hidden);
  const bounds = unionBounds(visible.map(elementBounds)) ?? {
    minX: 0,
    minY: 0,
    maxX: doc.width,
    maxY: doc.height,
  };

  const minX = bounds.minX - padding;
  const minY = bounds.minY - padding;
  const width = Math.max(bounds.maxX - bounds.minX + padding * 2, 1);
  const height = Math.max(bounds.maxY - bounds.minY + padding * 2, 1);
  const mm = (units) => Number((units * doc.mmPerUnit).toFixed(2));

  const body = visible.map((element) => `  ${serializeElement(element, doc)}`).join("\n");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX.toFixed(2)} ${minY.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)}"`,
    `     width="${mm(width)}mm" height="${mm(height)}mm">`,
    `  <title>${escapeXml(doc.name)}</title>`,
    body,
    `</svg>`,
    "",
  ].join("\n");
}

/** Trigger a browser download for a string. */
export function downloadText(filename, text, type = "image/svg+xml") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
