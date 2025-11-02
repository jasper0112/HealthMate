"use client";
import { useEffect, useMemo, useState } from "react";
import {
  listMedicationGuidanceByUser,
  deleteMedicationGuidance,
  getMedicationGuidanceById, // ← api.ts 里已导出别名
} from "@/lib/api";
import type { MedicationGuidance } from "@/lib/types"; // ← 类型来自 types.ts
import { getCurrentUser } from "@/lib/auth";
import { exportMedicationCSV, exportMedicationPDF } from "@/lib/otc-exports"; // ← 新建的导出工具

export default function MedicationHistory() {
  const auth = getCurrentUser();
  if (!auth) return <div className="card">Please login.</div>; // ✅ 早返回收窄类型

  const userId = auth.userId; // ✅ 现在是 number，不是 number | undefined
  const [rows, setRows] = useState<MedicationGuidance[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewing, setViewing] = useState<MedicationGuidance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listMedicationGuidanceByUser(userId)
      .then(setRows)
      .catch(() => setError("Failed to load medication history"))
      .finally(() => setLoading(false));
  }, [userId]);

  const allChecked = useMemo(
    () => rows.length > 0 && selectedIds.length === rows.length,
    [rows, selectedIds]
  );

  function toggleAll() {
    setSelectedIds(allChecked ? [] : rows.map(r => r.medGuidanceId!).filter(Boolean));
  }
  function toggleOne(id: number) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function onDelete(id?: number) {
    const toDelete = id ? [id] : selectedIds;
    if (toDelete.length === 0) return;
    if (!confirm(`Delete ${toDelete.length} record(s)?`)) return;
    for (const gid of toDelete) {
      await deleteMedicationGuidance(gid).catch(() => {});
    }
    setRows(rows.filter(r => !toDelete.includes(r.medGuidanceId!)));
    setSelectedIds([]);
  }

  return (
    <div className="card">
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <h3 style={{ marginRight: "auto" }}>Medication Guidance History</h3>
        <button className="btn btn-ghost" onClick={() => exportMedicationCSV(rows)}>Export CSV</button>
        <button className="btn btn-ghost" onClick={() => exportMedicationPDF(rows)}>Export PDF (Print)</button>
        <button className="btn btn-danger" onClick={() => onDelete()} disabled={selectedIds.length===0}>Delete Selected</button>
      </div>

      {error && <div className="badge" style={{ background:"#fee2e2", color:"#dc2626", marginTop:8 }}>{error}</div>}
      {loading ? <div>Loading...</div> : (
        <div className="table">
          <div className="thead">
            <div style={{ width: 40 }}>
              <input type="checkbox" checked={allChecked} onChange={toggleAll}/>
            </div>
            <div>ID</div>
            <div>Datetime</div>
            <div>Symptoms</div>
            <div>Actions</div>
          </div>
          <div className="tbody">
            {rows.map(r => (
              <div key={r.medGuidanceId} className="tr">
                <div style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(r.medGuidanceId!)}
                    onChange={() => toggleOne(r.medGuidanceId!)}
                  />
                </div>
                <div>#{r.medGuidanceId}</div>
                <div>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</div>
                <div>{r.symptoms || "—"}</div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="btn btn-ghost" onClick={async () => {
                    const full = await getMedicationGuidanceById(r.medGuidanceId!);
                    setViewing(full);
                  }}>View</button>
                  <button className="btn btn-danger" onClick={() => onDelete(r.medGuidanceId!)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewing && (
        <div className="modal">
          <div className="modal-body">
            <h4>Medication Guidance #{viewing.medGuidanceId}</h4>
            <p><b>Symptoms:</b> {viewing.symptoms}</p>
            <p><b>Description:</b> {viewing.conditionDescription}</p>
            <p><b>OTC:</b> {viewing.otcMedications}</p>
            <p><b>Usage:</b> {viewing.usageInstructions}</p>
            <p><b>Precautions:</b> {viewing.precautions}</p>
            <p><b>Side Effects:</b> {viewing.sideEffects}</p>
            <p><b>Recommended Pharmacies:</b> {viewing.recommendedPharmacies}</p>
            <div className="actions">
              <button className="btn btn-primary" onClick={() => exportMedicationPDF([viewing])}>Export PDF</button>
              <button className="btn" onClick={() => setViewing(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}