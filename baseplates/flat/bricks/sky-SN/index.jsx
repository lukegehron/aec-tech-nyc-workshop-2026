"use client";

// Sky + sun simulation. A small 3D scene with a procedural sky and a sun you
// can move: either by date / time / latitude (computed with suncalc) or by
// dragging azimuth + elevation by hand. The sun lights the scene and casts
// shadows from a few massing boxes. No network assets.

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import * as SunCalc from "suncalc";

const DEG = Math.PI / 180;

const SKIES = {
  clear: { label: "Clear", turbidity: 2, rayleigh: 1.2 },
  hazy: { label: "Hazy", turbidity: 9, rayleigh: 2.5 },
  overcast: { label: "Overcast", turbidity: 20, rayleigh: 0.5 },
};

const BOXES = [
  { p: [0, 3, 0], s: [4, 6, 4] },
  { p: [7, 1.5, -3], s: [3, 3, 5] },
  { p: [-7, 2, 4], s: [4, 4, 3] },
  { p: [3, 0.75, 8], s: [6, 1.5, 3] },
];

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Sun position (degrees) for a date + local solar-ish hour at a longitude.
function sunFor(dateISO, hour, lat, lng) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const utcMs = Date.UTC(y, m - 1, d) + (hour - lng / 15) * 3600 * 1000;
  const pos = SunCalc.getPosition(new Date(utcMs), lat, lng);
  return { azimuth: pos.azimuth, altitude: pos.altitude };
}

function formatHour(h) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm % 60).padStart(2, "0")}`;
}

function Scene({ azimuth, altitude, sky }) {
  // azimuth: 0 = north (-z), clockwise, east = +x. altitude: degrees above horizon.
  const az = azimuth * DEG;
  const alt = altitude * DEG;
  const dir = [
    Math.sin(az) * Math.cos(alt),
    Math.sin(alt),
    -Math.cos(az) * Math.cos(alt),
  ];
  const up = Math.max(0, Math.min(1, altitude / 15)); // fades near the horizon
  const sunPos = dir.map((v) => v * 60);
  const warm = altitude < 15 ? "#ffb070" : "#fff4e0";
  const overcast = sky === "overcast";

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={dir}
        turbidity={SKIES[sky].turbidity}
        rayleigh={SKIES[sky].rayleigh}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      <ambientLight intensity={0.15 + (overcast ? 0.5 : 0.25) * up} />
      <directionalLight
        position={sunPos}
        color={warm}
        intensity={altitude > 0 ? (overcast ? 0.8 : 2.6) * up : 0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-camera-near={1}
        shadow-camera-far={150}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[60, 64]} />
        <meshStandardMaterial color="#8a9a7b" />
      </mesh>
      {BOXES.map((b, i) => (
        <mesh key={i} position={b.p} castShadow receiveShadow>
          <boxGeometry args={b.s} />
          <meshStandardMaterial color="#e8e4dc" />
        </mesh>
      ))}
      {altitude > -5 && (
        <mesh position={sunPos}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial color="#fff2b0" toneMapped={false} />
        </mesh>
      )}
    </>
  );
}

function Slider({ label, value, min, max, step, onChange, display }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-w-0 flex-1"
      />
      <span className="w-14 text-right tabular-nums">{display}</span>
    </label>
  );
}

function NumberField({ label, value, min, max, onChange }) {
  return (
    <label className="flex items-center gap-1">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={0.1}
        value={value}
        onChange={(e) =>
          onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))
        }
        className="w-16 rounded border bg-background px-1 py-0.5"
      />
    </label>
  );
}

function ModeButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2 py-1 ${active ? "bg-baseplate text-white" : "border"}`}
    >
      {children}
    </button>
  );
}

function SkyCard({ expanded }) {
  const [manual, setManual] = useState(false);
  const [date, setDate] = useState(todayISO);
  const [hour, setHour] = useState(15);
  const [lat, setLat] = useState(40.7);
  const [lng, setLng] = useState(-74);
  const [manAz, setManAz] = useState(180);
  const [manAlt, setManAlt] = useState(45);
  const [sky, setSky] = useState("clear");

  const computed = sunFor(date || todayISO(), hour, lat, lng);
  const azimuth = manual ? manAz : computed.azimuth;
  const altitude = manual ? manAlt : computed.altitude;

  return (
    <div className="flex h-full flex-col gap-2">
      <div
        className={`relative min-h-0 flex-1 overflow-hidden rounded-md border bg-muted ${
          expanded ? "min-h-96" : "min-h-56"
        }`}
      >
        <Canvas shadows camera={{ position: [18, 10, 22], fov: 50 }}>
          <Scene azimuth={azimuth} altitude={altitude} sky={sky} />
          <OrbitControls
            target={[0, 2, 0]}
            maxPolarAngle={Math.PI / 2 - 0.02}
            enableDamping
          />
        </Canvas>
        <p className="pointer-events-none absolute left-2 top-2 rounded bg-background/80 px-2 py-0.5 text-xs tabular-nums">
          sun {Math.round(azimuth)}° az · {Math.round(altitude)}° alt
          {altitude <= 0 ? " · below horizon" : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <ModeButton active={!manual} onClick={() => setManual(false)}>
          Date &amp; time
        </ModeButton>
        <ModeButton active={manual} onClick={() => setManual(true)}>
          Manual
        </ModeButton>
        <span className="ml-2 text-muted-foreground">Sky</span>
        {Object.entries(SKIES).map(([key, s]) => (
          <ModeButton key={key} active={sky === key} onClick={() => setSky(key)}>
            {s.label}
          </ModeButton>
        ))}
      </div>

      {manual ? (
        <div className="flex flex-col gap-1">
          <Slider label="Azimuth" value={manAz} min={0} max={360} step={1}
            onChange={setManAz} display={`${manAz}°`} />
          <Slider label="Elevation" value={manAlt} min={-10} max={90} step={1}
            onChange={setManAlt} display={`${manAlt}°`} />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <Slider label="Time" value={hour} min={0} max={23.75} step={0.25}
            onChange={setHour} display={formatHour(hour)} />
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="flex items-center gap-1">
              <span className="text-muted-foreground">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded border bg-background px-1 py-0.5"
              />
            </label>
            <NumberField label="Lat" value={lat} min={-90} max={90} onChange={setLat} />
            <NumberField label="Lng" value={lng} min={-180} max={180} onChange={setLng} />
          </div>
        </div>
      )}
    </div>
  );
}

export const skySN = {
  id: "sky-SN",
  label: "Sky & sun",
  cards: [
    {
      id: "sky-sun",
      label: "Sky & sun",
      order: 92,
      span: 2,
      hint: "move the sun · orbit the scene",
      Card: SkyCard,
    },
  ],
};
