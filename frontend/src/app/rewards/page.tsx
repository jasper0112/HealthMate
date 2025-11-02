"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import { getCurrentUser } from "@/lib/auth";
import { dailyCheckIn, getUserRewards, RewardSystemResponse } from "@/lib/api";

const TIER_COLORS = {
  1: "bg-amber-100 text-amber-800",
  2: "bg-gray-100 text-gray-800",
  3: "bg-yellow-100 text-yellow-800",
  4: "bg-blue-100 text-blue-800",
};

const TIER_NAMES = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
  4: "Platinum",
};

export default function RewardsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [rewards, setRewards] = useState<RewardSystemResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setUserId(user.userId);
    loadRewards(user.userId);
  }, [router]);

  async function loadRewards(uid: number) {
    try {
      const data = await getUserRewards(uid);
      setRewards(data);
    } catch (e: any) {
      console.error("Failed to load rewards", e);
    }
  }

  async function handleCheckIn() {
    if (!userId) return;
    setCheckingIn(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await dailyCheckIn(userId);
      setRewards(result);
      setSuccess(`Check-in successful! You earned points. Current streak: ${result.currentStreak} days!`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to check in");
    } finally {
      setCheckingIn(false);
    }
  }

  function canCheckInToday(): boolean {
    if (!rewards || !rewards.lastCheckInDate) return true;
    const today = new Date().toISOString().split("T")[0];
    const lastCheckIn = new Date(rewards.lastCheckInDate).toISOString().split("T")[0];
    return today !== lastCheckIn;
  }

  if (!userId) {
    return <div>Loading...</div>;
  }

  if (!rewards) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Rewards & Check-in" }]} />
        <h1 className="text-3xl font-bold">Rewards & Check-in</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">No rewards data found. Start by checking in!</p>
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {checkingIn ? "Checking in..." : "Check In Now"}
          </button>
        </div>
      </div>
    );
  }

  const canCheckIn = canCheckInToday();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: "Rewards & Check-in" }]} />
      <h1 className="text-3xl font-bold">Daily Check-in Challenge & Rewards</h1>
      <p className="text-gray-600">
        Maintain healthy habits through daily check-ins, earn points, and unlock achievements!
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-800">
          {success}
        </div>
      )}

      {/* Check-in Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Daily Check-in</h2>
          {!canCheckIn && (
            <span className="text-sm text-green-600 font-medium">✓ Checked in today</span>
          )}
        </div>
        <p className="text-gray-600 mb-4">
          Check in daily to maintain your streak and earn points. Longer streaks = more bonus points!
        </p>
        <button
          onClick={handleCheckIn}
          disabled={checkingIn || !canCheckIn}
          className={`px-6 py-3 rounded-lg font-medium ${
            canCheckIn
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          } disabled:opacity-50`}
        >
          {checkingIn
            ? "Checking in..."
            : canCheckIn
            ? "Check In Now"
            : "Already Checked In Today"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">{rewards.totalPoints}</div>
          <div className="text-sm text-gray-600">Current Points</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">{rewards.lifetimePoints}</div>
          <div className="text-sm text-gray-600">Lifetime Points</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">{rewards.currentStreak}</div>
          <div className="text-sm text-gray-600">Current Streak (days)</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-orange-600 mb-2">{rewards.longestStreak}</div>
          <div className="text-sm text-gray-600">Longest Streak (days)</div>
        </div>
      </div>

      {/* Tier Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Tier</h2>
        <div className="flex items-center gap-4">
          <div
            className={`px-6 py-3 rounded-lg font-bold text-lg ${TIER_COLORS[rewards.tier as keyof typeof TIER_COLORS]}`}
          >
            {TIER_NAMES[rewards.tier as keyof typeof TIER_NAMES]}
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">Progress to next tier</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  rewards.tier === 4 ? "bg-blue-600" : "bg-blue-500"
                }`}
                style={{
                  width: `${
                    rewards.tier === 4
                      ? 100
                      : rewards.tier === 3
                      ? ((rewards.lifetimePoints / 10000) * 100).toFixed(0)
                      : rewards.tier === 2
                      ? ((rewards.lifetimePoints / 5000) * 100).toFixed(0)
                      : ((rewards.lifetimePoints / 1000) * 100).toFixed(0)
                  }%`,
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {rewards.tier === 4
                ? "Max tier reached!"
                : rewards.tier === 3
                ? `${rewards.lifetimePoints}/10,000 points to Platinum`
                : rewards.tier === 2
                ? `${rewards.lifetimePoints}/5,000 points to Gold`
                : `${rewards.lifetimePoints}/1,000 points to Silver`}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Activity Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{rewards.healthDataEntries}</div>
            <div className="text-sm text-gray-600">Health Data Entries</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{rewards.completedAssessments}</div>
            <div className="text-sm text-gray-600">Completed Assessments</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{rewards.completedPlans}</div>
            <div className="text-sm text-gray-600">Completed Health Plans</div>
          </div>
        </div>
      </div>

      {/* Check-in Calendar (if available) */}
      {rewards.checkInRecords && Object.keys(rewards.checkInRecords).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Check-in History</h2>
          <div className="grid grid-cols-7 gap-2">
            {Object.entries(rewards.checkInRecords)
              .slice(-30)
              .map(([date, checked]) => (
                <div
                  key={date}
                  className={`p-2 rounded text-center text-xs ${
                    checked ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-400"
                  }`}
                  title={date}
                >
                  {checked ? "✓" : "○"}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

