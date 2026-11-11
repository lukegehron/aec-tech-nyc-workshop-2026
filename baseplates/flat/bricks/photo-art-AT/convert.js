// Pure pixel maths for the Photo → Art card. No React in here, so it's easy to
// read on its own: sample the photo down to a grid, then paint that grid as
// either characters (ASCII) or blocks (pixel art).

export const ASCII_RAMP = "@%#*+=-:. "; // dense → sparse (dark → light)
const OUTPUT_WIDTH = 640; // px — the canvas's internal width

export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? "");
  if (!m) return { r: 0, g: 0, b: 0 };
  const n = Number.parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }) {
  const h = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

const luminance = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const posterize = (v, levels) =>
  levels >= 256 ? v : Math.round((v / 255) * (levels - 1)) * (255 / (levels - 1));
const mix = (a, b, t) => a + (b - a) * t;

/**
 * Shrink the image to `cols` × rows cells and return per-cell colour + light.
 * ASCII cells are twice as tall as wide (characters are), pixel cells square.
 */
export function sampleImage(img, { mode, cols, contrast }) {
  const aspect = img.naturalHeight / img.naturalWidth;
  const rows = Math.max(1, Math.round(cols * aspect * (mode === "ascii" ? 0.5 : 1)));
  const c = document.createElement("canvas");
  c.width = cols;
  c.height = rows;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.imageSmoothingQuality = "high";
  g.drawImage(img, 0, 0, cols, rows);
  const { data } = g.getImageData(0, 0, cols, rows);

  const k = contrast; // 1 = unchanged
  const cells = new Array(cols * rows);
  for (let i = 0; i < cells.length; i++) {
    const adj = (v) => clamp((v - 128) * k + 128, 0, 255);
    const r = adj(data[i * 4]);
    const gg = adj(data[i * 4 + 1]);
    const b = adj(data[i * 4 + 2]);
    cells[i] = { r, g: gg, b, l: luminance(r, gg, b) };
  }
  return { cols, rows, cells };
}

/**
 * Paint a sampled grid onto `canvas`. Returns the ASCII text (or "" for pixel).
 *
 *   palette   "original" — the photo's own colours
 *             "duotone"  — every cell mixes Ink (dark) → Paper (light)
 */
export function render(canvas, grid, { mode, levels, palette, ink, paper, invert }) {
  const { cols, rows, cells } = grid;
  const cell = OUTPUT_WIDTH / cols;
  const cellH = mode === "ascii" ? cell * 2 : cell;
  canvas.width = OUTPUT_WIDTH;
  canvas.height = Math.round(rows * cellH);

  const g = canvas.getContext("2d");
  const inkRgb = hexToRgb(ink);
  const paperRgb = hexToRgb(paper);
  g.fillStyle = paper;
  g.fillRect(0, 0, canvas.width, canvas.height);

  const colourOf = (c) => {
    if (palette === "original") {
      return `rgb(${posterize(c.r, levels)},${posterize(c.g, levels)},${posterize(c.b, levels)})`;
    }
    const t = posterize((invert ? 1 - c.l : c.l) * 255, levels) / 255;
    return `rgb(${mix(inkRgb.r, paperRgb.r, t)},${mix(inkRgb.g, paperRgb.g, t)},${mix(inkRgb.b, paperRgb.b, t)})`;
  };

  if (mode === "pixel") {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        g.fillStyle = colourOf(cells[y * cols + x]);
        // +0.5 overlaps neighbours slightly so no hairline seams show.
        g.fillRect(x * cell, y * cellH, cell + 0.5, cellH + 0.5);
      }
    }
    return "";
  }

  // ASCII: the character carries the light; colour is ink or the photo's own.
  g.font = `${cellH}px ui-monospace, Menlo, Consolas, monospace`;
  g.textBaseline = "top";
  const charW = g.measureText("M").width || cell;
  const squeeze = cell / charW; // fit monospace glyphs into square-ish cells
  const lines = [];
  for (let y = 0; y < rows; y++) {
    let line = "";
    for (let x = 0; x < cols; x++) {
      const c = cells[y * cols + x];
      const l = invert ? 1 - c.l : c.l;
      const ch = ASCII_RAMP[Math.min(ASCII_RAMP.length - 1, Math.floor(l * ASCII_RAMP.length))];
      line += ch;
      if (ch === " ") continue;
      g.fillStyle = palette === "original" ? colourOf(c) : ink;
      g.save();
      g.translate(x * cell, y * cellH);
      g.scale(squeeze, 1);
      g.fillText(ch, 0, 0);
      g.restore();
    }
    lines.push(line.trimEnd());
  }
  return lines.join("\n");
}

/** Read one pixel of a canvas at a client-space click position. */
export function pickFromCanvas(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(((event.clientX - rect.left) / rect.width) * canvas.width);
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * canvas.height);
  const g = canvas.getContext("2d", { willReadFrequently: true });
  const [r, gg, b] = g.getImageData(clamp(x, 0, canvas.width - 1), clamp(y, 0, canvas.height - 1), 1, 1).data;
  return rgbToHex({ r, g: gg, b });
}
