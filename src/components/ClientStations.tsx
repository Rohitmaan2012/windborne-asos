// src/components/ClientStations.tsx
"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Station } from "@/lib/types";
import SearchBar from "@/components/SearchBar";

// ⬇️ Dynamically import the map; never render it on the server
const StationsMap = dynamic(() => import("@/components/StationsMap"), {
  ssr: false,
  // optional: a simple placeholder while the map JS loads
  loading: () => (
    <div className="h-[480px] rounded-2xl border bg-white/50 animate-pulse" />
  ),
});

export default function ClientStations({ stations }: { stations: Station[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return stations;
    return stations.filter((s) =>
      [s.id, s.name, s.city, s.state]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(qq))
    );
  }, [q, stations]);

  return (
    <div className="space-y-3">
      <SearchBar onChange={setQ} />
      <StationsMap stations={filtered} />
      <div className="text-xs text-slate-500">
        Showing {filtered.length.toLocaleString()} of{" "}
        {stations.length.toLocaleString()} stations.
      </div>
    </div>
  );
}
