// Centralized API client with consistent BASE/PATH and solid error handling.
// This version mirrors client field names to server-preferred names on send
// (height -> heightCm; systolicBp/diastolicBp -> systolicPressure/diastolicPressure).

import {
  HealthDataCreateRequest,
  HealthDataResponse,
  HealthAssessmentResponse,
} from "./types";
import { avg, sum, daysAgoISO } from "./utils";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const PATH = {
  data: "/api/health-data",
  assessment: "/api/health-assessments",
  devices: "/api/health-devices",
};

const USER_ID = Number(process.env.NEXT_PUBLIC_USER_ID ?? 1);

/* ---------------- generic helpers ---------------- */

export async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    try {
      const j = text ? JSON.parse(text) : null;
      throw new Error(j?.error || text || "Request failed");
    } catch {
      throw new Error(text || "Request failed");
    }
  }
  return res.json();
}

async function del(url: string) {
  try {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || "Delete request failed");
    }
    return true; // 204 OK
  } catch (e: any) {
    throw new Error(e?.message || "Failed to fetch");
  }
}

/* ---------------- HEALTH DATA ---------------- */

export async function listHealthDataByUser(
  userId = USER_ID
): Promise<HealthDataResponse[]> {
  const res = await fetch(`${BASE}${PATH.data}/user/${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load health data");
  return res.json();
}

export async function deleteHealthData(id: number) {
  return del(`${BASE}${PATH.data}/${id}`);
}

export async function createHealthData(data: HealthDataCreateRequest) {
  // Mirror to backend-preferred names while keeping client names.
  const payload: any = {
    ...data,
    heightCm: data.height,                   // map cm to heightCm
    systolicPressure: data.systolicBp,       // BP name mapping
    diastolicPressure: data.diastolicBp,
  };
  return postJson(`${BASE}${PATH.data}`, payload);
}

/* ---------------- DEVICES ---------------- */

export async function listConnectedDevices(userId = USER_ID) {
  const res = await fetch(`${BASE}${PATH.devices}/user/${userId}/connected`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load devices");
  return res.json();
}

export async function syncDevice(deviceId: number) {
  const res = await fetch(`${BASE}${PATH.devices}/${deviceId}/sync`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Failed to sync device");
  return res.json();
}

export async function syncAllConnectedDevices(userId = USER_ID) {
  const list = await listConnectedDevices(userId);
  const out: { id: number; ok: boolean }[] = [];
  for (const d of list) {
    try {
      await syncDevice(d.id);
      out.push({ id: d.id, ok: true });
    } catch {
      out.push({ id: d.id, ok: false });
    }
  }
  return out;
}

/* ---------------- ASSESSMENTS ---------------- */

export async function latestAssessmentByUser(
  userId = USER_ID
): Promise<HealthAssessmentResponse | null> {
  const res = await fetch(
    `${BASE}${PATH.assessment}/user/${userId}/latest`,
    { cache: "no-store" }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch latest assessment");
  return res.json();
}

export async function listAssessmentsByUser(userId = USER_ID) {
  const res = await fetch(`${BASE}${PATH.assessment}/user/${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load assessments");
  return res.json();
}

export async function triggerAssessment(body: any) {
  return postJson(`${BASE}${PATH.assessment}/trigger`, body);
}

export async function deleteAssessment(id: number) {
  return del(`${BASE}${PATH.assessment}/${id}`);
}

/* -------- Optional aggregate (kept for compatibility) -------- */

export async function aggregateAndTriggerAssessment(
  userId = USER_ID,
  lookbackDays = 7
): Promise<HealthAssessmentResponse> {
  const all = await listHealthDataByUser(userId);
  const startISO = daysAgoISO(lookbackDays);
  const window = all.filter(
    (r) => new Date(r.recordedAt).getTime() >= new Date(startISO).getTime()
  );

  const summary = {
    sampleCount: window.length,
    avgWeight: avg(window.map((r) => r.weight ?? NaN)),
    avgHeartRate: avg(window.map((r) => r.heartRate ?? NaN)),
    totalSteps: sum(window.map((r) => r.steps ?? NaN)),
    latest: window[0] || null,
  };

  const body = { userId, type: "GENERAL", lookbackDays, metricsSummary: summary };
  return triggerAssessment(body);
}
