// src/components/DataRecordForm.tsx
"use client";

import React, { useMemo, useState } from "react";
import { HealthDataCreateRequest } from "../lib/types";
import { createHealthData, syncAllConnectedDevices } from "../lib/api";
import { toLocalInputValue, fromLocalInputValue } from "../lib/utils"; // <-- use timezone-safe helpers
import "../styles/card.css";

// Default payload with current timestamp (store as ISO for backend)
const defaultReq = (userId: number): HealthDataCreateRequest => ({
  userId: userId,
  recordedAt: new Date().toISOString(),
  weight: undefined,
  height: undefined,
  heartRate: undefined,
  systolicBp: undefined,
  diastolicBp: undefined,
  sleepHours: undefined,
  steps: undefined,
});

export default function DataRecordForm({ userId, onSaved }: { userId: number; onSaved?: () => void }) {
  const [m, setM] = useState<HealthDataCreateRequest>(defaultReq(userId));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Client-side BMI preview
  const bmi = useMemo(() => {
    if (!m.weight || !m.height) return undefined;
    const h = m.height / 100;
    return +(m.weight / (h * h)).toFixed(1);
  }, [m.weight, m.height]);

  function set<K extends keyof HealthDataCreateRequest>(
    k: K,
    v: HealthDataCreateRequest[K]
  ) {
    setM((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const hasAny =
        m.weight != null ||
        m.height != null ||
        m.heartRate != null ||
        m.systolicBp != null ||
        m.diastolicBp != null ||
        m.sleepHours != null ||
        m.steps != null;
      if (!hasAny) throw new Error("Please input at least one metric.");

      await createHealthData(m);
      setMsg("Saved successfully.");
      setM(defaultReq(userId));
      onSaved?.(); // safe optional callback (prevents 'is not a function')
    } catch (err: any) {
      setMsg(err.message ?? "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSyncAll() {
    setBusy(true);
    setMsg(null);
    try {
      const results = await syncAllConnectedDevices(userId);
      const failed = results.filter((r) => !r.ok).length;
      setMsg(
        failed
          ? `Synced ${results.length - failed}/${results.length} devices.`
          : `Synced ${results.length} devices.`
      );
      onSaved?.();
    } catch (err: any) {
      setMsg(err.message ?? "Sync failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h3>Record Today</h3>
      <form onSubmit={handleSubmit} className="row">
        <div>
          <label>DateTime</label>
          <input
            type="datetime-local"
            // Show local wall-clock without 'Z' (prevents the 11-hour offset)
            value={toLocalInputValue(m.recordedAt)}
            // Convert back to ISO string for backend on change
            onChange={(e) => set("recordedAt", fromLocalInputValue(e.target.value))}
          />
        </div>

        <div>
          <label>Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={m.weight ?? ""}
            onChange={(e) =>
              set("weight", e.target.value === "" ? undefined : +e.target.value)
            }
          />
        </div>

        <div>
          <label>Height (cm)</label>
          <input
            type="number"
            step="0.1"
            value={m.height ?? ""}
            onChange={(e) =>
              set("height", e.target.value === "" ? undefined : +e.target.value)
            }
          />
        </div>

        <div>
          <label>Heart Rate (bpm)</label>
          <input
            type="number"
            value={m.heartRate ?? ""}
            onChange={(e) =>
              set(
                "heartRate",
                e.target.value === "" ? undefined : +e.target.value
              )
            }
          />
        </div>

        <div>
          <label>Systolic BP</label>
          <input
            type="number"
            value={m.systolicBp ?? ""}
            onChange={(e) =>
              set(
                "systolicBp",
                e.target.value === "" ? undefined : +e.target.value
              )
            }
          />
        </div>

        <div>
          <label>Diastolic BP</label>
          <input
            type="number"
            value={m.diastolicBp ?? ""}
            onChange={(e) =>
              set(
                "diastolicBp",
                e.target.value === "" ? undefined : +e.target.value
              )
            }
          />
        </div>

        <div>
          <label>Sleep (hours)</label>
          <input
            type="number"
            step="0.1"
            value={m.sleepHours ?? ""}
            onChange={(e) =>
              set(
                "sleepHours",
                e.target.value === "" ? undefined : +e.target.value
              )
            }
          />
        </div>

        <div>
          <label>Steps</label>
          <input
            type="number"
            value={m.steps ?? ""}
            onChange={(e) =>
              set("steps", e.target.value === "" ? undefined : +e.target.value)
            }
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="badge">BMI (preview): {bmi ?? "-"}</div>
        </div>

        {/* Buttons row – clearly visible */}
        <div className="actions" style={{ gridColumn: "1 / -1", marginTop: 4 }}>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            Save
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleSyncAll}
            disabled={busy}
          >
            Sync All Devices
          </button>
          {msg && <span className="badge">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
