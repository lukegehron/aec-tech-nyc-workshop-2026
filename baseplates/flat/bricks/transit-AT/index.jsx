"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Ship, TrainFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseArrivals } from "./gtfs";
import { clock, upcomingFerries } from "./time";
import { FerryPanels, TrainPanels } from "./Panels";

/**
 * Next trains + ferries for the Verizon Executive Education Center at
 * Cornell Tech, Roosevelt Island.
 *
 *  Trains  live: MTA GTFS-Realtime, F/M line feed, Roosevelt Island (B06).
 *          The feed is public, needs no key and allows CORS, so the card
 *          fetches it from the browser.
 *  Ferry   scheduled: NYC Ferry Astoria route, Roosevelt Island landing. Its
 *          realtime feed sends no CORS header, so this uses the bundled
 *          timetable in ./ferrySchedule.js.
 */
const FEED_URL =
  "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm";
const STOP = "B06";

async function loadTrains() {
  const res = await fetch(FEED_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`MTA feed responded ${res.status}`);
  return parseArrivals(await res.arrayBuffer(), STOP);
}

function Heading({ icon: Icon, children, note }) {
  return (
    <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      <Icon className="size-3.5" /> {children}
      <span className="ml-auto font-normal normal-case">{note}</span>
    </h3>
  );
}

function TransitCard({ expanded }) {
  const [trains, setTrains] = useState(null); // { timestamp, arrivals }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(null);

  const refresh = () => {
    setLoading(true);
    setError("");
    loadTrains()
      .then((data) => setTrains(data))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => {
        setNow(new Date());
        setLoading(false);
      });
  };

  // Load once on mount, then tick every 15s so "min" counts down between
  // manual updates. State is only set from async callbacks, never in the body.
  useEffect(() => {
    let live = true;
    loadTrains()
      .then((data) => live && setTrains(data))
      .catch((e) => live && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => {
        if (!live) return;
        setNow(new Date());
        setLoading(false);
      });
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, []);

  const nowSec = now ? now.getTime() / 1000 : 0;
  const limit = expanded ? 6 : 3;
  const cols = expanded ? "grid-cols-2" : "";
  const ferries = now ? upcomingFerries(now) : null;

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">Verizon Executive Center</p>
          <p className="text-xs text-muted-foreground">
            Cornell Tech · Roosevelt Island
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : undefined} />
          Update
        </Button>
      </div>

      <section className="flex flex-col gap-2">
        <Heading icon={TrainFront} note="live">
          Subway · Roosevelt Island
        </Heading>
        {error && (
          <p className="text-xs text-destructive">
            Couldn&apos;t load trains: {error}
          </p>
        )}
        {!trains && loading && (
          <p className="text-xs text-muted-foreground">Loading arrivals…</p>
        )}
        {trains && (
          <TrainPanels
            arrivals={trains.arrivals}
            nowSec={nowSec}
            limit={limit}
            cols={cols}
          />
        )}
      </section>

      {ferries && (
        <section className="flex flex-col gap-2">
          <Heading
            icon={Ship}
            note={`${ferries.weekend ? "weekend" : "weekday"} schedule`}
          >
            NYC Ferry · Astoria route
          </Heading>
          <FerryPanels routes={ferries.routes} limit={limit} cols={cols} />
        </section>
      )}

      <p className="mt-auto text-[11px] text-muted-foreground">
        {trains?.timestamp
          ? `MTA feed as of ${clock(trains.timestamp)}`
          : "Waiting for MTA feed"}
        {" · "}ferry times are scheduled, not live
      </p>
    </div>
  );
}

export const transitAT = {
  id: "transit-AT",
  label: "Roosevelt Island transit",
  cards: [
    {
      id: "roosevelt-island-transit",
      label: "Roosevelt Island transit",
      order: 95,
      span: 1,
      hint: "F/M trains + NYC Ferry",
      Card: TransitCard,
    },
  ],
};
