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

// Smart Triage types
export type TriagePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SmartTriageResponse {
  triageId: number;
  userId: number;
  username?: string;
  symptomsInfo: string;
  priority: TriagePriority;
  triageResult?: string;
  recommendedAction?: string;
  aiAnalysis?: string;
  triageTime: string;
  associatedAppointmentId?: number;
  createdAt: string;
}

export interface SmartTriageRequest {
  userId: number;
  symptomsInfo: string;
  additionalContext?: string;
}

// GP Appointment types
export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface GpAppointmentResponse {
  appointmentId: number;
  userId: number;
  username?: string;
  facilityId: number;
  facilityName: string;
  facilityAddress: string;
  appointmentDate: string;
  status: AppointmentStatus;
  notes?: string;
  reason?: string;
  reminderTime?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GpAppointmentRequest {
  userId: number;
  facilityId: number;
  appointmentDate: string; // ISO string
  reason?: string;
  notes?: string;
  reminderTime?: string;
}

// Insurance Recommendation types
export type RecommendationReason = "INTERNATIONAL_STUDENT" | "NEW_IMMIGRANT" | "GENERAL_NEED";

export interface InsuranceRecommendationResponse {
  insuranceRecommendationId: number;
  userId: number;
  username?: string;
  reason: RecommendationReason;
  recommendationSummary?: string;
  detailedRecommendation?: string;
  recommendedProducts?: string;
  userProfileAnalysis?: string;
  benefits?: string;
  considerations?: string;
  recommendationDate: string;
  createdAt: string;
}

export interface InsuranceRecommendationRequest {
  userId: number;
  userProfile?: string;
  specificNeeds?: string;
  isInternationalStudent?: boolean;
  isNewImmigrant?: boolean;
}

// Reward System types
export interface RewardSystemResponse {
  rewardId: number;
  userId: number;
  username?: string;
  totalPoints: number;
  lifetimePoints: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate?: string;
  checkInRecords?: Record<string, boolean>;
  healthDataEntries: number;
  completedAssessments: number;
  completedPlans: number;
  tier: number;
  tierName: string;
  createdAt: string;
  updatedAt?: string;
}

// Facility types
export type FacilityType = "GP" | "HOSPITAL" | "CLINIC" | "PHARMACY" | "URGENT_CARE" | "EMERGENCY";

export interface FacilityResponse {
  facilityId: number;
  facilityType: FacilityType;
  name: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  specialties?: string;
  operatingHours?: string;
  directions?: string;
  distance?: number;
  createdAt: string;
}