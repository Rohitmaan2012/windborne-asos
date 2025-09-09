import { NextResponse } from "next/server";
import { stationsCache } from "@/lib/cache";
import type { Station } from "@/lib/types";
import { allow } from "@/lib/rateLimiter"; 

const UPSTREAM = "https://sfc.windbornesystems.com/stations";

export async function GET() {
  const cached = stationsCache.get("stations");
  if (cached) return NextResponse.json(cached);

  if (!allow()) {
    return NextResponse.json(
      { error: "rate limited" },
      { status: 429, headers: { "Retry-After": "60" } } // optional nicety
    );
  }

  try {
    const r = await fetch(UPSTREAM, { next: { revalidate: 600 } });
    if (!r.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }

    const raw: unknown = await r.json();
    const list: unknown[] = Array.isArray(raw)
      ? raw
      : (typeof raw === "object" &&
         raw !== null &&
         Array.isArray((raw as { data?: unknown[] }).data))
        ? (raw as { data: unknown[] }).data
        : [];

    const stations: Station[] = (list as Record<string, unknown>[]).flatMap(o => {
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

    stationsCache.set("stations", stations);
    return NextResponse.json(stations);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Fetch failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
