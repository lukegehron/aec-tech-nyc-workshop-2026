// A tiny GTFS-Realtime reader — just enough protobuf to pull arrival times for
// one station out of an MTA feed. No libraries, on purpose (see ../bricks.js).
//
// Field numbers come from gtfs-realtime.proto:
//   FeedMessage   1 header, 2 entity
//   FeedHeader    3 timestamp
//   FeedEntity    3 trip_update
//   TripUpdate    1 trip, 2 stop_time_update
//   TripDescriptor 1 trip_id, 5 route_id
//   StopTimeUpdate 2 arrival, 3 departure, 4 stop_id
//   StopTimeEvent  2 time

function readFields(buf) {
  const fields = [];
  let i = 0;
  // Numbers are built with multiplication, not bit shifts, so 64-bit varints
  // such as POSIX timestamps don't wrap at 32 bits.
  const varint = () => {
    let result = 0;
    let scale = 1;
    let byte;
    do {
      if (i >= buf.length) throw new Error("truncated varint");
      byte = buf[i++];
      result += (byte & 0x7f) * scale;
      scale *= 128;
    } while (byte & 0x80);
    return result;
  };
  while (i < buf.length) {
    const key = varint();
    const field = Math.floor(key / 8);
    const wire = key & 7;
    if (wire === 0) fields.push([field, varint()]);
    else if (wire === 2) {
      const len = varint();
      fields.push([field, buf.subarray(i, i + len)]);
      i += len;
    } else if (wire === 1) i += 8;
    else if (wire === 5) i += 4;
    else throw new Error(`unsupported wire type ${wire}`);
  }
  return fields;
}

const text = new TextDecoder();
const str = (bytes) => text.decode(bytes);

function eventTime(bytes) {
  for (const [f, v] of readFields(bytes)) if (f === 2) return v;
  return null;
}

/**
 * Returns `{ timestamp, arrivals: [{ route, stopId, time }] }` for every stop
 * whose id starts with `stopPrefix` (e.g. "B06" → B06N and B06S).
 */
export function parseArrivals(arrayBuffer, stopPrefix) {
  const root = readFields(new Uint8Array(arrayBuffer));
  let timestamp = null;
  const arrivals = [];

  for (const [field, value] of root) {
    if (field === 1) {
      for (const [f, v] of readFields(value)) if (f === 3) timestamp = v;
      continue;
    }
    if (field !== 2) continue;

    for (const [ef, ev] of readFields(value)) {
      if (ef !== 3) continue; // only trip_update
      let route = "";
      const updates = [];
      for (const [tf, tv] of readFields(ev)) {
        if (tf === 1) {
          for (const [df, dv] of readFields(tv)) if (df === 5) route = str(dv);
        } else if (tf === 2) {
          updates.push(tv);
        }
      }
      for (const update of updates) {
        let stopId = "";
        let arrival = null;
        let departure = null;
        for (const [sf, sv] of readFields(update)) {
          if (sf === 4) stopId = str(sv);
          else if (sf === 2) arrival = eventTime(sv);
          else if (sf === 3) departure = eventTime(sv);
        }
        const time = arrival ?? departure;
        if (stopId.startsWith(stopPrefix) && time) {
          arrivals.push({ route, stopId, time });
        }
      }
    }
  }

  arrivals.sort((a, b) => a.time - b.time);
  return { timestamp, arrivals };
}
