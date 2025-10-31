"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { AuthUser, getCurrentUser, clearCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    // initial read
    setUser(getCurrentUser());

    const handleStorage = () => setUser(getCurrentUser());
    const handleFocus = () => setUser(getCurrentUser());
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleFocus);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("visibilitychange", handleFocus);
      }
    };
  }, []);

  const onLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    clearCurrentUser();
    setUser(null);
    setShowLogoutConfirm(false);
    router.push("/");
  };

  const roleText = user?.role === "ADMIN" ? "admin" : user?.role ? user.role.toLowerCase() : "";
  const displayName = user?.fullName || user?.username || "";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "saturate(180%) blur(8px)",
        background: "rgba(226, 232, 240, 0.95)",
        borderBottom: "1px solid rgba(17, 24, 39, 0.1)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".5rem",
              textDecoration: "none",
              color: "inherit",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
            aria-label="HealthMate Home"
          >
            <span style={{ fontSize: "1.125rem" }}>HealthMate</span>
          </Link>

          {/* Dashboard next to logo */}
          <div
            onMouseEnter={() => {
              if (closeTimer.current) {
                window.clearTimeout(closeTimer.current);
                closeTimer.current = null;
              }
              setOpenMenu(true);
            }}
            onMouseLeave={() => {
              if (closeTimer.current) window.clearTimeout(closeTimer.current);
              closeTimer.current = window.setTimeout(() => setOpenMenu(false), 250) as unknown as number;
            }}
            style={{ position: "relative" }}
          >
            <button
              onClick={() => {
                const u = getCurrentUser();
                if (!u) {
                  setShowLoginPrompt(true);
                } else {
                  router.push("/dashboard");
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#64748b";
                e.currentTarget.style.borderColor = "rgba(17,24,39,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "rgba(17,24,39,0.12)";
              }}
              style={{
                padding: ".4rem .75rem",
                borderRadius: ".5rem",
                border: "1px solid rgba(17,24,39,0.12)",
                background: "white",
                cursor: "pointer",
                transition: "background-color 0.15s ease, border-color 0.15s ease",
              }}
            >
              Dashboard
            </button>
          {openMenu && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                left: 0,
                minWidth: 220,
                background: "white",
                border: "1px solid rgba(17,24,39,0.12)",
                borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                padding: ".5rem",
                zIndex: 60,
              }}
            >
              <a
                onClick={(e) => {
                  e.preventDefault();
                  const u = getCurrentUser();
                  if (!u) setShowLoginPrompt(true);
                  else router.push("/record");
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#64748b";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "inherit";
                }}
                href="/record"
                style={{
                  display: "block",
                  padding: ".5rem .5rem",
                  borderRadius: 6,
                  color: "inherit",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "background-color 0.15s ease, color 0.15s ease",
                }}
              >
                Record HealthData
              </a>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  const u = getCurrentUser();
                  if (!u) setShowLoginPrompt(true);
                  else router.push("/assessment");
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#64748b";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "inherit";
                }}
                href="/assessment"
                style={{
                  display: "block",
                  padding: ".5rem .5rem",
                  borderRadius: 6,
                  color: "inherit",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "background-color 0.15s ease, color 0.15s ease",
                }}
              >
                Health Assessment
              </a>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  const u = getCurrentUser();
                  if (!u) setShowLoginPrompt(true);
                  else router.push("/health-plans");
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#64748b";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "inherit";
                }}
                href="/health-plans"
                style={{
                  display: "block",
                  padding: ".5rem .5rem",
                  borderRadius: 6,
                  color: "inherit",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "background-color 0.15s ease, color 0.15s ease",
                }}
              >
                Health Plan
              </a>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  const u = getCurrentUser();
                  if (!u) setShowLoginPrompt(true);
                  else router.push("/diet-guidance");
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#64748b";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "inherit";
                }}
                href="/diet-guidance"
                style={{
                  display: "block",
                  padding: ".5rem .5rem",
                  borderRadius: 6,
                  color: "inherit",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "background-color 0.15s ease, color 0.15s ease",
                }}
              >
                Diet Guidance
              </a>
            </div>
          )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
          {user ? (
            <>
              <Link 
                href={user.role === "ADMIN" ? "/admin" : "/profile"} 
                style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", textDecoration: "none", color: "inherit" }}
              >
                <span style={{ fontSize: ".9rem", color: "#374151" }}>
                  Welcome, {roleText}: {displayName}
                </span>
                <img
                  src="https://avatars.githubusercontent.com/u/1?v=4"
                  alt="avatar"
                  width={28}
                  height={28}
                  style={{ borderRadius: "9999px", border: "1px solid rgba(17,24,39,0.08)" }}
                />
              </Link>
              <button
                onClick={onLogout}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#64748b";
                  e.currentTarget.style.borderColor = "rgba(17,24,39,0.3)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "rgba(17,24,39,0.12)";
                  e.currentTarget.style.color = "inherit";
                }}
                style={{
                  padding: ".4rem .75rem",
                  borderRadius: ".5rem",
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "white",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <span style={{ fontSize: ".9rem", color: "#6B7280" }}>Not logged in</span>
              <Link
                href="/login"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#64748b";
                  e.currentTarget.style.borderColor = "rgba(17,24,39,0.3)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "rgba(17,24,39,0.12)";
                  e.currentTarget.style.color = "inherit";
                }}
                style={{
                  padding: ".4rem .75rem",
                  borderRadius: ".5rem",
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "white",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
                }}
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      {showLoginPrompt && (
        <div
          onClick={() => setShowLoginPrompt(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: "white", 
              borderRadius: 12, 
              padding: 20, 
              width: 360, 
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              position: "relative",
              margin: "auto",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Please Login First</h3>
            <p style={{ fontSize: 14, color: "#4B5563", marginBottom: 16 }}>You need to log in to access the Dashboard.</p>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <button
                onClick={() => setShowLoginPrompt(false)}
                style={{
                  flex: 1,
                  padding: ".55rem 0",
                  borderRadius: 8,
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  router.push("/login");
                }}
                style={{
                  flex: 1,
                  padding: ".55rem 0",
                  borderRadius: 8,
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "black",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout confirmation popup */}
      {showLogoutConfirm && (
        <div
          onClick={() => setShowLogoutConfirm(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: "white", 
              borderRadius: 12, 
              padding: 20, 
              width: 360, 
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              position: "relative",
              margin: "auto",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Confirm Logout</h3>
            <p style={{ fontSize: 14, color: "#4B5563", marginBottom: 16 }}>Are you sure you want to log out?</p>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: ".55rem 0",
                  borderRadius: 8,
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                style={{
                  flex: 1,
                  padding: ".55rem 0",
                  borderRadius: 8,
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "black",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


