import type { HistoricalRecord } from "@/lib/types";

export default function DataTable({ data }: { data: HistoricalRecord[] }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 text-left text-slate-700">
          <tr>
            <th className="px-3 py-2">Time</th>
            <th className="px-3 py-2">Temp</th>
            <th className="px-3 py-2">Wind</th>
            <th className="px-3 py-2">Gust</th>
            <th className="px-3 py-2">Pressure</th>
            <th className="px-3 py-2">Precip</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i} className={i % 2 ? "bg-white" : "bg-slate-50"}>
              <td className="px-3 py-2">
                {new Date(d.timestamp).toLocaleString()}
              </td>
              <td className="px-3 py-2">{d.temperature ?? "—"}</td>
              <td className="px-3 py-2">{d.wind_speed ?? "—"}</td>
              <td className="px-3 py-2">{d.wind_gust ?? "—"}</td>
              <td className="px-3 py-2">{d.pressure ?? "—"}</td>
              <td className="px-3 py-2">{d.precip ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
