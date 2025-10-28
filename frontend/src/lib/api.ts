// src/lib/api.ts
// Centralized API client with robust error extraction

import { HealthDataCreateRequest, HealthDataResponse, HealthAssessmentResponse, HealthPlanRequest, HealthPlanResponse } from "./types";
import { avg, sum, daysAgoISO } from "./utils";

// Support both Next.js & local Spring Boot dev
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const PATH = {
  data: "/api/health-data",
  assessment: "/api/health-assessments",
  devices: "/api/health-devices",
  plans: "/api/health-plans",
  guidanceDiet: "/api/diet-guidance",
  guidanceMed: "/api/medication-guidance",
  insurance: "/api/insurance-recommendations",
  facilities: "/api/facilities",
  appointments: "/api/gp-appointments",
  rewards: "/api/rewards",
};

const USER_ID = Number(process.env.NEXT_PUBLIC_USER_ID ?? 1);

/* =======================================================
 Generic POST helper used by multiple API calls
======================================================= */
export async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    try {
      const j = JSON.parse(text);
      throw new Error(j.error || text || "Request failed");
    } catch {
      throw new Error(text || "Request failed");
    }
  }
  return res.json();
}

/* =======================================================
 HEALTH DATA API
======================================================= */
export async function listHealthDataByUser(userId = USER_ID): Promise<HealthDataResponse[]> {
  const res = await fetch(`${BASE}${PATH.data}/user/${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load health data");
  return res.json();
}

export async function deleteHealthData(id: number) {
  const res = await fetch(`${BASE}${PATH.data}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete data");
  return res.json();
}

export async function createHealthData(data: HealthDataCreateRequest) {
  return postJson(`${BASE}${PATH.data}`, data);
}

/* =======================================================
 DEVICE SYNC API
======================================================= */
export async function listConnectedDevices(userId = USER_ID) {
  const res = await fetch(`${BASE}${PATH.devices}/user/${userId}/connected`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load devices");
  return res.json();
}

export async function syncDevice(deviceId: number) {
  const res = await fetch(`${BASE}${PATH.devices}/${deviceId}/sync`, { method: "PUT" });
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

/* =======================================================
 HEALTH ASSESSMENT API (Gemini Trigger Support)
======================================================= */
export async function latestAssessmentByUser(userId = USER_ID): Promise<HealthAssessmentResponse | null> {
  const res = await fetch(`${BASE}${PATH.assessment}/user/${userId}/latest`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch latest assessment");
  return res.json();
}

export async function listAssessmentsByUser(userId = USER_ID) {
  const res = await fetch(`${BASE}${PATH.assessment}/user/${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load assessments");
  return res.json();
}

export async function triggerAssessment(body: any) {
  return postJson(`${BASE}${PATH.assessment}/trigger`, body);
}

/* =======================================================
 HEALTH PLAN (AI)
======================================================= */
export async function generateHealthPlan(body: HealthPlanRequest): Promise<HealthPlanResponse> {
  return postJson(`${BASE}${PATH.plans}/generate`, body);
}

export async function listHealthPlansByUser(userId = USER_ID): Promise<HealthPlanResponse[]> {
  const res = await fetch(`${BASE}${PATH.plans}/user/${userId}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    try { const j = JSON.parse(text); throw new Error(j.error || text || "Failed to load health plans"); }
    catch { throw new Error(text || "Failed to load health plans"); }
  }
  return res.json();
}

export async function latestHealthPlan(userId = USER_ID): Promise<HealthPlanResponse | null> {
  const res = await fetch(`${BASE}${PATH.plans}/user/${userId}/latest`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    try { const j = JSON.parse(text); throw new Error(j.error || text || "Failed to load latest health plan"); }
    catch { throw new Error(text || "Failed to load latest health plan"); }
  }
  return res.json();
}

/* =======================================================
Auto Metric Aggregation + AI Report Trigger
======================================================= */
export async function aggregateAndTriggerAssessment(
  userId = USER_ID,
  lookbackDays = 7
): Promise<HealthAssessmentResponse> {
  const all = await listHealthDataByUser(userId);
  const startISO = daysAgoISO(lookbackDays);
  const window = all.filter(r => new Date(r.recordedAt).getTime() >= new Date(startISO).getTime());

  const summary = {
    sampleCount: window.length,
    avgWeight: avg(window.map(r => r.weight ?? NaN)),
    avgHeartRate: avg(window.map(r => r.heartRate ?? NaN)),
    totalSteps: sum(window.map(r => r.steps ?? NaN)),
    latest: window[0] || null
  };

  const body = { userId, type: "GENERAL", lookbackDays, metricsSummary: summary };
  return triggerAssessment(body);
}

/* =======================================================
 GUIDANCE (Diet / Medication)
======================================================= */
export async function generateDietGuidance(userId = USER_ID, healthIssue: string) {
  const res = await fetch(`${BASE}${PATH.guidanceDiet}?userId=${userId}&healthIssue=${encodeURIComponent(healthIssue)}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to generate diet guidance");
  return res.json();
}

export async function generateMedicationGuidance(userId = USER_ID, symptoms: string) {
  const res = await fetch(`${BASE}${PATH.guidanceMed}?userId=${userId}&symptoms=${encodeURIComponent(symptoms)}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to generate medication guidance");
  return res.json();
}

/* =======================================================
 INSURANCE RECOMMENDATIONS
======================================================= */
export async function generateInsuranceRecommendation(body: { userId: number; userProfile: string; specificNeeds: string }) {
  const res = await fetch(`${BASE}${PATH.insurance}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error("Failed to generate insurance recommendation");
  return res.json();
}

export async function latestInsuranceRecommendation(userId = USER_ID) {
  const res = await fetch(`${BASE}${PATH.insurance}/user/${userId}/latest`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load latest insurance recommendation");
  return res.json();
}

export async function listInsuranceRecommendations(userId = USER_ID) {
  const res = await fetch(`${BASE}${PATH.insurance}/user/${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load insurance recommendations");
  return res.json();
}

/* =======================================================
 FACILITIES
======================================================= */
export async function listFacilities() {
  const res = await fetch(`${BASE}${PATH.facilities}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load facilities");
  return res.json();
}

export async function searchFacilitiesByName(name: string) {
  const res = await fetch(`${BASE}${PATH.facilities}/search?name=${encodeURIComponent(name)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to search facilities");
  return res.json();
}

/* =======================================================
 GP APPOINTMENTS
======================================================= */
export async function listAppointmentsByUser(userId = USER_ID) {
  const res = await fetch(`${BASE}${PATH.appointments}/user/${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load appointments");
  return res.json();
}

export async function cancelAppointment(appointmentId: number) {
  const res = await fetch(`${BASE}${PATH.appointments}/${appointmentId}/cancel`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to cancel appointment");
  return res.json();
}

/* =======================================================
 REWARDS
======================================================= */
export async function getRewards(userId = USER_ID) {
  const res = await fetch(`${BASE}${PATH.rewards}/user/${userId}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load rewards");
  return res.json();
}

export async function rewardsCheckIn(userId = USER_ID) {
  const res = await fetch(`${BASE}${PATH.rewards}/${userId}/check-in`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to check in");
  return res.json();
}
