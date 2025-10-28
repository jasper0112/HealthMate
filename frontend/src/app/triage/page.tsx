"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";

export default function TriagePage() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  const userId = Number(process.env.NEXT_PUBLIC_USER_ID || 1);
  const [symptomsInfo, setSymptomsInfo] = useState("");
  const [latest, setLatest] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function trigger() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${base}/api/smart-triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, symptomsInfo }),
      });
      if (!res.ok) throw new Error("Triage request failed");
      await load();
      return res.json();
    } catch (e: any) {
      setError(e.message || "Triage request failed");
    } finally {
      setBusy(false);
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r1 = await fetch(`${base}/api/smart-triage/user/${userId}/latest`, { cache: "no-store" });
      setLatest(r1.status === 404 ? null : await r1.json());
      const r2 = await fetch(`${base}/api/smart-triage/user/${userId}`, { cache: "no-store" });
      if (!r2.ok) throw new Error("Failed to load triage history");
      setHistory(await r2.json());
    } catch (e: any) {
      setError(e.message || "Failed to load triage");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Smart Triage", current: true }]} />
      <h1 className="hm-section-title">Smart Triage</h1>

      <div className="hm-card" style={{ padding: ".75rem", marginBottom: ".75rem" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input placeholder="Describe your symptoms..." value={symptomsInfo} onChange={(e) => setSymptomsInfo(e.target.value)} />
          <button className="btn btn-solid" onClick={trigger} disabled={busy}>{busy ? "Running..." : "Run Triage"}</button>
        </div>
      </div>

      {error && (
        <div style={{ color: "#b91c1c", marginBottom: ".75rem" }}>{error}</div>
      )}

      <div className="hm-card" style={{ padding: ".75rem", marginBottom: ".75rem" }}>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Latest</h2>
        {loading ? (
          <div>Loading...</div>
        ) : latest ? (
          <div>
            <div><strong>Priority:</strong> {latest.priority}</div>
            <div style={{ marginTop: 6, color: "#374151" }}>{latest.triageResult}</div>
          </div>
        ) : (
          <div style={{ color: "#6b7280" }}>No triage yet.</div>
        )}
      </div>

      <div className="hm-card" style={{ padding: ".75rem" }}>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>History</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ul style={{ display: "grid", gap: 8 }}>
            {history.map((t) => (
              <li key={t.triageId} className="hm-card" style={{ padding: ".5rem" }}>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(t.triageTime).toLocaleString()}</div>
                <div style={{ fontWeight: 600 }}>{t.priority}</div>
                <div style={{ color: "#374151" }}>{t.triageResult}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}


