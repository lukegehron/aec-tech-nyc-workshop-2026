// A procedural brick material (albedo, normal, roughness, height) drawn to
// canvases, so the viewer can be tried without uploading anything.

const S = 256;

function canvas() {
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  return c;
}

// Brick layout shared by every map. 4 courses x 2 bricks, running bond.
function eachBrick(fn) {
  const rows = 4;
  const bw = S / 2;
  const bh = S / rows;
  for (let r = 0; r < rows; r += 1) {
    const off = r % 2 ? bw / 2 : 0;
    for (let c = -1; c < 3; c += 1) fn(c * bw + off, r * bh, bw, bh, r * 7 + c);
  }
}

const gap = 6;
const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function heightCanvas() {
  const c = canvas();
  const g = c.getContext("2d");
  g.fillStyle = "#000";
  g.fillRect(0, 0, S, S);
  eachBrick((x, y, w, h, id) => {
    const v = 190 + Math.floor(hash(id) * 50);
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(x + gap / 2, y + gap / 2, w - gap, h - gap);
  });
  for (let i = 0; i < 1800; i += 1) {
    const v = Math.floor(hash(i) * 255);
    g.fillStyle = `rgba(${v},${v},${v},0.12)`;
    g.fillRect(hash(i + 1) * S, hash(i + 2) * S, 2, 2);
  }
  return c;
}

function albedoCanvas() {
  const c = canvas();
  const g = c.getContext("2d");
  g.fillStyle = "#b9b4a8"; // mortar
  g.fillRect(0, 0, S, S);
  eachBrick((x, y, w, h, id) => {
    const l = 32 + hash(id) * 14;
    g.fillStyle = `hsl(${10 + hash(id + 3) * 14}, 48%, ${l}%)`;
    g.fillRect(x + gap / 2, y + gap / 2, w - gap, h - gap);
  });
  return c;
}

function roughnessCanvas() {
  const c = canvas();
  const g = c.getContext("2d");
  g.fillStyle = "#f2f2f2"; // mortar: very rough
  g.fillRect(0, 0, S, S);
  eachBrick((x, y, w, h, id) => {
    const v = 120 + Math.floor(hash(id + 5) * 60);
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(x + gap / 2, y + gap / 2, w - gap, h - gap);
  });
  return c;
}

// Normal map from a height canvas (Sobel-ish central differences, wrapping).
function normalCanvas(height) {
  const src = height.getContext("2d").getImageData(0, 0, S, S).data;
  const c = canvas();
  const g = c.getContext("2d");
  const out = g.createImageData(S, S);
  const h = (x, y) => src[(((y + S) % S) * S + ((x + S) % S)) * 4] / 255;
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * 3;
      const dy = (h(x, y + 1) - h(x, y - 1)) * 3;
      const len = Math.hypot(dx, dy, 1);
      const o = (y * S + x) * 4;
      out.data[o] = ((-dx / len) * 0.5 + 0.5) * 255;
      out.data[o + 1] = ((dy / len) * 0.5 + 0.5) * 255; // +Y up (OpenGL)
      out.data[o + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      out.data[o + 3] = 255;
    }
  }
  g.putImageData(out, 0, 0);
  return c;
}

export function makeSample() {
  const height = heightCanvas();
  return {
    map: albedoCanvas().toDataURL(),
    normalMap: normalCanvas(height).toDataURL(),
    roughnessMap: roughnessCanvas().toDataURL(),
    bumpMap: height.toDataURL(),
  };
}
