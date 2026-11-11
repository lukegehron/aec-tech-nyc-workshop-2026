/**
 * Pure path math. No React, no atoms, no element concept — just points,
 * commands, and the conversions between them. Everything here is testable in
 * isolation, which is why it lives in its own file.
 *
 * The path model mirrors how a real vector editor stores geometry: a path is a
 * list of *subpaths*, and a subpath is a list of *commands*.
 *
 *   Command =
 *     | { type: "M" | "L", p: {x, y} }
 *     | { type: "C", c1: {x, y}, c2: {x, y}, p: {x, y} }
 *     | { type: "Z" }
 *
 * Only M / L / C / Z exist in the model. Everything else an SVG file can throw
 * at us (H, V, S, Q, T, A) is normalised into those four on import, so tools
 * downstream only ever handle four cases.
 */

export const pt = (x, y) => ({ x, y });

export const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

export const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

const round = (n, p) => {
  const f = 10 ** p;
  return Math.round(n * f) / f;
};

// ---------------------------------------------------------------------------
// Serialisation
// ---------------------------------------------------------------------------

/** subPaths -> an SVG `d` string. */
export function toPathD(subPaths, precision = 2) {
  const n = (v) => round(v, precision);
  const out = [];
  for (const commands of subPaths) {
    for (const c of commands) {
      if (c.type === "M") out.push(`M ${n(c.p.x)} ${n(c.p.y)}`);
      else if (c.type === "L") out.push(`L ${n(c.p.x)} ${n(c.p.y)}`);
      else if (c.type === "C")
        out.push(
          `C ${n(c.c1.x)} ${n(c.c1.y)} ${n(c.c2.x)} ${n(c.c2.y)} ${n(c.p.x)} ${n(c.p.y)}`
        );
      else if (c.type === "Z") out.push("Z");
    }
  }
  return out.join(" ");
}

const TOKENS = /[a-zA-Z]|[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g;
const ARG_COUNT = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

/**
 * An SVG `d` string -> subPaths. Handles every command type and both the
 * absolute and relative forms; quadratics and arcs are converted to cubics so
 * the rest of the app never has to know they existed.
 */
export function parsePathD(d) {
  const tokens = String(d ?? "").match(TOKENS) || [];
  const subPaths = [];
  let commands = null;
  let cur = pt(0, 0); // current point
  let start = pt(0, 0); // subpath start, for Z
  let lastCubicC2 = null; // for S
  let lastQuadC = null; // for T
  let cmd = null;
  let i = 0;

  const push = (c) => {
    if (!commands) {
      commands = [];
      subPaths.push(commands);
    }
    commands.push(c);
  };
  const num = () => Number(tokens[i++]);

  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    if (!cmd) break;
    const upper = cmd.toUpperCase();
    const rel = cmd !== upper;
    const argc = ARG_COUNT[upper];
    if (argc === undefined) break; // unknown command — bail rather than loop
    if (argc > 0 && i + argc > tokens.length) break;

    if (upper === "M") {
      const p = pt(num(), num());
      if (rel) (p.x += cur.x), (p.y += cur.y);
      commands = [];
      subPaths.push(commands);
      commands.push({ type: "M", p });
      cur = p;
      start = p;
      // Additional coordinate pairs after an M are implicit L commands.
      cmd = rel ? "l" : "L";
    } else if (upper === "L") {
      const p = pt(num(), num());
      if (rel) (p.x += cur.x), (p.y += cur.y);
      push({ type: "L", p });
      cur = p;
    } else if (upper === "H") {
      const x = num();
      const p = pt(rel ? cur.x + x : x, cur.y);
      push({ type: "L", p });
      cur = p;
    } else if (upper === "V") {
      const y = num();
      const p = pt(cur.x, rel ? cur.y + y : y);
      push({ type: "L", p });
      cur = p;
    } else if (upper === "C" || upper === "S") {
      let c1;
      if (upper === "C") {
        c1 = pt(num(), num());
        if (rel) (c1.x += cur.x), (c1.y += cur.y);
      } else {
        // S: first control point is the reflection of the previous one.
        c1 = lastCubicC2
          ? pt(2 * cur.x - lastCubicC2.x, 2 * cur.y - lastCubicC2.y)
          : pt(cur.x, cur.y);
      }
      const c2 = pt(num(), num());
      const p = pt(num(), num());
      if (rel) {
        (c2.x += cur.x), (c2.y += cur.y);
        (p.x += cur.x), (p.y += cur.y);
      }
      push({ type: "C", c1, c2, p });
      cur = p;
      lastCubicC2 = c2;
      lastQuadC = null;
      continue;
    } else if (upper === "Q" || upper === "T") {
      let q;
      if (upper === "Q") {
        q = pt(num(), num());
        if (rel) (q.x += cur.x), (q.y += cur.y);
      } else {
        q = lastQuadC ? pt(2 * cur.x - lastQuadC.x, 2 * cur.y - lastQuadC.y) : pt(cur.x, cur.y);
      }
      const p = pt(num(), num());
      if (rel) (p.x += cur.x), (p.y += cur.y);
      // Elevate the quadratic to an equivalent cubic.
      push({
        type: "C",
        c1: lerp(cur, q, 2 / 3),
        c2: lerp(p, q, 2 / 3),
        p,
      });
      cur = p;
      lastQuadC = q;
      lastCubicC2 = null;
      continue;
    } else if (upper === "A") {
      const rx = num();
      const ry = num();
      const rot = num();
      const largeArc = num();
      const sweep = num();
      const p = pt(num(), num());
      if (rel) (p.x += cur.x), (p.y += cur.y);
      for (const c of arcToCubics(cur, rx, ry, rot, largeArc, sweep, p)) push(c);
      cur = p;
    } else if (upper === "Z") {
      push({ type: "Z" });
      cur = start;
    }
    lastCubicC2 = null;
    lastQuadC = null;
  }

  return subPaths.filter((s) => s.length > 0);
}

/**
 * Endpoint-parameterised elliptical arc -> up to four cubic segments.
 * This is the standard conversion from the SVG implementation notes; the only
 * reason it's here is so imported SVGs (door swings, fillets) survive a round
 * trip through the editor.
 */
export function arcToCubics(from, rx, ry, rotationDeg, largeArc, sweep, to) {
  if (rx === 0 || ry === 0) return [{ type: "L", p: to }];
  rx = Math.abs(rx);
  ry = Math.abs(ry);

  const phi = (rotationDeg * Math.PI) / 180;
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);
  const dx2 = (from.x - to.x) / 2;
  const dy2 = (from.y - to.y) / 2;
  const x1 = cosP * dx2 + sinP * dy2;
  const y1 = -sinP * dx2 + cosP * dy2;

  // Scale the radii up if they're too small to span the two endpoints.
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) {
    const s = Math.sqrt(lambda);
    rx *= s;
    ry *= s;
  }

  const sign = largeArc === sweep ? -1 : 1;
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const co = sign * Math.sqrt(Math.max(0, num / den));
  const cx1 = (co * rx * y1) / ry;
  const cy1 = (-co * ry * x1) / rx;
  const cx = cosP * cx1 - sinP * cy1 + (from.x + to.x) / 2;
  const cy = sinP * cx1 + cosP * cy1 + (from.y + to.y) / 2;

  const angle = (ux, uy, vx, vy) => {
    const dot = ux * vx + uy * vy;
    const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
    const a = Math.acos(Math.min(1, Math.max(-1, dot / (len || 1))));
    return ux * vy - uy * vx < 0 ? -a : a;
  };

  const theta = angle(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry);
  let delta = angle((x1 - cx1) / rx, (y1 - cy1) / ry, (-x1 - cx1) / rx, (-y1 - cy1) / ry);
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  if (sweep && delta < 0) delta += 2 * Math.PI;

  const segments = Math.ceil(Math.abs(delta / (Math.PI / 2)));
  const step = delta / segments;
  const k = (4 / 3) * Math.tan(step / 4);
  const out = [];
  let t = theta;

  const onArc = (a) => ({
    x: cx + rx * Math.cos(a) * cosP - ry * Math.sin(a) * sinP,
    y: cy + rx * Math.cos(a) * sinP + ry * Math.sin(a) * cosP,
  });
  const tangent = (a) => ({
    x: -rx * Math.sin(a) * cosP - ry * Math.cos(a) * sinP,
    y: -rx * Math.sin(a) * sinP + ry * Math.cos(a) * cosP,
  });

  for (let s = 0; s < segments; s++) {
    const t2 = t + step;
    const p1 = onArc(t);
    const p2 = onArc(t2);
    const d1 = tangent(t);
    const d2 = tangent(t2);
    out.push({
      type: "C",
      c1: pt(p1.x + k * d1.x, p1.y + k * d1.y),
      c2: pt(p2.x - k * d2.x, p2.y - k * d2.y),
      p: s === segments - 1 ? to : p2,
    });
    t = t2;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

/** Run every point in a path (anchors *and* control points) through `fn`. */
export function mapSubPaths(subPaths, fn) {
  return subPaths.map((commands) =>
    commands.map((c) => {
      if (c.type === "Z") return c;
      if (c.type === "C")
        return { type: "C", c1: fn(c.c1), c2: fn(c.c2), p: fn(c.p) };
      return { type: c.type, p: fn(c.p) };
    })
  );
}

// ---------------------------------------------------------------------------
// Sampling & bounds
// ---------------------------------------------------------------------------

export function cubicAt(p0, c1, c2, p1, t) {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * c1.x + c * c2.x + d * p1.x,
    y: a * p0.y + b * c1.y + c * c2.y + d * p1.y,
  };
}

/** subPaths -> polylines. Curves are sampled; used for bounds and hit tests. */
export function flattenSubPaths(subPaths, steps = 16) {
  const polylines = [];
  for (const commands of subPaths) {
    let points = [];
    let cur = null;
    let start = null;
    for (const c of commands) {
      if (c.type === "M") {
        if (points.length > 1) polylines.push(points);
        points = [c.p];
        cur = c.p;
        start = c.p;
      } else if (c.type === "L") {
        points.push(c.p);
        cur = c.p;
      } else if (c.type === "C") {
        for (let s = 1; s <= steps; s++) points.push(cubicAt(cur, c.c1, c.c2, c.p, s / steps));
        cur = c.p;
      } else if (c.type === "Z" && start) {
        points.push(start);
        cur = start;
      }
    }
    if (points.length) polylines.push(points);
  }
  return polylines;
}

export function boundsOfPoints(points) {
  if (!points.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

export function unionBounds(list) {
  const valid = list.filter(Boolean);
  if (!valid.length) return null;
  return valid.reduce((a, b) => ({
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  }));
}

export function boundsIntersect(a, b) {
  if (!a || !b) return false;
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

export function normalizeRect(a, b) {
  return {
    minX: Math.min(a.x, b.x),
    minY: Math.min(a.y, b.y),
    maxX: Math.max(a.x, b.x),
    maxY: Math.max(a.y, b.y),
  };
}

// ---------------------------------------------------------------------------
// Primitive builders
// ---------------------------------------------------------------------------

export function rectSubPaths(x, y, w, h) {
  return [
    [
      { type: "M", p: pt(x, y) },
      { type: "L", p: pt(x + w, y) },
      { type: "L", p: pt(x + w, y + h) },
      { type: "L", p: pt(x, y + h) },
      { type: "Z" },
    ],
  ];
}

// Magic constant for approximating a quarter circle with a cubic Bézier.
const KAPPA = 0.5522847498;

export function ellipseSubPaths(cx, cy, rx, ry) {
  const ox = rx * KAPPA;
  const oy = ry * KAPPA;
  return [
    [
      { type: "M", p: pt(cx - rx, cy) },
      { type: "C", c1: pt(cx - rx, cy - oy), c2: pt(cx - ox, cy - ry), p: pt(cx, cy - ry) },
      { type: "C", c1: pt(cx + ox, cy - ry), c2: pt(cx + rx, cy - oy), p: pt(cx + rx, cy) },
      { type: "C", c1: pt(cx + rx, cy + oy), c2: pt(cx + ox, cy + ry), p: pt(cx, cy + ry) },
      { type: "C", c1: pt(cx - ox, cy + ry), c2: pt(cx - rx, cy + oy), p: pt(cx - rx, cy) },
      { type: "Z" },
    ],
  ];
}

export function polylineSubPaths(points, closed = false) {
  if (points.length < 2) return [];
  const commands = [{ type: "M", p: points[0] }];
  for (let i = 1; i < points.length; i++) commands.push({ type: "L", p: points[i] });
  if (closed) commands.push({ type: "Z" });
  return [commands];
}

// ---------------------------------------------------------------------------
// Freehand helpers (used by the pencil tool)
// ---------------------------------------------------------------------------

/** Ramer–Douglas–Peucker: drop points that don't change the shape. */
export function simplifyPoints(points, tolerance) {
  if (points.length < 3) return points;

  const sqTol = tolerance * tolerance;
  const sqSegDist = (p, a, b) => {
    let x = a.x;
    let y = a.y;
    let dx = b.x - x;
    let dy = b.y - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = b.x;
        y = b.y;
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    dx = p.x - x;
    dy = p.y - y;
    return dx * dx + dy * dy;
  };

  const keep = new Array(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];

  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDist = 0;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const dist = sqSegDist(points[i], points[first], points[last]);
      if (dist > maxDist) {
        maxDist = dist;
        index = i;
      }
    }
    if (maxDist > sqTol && index > -1) {
      keep[index] = true;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/** Catmull–Rom through the points, emitted as cubic commands. */
export function smoothPoints(points) {
  if (points.length < 2) return [];
  if (points.length === 2) {
    return [[{ type: "M", p: points[0] }, { type: "L", p: points[1] }]];
  }
  const commands = [{ type: "M", p: points[0] }];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    commands.push({
      type: "C",
      c1: pt(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6),
      c2: pt(p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6),
      p: p2,
    });
  }
  return [commands];
}
