import type { Station } from "@/lib/types";
import ClientStations from "@/components/ClientStations";

async function fetchStations(): Promise<Station[]> {
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/stations`, {
    cache: "no-store",
  });
  const raw: unknown = await r.json();

  // Accept array or { data: [...] } or { stations: [...] }
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

  // Produce Station[] directly
  const stations: Station[] = (list as Record<string, unknown>[]).flatMap((o) => {
    const id =
      (o.id ?? o.station_id ?? o.station ?? o.code) as string | undefined;
    const lat = Number(o.latitude ?? o.lat);
    const lon = Number(o.longitude ?? o.lon ?? o.lng);

    if (!id || !Number.isFinite(lat) || !Number.isFinite(lon)) return [];

    const station: Station = {
      id,
      name: (o.name ?? o.station_name ?? o.description) as string | undefined,
      city: o.city as string | undefined,
      state: o.state as string | undefined,
      latitude: lat,
      longitude: lon,
      elevation:
        typeof o.elevation === "number" ? (o.elevation as number) : null,
    };

    return [station];
  });

  return stations;
}

export default async function Home() {
  const stations = await fetchStations();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Explore ASOS Stations</h1>
      <p className="text-slate-700">
        Click a marker or search to find a station, then view detailed historical weather.
      </p>
      <ClientStations stations={stations} />
    </div>
  );
}
