"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// 动态导入，避免 SSR 报错
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

type Facility = {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
};

export default function PharmacyMap({
  center,
  facilities,
}: {
  center: { lat: number; lng: number };
  facilities: Facility[];
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 仅在客户端设置默认图标，避免 next/SSR 触发窗口依赖
      const L = (await import("leaflet")).default;
      const defaultIcon = new L.Icon({
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      (L.Marker.prototype as any).options.icon = defaultIcon;

      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;

  return (
    <div style={{ height: 400, width: "100%", marginTop: 12 }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%", borderRadius: 8 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {facilities.map((f, i) => (
          <Marker
            key={`${f.latitude},${f.longitude}-${i}`}
            position={[f.latitude, f.longitude]}
          >
            <Popup>
              <b>{f.name}</b>
              <br />
              {f.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}