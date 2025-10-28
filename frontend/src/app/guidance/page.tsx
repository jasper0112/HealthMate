"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { generateDietGuidance, generateMedicationGuidance } from "@/lib/api";

export default function GuidancePage() {
  const userId = Number(process.env.NEXT_PUBLIC_USER_ID || 1);
  const [healthIssue, setHealthIssue] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diet, setDiet] = useState<any | null>(null);
  const [med, setMed] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function genDiet() {
    setLoading(true); setError(null);
    try {
      const data = await generateDietGuidance(userId, healthIssue);
      setDiet(data);
    } catch (e: any) {
      setError(e.message || "Failed to generate diet guidance");
    } finally { setLoading(false); }
  }

  async function genMed() {
    setLoading(true); setError(null);
    try {
      const data = await generateMedicationGuidance(userId, symptoms);
      setMed(data);
    } catch (e: any) {
      setError(e.message || "Failed to generate medication guidance");
    } finally { setLoading(false); }
  }

  return (
    <main>
      <Breadcrumb items={[{ label: "Guidance", current: true }]} />
      <h1 className="hm-section-title">Diet & Medication Guidance</h1>

      {error && (<div style={{ color: "#b91c1c", marginBottom: 8 }}>{error}</div>)}

      <div className="hm-card" style={{ padding: ".75rem", marginBottom: ".75rem" }}>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Diet</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input placeholder="Health issue" value={healthIssue} onChange={(e) => setHealthIssue(e.target.value)} />
          <button className="btn btn-solid" onClick={genDiet} disabled={loading}>{loading ? "Generating..." : "Generate"}</button>
        </div>
        {diet && <pre style={{ whiteSpace: "pre-wrap" }}>{diet.guidance || JSON.stringify(diet, null, 2)}</pre>}
      </div>

      <div className="hm-card" style={{ padding: ".75rem" }}>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Medication</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input placeholder="Symptoms" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
          <button className="btn btn-solid" onClick={genMed} disabled={loading}>{loading ? "Generating..." : "Generate"}</button>
        </div>
        {med && <pre style={{ whiteSpace: "pre-wrap" }}>{med.guidance || JSON.stringify(med, null, 2)}</pre>}
      </div>
    </main>
  );
}


