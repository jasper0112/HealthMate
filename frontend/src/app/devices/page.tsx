"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";

export default function DevicesPage() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  const userId = Number(process.env.NEXT_PUBLIC_USER_ID || 1);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${base}/api/health-devices/user/${userId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load devices");
        setItems(await res.json());
      } catch (e: any) {
        setError(e.message || "Failed to load devices");
      } finally {
        setLoading(false);
      }
    })();
  }, [base, userId]);

  async function sync(deviceId: number) {
    setBusyId(deviceId);
    try {
      const res = await fetch(`${base}/api/health-devices/${deviceId}/sync`, { method: "PUT" });
      if (!res.ok) throw new Error("Sync failed");
      location.reload();
    } catch (e: any) {
      setError(e.message || "Sync failed");
    } finally {
      setBusyId(null);
    }
  }

  async function disconnect(deviceId: number) {
    setBusyId(deviceId);
    try {
      const res = await fetch(`${base}/api/health-devices/${deviceId}/disconnect`, { method: "PUT" });
      if (!res.ok) throw new Error("Disconnect failed");
      location.reload();
    } catch (e: any) {
      setError(e.message || "Disconnect failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Devices", current: true }]} />
      <h1 className="hm-section-title">Devices</h1>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "#b91c1c" }}>{error}</div>
      ) : (
        <ul style={{ display: "grid", gap: ".5rem" }}>
          {items.map((d) => (
            <li key={d.deviceId} className="hm-card" style={{ padding: ".75rem", display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 600 }}>{d.deviceName}</div>
              <div style={{ color: "#6b7280" }}>{d.deviceType}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => sync(d.deviceId)} disabled={busyId === d.deviceId}>Sync</button>
                <button className="btn" onClick={() => disconnect(d.deviceId)} disabled={busyId === d.deviceId}>Disconnect</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


