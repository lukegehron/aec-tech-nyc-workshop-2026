import { FERRY_SCHEDULE, HOLIDAYS } from "./ferrySchedule";

export const TZ = "America/New_York";

// The parts of "now" in New York, regardless of the viewer's own timezone.
function nyParts(date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return {
    ymd: `${parts.year}${parts.month}${parts.day}`,
    weekday: parts.weekday,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

/** Remaining ferry departures today, per destination, with minutes-until. */
export function upcomingFerries(now) {
  const { ymd, weekday, minutes } = nyParts(now);
  const weekend = weekday === "Sat" || weekday === "Sun" || HOLIDAYS.has(ymd);
  const table = weekend ? FERRY_SCHEDULE.weekend : FERRY_SCHEDULE.weekday;
  return {
    weekend,
    routes: Object.entries(table).map(([headsign, times]) => ({
      headsign,
      next: times
        .map((t) => {
          const [h, m] = t.split(":").map(Number);
          return { t, mins: h * 60 + m - minutes };
        })
        .filter((x) => x.mins >= 0),
    })),
  };
}

/** POSIX seconds → "3:42 PM" in New York. */
export const clock = (seconds) =>
  new Date(seconds * 1000).toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  });

/** "14:57" → "2:57 PM". */
export const to12h = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
