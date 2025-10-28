// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import UserBadge from "@/components/UserBadge";
import "./globals.css";             // your existing global css
import "../index.css";       // <- add this line to load the new styles

export const metadata: Metadata = {
  title: "HealthMate",
  description: "Health & Lifestyle Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#fafbff",
          color: "#111827",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        }}
      >
        {/* Global Top Navigation with user info on the right */}
        <header className="topbar">
          <div className="container">
            <Link href="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
              HealthMate
            </Link>
            {/* Navigation links removed per request; breadcrumb below the bar acts as navigation */}
            <UserBadge />
          </div>
        </header>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1rem" }}>{children}</div>

        <footer className="footer">
          <div className="container" style={{ display: "flex", justifyContent: "space-between" }}>
            <div>© {new Date().getFullYear()} HealthMate</div>
            <div style={{ display: "flex", gap: 12 }}>
              <Link href="/">Home</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
