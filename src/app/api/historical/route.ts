import { NextRequest, NextResponse } from "next/server";
import { historicalCache } from "@/lib/cache";
import { allow } from "@/lib/rateLimiter";
import { sanitizeHistorical } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  const station = req.nextUrl.searchParams.get("station");
  if (!station)
    return NextResponse.json({ error: "station required" }, { status: 400 });

  const key = `hist:${station}`;
  const cached = historicalCache.get(key);
  if (cached) return NextResponse.json(cached);

  if (!allow()) {
    return NextResponse.json(
      { error: "Rate limited, try again shortly" },
      { status: 429, headers: { "Retry-After": "5" } }
    );
  }

  try {
    const url = `https://sfc.windbornesystems.com/historical_weather?station=${encodeURIComponent(
      station
    )}`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok)
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    const raw = await r.json();
    const payload = sanitizeHistorical(raw);
    historicalCache.set(key, payload);
    return NextResponse.json(payload);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
