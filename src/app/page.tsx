// src/app/page.tsx
import ClientStations from "@/components/ClientStations";
import type { Station } from "@/lib/types";
import { headers } from "next/headers";

// Build an absolute origin from the incoming request (works on Vercel + local)
async function getOriginFromHeaders() {
  const h = await headers(); // ← MUST await in your Next version
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

async function fetchStations(): Promise<Station[]> {
  const origin = await getOriginFromHeaders();
  const r = await fetch(`${origin}/api/stations`, { cache: "no-store" });
  if (!r.ok) {
    console.error("fetchStations failed:", r.status, await r.text());
    return [];
  }

  const raw: unknown = await r.json();

  // Accept: array OR { data: [...] } OR { stations: [...] }
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : (typeof raw === "object" &&
        raw !== null &&
        (Array.isArray((raw as { data?: unknown[] }).data) ||
         Array.isArray((raw as { stations?: unknown[] }).stations)))
      ? ((raw as { data?: unknown[]; stations?: unknown[] }).data ??
         (raw as { data?: unknown[]; stations?: unknown[] }).stations ??
         [])
      : [];

  // Normalize to Station[]
  const stations: Station[] = (list as Record<string, unknown>[]).flatMap((o) => {
    // Prefer 4-letter ICAO; if only a 3-letter US code + state exists, prefix K
    let icao =
      (typeof o.station === "string" && o.station) ||
      (typeof o.station_id === "string" && o.station_id) ||
      (typeof (o as Record<string, unknown>).icao === "string" && (o as Record<string, unknown>).icao) ||
      null;

    const code =
      (typeof o.id === "string" && o.id) ||
      (typeof o.code === "string" && o.code) ||
      null;

    if (!icao && code && code.length === 3 && typeof o.state === "string") {
      icao = `K${code.toUpperCase()}`;
    }

    const id = String(icao || code || "").toUpperCase();

    const obj = o as Record<string, unknown>;
    const lat = Number(obj.latitude ?? obj.lat);
    const lon = Number(obj.longitude ?? obj.lon ?? obj.lng);
    if (!id || !Number.isFinite(lat) || !Number.isFinite(lon)) return [];

    return [{
      id,
      name:
        (o.name as string | undefined) ??
        (obj.station_name as string | undefined) ??
        (obj.description as string | undefined),
      city: obj.city as string | undefined,
      state: obj.state as string | undefined,
      latitude: lat,
      longitude: lon,
      elevation: typeof obj.elevation === "number" ? (obj.elevation as number) : null,
    }];
  });

  return stations;
}

export default async function Home() {
  const stations = await fetchStations();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Explore ASOS Stations</h1>
      <p className="text-slate-700">
        Click a marker or search to find a station, then view detailed
        historical weather.
      </p>
      <ClientStations stations={stations} />
    </div>
  );
}
