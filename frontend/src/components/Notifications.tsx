"use client";

import { useEffect, useState } from "react";

type Notice = { id: string; title: string; body?: string; time?: string };

export default function Notifications() {
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // 简单占位：基于后端最新评估/计划/预约状态拼装通知
    (async () => {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
      const userId = Number(process.env.NEXT_PUBLIC_USER_ID || 1);
      try {
        const [latestAssessmentRes, latestPlanRes, upcomingApptRes] = await Promise.all([
          fetch(`${base}/api/health-assessments/user/${userId}/latest`),
          fetch(`${base}/api/health-plans/user/${userId}/latest`),
          fetch(`${base}/api/gp-appointments/user/${userId}/upcoming`),
        ]);

        const latestAssessment = latestAssessmentRes.status === 404 ? null : await latestAssessmentRes.json();
        const latestPlan = latestPlanRes.status === 404 ? null : await latestPlanRes.json();
        const upcoming = upcomingApptRes.ok ? await upcomingApptRes.json() : [];

        const list: Notice[] = [];
        if (latestAssessment) {
          list.push({ id: "a1", title: "New Health Assessment", body: latestAssessment.summary, time: latestAssessment.createdAt });
        }
        if (latestPlan) {
          list.push({ id: "p1", title: "New Health Plan", body: latestPlan.planSummary, time: latestPlan.createdAt });
        }
        if (Array.isArray(upcoming) && upcoming.length > 0) {
          list.push({ id: "g1", title: "Upcoming GP Appointment", body: upcoming[0].facilityName, time: upcoming[0].appointmentDate });
        }
        setItems(list);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Notifications</h2>
      {loading ? (
        <div>Loading notifications...</div>
      ) : items.length === 0 ? (
        <div style={{ color: "#6b7280" }}>No notifications</div>
      ) : (
        <ul style={{ display: "grid", gap: "0.5rem" }}>
          {items.map((n) => (
            <li key={n.id} className="hm-card" style={{ padding: "0.75rem" }}>
              <div style={{ fontWeight: 600 }}>{n.title}</div>
              {n.body && <div style={{ color: "#374151", marginTop: 4 }}>{n.body}</div>}
              {n.time && (
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                  {new Date(n.time).toLocaleString()}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


