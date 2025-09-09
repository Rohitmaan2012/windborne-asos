// src/components/StationsMap.tsx
"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { Station } from "@/lib/types";
import ClusteredStations from "./ClusteredStations";
import "leaflet/dist/leaflet.css";
import "@/styles/leaflet-fix.css";

const DEFAULT_CENTER: LatLngExpression = [39, -98];

export default function StationsMap({ stations }: { stations: Station[] }) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={4}
      minZoom={3}
      maxZoom={18}
      scrollWheelZoom
      preferCanvas
      className="h-[480px] w-full rounded-2xl border bg-white"
    >
      {/* Light basemap so bubbles pop */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
      />

      <ClusteredStations stations={stations} />
    </MapContainer>
  );
}
