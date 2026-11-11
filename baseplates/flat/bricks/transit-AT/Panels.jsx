"use client";

import { clock, to12h } from "./time";

const DIRECTIONS = {
  S: { label: "Manhattan-bound", sub: "to 63 St · Lexington Av" },
  N: { label: "Queens-bound", sub: "to 21 St · Queensbridge" },
};

function Minutes({ mins }) {
  return (
    <span className="ml-auto font-heading text-base font-semibold tabular-nums">
      {mins <= 0 ? "now" : `${mins} min`}
    </span>
  );
}

function Box({ title, sub, empty, children }) {
  return (
    <div className="rounded-lg border p-2">
      <p className="font-medium">{title}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      {empty ? (
        <p className="mt-1 text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-1 flex flex-col gap-1">{children}</ul>
      )}
    </div>
  );
}

export function TrainPanels({ arrivals, nowSec, limit, cols }) {
  return (
    <div className={`grid gap-2 ${cols}`}>
      {Object.entries(DIRECTIONS).map(([dir, info]) => {
        const list = arrivals
          .filter((a) => a.stopId.endsWith(dir) && a.time >= nowSec - 30)
          .slice(0, limit);
        return (
          <Box
            key={dir}
            title={info.label}
            sub={info.sub}
            empty={list.length === 0 && "No trains reported"}
          >
            {list.map((a) => (
              <li
                key={`${a.route}-${a.time}-${a.stopId}`}
                className="flex items-center gap-2"
              >
                {/* F and M are both IND Sixth Avenue — orange bullets. */}
                <span className="flex size-5 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">
                  {a.route}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {clock(a.time)}
                </span>
                <Minutes mins={Math.round((a.time - nowSec) / 60)} />
              </li>
            ))}
          </Box>
        );
      })}
    </div>
  );
}

export function FerryPanels({ routes, limit, cols }) {
  return (
    <div className={`grid gap-2 ${cols}`}>
      {routes.map((f) => (
        <Box
          key={f.headsign}
          title={`to ${f.headsign}`}
          empty={f.next.length === 0 && "No more departures today"}
        >
          {f.next.slice(0, limit).map((x) => (
            <li key={x.t} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {to12h(x.t)}
              </span>
              <Minutes mins={x.mins} />
            </li>
          ))}
        </Box>
      ))}
    </div>
  );
}
