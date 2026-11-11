// NYC Ferry · Astoria route (AS) · Roosevelt Island landing (stop 25).
//
// Extracted from the published NYC Ferry GTFS (Connexionz, feed_version
// 20261108, valid 2026-11-02 → 2027-12-31). The ferry's realtime feed sends no
// CORS header, so a browser card can't read it — the timetable is bundled here
// instead. Times are local New York time, HH:MM.

export const FERRY_SCHEDULE = {
  weekday: {
    "East 90th St": [
      "07:02", "07:40", "08:18", "08:56", "09:34", "10:12", "11:09", "12:06",
      "13:03", "14:00", "14:57", "15:57", "16:54", "17:33", "18:12", "18:54",
      "19:33", "20:08", "20:47",
    ],
    "Wall St / Pier 11": [
      "06:17", "06:55", "07:33", "08:11", "08:49", "09:27", "10:05", "10:43",
      "11:40", "12:37", "13:34", "14:31", "15:28", "16:28", "17:29", "18:05",
      "18:44", "19:26", "20:05", "20:39",
    ],
  },
  weekend: {
    "East 90th St": [
      "09:41", "10:43", "11:45", "12:47", "13:49", "14:51", "15:53", "16:55",
      "17:57", "18:59", "20:01", "21:03",
    ],
    "Wall St / Pier 11": [
      "09:08", "10:12", "11:14", "12:16", "13:18", "14:20", "15:22", "16:24",
      "17:26", "18:28", "19:30", "20:32",
    ],
  },
};

// Weekdays that run the weekend timetable (calendar_dates.txt).
export const HOLIDAYS = new Set([
  "20261126", "20261127", "20261224", "20261225", "20270101", "20270118",
  "20270215",
]);
