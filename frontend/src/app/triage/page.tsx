"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import { getCurrentUser } from "@/lib/auth";
import {
  generateTriage,
  getTriageHistory,
  getUserAppointments,
  bookGpAppointment,
  deleteTriage,
  getFacilitiesByType,
  SmartTriageResponse,
  GpAppointmentResponse,
  FacilityResponse,
} from "@/lib/api";
import type { SmartTriageRequest, GpAppointmentRequest } from "@/lib/types";

const PRIORITY_COLORS = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const PRIORITY_LABELS = {
  LOW: "Self-Care",
  MEDIUM: "GP Appointment",
  HIGH: "Urgent Care",
  CRITICAL: "Emergency",
};

export default function TriagePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<SmartTriageResponse | null>(null);
  const [history, setHistory] = useState<SmartTriageResponse[]>([]);
  const [appointments, setAppointments] = useState<GpAppointmentResponse[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingFacilityId, setBookingFacilityId] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingReason, setBookingReason] = useState("");
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setUserId(user.userId);
    loadHistory(user.userId);
    loadAppointments(user.userId);
    loadFacilities();
  }, [router]);

  async function loadFacilities() {
    setLoadingFacilities(true);
    try {
      const data = await getFacilitiesByType("GP");
      setFacilities(data);
    } catch (e: any) {
      console.error("Failed to load facilities", e);
    } finally {
      setLoadingFacilities(false);
    }
  }

  async function loadHistory(uid: number) {
    try {
      const data = await getTriageHistory(uid);
      setHistory(data);
    } catch (e: any) {
      console.error("Failed to load history", e);
    }
  }

  async function loadAppointments(uid: number) {
    try {
      const data = await getUserAppointments(uid);
      setAppointments(data);
    } catch (e: any) {
      console.error("Failed to load appointments", e);
    }
  }

  async function handleGenerateTriage() {
    if (!userId || !symptoms.trim()) {
      setError("Please enter your symptoms");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const request: SmartTriageRequest = {
        userId,
        symptomsInfo: symptoms,
        additionalContext: additionalContext || undefined,
      };
      const result = await generateTriage(request);
      setTriageResult(result);
      loadHistory(userId);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to generate triage recommendation");
    } finally {
      setLoading(false);
    }
  }

  async function handleBookAppointment() {
    if (!userId || !bookingFacilityId || !bookingDate) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const request: GpAppointmentRequest = {
        userId,
        facilityId: bookingFacilityId,
        appointmentDate: new Date(bookingDate).toISOString(),
        reason: bookingReason || undefined,
      };
      await bookGpAppointment(request);
      setShowBooking(false);
      setBookingDate("");
      setBookingReason("");
      setBookingFacilityId(null);
      loadAppointments(userId);
      alert("Appointment booked successfully!");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTriage(id: number) {
    if (!confirm("Delete this triage record?")) return;
    try {
      await deleteTriage(id);
      loadHistory(userId!);
      if (triageResult?.triageId === id) {
        setTriageResult(null);
      }
    } catch (e: any) {
      setError(e.message || "Failed to delete");
    }
  }

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: "Smart Triage & GP Connection" }]} />
      <h1 className="text-3xl font-bold">Smart Triage & GP Connection</h1>
      <p className="text-gray-600">
        Get quick guidance on whether to self-care, take OTC medicine, book a GP appointment, or go to emergency.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-800">
          {error}
        </div>
      )}

      {/* Triage Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Describe Your Symptoms</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms <span className="text-red-500">*</span>
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[100px]"
              placeholder="e.g., Headache for 2 days, mild pain, no fever..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Context (Optional)
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[80px]"
              placeholder="e.g., History of migraines, recent stress..."
            />
          </div>
          <button
            onClick={handleGenerateTriage}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Get Triage Recommendation"}
          </button>
        </div>
      </div>

      {/* Triage Result */}
      {triageResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Triage Result</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_COLORS[triageResult.priority]}`}
            >
              {PRIORITY_LABELS[triageResult.priority]}
            </span>
          </div>

          {triageResult.recommendedAction && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Recommended Action:</h3>
              <p className="text-gray-700 whitespace-pre-line">{triageResult.recommendedAction}</p>
            </div>
          )}

          {triageResult.triageResult && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Triage Assessment:</h3>
              <p className="text-gray-700 whitespace-pre-line">{triageResult.triageResult}</p>
            </div>
          )}

          {triageResult.aiAnalysis && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">AI Analysis:</h3>
              <p className="text-gray-700 whitespace-pre-line">{triageResult.aiAnalysis}</p>
            </div>
          )}

          {triageResult.priority === "MEDIUM" && (
            <button
              onClick={() => {
                setShowBooking(true);
                setBookingReason(triageResult.symptomsInfo);
              }}
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Book GP Appointment
            </button>
          )}
        </div>
      )}

      {/* Booking Form */}
      {showBooking && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Book GP Appointment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select GP Facility <span className="text-red-500">*</span>
              </label>
              {loadingFacilities ? (
                <div className="text-sm text-gray-500">Loading facilities...</div>
              ) : facilities.length > 0 ? (
                <select
                  value={bookingFacilityId || ""}
                  onChange={(e) => setBookingFacilityId(Number(e.target.value) || null)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">Select a facility...</option>
                  {facilities.map((facility) => (
                    <option key={facility.facilityId} value={facility.facilityId}>
                      {facility.name} {facility.address ? `- ${facility.address}` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <input
                    type="number"
                    value={bookingFacilityId || ""}
                    onChange={(e) => setBookingFacilityId(Number(e.target.value) || null)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="Enter facility ID (if no facilities available)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    No facilities found. Please enter facility ID manually.
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <textarea
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[80px]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBookAppointment}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Booking..." : "Book Appointment"}
              </button>
              <button
                onClick={() => {
                  setShowBooking(false);
                  setBookingDate("");
                  setBookingReason("");
                  setBookingFacilityId(null);
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointments List */}
      {appointments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.appointmentId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{apt.facilityName}</p>
                    <p className="text-sm text-gray-600">{apt.facilityAddress}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Date: {new Date(apt.appointmentDate).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      Status: <span className="font-medium">{apt.status}</span>
                    </p>
                    {apt.reason && <p className="text-sm text-gray-600 mt-1">Reason: {apt.reason}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Triage History</h2>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.triageId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[item.priority]}`}
                      >
                        {PRIORITY_LABELS[item.priority]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.triageTime).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Symptoms:</strong> {item.symptomsInfo}
                    </p>
                    {item.recommendedAction && (
                      <p className="text-sm text-gray-600">{item.recommendedAction}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteTriage(item.triageId)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

