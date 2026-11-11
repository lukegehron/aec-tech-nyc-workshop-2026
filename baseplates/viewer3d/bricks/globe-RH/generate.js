import { GENERIC_PARTS } from "./landmarks";

// Live generation: ask Claude (via /api/claude) to design a low-poly cartoon
// model of the typed landmark as plain data — the same `parts` format the
// built-in catalogue uses — then validate it hard before it reaches the scene.
// Plain data means nothing inside <Canvas> ever has to load or suspend.

const SYSTEM = `You design tiny low-poly cartoon models of world landmarks for a toy globe.
Reply with ONE JSON object and nothing else (no markdown, no prose):
{
  "name": string,            // proper landmark name
  "lat": number, "lon": number,   // real-world coordinates in degrees
  "height": number,          // 0.15-0.3, how tall it renders as a fraction of the globe radius: use ~0.3 for tall towers, ~0.18 for low or wide things
  "parts": [ ... 3 to 24 parts ... ]
}
The model stands on z = 0 and is about 1 unit tall; z is up. Keep every part within x,y in [-1.5, 1.5] and z in [0, 1.2].
Part kinds (all take optional x, y, z offsets of the part's base, and "color" as a #rrggbb hex):
  {"kind":"cyl","r1":bottom radius,"r2":top radius,"h":height,"seg":sides}   frustum/cone/cylinder. seg 4 = square pyramid/tower (r is half-width), 3 = triangular, 6-32 = round. r2 0 makes a point.
  {"kind":"box","w":x size,"l":y size,"h":height}
  {"kind":"sphere","r":radius,"scale":[sx,sy,sz]}   centred on z, so set z = r for a dome sitting on the ground
  optional "tilt": radians leaning the part about the y axis (for leaning towers, slanted cables, sails).
Make it instantly recognisable by its silhouette and signature colours, using few simple solids. Stack parts by setting each z to the top of the one below. Use bright, slightly cartoonish colours.`;

const KINDS = new Set(["cyl", "box", "sphere"]);
const HEX = /^#[0-9a-fA-F]{6}$/;

const num = (v, min, max, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

function cleanPart(p) {
  if (!p || !KINDS.has(p.kind)) return null;
  const out = {
    kind: p.kind,
    color: HEX.test(p.color) ? p.color : "#cfc7b6",
    x: num(p.x, -1.5, 1.5, 0),
    y: num(p.y, -1.5, 1.5, 0),
    z: num(p.z, 0, 1.2, 0),
    tilt: num(p.tilt, -1, 1, 0),
  };
  if (p.kind === "cyl") {
    out.r1 = num(p.r1, 0, 1, 0.1);
    out.r2 = num(p.r2, 0, 1, 0);
    out.h = num(p.h, 0.005, 1.2, 0.1);
    out.seg = Math.round(num(p.seg, 3, 40, 20));
  } else if (p.kind === "box") {
    out.w = num(p.w, 0.005, 2, 0.1);
    out.l = num(p.l, 0.005, 2, 0.1);
    out.h = num(p.h, 0.005, 1.2, 0.1);
  } else {
    out.r = num(p.r, 0.005, 0.8, 0.1);
    const s = Array.isArray(p.scale) ? p.scale : [1, 1, 1];
    out.scale = [0, 1, 2].map((i) => num(s[i], 0.1, 4, 1));
  }
  return out;
}

/** Pull the first JSON object out of a model reply, tolerating code fences. */
function parseJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no JSON in reply");
  return JSON.parse(text.slice(start, end + 1));
}

/**
 * Ask Claude for a model of `query`. Returns a placed-landmark object, or
 * throws with a readable message. Bad parts are dropped; if too few survive the
 * generic monument is used rather than failing.
 */
export async function generateLandmark(query) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: SYSTEM,
      messages: [{ role: "user", content: `Landmark: ${query}` }],
      maxTokens: 3000,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Claude said ${res.status}`);

  const raw = parseJson(String(body.text ?? ""));
  const lat = Number(raw.lat);
  const lon = Number(raw.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    throw new Error("the model didn't give usable coordinates");
  }
  const parts = (Array.isArray(raw.parts) ? raw.parts : []).slice(0, 30).map(cleanPart).filter(Boolean);
  const usable = parts.length >= 2;
  return {
    ...buildResult(raw, query, lat, lon, parts, usable),
  };
}

// Top of a part in model units (z is up).
function topOf(p) {
  if (p.kind === "sphere") return p.z + p.r * p.scale[2];
  return p.z + p.h;
}

/** Scale every dimension so the model stands ~1 unit tall, like the catalogue. */
function normalise(parts) {
  const top = Math.max(...parts.map(topOf));
  if (!(top > 0)) return parts;
  const s = 1 / top;
  return parts.map((p) => {
    const q = { ...p, x: p.x * s, y: p.y * s, z: p.z * s };
    if (p.kind === "cyl") Object.assign(q, { r1: p.r1 * s, r2: p.r2 * s, h: p.h * s });
    else if (p.kind === "box") Object.assign(q, { w: p.w * s, l: p.l * s, h: p.h * s });
    else q.r = p.r * s;
    return q;
  });
}

function buildResult(raw, query, lat, lon, parts, usable) {
  return {
    id: `gen-${lat.toFixed(3)}-${lon.toFixed(3)}`,
    name: String(raw.name || query).slice(0, 60),
    lat,
    lon,
    // Same band as the hand-built landmarks (0.12–0.42, mostly 0.3).
    height: num(raw.height, 0.15, 0.3, 0.22),
    parts: usable ? normalise(parts) : GENERIC_PARTS,
    generic: !usable,
  };
}
