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

export default function DataHistoryTable({ userId }: { userId: number }) {
  const [all, setAll] = useState<HealthDataResponse[]>([]);
  const [busy, setBusy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  async function load() {
    setBusy(true);
    try {
      const res = await listHealthDataByUser(userId);
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
  }, [userId]);

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
    setShowDeleteConfirm(id);
  }

  async function handleConfirmDelete() {
    if (showDeleteConfirm == null) return;
    try {
      await deleteHealthData(showDeleteConfirm);
      setShowDeleteConfirm(null);
      setShowSuccess(true);
      await load();
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
  }

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0" }}>
        <h3 style={{ margin: 0 }}>History</h3>
        <button
          onClick={load}
          disabled={busy}
          style={{
            background: "transparent",
            border: "none",
            cursor: busy ? "not-allowed" : "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            transition: "background-color 0.15s ease",
            opacity: busy ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!busy) {
              e.currentTarget.style.background = "#f3f4f6";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
          title="Refresh"
          aria-label="Refresh"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: busy ? "rotate(360deg)" : "none",
              transition: busy ? "transform 0.6s linear" : "none",
              transformOrigin: "center",
            }}
          >
            <path
              d="M17.5 2.5C16.3 1.3 14.7 0.5 13 0.5C9.4 0.5 6.5 3.4 6.5 7C6.5 10.6 9.4 13.5 13 13.5C16.6 13.5 19.5 10.6 19.5 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M19.5 2.5L17.5 0.5M19.5 2.5H17.5M19.5 2.5V4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

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

      {/* Delete confirmation popup */}
      {showDeleteConfirm != null && (
        <div
          onClick={() => setShowDeleteConfirm(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 12,
              padding: 20,
              width: 360,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              position: "relative",
              margin: "auto",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Confirm Delete</h3>
            <p style={{ fontSize: 14, color: "#4B5563", marginBottom: 16 }}>Are you sure you want to delete this record? This action cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: ".55rem 0",
                  borderRadius: 8,
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  padding: ".55rem 0",
                  borderRadius: 8,
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "#dc2626",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {showSuccess && (
        <Toast onClose={() => setShowSuccess(false)} message="Delete successful" />
      )}
    </div>
  );
}

function Toast({ onClose, message }: { onClose: () => void; message: string }) {
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideInUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        animation: "slideInUp 0.3s ease-out",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
          padding: "16px 20px",
          minWidth: "280px",
          border: "1px solid var(--border)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" fill="white"/>
          </svg>
        </div>
        <span style={{ fontSize: "15px", color: "#111827", flex: 1 }}>
          {message}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            transition: "background-color 0.15s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5L15 15" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
