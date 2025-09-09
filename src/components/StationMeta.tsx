import type { Station } from "@/lib/types";

export default function StationMeta({ s }: { s: Station }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-600">Station</div>
      <div className="text-xl font-semibold">{s.name || s.id}</div>
      <div className="text-slate-700 text-sm">
        {s.city}
        {s.state ? `, ${s.state}` : ""}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-slate-500">ID:</span> {s.id}
        </div>
        <div>
          <span className="text-slate-500">Lat:</span> {s.latitude.toFixed(3)}
        </div>
        <div>
          <span className="text-slate-500">Lon:</span> {s.longitude.toFixed(3)}
        </div>
        {s.elevation != null && (
          <div>
            <span className="text-slate-500">Elevation:</span> {s.elevation}
          </div>
        )}
      </div>
    </div>
  );
}
