"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import ExportButtons from "@/components/ExportButtons";
import { generateHealthPlan, latestHealthPlan, listHealthPlansByUser } from "@/lib/api";
import { HealthPlanRequest, HealthPlanResponse } from "@/lib/types";

const USER_ID = Number(process.env.NEXT_PUBLIC_USER_ID ?? 1);

export default function HealthPlanPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<HealthPlanResponse | null>(null);
  const [history, setHistory] = useState<HealthPlanResponse[]>([]);
  const [type, setType] = useState<HealthPlanRequest["type"]>("WEEKLY");
  const [daysBack, setDaysBack] = useState<number>(7);

  async function load() {
    setError(null);
    let latestErr: any = null;
    try {
      const a = await latestHealthPlan(USER_ID).catch((e) => { latestErr = e; return null; });
      const b = await listHealthPlansByUser(USER_ID);
      setLatest(a);
      setHistory((b || []).sort((x, y) => new Date(y.createdAt || '').getTime() - new Date(x.createdAt || '').getTime()));
      // If latest报错但历史成功，视为“暂无最新计划”，不展示红色错误
    } catch (e: any) {
      // 历史也失败时才展示错误
      setError(e.message || latestErr?.message || "Failed to load health plans");
    }
  }

  useEffect(() => { load(); }, []);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      await generateHealthPlan({ userId: USER_ID, type, daysBack });
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }

  const shouldShowError = error && !/doesn\'t exist|Unknown table|Table .* doesn\'t exist/i.test(error);
  return (
    <main>
      <Breadcrumb items={[{ label: "Health Plan (AI)", current: true }]} />
      <h1 className="hm-section-title">Health Plan (AI)</h1>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <select value={type} onChange={(e)=> setType(e.target.value as any)}>
          <option value="DAILY">DAILY</option>
          <option value="WEEKLY">WEEKLY</option>
          <option value="MONTHLY">MONTHLY</option>
        </select>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          Days Back
          <input type="number" min={1} value={daysBack} onChange={(e)=> setDaysBack(Number(e.target.value || 7))} style={{ width: 80 }} />
        </label>
        <button className="btn btn-solid" onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Plan"}
        </button>

        <ExportButtons onExportPdf={()=> window.print()} onExportCsv={()=> alert("CSV export coming soon")} />
      </div>

      {/* Error */}
      {shouldShowError && (
        <div style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</div>
      )}

      {/* Latest Plan */}
      <div className="hm-card" style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>Latest Plan</h2>
        {latest ? (
          <div style={{ display: "grid", gap: 8 }}>
            <div><strong>Type:</strong> {latest.type ?? '-'}</div>
            <div><strong>Period:</strong> {latest.startDate ?? '-'} ~ {latest.endDate ?? '-'}</div>
            {latest.summary && (
              <div style={{ whiteSpace: "pre-wrap", color: "#374151" }}>{latest.summary}</div>
            )}
            {latest.dietPlan && (
              <div>
                <div className="badge">Diet</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{latest.dietPlan}</div>
              </div>
            )}
            {latest.workoutPlan && (
              <div>
                <div className="badge">Workout</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{latest.workoutPlan}</div>
              </div>
            )}
            {latest.lifestylePlan && (
              <div>
                <div className="badge">Lifestyle</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{latest.lifestylePlan}</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: "#6b7280" }}>No plan yet.</div>
        )}
      </div>

      {/* History */}
      <div className="hm-card">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>History</h2>
        <ul style={{ display: "grid", gap: 8 }}>
          {history.map((p) => (
            <li key={p.id} className="hm-card" style={{ padding: ".5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</div>
                <div style={{ fontWeight: 600 }}>{p.type ?? '-'}</div>
              </div>
              {p.summary && <div style={{ color: "#374151", marginTop: 6 }}>{p.summary}</div>}
            </li>
          ))}
          {history.length === 0 && <li style={{ color: "#6b7280" }}>No records.</li>}
        </ul>
      </div>
    </main>
  );
}


