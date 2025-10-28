"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { getRewards, rewardsCheckIn } from "@/lib/api";

export default function RewardsPage() {
  const userId = Number(process.env.NEXT_PUBLIC_USER_ID || 1);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const r = await getRewards(userId);
      setData(r);
    } catch (e: any) {
      setError(e.message || "Failed to load rewards");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    load();
  }, []);

  const [busy, setBusy] = useState(false);
  async function checkIn() {
    setBusy(true); setError(null);
    try {
      await rewardsCheckIn(userId);
      await load();
    } catch (e: any) {
      setError(e.message || "Check-in failed");
    } finally { setBusy(false); }
  }

  return (
    <main>
      <Breadcrumb items={[{ label: "Rewards", current: true }]} />
      <h1 className="hm-section-title">Rewards</h1>

      <div style={{ marginBottom: ".75rem" }}>
        <button className="btn btn-solid" onClick={checkIn} disabled={busy}>{busy ? "Checking..." : "Daily Check-in"}</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "#b91c1c" }}>{error}</div>
      ) : !data ? (
        <div>No rewards yet.</div>
      ) : (
        <div className="hm-card" style={{ padding: ".75rem", display: "grid", gap: 6 }}>
          <div><strong>Total Points:</strong> {data.totalPoints}</div>
          <div><strong>Current Streak:</strong> {data.currentStreak}</div>
          <div><strong>Tier:</strong> {data.tierName}</div>
        </div>
      )}
    </main>
  );
}


