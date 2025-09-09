"use client";

import { useEffect, useMemo, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Supercluster from "supercluster";
import type { Feature, Point } from "geojson";
import Link from "next/link";
import type { Station } from "@/lib/types";

// Props stored on features
type PointProps   = { station: Station };
type ClusterProps = { cluster: true; point_count: number; cluster_id: number };

// Union feature type returned by supercluster
type SCFeature = Feature<Point, PointProps | ClusterProps>;

// Type guard for cluster props
function isClusterProps(p: PointProps | ClusterProps): p is ClusterProps {
  return (p as ClusterProps).cluster === true;
}

// Cluster bubble (numbered)
function clusterDivIcon(count: number) {
  const size = count >= 100 ? "large" : count >= 25 ? "medium" : "small";
  return L.divIcon({
    html: `<div class="cluster-badge ${size}"><span>${count}</span></div>`,
    className: "custom-cluster-icon",
    iconSize: undefined, // CSS sizes the bubble
  });
}

// Single-station bubble (small, no number)
const stationIcon = L.divIcon({
  html: '<div class="station-badge"></div>',
  className: "custom-station-icon",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -11],
});

export default function ClusteredStations({ stations }: { stations: Station[] }) {
  const map = useMap();

  // Build GeoJSON features once from stations
  const points: Feature<Point, PointProps>[] = useMemo(
    () =>
      stations.map((s) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [s.longitude, s.latitude] },
        properties: { station: s },
      })),
    [stations]
  );

  // Create the supercluster index
  const index = useMemo(
    () =>
      new Supercluster<PointProps, ClusterProps>({ radius: 60, maxZoom: 16 }).load(
        points
      ),
    [points]
  );

  // Track viewport
  const [{ bounds, zoom }, setViewport] = useState(() => ({
    zoom: map.getZoom(),
    bounds: map.getBounds(),
  }));

  useEffect(() => {
    const update = () => setViewport({ zoom: map.getZoom(), bounds: map.getBounds() });
    map.on("moveend", update);
    map.on("zoomend", update);
    return () => {
      map.off("moveend", update);
      map.off("zoomend", update);
    };
  }, [map]);

  // Convert Leaflet bounds → [w, s, e, n]
  const bbox: [number, number, number, number] = useMemo(() => {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    return [sw.lng, sw.lat, ne.lng, ne.lat];
  }, [bounds]);

  // Clusters for current view
  const clusters = useMemo(
    () => index.getClusters(bbox, Math.round(zoom)) as SCFeature[],
    [index, bbox, zoom]
  );

  return (
    <>
      {clusters.map((c) => {
        const [lng, lat] = c.geometry.coordinates as [number, number];
        const props = c.properties!;

        // Render cluster bubble
        if (isClusterProps(props)) {
          const count = props.point_count;
          const id = props.cluster_id;
          return (
            <Marker
              key={`cluster-${id}`}
              position={[lat, lng]}
              icon={clusterDivIcon(count)}
              eventHandlers={{
                click: () => {
                  const expansionZoom = Math.min(index.getClusterExpansionZoom(id), 18);
                  map.flyTo([lat, lng], expansionZoom, { duration: 0.5 });
                },
              }}
            />
          );
        }

        // Render single-station bubble
        const s = (props as PointProps).station;
        return (
          <Marker
            key={s.id}
            position={[s.latitude, s.longitude] as [number, number]}
            icon={stationIcon}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{s.name || s.id}</div>
                <div className="text-xs text-slate-600">
                  {s.city}
                  {s.state ? `, ${s.state}` : ""}
                </div>
                <Link className="text-blue-600 underline" href={`/station/${s.id}`}>
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
