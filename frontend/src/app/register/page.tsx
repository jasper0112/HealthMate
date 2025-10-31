"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("OTHER");
  const [dateOfBirth, setDateOfBirth] = useState(""); // yyyy-MM-dd
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [userInfo, setUserInfo] = useState("");
  const [healthProfile, setHealthProfile] = useState("");
  const [healthGoal, setHealthGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
      }}
    >
      <div className="relative z-10 w-full max-w-2xl">
        {/* Error message */}
        {error && (
          <div className="mb-4 mx-auto flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm max-w-2xl">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">×</span>
            </div>
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Registration card */}
        <div 
          className="bg-white rounded-2xl shadow-xl"
          style={{
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
            padding: "20px",
          }}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                const fullName = `${firstName} ${lastName}`.trim();
                const dob = dateOfBirth ? `${dateOfBirth}T00:00:00` : undefined;
                await registerUser({
                  username,
                  email,
                  password,
                  fullName,
                  gender,
                  dateOfBirth: dob,
                  phoneNumber: phoneNumber || undefined,
                  address: address || undefined,
                  ...(userInfo ? { userInfo } : {}),
                  ...(healthProfile ? { healthProfile } : {}),
                  ...(healthGoal ? { healthGoal } : {}),
                } as any);
                setShowSuccess(true);
                // Delay redirect to let user see success message
                setTimeout(() => {
                  router.push("/login");
                }, 1500);
              } catch (err: any) {
                setError(err?.message || "Registration failed");
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-6 mx-auto"
            style={{ maxWidth: "600px" }}
          >
            {/* First name & Last name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 w-24 shrink-0">
                  First name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
                  placeholder="First name"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 w-24 shrink-0">
                  Last name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Username */}
            <div className="flex items-center gap-6">
              <label className="text-sm font-medium text-gray-700 w-24 shrink-0">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
                placeholder="yourname"
              />
            </div>

            {/* Email */}
            <div className="flex items-center gap-6">
              <label className="text-sm font-medium text-gray-700 w-24 shrink-0">
                Email
              </label>
              <div className="flex-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  placeholder="example@email.com"
                />
                <p className="text-xs text-gray-500 mt-1 ml-1">Please enter a valid email format, e.g., user@example.com</p>
              </div>
            </div>

            {/* Password */}
            <div className="flex items-center gap-6">
              <label className="text-sm font-medium text-gray-700 w-24 shrink-0">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
                placeholder="••••••••"
              />
            </div>

            {/* Gender & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 w-24 shrink-0">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 w-24 shrink-0">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
                />
              </div>
            </div>

            {/* Phone Number & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 w-24 shrink-0">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
                  placeholder="1234567890"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 w-24 shrink-0">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
                  placeholder="Street, City, State"
                />
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-start gap-6">
              <label className="text-sm font-medium text-gray-700 w-24 shrink-0 pt-2.5">
                User Info
              </label>
              <textarea
                rows={3}
                value={userInfo}
                onChange={(e) => setUserInfo(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 resize-none"
                placeholder="e.g., Software developer, likes running..."
              />
            </div>

            {/* Health Profile */}
            <div className="flex items-start gap-6">
              <label className="text-sm font-medium text-gray-700 w-24 shrink-0 pt-2.5">
                Health Profile
              </label>
              <textarea
                rows={3}
                value={healthProfile}
                onChange={(e) => setHealthProfile(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 resize-none"
                placeholder="e.g., Pollen allergy, family history of hypertension..."
              />
            </div>

            {/* Health Goal */}
            <div className="flex items-start gap-6">
              <label className="text-sm font-medium text-gray-700 w-24 shrink-0 pt-2.5">
                Health Goal
              </label>
              <textarea
                rows={3}
                value={healthGoal}
                onChange={(e) => setHealthGoal(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 resize-none"
                placeholder="e.g., Lose 5kg, improve cardio endurance..."
              />
            </div>

            {/* Button group */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white rounded-lg py-2.5 font-medium hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Register Now"}
              </button>
            </div>
          </form>

          {/* Login link */}
          <p className="text-sm text-gray-600 text-center mt-6">
            Already have an account?{" "}
            <Link className="text-blue-500 hover:underline ml-1" href="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
      
      {/* Success toast */}
      {showSuccess && (
        <Toast onClose={() => setShowSuccess(false)} message="Registration successful" />
      )}
    </div>
  );
}

function Toast({ onClose, message }: { onClose: () => void; message: string }) {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideInUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        animation: "slideInUp 0.3s ease-out",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
          padding: "16px 20px",
          minWidth: "280px",
          border: "1px solid var(--border)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" fill="white"/>
          </svg>
        </div>
        <span style={{ fontSize: "15px", color: "#111827", flex: 1 }}>
          {message}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            transition: "background-color 0.15s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5L15 15" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}


