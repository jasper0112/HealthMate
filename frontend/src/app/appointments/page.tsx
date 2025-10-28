"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { listAppointmentsByUser, cancelAppointment } from "@/lib/api";

export default function AppointmentsPage() {
  const userId = Number(process.env.NEXT_PUBLIC_USER_ID || 1);

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const res = await listAppointmentsByUser(userId);
        setItems(res);
      } catch (e: any) {
        setError(e.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const [busyId, setBusyId] = useState<number | null>(null);
  async function cancel(id: number) {
    setBusyId(id);
    try {
      await cancelAppointment(id);
      location.reload();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main>
      <Breadcrumb items={[{ label: "Appointments", current: true }]} />
      <h1 className="hm-section-title">Appointments</h1>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "#b91c1c" }}>{error}</div>
      ) : (
        <ul style={{ display: "grid", gap: ".5rem" }}>
          {items.map((a) => (
            <li key={a.appointmentId} className="hm-card" style={{ padding: ".75rem", display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 600 }}>{a.facilityName}</div>
              <div>{new Date(a.appointmentDate).toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{a.status}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => cancel(a.appointmentId)} disabled={busyId === a.appointmentId}>Cancel</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


