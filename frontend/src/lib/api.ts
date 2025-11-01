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
  users: "/api/users",
  plans: "/api/health-plans",
  diet: "/api/diet-guidance",
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

/* ---------------- USERS (Auth) ---------------- */

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  gender?: string; // BACKEND enum string; optional
  dateOfBirth?: string; // ISO string if provided
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

/**
 * 获取所有用户（包括启用和未启用的）
 * 通过合并启用和禁用用户的列表来确保获取完整数据
 */
export async function listAllUsersIncludingDisabled(): Promise<UserResponse[]> {
  try {
    // 尝试直接获取所有用户
    const allUsers = await listAllUsers();
    // 如果已经包含了启用的和禁用的用户，直接返回
    const hasEnabled = allUsers.some((u) => u.enabled === true);
    const hasDisabled = allUsers.some((u) => u.enabled === false);
    
    if (hasEnabled && hasDisabled) {
      return allUsers;
    }
    
    // 如果缺少某些状态的用户，补充获取
    const [enabledUsers, disabledUsers] = await Promise.all([
      getUsersByEnabled(true).catch(() => []),
      getUsersByEnabled(false).catch(() => []),
    ]);
    
    // 合并去重
    const userMap = new Map<number, UserResponse>();
    allUsers.forEach((u) => {
      if (u?.id) userMap.set(u.id, u);
    });
    [...enabledUsers, ...disabledUsers].forEach((u) => {
      if (u?.id) userMap.set(u.id, u);
    });
    
    return Array.from(userMap.values());
  } catch (e: any) {
    // 如果 listAllUsers 失败，尝试合并启用和禁用的用户
    const [enabledUsers, disabledUsers] = await Promise.all([
      getUsersByEnabled(true).catch(() => []),
      getUsersByEnabled(false).catch(() => []),
    ]);
    
    // 合并去重
    const userMap = new Map<number, UserResponse>();
    [...enabledUsers, ...disabledUsers].forEach((u) => {
      if (u?.id) userMap.set(u.id, u);
    });
    
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
  // 确保布尔值正确转换为 URL 查询参数字符串
  const enabledParam = enabled ? "true" : "false";
  const url = `${BASE}${PATH.users}/enabled?enabled=${enabledParam}`;
  
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to load users");
  }
  const data = await res.json();
  
  // 确保返回的是数组，如果不是数组则转换为数组
  if (Array.isArray(data)) {
    // 验证返回的用户是否匹配查询条件
    return data.filter(user => user.enabled === enabled);
  }
  
  // 如果返回的是对象，尝试提取数组
  if (data && typeof data === "object") {
    let userArray: any[] = [];
    // 可能的结构：{ users: [...] } 或 { data: [...] } 或 { content: [...] }
    if (Array.isArray(data.users)) userArray = data.users;
    else if (Array.isArray(data.data)) userArray = data.data;
    else if (Array.isArray(data.content)) userArray = data.content;
    else if (Array.isArray(Object.values(data)[0])) {
      userArray = Object.values(data)[0] as any[];
    }
    
    if (userArray.length > 0) {
      // 验证返回的用户是否匹配查询条件
      return userArray.filter((item): item is UserResponse => 
        typeof item === "object" && item !== null && "id" in item && item.enabled === enabled
      ) as UserResponse[];
    }
  }
  
  // 如果都不是，返回空数组
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

/* ---------------- generic helpers ---------------- */

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
  id?: number; // 前端兼容字段
  dietGuidanceId?: number; // 后端实际字段
  userId?: number;
  username?: string | null;
  healthIssue?: string | null;
  // 后端实际字段
  foodRecommendations?: string | null;
  avoidFoods?: string | null;
  supplementRecommendations?: string | null;
  mealSuggestions?: string | null;
  cookingTips?: string | null;
  guidance?: string | null;
  nutritionalBenefits?: string | null;
  sampleMenu?: string | null;
  // 前端兼容字段
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
