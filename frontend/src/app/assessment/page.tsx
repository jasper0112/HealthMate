"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import AssessmentHistory from "@/components/AssessmentHistory";
import ExportButtons from "@/components/ExportButtons";
import { triggerAssessment } from "@/lib/api";
import { downloadTextFile, toCSV, printHTML, fmtDateTime } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

export default function AssessmentPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestReport, setLatestReport] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement | null>(null); // printable area

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setUserId(user.userId);
  }, [router]);

  // Trigger assessment WITHOUT the "lastOnly" flag
  async function handleGenerateReport() {
    if (!userId) {
      setError("请先登录");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await triggerAssessment({
        userId: userId,
        type: "GENERAL",
        daysBack: 7           // keep a simple, predictable lookback window
      });
      setLatestReport(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  // Build a CSV row from latest report (for a single-line export)
  const latestCsvRow = useMemo(() => {
    if (!latestReport) return null;
    return [{
      createdAt: fmtDateTime(latestReport.createdAt),
      type: latestReport.type ?? "GENERAL",
      overallScore: latestReport.overallScore ?? "",
      summary: latestReport.summary ?? "",
    }];
  }, [latestReport]);

  // Export only the Latest section as CSV
  function handleExportCsv() {
    if (!latestCsvRow) {
      alert("No latest report yet.");
      return;
    }
    downloadTextFile(`latest_assessment_${Date.now()}.csv`, toCSV(latestCsvRow));
  }

  // Print only the report block (fixes the blank/shadow-only PDF)
  function handleExportPdf() {
    const el = reportRef.current;
    if (!el) {
      alert("Nothing to print yet.");
      return;
    }
    // Compose a small, clean HTML using only the report content
    const html = `
      <h1>HealthMate</h1>
      <div class="section"><strong class="muted">Latest Report</strong></div>
      ${el.innerHTML}
    `;
    printHTML(html, "Assessment Report");
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

        {/* Removed the "Use only the most recent record" checkbox */}

        <ExportButtons onExportPdf={handleExportPdf} onExportCsv={handleExportCsv} />
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

      {/* Latest Report (printable block) */}
      <div className="hm-card" style={{ marginBottom: "1rem" }} ref={reportRef}>
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
              <strong>Summary:</strong>{" "}
              {latestReport.summary ?? "-"}
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
      {userId && (
        <div className="hm-card">
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Report History</h2>
          <AssessmentHistory userId={userId} showInternalTitle={false}/>
        </div>
      )}
    </main>
  );
}
