// src/components/DataHistoryTable.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { HealthDataResponse } from "../lib/types";
import { deleteHealthData, listHealthDataByUser } from "../lib/api";
import { fmtDateTime } from "../lib/utils";
import Sparkline from "./Sparkline";
import "../styles/card.css";

const PAGE_SIZE = 10;

/** Simple client-side paging hook (pure React hook). */
function useClientPaging<T>(all: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
  const slice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return all.slice(start, start + pageSize);
  }, [all, page, pageSize]);
  return { page, setPage, totalPages, slice };
}

export default function DataHistoryTable() {
  const [all, setAll] = useState<HealthDataResponse[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    try {
      const res = await listHealthDataByUser();
      // Sort DESC for table display (new -> old)
      res.sort(
        (a, b) =>
          new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      );
      setAll(res);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const { page, setPage, totalPages, slice } = useClientPaging(all, PAGE_SIZE);

  // Build weights for the sparkline in chronological order (old -> new)
  const weightsChrono = useMemo(() => {
    return [...all]
      .sort(
        (a, b) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
      )
      .map((m) => m.weight ?? 0)
      .filter((x) => x > 0);
  }, [all]);

  async function onDelete(id: number) {
    if (!confirm("Delete this record?")) return;
    await deleteHealthData(id);
    load();
  }

  return (
    <div className="card">
      <h3>History</h3>

      <div className="row">
        <div>
          <div className="badge">Weight Trend</div>
          <div style={{ marginTop: 8 }}>
            <Sparkline values={weightsChrono} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>DateTime</th>
              <th>Weight</th>
              <th>Height</th>
              <th>HR</th>
              <th>BP</th>
              <th>Sleep</th>
              <th>Steps</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((m) => {
              const sys = (m as any).systolicBp ?? (m as any).systolicPressure;
              const dia =
                (m as any).diastolicBp ?? (m as any).diastolicPressure;
              return (
                <tr key={m.id}>
                  {/* robust local time rendering */}
                  <td>{fmtDateTime(m.recordedAt)}</td>
                  <td>{m.weight ?? "-"}</td>
                  <td>{m.height ?? (m as any).heightCm ?? "-"}</td>
                  <td>{m.heartRate ?? "-"}</td>
                  <td>
                    {sys != null && dia != null ? `${sys}/${dia}` : "-"}
                  </td>
                  <td>{m.sleepHours ?? "-"}</td>
                  <td>{m.steps ?? "-"}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => onDelete(m.id)}
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {slice.length === 0 && (
              <tr>
                <td colSpan={8} style={{ color: "var(--muted)" }}>
                No data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="actions" style={{ marginTop: 12 }}>
        <button
          className="btn btn-ghost"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || busy}
        >
          Prev
        </button>
        <span className="badge">Page {page} / {totalPages}</span>
        <button
          className="btn btn-ghost"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={busy || page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
