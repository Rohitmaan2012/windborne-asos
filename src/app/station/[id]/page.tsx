// src/app/station/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import StationMeta from "@/components/StationMeta";
import Charts from "@/components/Charts";
import DataTable from "@/components/DataTable";
import type { HistoricalPayload, Station } from "@/lib/types";
import { headers } from "next/headers";

async function getOriginFromHeaders() {
  const h = await headers(); // ← MUST await in your Next version
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

async function fetchStations(): Promise<Station[]> {
  const origin = await getOriginFromHeaders();
  const r = await fetch(`${origin}/api/stations`, { cache: "force-cache" });
  if (!r.ok) return [];

  const raw: unknown = await r.json();

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

  const stations: Station[] = (list as Record<string, unknown>[]).flatMap((o) => {
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

async function fetchHistorical(id: string): Promise<HistoricalPayload> {
  const origin = await getOriginFromHeaders();
  const r = await fetch(
    `${origin}/api/historical?station=${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );
  return r.json();
}

// Next 15: params is a Promise for dynamic segments
export default async function StationPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [stations, hist] = await Promise.all([
    fetchStations(),
    fetchHistorical(id),
  ]);

  const s = stations.find((st) => st.id.toUpperCase() === id.toUpperCase());

  if (!s || !Array.isArray(hist.data) || hist.data.length === 0) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-blue-600 underline">
        ← Back to map
      </Link>

      <StationMeta s={s} />

      {hist.warnings?.length ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">
          <div className="font-medium">Data warnings</div>
          <ul className="list-disc pl-5">
            {hist.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Charts data={hist.data} />

      <div>
        <h3 className="mt-6 mb-2 text-lg font-semibold">Raw Data</h3>
        <DataTable data={hist.data} />
      </div>
    </div>
  );
}
