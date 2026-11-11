import { boxFromOutline, PLAN_INSET, SLAB_GAP } from "../../geometry";

/**
 * Naming what was clicked.
 *
 * The baseplate's box meshes carry no id, and bricks don't import each other,
 * so this brick can't ask the active view mode what a mesh is. Instead it
 * rebuilds the three boxes the project data can produce — building, floor,
 * space — with the same shared primitive the modes use, and matches a clicked
 * mesh to one of them by position and size. Anything that doesn't match (a
 * box from another mode, imported geometry) still gets a comment, just with a
 * generic name.
 */

const EPS = 0.02;
const near = (a, b) => Math.abs(a - b) < EPS;

export const SITE_TARGET = { id: "site", kind: "Site", label: "Site" };

export function targetsFrom(data) {
  const out = [];
  for (const b of data.buildings) {
    out.push({
      id: b.id,
      kind: "Building",
      label: b.name,
      ...boxFromOutline(b.outline, { base: 0, height: b.height }),
    });
    for (const f of b.floors) {
      out.push({
        id: f.id,
        kind: "Floor",
        label: `${b.name} — ${f.name}`,
        ...boxFromOutline(f.outline, {
          base: f.elevation,
          height: f.height,
          verticalGap: SLAB_GAP,
        }),
      });
      for (const s of f.spaces) {
        out.push({
          id: s.id,
          kind: "Space",
          label: `${s.name} — ${b.name}, ${f.name}`,
          ...boxFromOutline(s.footprint, {
            base: f.elevation,
            height: f.height,
            inset: PLAN_INSET,
            verticalGap: SLAB_GAP,
          }),
        });
      }
    }
  }
  return out;
}

/**
 * Turn a raycast hit into `{ target, box }`. `box` is `{ position, size }`
 * when the hit is a box (so the hover outline can be drawn), otherwise null.
 */
export function describeHit(hit, targets) {
  const obj = hit?.object;
  const geometry = obj?.geometry;
  if (!obj || geometry?.type === "PlaneGeometry") {
    return { target: SITE_TARGET, box: null };
  }
  if (geometry?.type === "BoxGeometry") {
    const { width, height, depth } = geometry.parameters;
    const size = [width, height, depth];
    const position = obj.position.toArray();
    const match = targets.find(
      (t) =>
        t.position.every((v, i) => near(v, position[i])) &&
        t.size.every((v, i) => near(v, size[i])),
    );
    const target = match
      ? { id: match.id, kind: match.kind, label: match.label }
      : {
          id: `box@${position.map((n) => n.toFixed(1)).join(",")}`,
          kind: "Element",
          label: "Model element",
        };
    return { target, box: { position, size } };
  }
  const name = obj.name || "Imported geometry";
  return { target: { id: `object:${name}`, kind: "Object", label: name }, box: null };
}

/** "Building · North Tower", or just "Site". */
export function targetText(target) {
  if (!target) return "";
  return target.kind === target.label ? target.label : `${target.kind} · ${target.label}`;
}
