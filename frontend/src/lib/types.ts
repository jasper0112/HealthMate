// src/lib/types.ts
// TypeScript contracts aligned with your controllers.
// Removed `traffic` from HealthAssessmentResponse.

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
  mood?: MoodLevel; // optional for reading if backend returns it
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
}

export interface HealthAssessmentResponse {
  id: number;
  userId: number;
  type?: "GENERAL" | "DIET" | "SLEEP" | string;
  overallScore?: number;
  createdAt: string;
  highlights?: string[];
  recommendations?: string[];
  kpis?: { name: string; value: string | number; traffic?: "green" | "yellow" | "red" }[];
}

// src/lib/types.ts


export type MedicationGuidance = {
  medGuidanceId?: number;
  userId?: number;
  username?: string | null;
  symptoms?: string | null;
  conditionDescription?: string | null;
  otcMedications?: string | null;
  usageInstructions?: string | null;
  precautions?: string | null;
  sideEffects?: string | null;
  recommendedPharmacies?: string | null;
  priceComparison?: string | null;
  guidance?: string | null;
  createdAt?: string | null;
};
