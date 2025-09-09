import Link from "next/link";
import { notFound } from "next/navigation";         // <-- add this
import StationMeta from "@/components/StationMeta";
import Charts from "@/components/Charts";
import DataTable from "@/components/DataTable";
import type { HistoricalPayload, Station } from "@/lib/types";

async function fetchStations(): Promise<Station[]> {
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/stations`, {
    cache: "force-cache",
  });
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
    const id = (o.id ?? o.station_id ?? o.station ?? o.code) as string | undefined;
    const lat = Number(o.latitude ?? o.lat);
    const lon = Number(o.longitude ?? o.lon ?? o.lng);
    if (!id || !Number.isFinite(lat) || !Number.isFinite(lon)) return [];
    return [{
      id,
      name: (o.name ?? o.station_name ?? o.description) as string | undefined,
      city: o.city as string | undefined,
      state: o.state as string | undefined,
      latitude: lat,
      longitude: lon,
      elevation: typeof o.elevation === "number" ? (o.elevation as number) : null,
    }];
  });

  return stations;
}

async function fetchHistorical(id: string): Promise<HistoricalPayload> {
  const r = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/historical?station=${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );
  // If upstream failed and your API returned an error object, hist.data may be undefined.
  return r.json();
}

export default async function StationPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const [stations, hist] = await Promise.all([
    fetchStations(),
    fetchHistorical(id),
  ]);

  // 1) 404 if station id is unknown
  const s = stations.find((st) => st.id === id);
  if (!s) {
    notFound();
  }

  // 2) 404 if no historical data for this station
  if (!Array.isArray(hist.data) || hist.data.length === 0) {
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