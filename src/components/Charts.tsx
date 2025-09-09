"use client";

import type { HistoricalRecord } from "@/lib/types";   // <-- import the type
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

function formatTime(t: string) {
  // safe date formatting
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? t : d.toLocaleString();
}

export default function Charts({ data }: { data: HistoricalRecord[] }) {
  const rows = data.map((d) => ({
    time: formatTime(d.timestamp),
    temperature: d.temperature ?? null,
    wind_speed: d.wind_speed ?? null,
    wind_gust: d.wind_gust ?? null,
    pressure: d.pressure ?? null,
    precip: d.precip ?? null,
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 font-semibold">Temperature</div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="temperature" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 font-semibold">Wind (speed &amp; gust)</div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" hide />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="wind_speed" dot={false} />
              <Line type="monotone" dataKey="wind_gust" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 font-semibold">Pressure</div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pressure" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 font-semibold">Precipitation</div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="precip" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
