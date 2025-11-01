"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

type Facility = {
  facilityId: number;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  phoneNumber?: string;
};

type Props = {
  center: { lat: number; lng: number };
  facilities: Facility[];
  zoom?: number;
};

export default function PharmacyMap({ center, facilities, zoom = 13 }: Props) {
  useEffect(() => {
    const defaultIcon = new L.Icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    (L.Marker.prototype as any).options.icon = defaultIcon;
  }, []);

  return (
    <div className="w-full h-[380px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {facilities?.map((f) => (
          <Marker key={f.facilityId} position={[f.latitude, f.longitude]}>
            <Popup>
              <b>{f.name}</b>
              {f.address ? <div>{f.address}</div> : null}
              {f.phoneNumber ? (
                <div>
                  <a href={`tel:${f.phoneNumber}`}>📞 {f.phoneNumber}</a>
                </div>
              ) : null}
              <div>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${f.latitude},${f.longitude}`}
                >
                  🧭 Navigate
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
