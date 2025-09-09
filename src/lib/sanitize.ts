import type { HistoricalRecord, HistoricalPayload } from "./types";

type Dict = Record<string, unknown>;

const isDict = (v: unknown): v is Dict =>
  typeof v === "object" && v !== null;

const isISOTime = (v: unknown): v is string =>
  typeof v === "string" && !Number.isNaN(Date.parse(v));

// Only accept finite numbers (reject NaN/±Infinity)
const numFiniteOrNull = (v: unknown): v is number | null =>
  v === null || (typeof v === "number" && Number.isFinite(v));

export function sanitizeHistorical(raw: unknown): HistoricalPayload {
  const warnings: string[] = [];

  // Accept array or a few common container shapes: {data}, {points}, {observations}, {records}
  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (isDict(raw)) {
    const obj = raw as {
      data?: unknown;
      points?: unknown;
      observations?: unknown;
      records?: unknown;
    };
    if (Array.isArray(obj.data)) list = obj.data;
    else if (Array.isArray(obj.points)) list = obj.points;
    else if (Array.isArray(obj.observations)) list = obj.observations;
    else if (Array.isArray(obj.records)) list = obj.records;
  }

  if (list.length === 0) {
    warnings.push("Upstream returned no data for this station.");
  }

  const cleaned: HistoricalRecord[] = list.flatMap((item) => {
    if (!isDict(item)) {
      warnings.push("Dropped a corrupted record (not an object).");
      return [];
    }

    // Timestamp: accept strings parseable by Date.parse (e.g., '2025-08-30 21:51')
    const ts = item["timestamp"];
    if (!isISOTime(ts)) {
      warnings.push("Dropped a corrupted record (bad timestamp).");
      return [];
    }

    // Temperature / pressure / precip straight through if finite
    const temperature = numFiniteOrNull(item["temperature"])
      ? (item["temperature"] as number | null)
      : null;

    const pressure = numFiniteOrNull(item["pressure"])
      ? (item["pressure"] as number | null)
      : null;

    const precip = numFiniteOrNull(item["precip"])
      ? (item["precip"] as number | null)
      : null;

    // Wind speed: prefer wind_speed; otherwise wind; otherwise derive from wind_x/wind_y
    let wind_speed: number | null = null;
    if (numFiniteOrNull(item["wind_speed"])) {
      wind_speed = item["wind_speed"] as number | null;
    } else if (numFiniteOrNull(item["wind"])) {
      wind_speed = item["wind"] as number | null;
    } else {
      const wx = numFiniteOrNull(item["wind_x"]) ? (item["wind_x"] as number) : null;
      const wy = numFiniteOrNull(item["wind_y"]) ? (item["wind_y"] as number) : null;
      if (wx !== null && wy !== null) {
        // magnitude of vector (m/s or kt depending on upstream; we just plot consistently)
        wind_speed = Math.hypot(wx, wy);
      }
    }

    // Wind gust: pass through if provided, otherwise null
    const wind_gust = numFiniteOrNull(item["wind_gust"])
      ? (item["wind_gust"] as number | null)
      : null;

    const rec: HistoricalRecord = {
      timestamp: ts,
      temperature,
      wind_speed,
      wind_gust,
      pressure,
      precip,
    };

    return [rec];
  });

  return { data: cleaned, warnings };
}