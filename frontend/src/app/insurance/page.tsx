"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { generateInsuranceRecommendation, latestInsuranceRecommendation, listInsuranceRecommendations } from "@/lib/api";

export default function InsurancePage() {
  const userId = Number(process.env.NEXT_PUBLIC_USER_ID || 1);
  const [profile, setProfile] = useState("");
  const [needs, setNeeds] = useState("");
  const [latest, setLatest] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true); setError(null);
    try {
      await generateInsuranceRecommendation({ userId, userProfile: profile, specificNeeds: needs });
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to generate recommendation");
    } finally { setLoading(false); }
  }

  async function load() {
    setError(null);
    try {
      const [a, b] = await Promise.all([
        latestInsuranceRecommendation(userId),
        listInsuranceRecommendations(userId),
      ]);
      setLatest(a);
      setHistory(b);
    } catch (e: any) {
      setError(e.message || "Failed to load insurance recommendations");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main>
      <Breadcrumb items={[{ label: "Insurance", current: true }]} />
      <h1 className="hm-section-title">Insurance Recommendations</h1>

      <div className="hm-card" style={{ padding: ".75rem", marginBottom: ".75rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input placeholder="User profile" value={profile} onChange={(e) => setProfile(e.target.value)} />
          <input placeholder="Specific needs" value={needs} onChange={(e) => setNeeds(e.target.value)} />
          <button className="btn btn-solid" onClick={generate} disabled={loading}>{loading ? "Generating..." : "Generate"}</button>
        </div>
      {error && (<div style={{ color: "#b91c1c", marginTop: 8 }}>{error}</div>)}
      </div>

      <div className="hm-card" style={{ padding: ".75rem", marginBottom: ".75rem" }}>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Latest</h2>
        {latest ? (
          <div>
            <div style={{ fontWeight: 600 }}>{latest.reason}</div>
            <div style={{ marginTop: 6, color: "#374151" }}>{latest.recommendationSummary}</div>
          </div>
        ) : (
          <div style={{ color: "#6b7280" }}>No recommendation yet.</div>
        )}
      </div>

      <div className="hm-card" style={{ padding: ".75rem" }}>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>History</h2>
        <ul style={{ display: "grid", gap: 8 }}>
          {history.map((x) => (
            <li key={x.insuranceRecommendationId} className="hm-card" style={{ padding: ".5rem" }}>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(x.recommendationDate).toLocaleString()}</div>
              <div style={{ fontWeight: 600 }}>{x.reason}</div>
              <div style={{ color: "#374151" }}>{x.recommendationSummary}</div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}


