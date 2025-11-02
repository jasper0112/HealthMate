"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { getCurrentUser, setCurrentUser } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      router.replace("/");
    }
  }, [router]);

  const handleReset = () => {
    setEmail("");
    setPassword("");
    setError(null);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
      }}
    >

      <div className="relative z-10 w-full max-w-lg" style={{ marginTop: "4rem" }}>
        {/* Error message */}
        {error && (
          <div className="mb-4 mx-auto flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">×</span>
            </div>
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Login card */}
        <div 
          className="bg-white rounded-2xl shadow-xl"
          style={{
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
            padding: "32px",
          }}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                const isEmail = /.+@.+\..+/.test(email);
                if (!isEmail) {
                  throw new Error("Invalid username or password");
                }
                if (password.trim().length < 6) {
                  throw new Error("Invalid username or password");
                }
                const resp = await loginUser({ usernameOrEmail: email, password });
                setCurrentUser({
                  userId: resp.userId,
                  username: resp.username,
                  email: resp.email,
                  fullName: resp.fullName,
                  role: resp.role,
                });
                setShowSuccess(true);
                // Redirect immediately
                if (resp.role === "ADMIN") {
                  router.push("/admin");
                } else if (resp.role === "USER") {
                  router.push("/dashboard");
                } else {
                  router.push("/dashboard");
                }
              } catch (err: any) {
                setError(err?.message || "Invalid username or password");
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-6 mx-auto"
            style={{ maxWidth: "320px" }}
          >
            {/* Email */}
            <div className="flex items-center gap-6">
              <label className="text-sm font-medium text-gray-700 w-16 shrink-0">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ width: "180px" }}
                placeholder="username@gmail.com"
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-6">
              <label className="text-sm font-medium text-gray-700 w-16 shrink-0">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ width: "180px" }}
                placeholder="••••••••"
              />
            </div>

            {/* Button group */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-ghost flex-1"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Register link */}
          <p className="text-sm text-gray-600 text-center mt-6">
            Don't have an account?{" "}
            <Link className="text-blue-500 hover:underline ml-1" href="/register">
              Register
            </Link>
          </p>
        </div>
      </div>
      
      {/* Success toast */}
      {showSuccess && (
        <Toast onClose={() => setShowSuccess(false)} message="Login successful" />
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


