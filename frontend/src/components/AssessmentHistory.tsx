// src/components/AssessmentHistory.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HealthAssessmentResponse } from "../lib/types";
import { listAssessmentsByUser, deleteAssessment } from "../lib/api";
import { fmtDateTime, toCSV, downloadTextFile } from "../lib/utils";
import "../styles/card.css";

const PAGE_SIZE = 10;

/** Client-side paging helper (keeps layout unchanged). */
function useClientPaging<T>(all: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
  const slice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return all.slice(start, start + pageSize);
  }, [all, page, pageSize]);
  return { page, setPage, totalPages, slice };
}

/** Props for toggling the internal title to avoid duplicate headings. */
type Props = {
  /** When false, the internal <h3> "Report History" is not rendered. */
  showInternalTitle?: boolean;
};

export default function AssessmentHistory({ showInternalTitle = true }: Props) {
  const [all, setAll] = useState<HealthAssessmentResponse[]>([]);
  const [sel, setSel] = useState<HealthAssessmentResponse[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const res = await listAssessmentsByUser();
    // Sort newest first to match the rest of the page.
    res.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setAll(res);
  }
  useEffect(() => {
    load();
  }, []);

  const { page, setPage, totalPages, slice } = useClientPaging(all, PAGE_SIZE);

  /** Toggle selection for quick score comparison (up to 2 rows). */
  function toggleSelect(item: HealthAssessmentResponse) {
    const exists = sel.find((s) => s.id === item.id);
    setSel(exists ? sel.filter((s) => s.id !== item.id) : [...sel.slice(-1), item]);
  }

  /** Export ALL rows (full history) as CSV; traffic column removed per request. */
  function exportHistoryCSV() {
    if (!all.length) {
      alert("No records to export.");
      return;
    }
    const rows = all.map((it) => ({
      id: it.id,
      createdAt: fmtDateTime(it.createdAt),
      score: it.overallScore ?? "",
      type: it.type ?? "",
      summary: (it as any).summary ?? "",
    }));
    downloadTextFile(`assessment_history_${Date.now()}.csv`, toCSV(rows));
  }

  /** Delete a single assessment row. */
  async function handleDelete(id: number) {
    if (!confirm("Delete this record?")) return;
    try {
      setBusyId(id);
      await deleteAssessment(id);
      await load();
      setSel((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setErr(e.message || "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  /** Simple score delta when exactly two rows are selected. */
  const diff = (() => {
    if (sel.length !== 2) return null;
    const [a, b] = sel;
    const scoreA = a.overallScore ?? 0;
    const scoreB = b.overallScore ?? 0;
    return { score: scoreA - scoreB };
  })();

  return (
    <div className="card">
      {/* Hide the internal title when the page already shows a section heading. */}
      {showInternalTitle && <h3>Report History</h3>}

      {/* Right-aligned lightweight toolbar; layout untouched */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button className="btn btn-ghost" onClick={exportHistoryCSV}>
          Export CSV
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Select</th>
              <th>DateTime</th>
              <th>Score</th>
              <th>Type</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((it) => (
              <tr key={it.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={!!sel.find((s) => s.id === it.id)}
                    onChange={() => toggleSelect(it)}
                  />
                </td>
                <td>{fmtDateTime(it.createdAt)}</td>
                <td>{it.overallScore ?? "-"}</td>
                <td>{it.type ?? "-"}</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => handleDelete(it.id)}
                    disabled={busyId === it.id}
                    aria-label="Delete assessment"
                    title="Delete"
                  >
                    {busyId === it.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
            {slice.length === 0 && (
              <tr>
                {/* colSpan matches current column count */}
                <td colSpan={5} style={{ color: "var(--muted)" }}>
                  No records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {diff && (
        <div className="card" style={{ marginTop: 12, background: "#fbfbfd" }}>
          <div className="badge">Comparison</div>
          <div style={{ marginTop: 6 }}>
            Score change:{" "}
            <strong>{diff.score >= 0 ? `+${diff.score}` : diff.score}</strong>
          </div>
        </div>
      )}

      {err && <div style={{ color: "#b91c1c", marginTop: 8 }}>{err}</div>}
    </div>
  );
}
