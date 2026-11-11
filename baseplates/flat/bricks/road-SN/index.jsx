"use client";

// Traffic road maker: a top-down road with 1–4 traffic lanes, optional bike
// lanes and sidewalks. Click a lane to place a vehicle, click a vehicle to
// remove it, or let the randomizer scatter them without overlaps.
// Saved per browser via useCardState.

import { useRef } from "react";
import { useCardState } from "../../storage";

const W = 640;
const MARGIN = 16;
const LANE_H = 36;
const BIKE_H = 24;
const WALK_H = 22;
const GAP = 10;
const KINDS = {
  car: { label: "Car", len: 44, wid: 22, on: "lane" },
  truck: { label: "Truck", len: 76, wid: 26, on: "lane" },
  bike: { label: "Bike", len: 22, wid: 8, on: "bike" },
};
const COLORS = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#e5e7eb", "#1f2937"];

// Rows from top to bottom. Lanes above the median travel left, the rest right.
function buildRows(lanes, bike, walk) {
  const rows = [];
  let y = MARGIN;
  const add = (id, type, h, dir) => {
    rows.push({ id, type, h, y, dir });
    y += h;
  };
  const leftCount = Math.floor(lanes / 2);
  if (walk) add("walk-top", "walk", WALK_H, 0);
  if (bike) add("bike-top", "bike", BIKE_H, -1);
  for (let i = 0; i < lanes; i += 1) {
    add(`lane-${i}`, "lane", LANE_H, i < leftCount ? -1 : 1);
  }
  if (bike) add("bike-bottom", "bike", BIKE_H, 1);
  if (walk) add("walk-bottom", "walk", WALK_H, 0);
  return { rows, height: y + MARGIN, leftCount };
}

function overlaps(cars, rowId, x, len, ignoreId) {
  return cars.some((c) => {
    if (c.row !== rowId || c.id === ignoreId) return false;
    return Math.abs(c.x - x) < (len + KINDS[c.kind].len) / 2 + GAP;
  });
}

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomVehicles(count, rows, truckShare) {
  const laneRows = rows.filter((r) => r.type === "lane");
  const bikeRows = rows.filter((r) => r.type === "bike");
  const out = [];
  const tryPlace = (kind, row) => {
    const len = KINDS[kind].len;
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const x = len / 2 + 6 + Math.random() * (W - len - 12);
      if (!overlaps(out, row.id, x, len)) {
        out.push({ id: newId(), row: row.id, x, kind, color: pick(COLORS) });
        return;
      }
    }
  };
  for (let i = 0; i < count; i += 1) {
    tryPlace(Math.random() < truckShare ? "truck" : "car", pick(laneRows));
  }
  // A few cyclists per bike lane, when there are any.
  bikeRows.forEach((row) => {
    const n = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i += 1) tryPlace("bike", row);
  });
  return out;
}

function Vehicle({ car, dir, y }) {
  const { len, wid } = KINDS[car.kind];
  const nose = dir * (len / 2);
  if (car.kind === "bike") {
    return (
      <g transform={`translate(${car.x} ${y})`}>
        <circle cx={-len / 2 + 4} cy={0} r={4} fill="none" stroke="#111827" strokeWidth={1.5} />
        <circle cx={len / 2 - 4} cy={0} r={4} fill="none" stroke="#111827" strokeWidth={1.5} />
        <line x1={-len / 2 + 4} y1={0} x2={len / 2 - 4} y2={0} stroke={car.color} strokeWidth={2.5} />
        <circle cx={0} cy={-2} r={2.5} fill={car.color} />
      </g>
    );
  }
  return (
    <g transform={`translate(${car.x} ${y})`}>
      <rect x={-len / 2} y={-wid / 2} width={len} height={wid} rx={6} fill={car.color} stroke="#111827" strokeWidth={1} />
      <rect x={dir * len * 0.08 - len * 0.2} y={-wid / 2 + 3} width={len * 0.4} height={wid - 6} rx={3} fill="#bfdbfe" opacity={0.85} />
      <circle cx={nose - dir * 4} cy={-wid / 2 + 4} r={2} fill="#fde047" />
      <circle cx={nose - dir * 4} cy={wid / 2 - 4} r={2} fill="#fde047" />
    </g>
  );
}

function Btn({ active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-xs disabled:opacity-40 ${
        active ? "bg-baseplate text-white" : "border"
      }`}
    >
      {children}
    </button>
  );
}

function RoadCard({ expanded }) {
  const svgRef = useRef(null);
  const [lanes, setLanes] = useCardState("road2-lanes", 2);
  const [bike, setBike] = useCardState("road2-bike", false);
  const [walk, setWalk] = useCardState("road2-walk", false);
  const [cars, setCars] = useCardState("road2-vehicles", []);
  const [kind, setKind] = useCardState("road2-kind", "car");
  const [count, setCount] = useCardState("road2-count", 8);
  const [truckShare, setTruckShare] = useCardState("road2-truckShare", 15);

  const { rows, height: H, leftCount } = buildRows(lanes, bike, walk);
  const rowById = Object.fromEntries(rows.map((r) => [r.id, r]));
  // Hide vehicles whose row no longer exists (road narrowed, bike lane off).
  const visible = cars.filter((c) => rowById[c.row]);
  const laneRows = rows.filter((r) => r.type === "lane");
  const roadRows = rows.filter((r) => r.type !== "walk");
  const roadTop = roadRows[0].y;
  const lastRow = roadRows[roadRows.length - 1];
  const roadBottom = lastRow.y + lastRow.h;

  function onPlace(event) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * W;
    const y = ((event.clientY - rect.top) / rect.height) * H;
    const row = rows.find((r) => y >= r.y && y < r.y + r.h);
    if (!row || row.type === "walk") return;
    const spec = KINDS[kind];
    // Cars and trucks go in traffic lanes; bikes go in bike lanes.
    if (spec.on !== row.type) return;
    const cx = Math.max(spec.len / 2 + 2, Math.min(W - spec.len / 2 - 2, x));
    if (overlaps(cars, row.id, cx, spec.len)) return;
    setCars((current) => [
      ...current,
      { id: newId(), row: row.id, x: cx, kind, color: pick(COLORS) },
    ]);
  }

  function removeVehicle(event, id) {
    event.stopPropagation();
    setCars((current) => current.filter((c) => c.id !== id));
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Lanes</span>
        {[1, 2, 3, 4].map((n) => (
          <Btn key={n} active={lanes === n} onClick={() => setLanes(n)}>
            {n}
          </Btn>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">Add</span>
        <Btn active={bike} onClick={() => setBike(!bike)}>
          Bike lanes
        </Btn>
        <Btn active={walk} onClick={() => setWalk(!walk)}>
          Sidewalks
        </Btn>
        <span className="ml-2 text-xs text-muted-foreground">Place</span>
        {Object.entries(KINDS).map(([key, k]) => (
          <Btn
            key={key}
            active={kind === key}
            disabled={key === "bike" && !bike}
            onClick={() => setKind(key)}
          >
            {k.label}
          </Btn>
        ))}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        onClick={onPlace}
        role="img"
        aria-label="Road with vehicles. Click a lane to place a vehicle."
        className={`w-full cursor-crosshair rounded-md border ${expanded ? "max-h-[70vh]" : ""}`}
      >
        <rect width={W} height={H} fill="#86a37a" />
        <rect y={roadTop} width={W} height={roadBottom - roadTop} fill="#374151" />
        {rows.map((r) => {
          if (r.type === "walk") {
            return <rect key={r.id} y={r.y} width={W} height={r.h} fill="#d6d3d1" />;
          }
          if (r.type === "bike") {
            return (
              <g key={r.id}>
                <rect y={r.y} width={W} height={r.h} fill="#15803d" opacity={0.8} />
                <text x={8} y={r.y + r.h / 2 + 3} fontSize={9} fill="#ecfdf5">
                  BIKE
                </text>
              </g>
            );
          }
          return null;
        })}
        {/* Dividers between neighbouring rows of the roadway. */}
        {rows.slice(1).map((r, i) => {
          const above = rows[i];
          if (above.type === "walk" || r.type === "walk") return null;
          const median = above.dir !== r.dir;
          const edge = above.type !== r.type;
          return (
            <line
              key={r.id}
              x1={0}
              x2={W}
              y1={r.y}
              y2={r.y}
              stroke={median ? "#facc15" : "#e5e7eb"}
              strokeWidth={median ? 3 : 1.5}
              strokeDasharray={median || edge ? undefined : "14 12"}
            />
          );
        })}
        {visible.map((car) => {
          const row = rowById[car.row];
          return (
            <g
              key={car.id}
              onClick={(e) => removeVehicle(e, car.id)}
              style={{ cursor: "pointer" }}
            >
              <Vehicle car={car} dir={row.dir || 1} y={row.y + row.h / 2} />
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <label className="flex items-center gap-1">
          <span className="text-muted-foreground">Vehicles</span>
          <input
            type="range"
            min={1}
            max={40}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <span className="w-6 tabular-nums">{count}</span>
        </label>
        <label className="flex items-center gap-1">
          <span className="text-muted-foreground">Trucks</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={truckShare}
            onChange={(e) => setTruckShare(Number(e.target.value))}
          />
          <span className="w-8 tabular-nums">{truckShare}%</span>
        </label>
        <Btn
          active
          onClick={() => setCars(randomVehicles(count, rows, truckShare / 100))}
        >
          Randomize
        </Btn>
        <Btn onClick={() => setCars([])}>Clear</Btn>
        <span className="ml-auto text-muted-foreground">
          {visible.length} placed · {laneRows.length} lane
          {laneRows.length === 1 ? "" : "s"}
          {leftCount === 0 ? " (one way)" : ""}
        </span>
      </div>
    </div>
  );
}

export const roadSN = {
  id: "road-SN",
  label: "Traffic road maker",
  cards: [
    {
      id: "road-maker",
      label: "Traffic road",
      order: 93,
      span: 2,
      hint: "up to 4 lanes · bike lanes · sidewalks",
      Card: RoadCard,
    },
  ],
};
