// TypeScript contracts aligned with your controllers.
// mood is removed from create/update payload.

export type MoodLevel = "LOW" | "MEDIUM" | "HIGH"; // kept for response compatibility if backend returns it

export interface HealthDataResponse {
  id: number;
  userId: number;
  recordedAt: string;
  weight?: number;
  height?: number;
  heartRate?: number;
  systolicBp?: number;
  diastolicBp?: number;
  sleepHours?: number;
  steps?: number;
  mood?: MoodLevel; // keep optional for reading if backend returns it
  bmi?: number;
}

export interface HealthDataCreateRequest {
  userId: number;
  recordedAt: string; // ISO string
  weight?: number;
  height?: number;
  heartRate?: number;
  systolicBp?: number;
  diastolicBp?: number;
  sleepHours?: number;
  steps?: number;
  // mood removed from payload
}

export interface HealthAssessmentResponse {
  id: number;
  userId: number;
  type?: "GENERAL" | "DIET" | "SLEEP" | string;
  overallScore?: number;
  traffic?: "green" | "yellow" | "red";
  createdAt: string;
  highlights?: string[];
  recommendations?: string[];
  kpis?: { name: string; value: string | number; traffic?: "green" | "yellow" | "red" }[];
}

// ==== Health Plan (AI) ====
// Align with backend enum HealthPlan.PlanType { DAILY, WEEKLY, MONTHLY }
export type HealthPlanType = "DAILY" | "WEEKLY" | "MONTHLY";

export interface HealthPlanRequest {
  userId: number;
  type: HealthPlanType;
  daysBack?: number;
  startDate?: string;
  endDate?: string;
  healthGoals?: string[];
}

export interface HealthPlanResponse {
  id: number;
  userId: number;
  username?: string;
  planDate?: string;
  startDate?: string;
  endDate?: string;
  type?: HealthPlanType;
  dietPlan?: string;
  workoutPlan?: string;
  lifestylePlan?: string;
  longTermGoals?: string[];
  summary?: string;
  createdAt?: string;
  updatedAt?: string;
}
