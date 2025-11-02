// frontend/src/app/otc/page.tsx
"use client";
import { useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { generateMedicationGuidance } from "@/lib/api";
import MedicationHistory from "@/components/MedicationHistory";

export default function OTCPage() {
  const auth = getCurrentUser();
  if (!auth) return <div className="max-w-5xl mx-auto card">Please login.</div>;

  const userId = auth.userId;
  const [symptoms, setSymptoms] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // ✅

  async function onGenerate() {
    setErr(null);
    if (!symptoms.trim()) { setErr("Please input symptoms"); return; }
    setBusy(true);
    try {
      await generateMedicationGuidance(userId, symptoms.trim());
      setSymptoms("");
      setRefreshKey(k => k + 1); // ✅ 触发历史刷新
    } catch (e: any) {
      setErr(e?.message || "Failed to generate medication guidance");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="card">
        <h3>Generate OTC Guidance</h3>
        <div className="row" style={{ gridTemplateColumns: "1fr auto" }}>
          <textarea
            rows={3}
            value={symptoms}
            onChange={(e)=>setSymptoms(e.target.value)}
            placeholder="e.g. headache, arm hurt"
            style={{ width:"100%", marginTop:6, padding:"11px 12px" }}
          />
          <div className="actions" style={{ alignSelf:"end" }}>
            <button className="btn btn-primary" onClick={onGenerate} disabled={busy}>
              {busy ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
        {err && <span className="badge" style={{ background:"#fee2e2", color:"#dc2626" }}>{err}</span>}
      </div>

      {/* 关键：加 key 触发重新 mount 从而重新拉取列表 */}
      <MedicationHistory key={refreshKey}/>
    </div>
  );
}