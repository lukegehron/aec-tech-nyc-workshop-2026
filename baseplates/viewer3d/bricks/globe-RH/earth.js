import * as THREE from "three";

// Very coarse continent outlines as [lon, lat]. Cartoon on purpose.
const LAND = [
  // North America
  [[-168,66],[-162,70],[-141,70],[-125,70],[-110,73],[-95,72],[-85,69],[-82,63],[-93,60],[-95,55],[-80,52],[-78,60],[-70,60],[-62,58],[-56,52],[-60,47],[-66,44],[-70,42],[-76,38],[-76,35],[-81,31],[-80,26],[-82,26],[-84,30],[-90,29],[-94,29.5],[-97,26],[-97,21],[-95,18],[-91,19],[-90,21],[-87,21],[-88,16],[-84,15],[-83,10],[-80,8],[-78,8.5],[-80,7.2],[-84,8],[-87,13],[-92,14.5],[-96,16],[-105,20],[-106,23],[-109,26],[-112,31],[-115,30],[-110,23],[-112,25],[-114,28],[-117,32],[-121,35],[-124,40],[-124,47],[-130,54],[-136,58],[-146,61],[-152,59],[-158,57],[-164,55],[-158,59],[-165,62]],
  // Greenland
  [[-55,60],[-45,60],[-20,70],[-20,80],[-40,83],[-60,82],[-72,78],[-58,70]],
  // South America
  [[-78,8.5],[-72,12],[-62,10.5],[-52,5],[-50,0],[-35,-5],[-39,-15],[-48,-26],[-58,-35],[-57,-38],[-65,-41],[-66,-47],[-69,-52],[-68,-55],[-74,-52],[-74,-42],[-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,-1],[-77,4]],
  // Eurasia
  [[-9,37],[-9,43],[-2,43.5],[-1,46],[-4,48],[2,51],[5,53],[9,54],[8,57],[10,58],[12,56],[11,59],[5,59],[5,62],[14,68],[22,70],[30,71],[40,68],[33,66],[41,66],[44,68],[60,69],[70,73],[80,73],[100,77],[115,74],[140,72],[160,70],[180,69],[180,65],[170,60],[163,58],[156,51],[156,57],[150,59],[140,54],[141,48],[135,43],[130,42],[129,35],[126,35],[126,38],[122,40],[118,38],[122,37],[120,32],[122,30],[119,25],[110,20],[108,21],[106,18],[109,12],[105,9],[100,13],[100,8],[103,1.5],[98,8],[98,16],[94,17],[91,22],[87,21],[80,15],[78,8],[73,16],[72,21],[67,24],[62,25],[57,26],[59,22],[52,16],[43,12.5],[39,21],[35,28],[34,31],[36,36],[30,36.5],[27,37],[26,40],[29,41],[23,40],[24,37],[22,37],[19,41],[14,45],[12,45],[16,41],[18,40],[16,38],[12,42],[8,44],[3,43],[0,39],[-1,37],[-5,36]],
  // Africa
  [[-17,21],[-13,28],[-6,36],[10,37],[11,33],[20,31],[32,31],[34,28],[38,20],[43,12],[51,12],[48,5],[40,-3],[40,-15],[35,-24],[32,-29],[27,-34],[19,-35],[15,-27],[12,-17],[13,-8],[9,-1],[9,4],[0,5],[-8,4.5],[-13,8],[-17,14]],
  // Australia
  [[114,-22],[122,-18],[130,-12],[137,-12],[136,-16],[142,-11],[146,-19],[153,-26],[150,-37],[141,-38],[135,-34],[129,-32],[115,-34],[113,-26]],
  // Great Britain, Ireland
  [[-5,50],[1,51],[2,53],[-2,56],[-2,58],[-5,58.5],[-6,56],[-3,54],[-5,52]],
  [[-10,52],[-6,52],[-6,55],[-9,54.5]],
  // Japan
  [[130,32],[134,34],[140,35],[142,39],[141,43],[145,44],[140,45],[139,40],[136,36],[131,34]],
  // Borneo, Sumatra
  [[109,1],[117,7],[119,1],[116,-4],[110,-3]],
  [[95,5],[104,-2],[106,-6],[100,-1]],
  // New Zealand
  [[172,-34],[178,-38],[175,-41],[172,-41]],
  [[172,-41],[174,-42],[170,-46],[167,-46]],
  // Madagascar
  [[44,-25],[49,-15],[50,-13],[47,-25]],
];

const ICE = [
  // Antarctica
  [[-180,-72],[-150,-75],[-120,-73],[-90,-72],[-60,-66],[-30,-72],[0,-70],[40,-68],[80,-66],[120,-66],[160,-70],[180,-72],[180,-90],[-180,-90]],
];

/** An equirectangular, cartoon-flat earth texture. Synchronous — no loader, nothing suspends. */
export function makeEarthTexture() {
  if (typeof document === "undefined") return null;
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const px = ([lon, lat]) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];

  ctx.fillStyle = "#4aa8e8";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  for (let lon = -180; lon <= 180; lon += 30) {
    const [x] = px([lon, 0]);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const [, y] = px([0, lat]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  const draw = (poly, fill, stroke) => {
    ctx.beginPath();
    poly.forEach((p, i) => {
      const [x, y] = px(p);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineJoin = "round";
    ctx.lineWidth = 7;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  };
  LAND.forEach((poly) => draw(poly, "#8fd45a", "#3f8f3a"));
  ICE.forEach((poly) => draw(poly, "#f4f9ff", "#b7d3ea"));

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/**
 * Lat/lon (degrees) → globe frame. The globe's pole is +Z (the scene is Z-up),
 * lon 0 / lat 0 is +X, east is +Y. Returns the surface normal plus a
 * quaternion that stands a Z-up model on the surface, north-up.
 */
export function surfaceFrame(lat, lon) {
  const la = THREE.MathUtils.degToRad(lat);
  const lo = THREE.MathUtils.degToRad(lon);
  const up = new THREE.Vector3(
    Math.cos(la) * Math.cos(lo),
    Math.cos(la) * Math.sin(lo),
    Math.sin(la)
  );
  const east = new THREE.Vector3(-Math.sin(lo), Math.cos(lo), 0);
  const north = new THREE.Vector3().crossVectors(up, east);
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(east, north, up)
  );
  return { up, quaternion };
}
