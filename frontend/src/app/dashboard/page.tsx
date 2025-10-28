"use client";

import Breadcrumb from "@/components/Breadcrumb";
import TodayOverview from "@/components/TodayOverview";
import Notifications from "@/components/Notifications";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <main>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", current: true },
        ]}
      />
      <h1 className="hm-section-title">Dashboard</h1>

      <div className="hm-card" style={{ marginBottom: "1rem" }}>
        <TodayOverview />
      </div>

      <div className="hm-card" style={{ marginBottom: "1rem" }}>
        <Notifications />
      </div>

      {/* Features grid mapped to API.md modules */}
      <section style={{ marginTop: "0.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Quick Actions</h2>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {[
            { href: "/record", title: "Health Data", desc: "Create and view records", icon: "/file.svg" },
            { href: "/assessment", title: "Health Assessment (AI)", desc: "Run AI analysis", icon: "/window.svg" },
            { href: "/plans", title: "Health Plan (AI)", desc: "Generate plans", icon: "/vercel.svg" },
            { href: "/triage", title: "Smart Triage (AI)", desc: "Symptom triage", icon: "/globe.svg" },
            { href: "/guidance", title: "Diet Guidance (AI)", desc: "Personal diet tips", icon: "/file.svg" },
            { href: "/guidance", title: "Medication Guidance (AI)", desc: "OTC suggestions", icon: "/window.svg" },
            { href: "/insurance", title: "Insurance Recommendation (AI)", desc: "Tailored coverage", icon: "/vercel.svg" },
            { href: "/facilities", title: "Facility", desc: "Search facilities", icon: "/globe.svg" },
            { href: "/devices", title: "Health Device", desc: "Manage devices", icon: "/file.svg" },
            { href: "/rewards", title: "Reward System", desc: "Check-in & tiers", icon: "/window.svg" },
          ].map((f) => (
            <a
              key={f.title}
              href={f.href}
              className="hm-card"
              style={{ padding: 16, textDecoration: "none", borderRadius: 12, border: "1px solid #e5e7eb" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <Image src={f.icon} alt="icon" width={18} height={18} />
                <div style={{ fontWeight: 700 }}>{f.title}</div>
              </div>
              <div style={{ color: "#6b7280", fontSize: 14 }}>{f.desc}</div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}


