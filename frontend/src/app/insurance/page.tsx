"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import { getCurrentUser } from "@/lib/auth";
import {
  generateInsuranceRecommendation,
  getUserInsuranceRecommendations,
  getLatestInsuranceRecommendation,
  InsuranceRecommendationResponse,
} from "@/lib/api";
import type { InsuranceRecommendationRequest } from "@/lib/types";

export default function InsurancePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState("");
  const [specificNeeds, setSpecificNeeds] = useState("");
  const [isInternationalStudent, setIsInternationalStudent] = useState(false);
  const [isNewImmigrant, setIsNewImmigrant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<InsuranceRecommendationResponse | null>(null);
  const [history, setHistory] = useState<InsuranceRecommendationResponse[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setUserId(user.userId);
    loadHistory(user.userId);
    loadLatest(user.userId);
  }, [router]);

  async function loadHistory(uid: number) {
    try {
      const data = await getUserInsuranceRecommendations(uid);
      setHistory(data);
    } catch (e: any) {
      console.error("Failed to load history", e);
    }
  }

  async function loadLatest(uid: number) {
    try {
      const data = await getLatestInsuranceRecommendation(uid);
      if (data) setRecommendation(data);
    } catch (e: any) {
      console.error("Failed to load latest", e);
    }
  }

  async function handleGenerateRecommendation() {
    if (!userId) {
      setError("Please login first");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const request: InsuranceRecommendationRequest = {
        userId,
        userProfile: userProfile || undefined,
        specificNeeds: specificNeeds || undefined,
        isInternationalStudent,
        isNewImmigrant,
      };
      const result = await generateInsuranceRecommendation(request);
      setRecommendation(result);
      loadHistory(userId);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to generate insurance recommendation");
    } finally {
      setLoading(false);
    }
  }

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: "Health Insurance Recommendations" }]} />
      <h1 className="text-3xl font-bold">Health Insurance Recommendations</h1>
      <p className="text-gray-600">
        Get personalized health insurance recommendations, especially designed for international students and new immigrants.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-800">
          {error}
        </div>
      )}

      {/* Request Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Get Insurance Recommendation</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isInternationalStudent}
                onChange={(e) => setIsInternationalStudent(e.target.checked)}
                className="w-4 h-4"
              />
              <span>I am an international student</span>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isNewImmigrant}
                onChange={(e) => setIsNewImmigrant(e.target.checked)}
                className="w-4 h-4"
              />
              <span>I am a new immigrant</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Profile (Optional)
            </label>
            <textarea
              value={userProfile}
              onChange={(e) => setUserProfile(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[80px]"
              placeholder="e.g., International student from China, studying at University of Sydney, 22 years old..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Needs (Optional)
            </label>
            <textarea
              value={specificNeeds}
              onChange={(e) => setSpecificNeeds(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[80px]"
              placeholder="e.g., Budget: $500-800/year, need coverage for dental and mental health..."
            />
          </div>
          <button
            onClick={handleGenerateRecommendation}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Generating Recommendation..." : "Get Recommendation"}
          </button>
        </div>
      </div>

      {/* Recommendation Result */}
      {recommendation && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Latest Recommendation</h2>
            <span className="text-sm text-gray-500">
              {new Date(recommendation.recommendationDate).toLocaleDateString()}
            </span>
          </div>

          {recommendation.recommendationSummary && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Summary:</h3>
              <p className="text-gray-700 whitespace-pre-line">{recommendation.recommendationSummary}</p>
            </div>
          )}

          {recommendation.userProfileAnalysis && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Profile Analysis:</h3>
              <p className="text-gray-700 whitespace-pre-line">{recommendation.userProfileAnalysis}</p>
            </div>
          )}

          {recommendation.detailedRecommendation && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Detailed Recommendation:</h3>
              <p className="text-gray-700 whitespace-pre-line">{recommendation.detailedRecommendation}</p>
            </div>
          )}

          {recommendation.recommendedProducts && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Recommended Products:</h3>
              <p className="text-gray-700 whitespace-pre-line">{recommendation.recommendedProducts}</p>
            </div>
          )}

          {recommendation.benefits && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Key Benefits:</h3>
              <div className="text-gray-700 whitespace-pre-line">
                {recommendation.benefits.split("\n").map((line, i) => (
                  <p key={i} className="mb-1">
                    {line.trim() && "• "}
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {recommendation.considerations && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold mb-2">Important Considerations:</h3>
              <p className="text-gray-700 whitespace-pre-line">{recommendation.considerations}</p>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recommendation History</h2>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.insuranceRecommendationId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">
                      {item.reason === "INTERNATIONAL_STUDENT"
                        ? "International Student"
                        : item.reason === "NEW_IMMIGRANT"
                        ? "New Immigrant"
                        : "General Need"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.recommendationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {item.recommendationSummary && (
                  <p className="text-sm text-gray-700 mt-2">{item.recommendationSummary}</p>
                )}
                {item.recommendedProducts && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Products:</strong> {item.recommendedProducts.substring(0, 100)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

