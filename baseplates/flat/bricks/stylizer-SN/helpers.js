// Pixel helpers for the image stylizer. Pure functions, no React.

export const MAX_W = 420; // the source is scaled down to this width

export const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

// Luminance 0..255 per pixel.
export function gray(d) {
  const g = new Float32Array(d.length / 4);
  for (let i = 0; i < g.length; i += 1) {
    const o = i * 4;
    g[i] = 0.299 * d[o] + 0.587 * d[o + 1] + 0.114 * d[o + 2];
  }
  return g;
}

// One channel of RGBA data as a Float32Array.
export function channel(d, c) {
  const a = new Float32Array(d.length / 4);
  for (let i = 0; i < a.length; i += 1) a[i] = d[i * 4 + c];
  return a;
}

// Separable box blur with clamped edges.
export function blur(src, w, h, r) {
  if (r < 1) return src.slice();
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const k = 2 * r + 1;
  const cx = (x) => Math.min(w - 1, Math.max(0, x));
  const cy = (y) => Math.min(h - 1, Math.max(0, y));
  for (let y = 0; y < h; y += 1) {
    const row = y * w;
    let sum = 0;
    for (let x = -r; x <= r; x += 1) sum += src[row + cx(x)];
    for (let x = 0; x < w; x += 1) {
      tmp[row + x] = sum / k;
      sum += src[row + cx(x + r + 1)] - src[row + cx(x - r)];
    }
  }
  for (let x = 0; x < w; x += 1) {
    let sum = 0;
    for (let y = -r; y <= r; y += 1) sum += tmp[cy(y) * w + x];
    for (let y = 0; y < h; y += 1) {
      out[y * w + x] = sum / k;
      sum += tmp[cy(y + r + 1) * w + x] - tmp[cy(y - r) * w + x];
    }
  }
  return out;
}

// Fully saturated colour for a hue in degrees.
export function hue(deg) {
  const f = (n) => {
    const k = (n + deg / 30) % 12;
    return 255 * (0.5 - 0.5 * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return [f(0), f(8), f(4)];
}

// Draws a small procedural landscape so the tool can be tried without a file.
export function drawSample(canvas) {
  const w = MAX_W;
  const h = 280;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#1e3a8a");
  sky.addColorStop(0.6, "#f97316");
  sky.addColorStop(1, "#fde68a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff7cc";
  ctx.beginPath();
  ctx.arc(300, 150, 42, 0, Math.PI * 2);
  ctx.fill();
  [["#7c2d12", 190, 60], ["#431407", 215, 90], ["#1c1917", 240, 70]].forEach(([c, y, a], i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 10) ctx.lineTo(x, y + Math.sin(x * 0.02 + i * 2) * a * 0.4);
    ctx.lineTo(w, h);
    ctx.fill();
  });
  ctx.fillStyle = "#0c0a09";
  for (let i = 0; i < 9; i += 1) {
    ctx.fillRect(30 + i * 44, 236 - (i % 3) * 14, 6, 44);
    ctx.beginPath();
    ctx.arc(33 + i * 44, 232 - (i % 3) * 14, 15, 0, Math.PI * 2);
    ctx.fill();
  }
}
