"use client";

import { useEffect, useState } from "react";

type Card = { label: string; value: string | number; hint?: string };

export default function TodayOverview() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
        const userId = Number(process.env.NEXT_PUBLIC_USER_ID || 1);
        const [today, stats, latest] = await Promise.all([
          fetch(`${base}/api/health-data/user/${userId}/today`).then(r => r.json()),
          fetch(`${base}/api/health-data/user/${userId}/statistics`).then(r => r.json()),
          fetch(`${base}/api/health-data/user/${userId}/latest`).then(r => (r.status === 404 ? null : r.json())),
        ]);

        const steps = today?.reduce((acc: number, x: any) => acc + (x.steps || 0), 0) ?? 0;
        const sleep = today?.reduce((acc: number, x: any) => acc + (x.sleepHours || 0), 0) ?? 0;
        const hr = latest?.heartRate ?? "-";
        const weight = latest?.weight ?? "-";

        const nextCards: Card[] = [
          { label: "Steps Today", value: steps },
          { label: "Sleep (h)", value: sleep },
          { label: "Heart Rate", value: hr },
          { label: "Weight", value: weight },
          { label: "30d Avg HR", value: Math.round((stats?.averageHeartRate || 0) as number) || "-" },
        ];
        if (mounted) setCards(nextCards);
      } catch (e: any) {
        if (mounted) setError(e.message || "Failed to load overview");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading today overview...</div>;
  if (error) return <div style={{ color: "#b91c1c" }}>{error}</div>;

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Today Overview</h2>
      <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {cards.map((c) => (
          <div key={c.label} className="hm-card" style={{ padding: "0.75rem" }}>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{c.value}</div>
            {c.hint && <div style={{ fontSize: 12, color: "#9ca3af" }}>{c.hint}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}


