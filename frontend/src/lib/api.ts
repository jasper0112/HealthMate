// frontend/src/lib/api.ts
// Centralized API client with consistent BASE/PATH and solid error handling.
// Mirrors client field names to server-preferred names on send.

import {
  HealthDataCreateRequest,
  HealthDataResponse,
  HealthAssessmentResponse,
  SmartTriageRequest,
  SmartTriageResponse,
  GpAppointmentRequest,
  GpAppointmentResponse,
  InsuranceRecommendationRequest,
  InsuranceRecommendationResponse,
  RewardSystemResponse,
  FacilityResponse,
  FacilityType,
} from "./types";
import type { MedicationGuidance } from "./types";

import { avg, sum, daysAgoISO } from "./utils";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const PATH = {
  data: "/api/health-data",
  assessment: "/api/health-assessments",
  devices: "/api/health-devices",
  users: "/api/users",
  plans: "/api/health-plans",
  diet: "/api/diet-guidance",
  medication: "/api/medication-guidance",
  triage: "/api/smart-triage",
  appointments: "/api/gp-appointments",
  insurance: "/api/insurance-recommendations",
  rewards: "/api/rewards",
  facilities: "/api/facilities",
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
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Delete request failed");
  }
  return true; // 204
}

/* ---------------- USERS (Auth) ---------------- */

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
};

export type LoginPayload = {
  usernameOrEmail: string;
  password: string;
};

export type LoginResponse = {
  userId: number;
  username: string;
  email: string;
  fullName?: string | null;
  role: "USER" | "ADMIN" | "DOCTOR";
  enabled: boolean;
  message: string;
};

export async function registerUser(payload: RegisterPayload) {
  return postJson(`${BASE}${PATH.users}`, payload);
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  return postJson(`${BASE}${PATH.users}/login`, payload);
}

/* ---------------- USER PROFILE ---------------- */

export type UserResponse = {
  id: number;
  username: string;
  email: string;
  fullName?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  age?: number | null;
  phoneNumber?: string | null;
  address?: string | null;
  userInfo?: string | null;
  healthProfile?: string | null;
  healthGoal?: string | null;
  role: "USER" | "ADMIN" | "DOCTOR";
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string | null;
};

export type UserUpdateRequest = Partial<
  Pick<
    UserResponse,
    | "username"
    | "email"
    | "fullName"
    | "gender"
    | "dateOfBirth"
    | "phoneNumber"
    | "address"
    | "userInfo"
    | "healthProfile"
    | "healthGoal"
    | "enabled"
    | "role"
  >
>;

export async function getUserById(id: number): Promise<UserResponse> {
  const res = await fetch(`${BASE}${PATH.users}/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load user");
  return res.json();
}

export async function updateUser(id: number, payload: UserUpdateRequest): Promise<UserResponse> {
  const res = await fetch(`${BASE}${PATH.users}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Update failed");
  }
  return res.json();
}

/* ---------------- ADMIN USER MANAGEMENT ---------------- */

export async function listAllUsers(): Promise<UserResponse[]> {
  const res = await fetch(`${BASE}${PATH.users}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

export async function listAllUsersIncludingDisabled(): Promise<UserResponse[]> {
  try {
    const allUsers = await listAllUsers();
    const hasEnabled = allUsers.some((u) => u.enabled === true);
    const hasDisabled = allUsers.some((u) => u.enabled === false);
    if (hasEnabled && hasDisabled) return allUsers;

    const [enabledUsers, disabledUsers] = await Promise.all([
      getUsersByEnabled(true).catch(() => []),
      getUsersByEnabled(false).catch(() => []),
    ]);

    const userMap = new Map<number, UserResponse>();
    allUsers.forEach((u) => u?.id && userMap.set(u.id, u));
    [...enabledUsers, ...disabledUsers].forEach((u) => u?.id && userMap.set(u.id, u));
    return Array.from(userMap.values());
  } catch {
    const [enabledUsers, disabledUsers] = await Promise.all([
      getUsersByEnabled(true).catch(() => []),
      getUsersByEnabled(false).catch(() => []),
    ]);
    const userMap = new Map<number, UserResponse>();
    [...enabledUsers, ...disabledUsers].forEach((u) => u?.id && userMap.set(u.id, u));
    return Array.from(userMap.values());
  }
}

export async function getUserByUsername(username: string): Promise<UserResponse> {
  const res = await fetch(`${BASE}${PATH.users}/username/${username}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load user");
  return res.json();
}

export async function getUserByEmail(email: string): Promise<UserResponse> {
  const res = await fetch(`${BASE}${PATH.users}/email/${email}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load user");
  return res.json();
}

export async function getUsersByRole(role: "USER" | "ADMIN" | "DOCTOR"): Promise<UserResponse[]> {
  const res = await fetch(`${BASE}${PATH.users}/role/${role}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

export async function getUsersByEnabled(enabled: boolean): Promise<UserResponse[]> {
  const enabledParam = enabled ? "true" : "false";
  const url = `${BASE}${PATH.users}/enabled?enabled=${enabledParam}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to load users");
  }
  const data = await res.json();

  if (Array.isArray(data)) {
    return data.filter((user) => user.enabled === enabled);
  }

  if (data && typeof data === "object") {
    let userArray: any[] = [];
    if (Array.isArray(data.users)) userArray = data.users;
    else if (Array.isArray(data.data)) userArray = data.data;
    else if (Array.isArray(data.content)) userArray = data.content;
    else if (Array.isArray(Object.values(data)[0])) {
      userArray = Object.values(data)[0] as any[];
    }
    if (userArray.length > 0) {
      return userArray.filter(
        (item): item is UserResponse =>
          typeof item === "object" && item !== null && "id" in item && item.enabled === enabled
      );
    }
  }

  return [];
}

export type UserCountResponse = {
  total: number;
  byRole?: { [key: string]: number };
  enabled?: number;
  disabled?: number;
};

export async function getUserCount(): Promise<UserCountResponse> {
  const res = await fetch(`${BASE}${PATH.users}/count`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load user count");
  return res.json();
}

export async function deleteUser(id: number) {
  return del(`${BASE}${PATH.users}/${id}`);
}

/* ---------------- HEALTH DATA ---------------- */

export async function listHealthDataByUser(
  userId = USER_ID
): Promise<HealthDataResponse[]> {
  const res = await fetch(`${BASE}${PATH.data}/user/${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load health data");
  return res.json();
}

export async function deleteHealthData(id: number) {
  return del(`${BASE}${PATH.data}/${id}`);
}

export async function createHealthData(data: HealthDataCreateRequest) {
  const payload: any = {
    ...data,
    heightCm: data.height,
    systolicPressure: data.systolicBp,
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

/* ---------------- ASSESSMENTS ---------------- */

export async function latestAssessmentByUser(
  userId = USER_ID
): Promise<HealthAssessmentResponse | null> {
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

export async function deleteAssessment(id: number) {
  return del(`${BASE}${PATH.assessment}/${id}`);
}

/* -------- Optional aggregate -------- */

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

/* ---------------- HEALTH PLANS ---------------- */

export type HealthPlanType = "DAILY" | "WEEKLY" | "MONTHLY" | string;

export type HealthPlanResponse = {
  id: number;
  userId: number;
  type: HealthPlanType;
  createdAt?: string;
  updatedAt?: string | null;
  summary?: string | null;
  items?: any[];
};

export async function generateHealthPlan(body: {
  userId: number;
  type: HealthPlanType;
  daysBack?: number;
  startDate?: string | null;
  endDate?: string | null;
  healthGoals?: string | null;
}): Promise<HealthPlanResponse> {
  return postJson(`${BASE}${PATH.plans}/generate`, body);
}

export async function latestHealthPlanByUser(userId: number): Promise<HealthPlanResponse | null> {
  const res = await fetch(`${BASE}${PATH.plans}/user/${userId}/latest`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load latest plan");
  return res.json();
}

export async function listHealthPlansByUser(userId: number): Promise<HealthPlanResponse[]> {
  const res = await fetch(`${BASE}${PATH.plans}/user/${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load plans");
  return res.json();
}

export async function deleteHealthPlan(id: number) {
  const res = await fetch(`${BASE}${PATH.plans}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete plan");
  return true;
}

export async function activeHealthPlanByUser(userId: number): Promise<HealthPlanResponse | null> {
  const res = await fetch(`${BASE}${PATH.plans}/user/${userId}/active`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load active plan");
  return res.json();
}

export async function listHealthPlansByType(userId: number, type: HealthPlanType): Promise<HealthPlanResponse[]> {
  const res = await fetch(`${BASE}${PATH.plans}/user/${userId}/type/${type}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load plans by type");
  return res.json();
}

/* ---------------- DIET GUIDANCE ---------------- */

export type DietGuidance = {
  id?: number;
  dietGuidanceId?: number;
  userId?: number;
  username?: string | null;
  healthIssue?: string | null;
  foodRecommendations?: string | null;
  avoidFoods?: string | null;
  supplementRecommendations?: string | null;
  mealSuggestions?: string | null;
  cookingTips?: string | null;
  guidance?: string | null;
  nutritionalBenefits?: string | null;
  sampleMenu?: string | null;
  summary?: string | null;
  recommendations?: string | null;
  aiInsights?: string | null;
  createdAt?: string | null;
};

export async function generateDietGuidance(userId: number, healthIssue: string): Promise<DietGuidance> {
  const url = `${BASE}${PATH.diet}?userId=${encodeURIComponent(userId)}&healthIssue=${encodeURIComponent(healthIssue)}`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to generate diet guidance");
  }
  return res.json();
}

export async function getDietGuidance(id: number): Promise<DietGuidance> {
  const res = await fetch(`${BASE}${PATH.diet}/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load guidance");
  return res.json();
}

export async function listDietGuidanceByUser(userId: number): Promise<DietGuidance[]> {
  const res = await fetch(`${BASE}${PATH.diet}/user/${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load user diet guidance");
  return res.json();
}

export async function searchDietGuidance(healthIssue: string): Promise<DietGuidance[]> {
  const res = await fetch(`${BASE}${PATH.diet}/search?healthIssue=${encodeURIComponent(healthIssue)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to search diet guidance");
  return res.json();
}

export async function deleteDietGuidance(id: number) {
  const res = await fetch(`${BASE}${PATH.diet}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete diet guidance");
  return true;
}
/* ---------------- MEDICATION GUIDANCE (OTC) ---------------- */



export async function generateMedicationGuidance(
  userId: number,
  symptoms: string
): Promise<MedicationGuidance> {
  const url = `${BASE}/api/medication-guidance?userId=${encodeURIComponent(userId)}&symptoms=${encodeURIComponent(symptoms)}`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to generate medication guidance");
  }
  return res.json();
}

// ✅ 列表（按用户）
export async function listMedicationGuidanceByUser(userId: number): Promise<MedicationGuidance[]> {
  const res = await fetch(`${BASE}/api/medication-guidance/user/${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load medication guidance list");
  return res.json();
}

// ✅ 详情（按 guidanceId）
export async function getMedicationGuidance(id: number): Promise<MedicationGuidance> {
  const res = await fetch(`${BASE}/api/medication-guidance/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load medication guidance");
  return res.json();
}

// ✅ 删除
export async function deleteMedicationGuidance(id: number): Promise<boolean> {
  const res = await fetch(`${BASE}/api/medication-guidance/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to delete medication guidance");
  }
  return true;
}

// ✅ 给组件用的别名（防止"没有导出的成员 getMedicationGuidanceById"）
export { getMedicationGuidance as getMedicationGuidanceById };

/* ---------------- SMART TRIAGE ---------------- */

export async function generateTriage(request: SmartTriageRequest): Promise<SmartTriageResponse> {
  return postJson(`${BASE}${PATH.triage}`, request);
}

export async function getTriageById(id: number): Promise<SmartTriageResponse> {
  const res = await fetch(`${BASE}${PATH.triage}/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load triage");
  return res.json();
}

export async function getTriageHistory(userId: number): Promise<SmartTriageResponse[]> {
  const res = await fetch(`${BASE}${PATH.triage}/user/${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load triage history");
  return res.json();
}

export async function getLatestTriage(userId: number): Promise<SmartTriageResponse | null> {
  const res = await fetch(`${BASE}${PATH.triage}/user/${userId}/latest`, { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to load latest triage");
  }
  return res.json();
}

export async function deleteTriage(id: number): Promise<boolean> {
  const res = await fetch(`${BASE}${PATH.triage}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete triage");
  return true;
}

/* ---------------- GP APPOINTMENTS ---------------- */

export async function bookGpAppointment(request: GpAppointmentRequest): Promise<GpAppointmentResponse> {
  return postJson(`${BASE}${PATH.appointments}`, request);
}

export async function getAppointmentById(id: number): Promise<GpAppointmentResponse> {
  const res = await fetch(`${BASE}${PATH.appointments}/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load appointment");
  return res.json();
}

export async function getUserAppointments(userId: number): Promise<GpAppointmentResponse[]> {
  const res = await fetch(`${BASE}${PATH.appointments}/user/${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load appointments");
  return res.json();
}

export async function cancelAppointment(id: number): Promise<boolean> {
  const res = await fetch(`${BASE}${PATH.appointments}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to cancel appointment");
  return true;
}

/* ---------------- INSURANCE RECOMMENDATIONS ---------------- */

export async function generateInsuranceRecommendation(
  request: InsuranceRecommendationRequest
): Promise<InsuranceRecommendationResponse> {
  return postJson(`${BASE}${PATH.insurance}`, request);
}

export async function getUserInsuranceRecommendations(
  userId: number
): Promise<InsuranceRecommendationResponse[]> {
  const res = await fetch(`${BASE}${PATH.insurance}/user/${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load insurance recommendations");
  return res.json();
}

export async function getLatestInsuranceRecommendation(
  userId: number
): Promise<InsuranceRecommendationResponse | null> {
  const res = await fetch(`${BASE}${PATH.insurance}/user/${userId}/latest`, { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to load latest insurance recommendation");
  }
  return res.json();
}

/* ---------------- REWARD SYSTEM ---------------- */

export async function dailyCheckIn(userId: number): Promise<RewardSystemResponse> {
  const res = await fetch(`${BASE}${PATH.rewards}/${userId}/check-in`, { method: "POST" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to check in");
  }
  return res.json();
}

export async function getUserRewards(userId: number): Promise<RewardSystemResponse | null> {
  const res = await fetch(`${BASE}${PATH.rewards}/user/${userId}`, { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to load rewards");
  }
  return res.json();
}

export async function recordHealthDataEntry(userId: number): Promise<RewardSystemResponse> {
  const res = await fetch(`${BASE}${PATH.rewards}/${userId}/health-data`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to record health data entry");
  return res.json();
}

export async function recordAssessmentCompletion(userId: number): Promise<RewardSystemResponse> {
  const res = await fetch(`${BASE}${PATH.rewards}/${userId}/assessment`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to record assessment completion");
  return res.json();
}

/* ---------------- FACILITIES ---------------- */

export async function getAllFacilities(): Promise<FacilityResponse[]> {
  const res = await fetch(`${BASE}${PATH.facilities}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load facilities");
  return res.json();
}

export async function getFacilityById(id: number): Promise<FacilityResponse> {
  const res = await fetch(`${BASE}${PATH.facilities}/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load facility");
  return res.json();
}

export async function getFacilitiesByType(type: FacilityType): Promise<FacilityResponse[]> {
  const res = await fetch(`${BASE}${PATH.facilities}/type/${type}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load facilities");
  return res.json();
}