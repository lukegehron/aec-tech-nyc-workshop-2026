// Landmark catalogue as plain data. Each model is built in a local Z-up frame,
// roughly 1 unit tall, standing on z = 0. `height` is how tall it renders as a
// fraction of the globe's radius — deliberately oversized.
//
// Part kinds:
//   cyl    { r1 (bottom), r2 (top), h, seg }   seg 4 = square frustum
//   box    { w, l, h }                         sits on z
//   sphere { r, scale: [x, y, z] }             centred on z
// Any part: { x, y, z, tilt (radians about Y), color }

const cyl = (color, r1, r2, h, z = 0, extra = {}) => ({ kind: "cyl", color, r1, r2, h, z, ...extra });
const box = (color, w, l, h, z = 0, extra = {}) => ({ kind: "box", color, w, l, h, z, ...extra });
const ball = (color, r, z = 0, extra = {}) => ({ kind: "sphere", color, r, z, ...extra });

const minarets = [[-1, -1], [1, -1], [-1, 1], [1, 1]].flatMap(([sx, sy]) => [
  cyl("#f4f0e8", 0.035, 0.03, 0.6, 0.1, { x: sx * 0.48, y: sy * 0.48 }),
  ball("#f4f0e8", 0.045, 0.72, { x: sx * 0.48, y: sy * 0.48 }),
]);

export const LANDMARKS = [
  {
    key: "eiffel",
    name: "Eiffel Tower",
    aliases: ["eiffel tower", "eiffel", "tour eiffel"],
    lat: 48.8584, lon: 2.2945, height: 0.3,
    parts: [
      cyl("#a07d5a", 0.26, 0.12, 0.38, 0, { seg: 4 }),
      box("#8a6a4a", 0.26, 0.26, 0.03, 0.38),
      cyl("#a07d5a", 0.1, 0.045, 0.34, 0.41, { seg: 4 }),
      box("#8a6a4a", 0.12, 0.12, 0.025, 0.75),
      cyl("#a07d5a", 0.035, 0, 0.25, 0.775, { seg: 4 }),
    ],
  },
  {
    key: "liberty",
    name: "Statue of Liberty",
    aliases: ["statue of liberty", "lady liberty", "liberty"],
    lat: 40.6892, lon: -74.0445, height: 0.3,
    parts: [
      box("#c9c2b4", 0.34, 0.34, 0.2),
      box("#d8d1c3", 0.22, 0.22, 0.1, 0.2),
      cyl("#6fcfb0", 0.1, 0.06, 0.4, 0.3),
      ball("#6fcfb0", 0.055, 0.73),
      cyl("#f2c14e", 0.06, 0.01, 0.07, 0.78),
      cyl("#6fcfb0", 0.022, 0.018, 0.3, 0.62, { x: 0.05, tilt: 0.25 }),
      ball("#f2c14e", 0.04, 0.92, { x: 0.125 }),
      cyl("#ff9f1c", 0.03, 0, 0.08, 0.95, { x: 0.125 }),
    ],
  },
  {
    key: "pyramids",
    name: "Great Pyramid of Giza",
    aliases: ["pyramids", "pyramid", "great pyramid", "giza", "pyramids of giza"],
    lat: 29.9792, lon: 31.1342, height: 0.22,
    parts: [
      cyl("#e8c872", 0.5, 0, 0.6, 0, { seg: 4 }),
      cyl("#dfbd68", 0.3, 0, 0.36, 0, { seg: 4, x: 0.75 }),
      cyl("#d6b45f", 0.22, 0, 0.26, 0, { seg: 4, x: 1.2, y: 0.2 }),
    ],
  },
  {
    key: "bigben",
    name: "Big Ben",
    aliases: ["big ben", "elizabeth tower", "westminster"],
    lat: 51.5007, lon: -0.1246, height: 0.3,
    parts: [
      box("#d9b66c", 0.22, 0.22, 0.6),
      box("#c9a55c", 0.26, 0.26, 0.05, 0.6),
      box("#fffbe6", 0.15, 0.235, 0.15, 0.62),
      box("#fffbe6", 0.235, 0.15, 0.15, 0.62),
      cyl("#4a6a7a", 0.17, 0, 0.3, 0.7, { seg: 4 }),
    ],
  },
  {
    key: "tajmahal",
    name: "Taj Mahal",
    aliases: ["taj mahal", "taj"],
    lat: 27.1751, lon: 78.0421, height: 0.2,
    parts: [
      box("#f4f0e8", 0.8, 0.8, 0.1),
      box("#fbf8f1", 0.5, 0.5, 0.25, 0.1),
      ball("#fbf8f1", 0.2, 0.4, { scale: [1, 1, 1.15] }),
      cyl("#f2c14e", 0.015, 0, 0.15, 0.6),
      ...minarets,
    ],
  },
  {
    key: "opera",
    name: "Sydney Opera House",
    aliases: ["sydney opera house", "opera house", "sydney opera"],
    lat: -33.8568, lon: 151.2153, height: 0.18,
    parts: [
      box("#d8c8a8", 1.0, 0.5, 0.1),
      cyl("#fdfdfd", 0.28, 0, 0.6, 0.1, { seg: 3, x: -0.3, tilt: -0.15 }),
      cyl("#fdfdfd", 0.26, 0, 0.5, 0.1, { seg: 3, x: 0.02, tilt: -0.15 }),
      cyl("#fdfdfd", 0.22, 0, 0.38, 0.1, { seg: 3, x: 0.32, tilt: -0.15 }),
    ],
  },
  {
    key: "colosseum",
    name: "Colosseum",
    aliases: ["colosseum", "coliseum", "roman colosseum"],
    lat: 41.8902, lon: 12.4922, height: 0.12,
    parts: [
      cyl("#d9b98a", 0.45, 0.4, 0.25, 0, { seg: 40 }),
      cyl("#b79b6f", 0.28, 0.28, 0.06, 0.22, { seg: 40 }),
    ],
  },
  {
    key: "christ",
    name: "Christ the Redeemer",
    aliases: ["christ the redeemer", "cristo redentor", "christ redeemer", "rio statue"],
    lat: -22.9519, lon: -43.2105, height: 0.3,
    parts: [
      cyl("#8a8a8a", 0.15, 0.1, 0.25),
      cyl("#f4f4f0", 0.06, 0.045, 0.4, 0.25),
      box("#f4f4f0", 0.5, 0.05, 0.05, 0.55),
      ball("#f4f4f0", 0.045, 0.7),
    ],
  },
  {
    key: "burj",
    name: "Burj Khalifa",
    aliases: ["burj khalifa", "burj", "khalifa"],
    lat: 25.1972, lon: 55.2744, height: 0.42,
    parts: [
      cyl("#9fc3d6", 0.1, 0.07, 0.4, 0, { seg: 6 }),
      cyl("#9fc3d6", 0.07, 0.045, 0.3, 0.4, { seg: 6 }),
      cyl("#9fc3d6", 0.045, 0.025, 0.2, 0.7, { seg: 6 }),
      cyl("#cfd8dc", 0.012, 0, 0.25, 0.9),
    ],
  },
  {
    key: "pisa",
    name: "Leaning Tower of Pisa",
    aliases: ["leaning tower of pisa", "tower of pisa", "pisa", "leaning tower"],
    lat: 43.723, lon: 10.3966, height: 0.25,
    parts: [
      cyl("#f4efe4", 0.1, 0.1, 0.6, 0, { seg: 24, tilt: 0.1 }),
      cyl("#e6dfcf", 0.075, 0.075, 0.12, 0.6, { seg: 24, tilt: 0.1, x: 0.06 }),
    ],
  },
  {
    key: "empire",
    name: "Empire State Building",
    aliases: ["empire state building", "empire state"],
    lat: 40.7484, lon: -73.9857, height: 0.36,
    parts: [
      box("#b8b0a0", 0.5, 0.5, 0.35),
      box("#c4bcac", 0.36, 0.36, 0.3, 0.35),
      box("#b8b0a0", 0.24, 0.24, 0.2, 0.65),
      box("#c4bcac", 0.12, 0.12, 0.1, 0.85),
      cyl("#cfd8dc", 0.02, 0.005, 0.25, 0.95),
    ],
  },
  {
    key: "needle",
    name: "Space Needle",
    aliases: ["space needle", "seattle needle"],
    lat: 47.6205, lon: -122.3493, height: 0.3,
    parts: [
      cyl("#e8e8e8", 0.06, 0.025, 0.6, 0, { seg: 6 }),
      cyl("#d9d9d9", 0.2, 0.26, 0.08, 0.55),
      cyl("#c8553d", 0.27, 0.27, 0.03, 0.63),
      cyl("#e8e8e8", 0.01, 0, 0.25, 0.76),
    ],
  },
  {
    key: "tokyo",
    name: "Tokyo Tower",
    aliases: ["tokyo tower"],
    lat: 35.6586, lon: 139.7454, height: 0.32,
    parts: [
      cyl("#e8532a", 0.2, 0.08, 0.5, 0, { seg: 4 }),
      box("#ffffff", 0.2, 0.2, 0.03, 0.4),
      cyl("#e8532a", 0.07, 0.035, 0.3, 0.53, { seg: 4 }),
      cyl("#ffffff", 0.02, 0, 0.27, 0.83),
    ],
  },
  {
    key: "fuji",
    name: "Mount Fuji",
    aliases: ["mount fuji", "mt fuji", "fuji", "fujisan"],
    lat: 35.3606, lon: 138.7274, height: 0.14,
    parts: [
      cyl("#6b7fa8", 0.6, 0.1, 0.5, 0, { seg: 28 }),
      cyl("#ffffff", 0.26, 0.1, 0.15, 0.35, { seg: 28 }),
    ],
  },
];

/** Generic monument for places that are not in the catalogue. */
export const GENERIC_PARTS = [
  box("#c9bda0", 0.4, 0.4, 0.1),
  cyl("#d4c6a1", 0.12, 0.06, 0.7, 0.1, { seg: 4 }),
  cyl("#f2c14e", 0.06, 0, 0.15, 0.8, { seg: 4 }),
];

const norm = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

/** Find a catalogue landmark from free text, or null. */
export function findLandmark(text) {
  const q = norm(text);
  if (q.length < 3) return null;
  return (
    LANDMARKS.find((l) => l.aliases.some((a) => a === q)) ??
    LANDMARKS.find((l) =>
      l.aliases.some((a) => q.includes(a) || (q.length >= 4 && a.includes(q)))
    ) ??
    null
  );
}

/** Look up unknown places by name. Returns { name, lat, lon } or null. */
export async function geocode(text) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Geocoder said ${res.status}`);
  const [hit] = await res.json();
  if (!hit) return null;
  return {
    name: String(hit.display_name).split(",")[0].trim() || text,
    lat: Number(hit.lat),
    lon: Number(hit.lon),
  };
}
