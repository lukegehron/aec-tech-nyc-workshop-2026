// Warm paper: laid once onto a fresh (pure white) canvas.

const PAPER = [238, 224, 198]; // warm cream

// Fresh canvas = pure white in two opposite corners (paper never is).
export function isBlankCanvas(g) {
  const { width, height } = g.canvas;
  const white = (x, y) => {
    const d = g.getImageData(x, y, 1, 1).data;
    return d[0] === 255 && d[1] === 255 && d[2] === 255;
  };
  return white(0, 0) && white(width - 1, height - 1);
}

export function layPaper(p, g) {
  const { width, height } = g.canvas; // device pixels

  // Grain: per-pixel tone variation plus low-frequency mottling.
  const tex = document.createElement("canvas");
  tex.width = width;
  tex.height = height;
  const tg = tex.getContext("2d");
  const img = tg.createImageData(width, height);
  const d = img.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const mottle = p.noise(x * 0.004, y * 0.004) * 22 - 11;
      const grain = (Math.random() - 0.5) * 14;
      const v = mottle + grain;
      const i = (y * width + x) * 4;
      d[i] = PAPER[0] + v;
      d[i + 1] = PAPER[1] + v;
      d[i + 2] = PAPER[2] + v * 1.1;
      d[i + 3] = 255;
    }
  }
  tg.putImageData(img, 0, 0);

  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = "multiply";
  g.drawImage(tex, 0, 0);

  // A few faint fibres.
  g.lineCap = "round";
  for (let i = 0; i < 260; i++) {
    let x = Math.random() * width;
    let y = Math.random() * height;
    let a = Math.random() * Math.PI * 2;
    g.strokeStyle = `rgba(150,120,85,${0.05 + Math.random() * 0.08})`;
    g.lineWidth = 0.5 + Math.random();
    g.beginPath();
    g.moveTo(x, y);
    const len = 6 + Math.random() * 18;
    for (let s = 0; s < len; s++) {
      a += (Math.random() - 0.5) * 0.5;
      x += Math.cos(a) * 1.5;
      y += Math.sin(a) * 1.5;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  g.restore();
}
