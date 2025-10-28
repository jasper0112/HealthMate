// src/app/assessment/page.tsx
"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AssessmentHistory from "@/components/AssessmentHistory";
import ExportButtons from "@/components/ExportButtons";
// Use the API wrapper that already knows BASE url
import { triggerAssessment } from "@/lib/api";

export default function AssessmentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestReport, setLatestReport] = useState<any>(null);

  // Call the Spring Boot trigger endpoint via our wrapper
  async function handleGenerateReport() {
    setLoading(true);
    setError(null);
    try {
      const data = await triggerAssessment({
        userId: 1,       // TODO: replace with actual signed-in user id if available
        type: "GENERAL", // Or "COMPREHENSIVE" etc.
        daysBack: 7,
      });
      setLatestReport(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Record", href: "/record" },
          { label: "Assessment", current: true },
        ]}
      />
      <h1 className="hm-section-title">Assessment &amp; Report</h1>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
        <button className="btn btn-solid btn-lg" onClick={handleGenerateReport} disabled={loading}>
          {loading ? "Generating..." : "Generate Report"}
        </button>

        <ExportButtons
          onExportPdf={() => window.print()}
          onExportCsv={() => alert("CSV export coming soon")}
        />
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </div>
      )}

      {/* Latest Report */}
      <div className="hm-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Latest Report</h2>

        {latestReport ? (
          <div>
            <p>
              <strong>Date:</strong>{" "}
              {latestReport.createdAt ? new Date(latestReport.createdAt).toLocaleString() : "-"}
            </p>
            <p>
              <strong>Score:</strong> {latestReport.overallScore ?? "-"}
            </p>
            <p>
              <strong>Summary:</strong> {latestReport.summary ?? "-"}
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "#eef2ff",
              color: "#4f46e5",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
            }}
          >
            No report yet.
          </div>
        )}
      </div>

      {/* History table */}
      <div className="hm-card">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Report History</h2>
        <AssessmentHistory />
      </div>
    </main>
  );
}