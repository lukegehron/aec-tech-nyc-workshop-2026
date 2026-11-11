// The styles. Each filter takes ImageData-style `src` ({data,width,height})
// and `amount` (0..1, the user's intensity slider) and returns a Uint8ClampedArray.

import { blur, channel, clamp, gray, hue } from "./helpers";

function newBuf(src) {
  const out = new Uint8ClampedArray(src.data.length);
  for (let i = 3; i < out.length; i += 4) out[i] = 255;
  return out;
}

// Strong where luminance changes: gradient magnitude of a lightly blurred copy.
function edges(src) {
  const { width: w, height: h } = src;
  const g = gray(src.data);
  const b = blur(g, w, h, 1);
  const e = new Float32Array(g.length);
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const i = y * w + x;
      e[i] = Math.hypot(b[i + 1] - b[i - 1], b[i + w] - b[i - w]);
    }
  }
  return e;
}

function pencil(src, amount) {
  const { width: w, height: h } = src;
  const g = gray(src.data);
  const inv = g.map((v) => 255 - v);
  const bl = blur(inv, w, h, 6 + Math.round(amount * 10));
  const out = newBuf(src);
  for (let i = 0; i < g.length; i += 1) {
    // colour-dodge blend gives the classic pencil look
    const v = clamp(bl[i] >= 255 ? 255 : (g[i] * 255) / (255 - bl[i]));
    out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = v;
  }
  return out;
}

function ink(src, amount) {
  const e = edges(src);
  const g = blur(gray(src.data), src.width, src.height, 1);
  const out = newBuf(src);
  const edgeCut = 38 - amount * 28;
  const shadowCut = 40 + amount * 50;
  for (let i = 0; i < e.length; i += 1) {
    const x = i % src.width;
    const y = (i / src.width) | 0;
    const hatch = g[i] < shadowCut * 1.6 && (x + y) % 6 < 2 ? 0 : 255;
    const v = e[i] > edgeCut || g[i] < shadowCut ? 0 : hatch;
    out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = v;
  }
  return out;
}

function popArt(src, amount) {
  const g = blur(gray(src.data), src.width, src.height, 1);
  const palette = [[20, 20, 40], [230, 30, 90], [255, 205, 0], [0, 190, 220], [255, 250, 235]];
  const n = Math.max(3, Math.round(3 + amount * 2));
  const out = newBuf(src);
  for (let i = 0; i < g.length; i += 1) {
    const idx = Math.min(n - 1, Math.floor((g[i] / 256) * n));
    const c = palette[Math.round((idx * (palette.length - 1)) / (n - 1))];
    out[i * 4] = c[0];
    out[i * 4 + 1] = c[1];
    out[i * 4 + 2] = c[2];
  }
  return out;
}

function duotone(src, amount) {
  const g = gray(src.data);
  const a = hue(250 + amount * 80).map((v) => v * 0.25);
  const b = hue(20 + amount * 40).map((v) => 120 + v * 0.5);
  const out = newBuf(src);
  for (let i = 0; i < g.length; i += 1) {
    const t = g[i] / 255;
    for (let c = 0; c < 3; c += 1) out[i * 4 + c] = a[c] + (b[c] - a[c]) * t;
  }
  return out;
}

function neon(src, amount) {
  const e = edges(src);
  const out = newBuf(src);
  const gain = 5 + amount * 9;
  for (let i = 0; i < e.length; i += 1) {
    const v = Math.min(1, (e[i] * gain) / 255);
    const [r, g, b] = hue((i % src.width) * 0.6 + ((i / src.width) | 0) * 0.4);
    out[i * 4] = 12 + r * v;
    out[i * 4 + 1] = 6 + g * v;
    out[i * 4 + 2] = 32 + b * v;
  }
  return out;
}

function pixel(src, amount) {
  const { width: w, height: h, data } = src;
  const block = Math.round(4 + amount * 10);
  const levels = 5;
  const out = newBuf(src);
  for (let by = 0; by < h; by += block) {
    for (let bx = 0; bx < w; bx += block) {
      const sum = [0, 0, 0];
      let n = 0;
      for (let y = by; y < Math.min(h, by + block); y += 1) {
        for (let x = bx; x < Math.min(w, bx + block); x += 1) {
          for (let c = 0; c < 3; c += 1) sum[c] += data[(y * w + x) * 4 + c];
          n += 1;
        }
      }
      const col = sum.map((s) => Math.round((s / n / 255) * (levels - 1)) * (255 / (levels - 1)));
      for (let y = by; y < Math.min(h, by + block); y += 1) {
        for (let x = bx; x < Math.min(w, bx + block); x += 1) {
          const o = (y * w + x) * 4;
          out[o] = col[0];
          out[o + 1] = col[1];
          out[o + 2] = col[2];
        }
      }
    }
  }
  return out;
}

function halftone(src, amount) {
  const { width: w, height: h } = src;
  const g = gray(src.data);
  const cell = Math.round(5 + amount * 6);
  const out = newBuf(src);
  for (let i = 0; i < out.length; i += 4) {
    out[i] = out[i + 1] = out[i + 2] = 245;
  }
  for (let cy = 0; cy < h; cy += cell) {
    for (let cx = 0; cx < w; cx += cell) {
      let s = 0;
      let n = 0;
      for (let y = cy; y < Math.min(h, cy + cell); y += 1) {
        for (let x = cx; x < Math.min(w, cx + cell); x += 1) {
          s += g[y * w + x];
          n += 1;
        }
      }
      const r = (1 - s / n / 255) * cell * 0.72;
      const mx = cx + cell / 2;
      const my = cy + cell / 2;
      for (let y = cy; y < Math.min(h, cy + cell); y += 1) {
        for (let x = cx; x < Math.min(w, cx + cell); x += 1) {
          if (Math.hypot(x + 0.5 - mx, y + 0.5 - my) <= r) {
            const o = (y * w + x) * 4;
            out[o] = 25;
            out[o + 1] = 25;
            out[o + 2] = 60;
          }
        }
      }
    }
  }
  return out;
}

function watercolor(src, amount) {
  const { width: w, height: h, data } = src;
  const r = 2 + Math.round(amount * 4);
  const ch = [0, 1, 2].map((c) => blur(channel(data, c), w, h, r));
  const e = edges(src);
  const out = newBuf(src);
  const step = 24;
  for (let i = 0; i < ch[0].length; i += 1) {
    const paper = 0.92 + 0.08 * Math.sin((i % w) * 1.7) * Math.cos((i / w) * 1.3);
    const dark = Math.min(0.25, (e[i] / 255) * 2.5);
    for (let c = 0; c < 3; c += 1) {
      const q = Math.round(ch[c][i] / step) * step; // flat washes
      const v = 255 - (255 - q) * 0.78; // washed out, paper shows through
      out[i * 4 + c] = clamp(v * paper * (1 - dark));
    }
  }
  return out;
}

export const STYLES = [
  { key: "pencil", label: "Pencil sketch", run: pencil },
  { key: "ink", label: "Ink drawing", run: ink },
  { key: "pop", label: "Pop art", run: popArt },
  { key: "duotone", label: "Duotone", run: duotone },
  { key: "neon", label: "Neon edges", run: neon },
  { key: "pixel", label: "Pixel art", run: pixel },
  { key: "halftone", label: "Halftone", run: halftone },
  { key: "watercolor", label: "Watercolor", run: watercolor },
];
