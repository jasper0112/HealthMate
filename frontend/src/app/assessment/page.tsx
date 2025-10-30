// src/app/assessment/page.tsx
"use client";

import { useRef, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AssessmentHistory from "@/components/AssessmentHistory";
import ExportButtons from "@/components/ExportButtons";
import { triggerAssessment } from "@/lib/api";
import { buildLatestReportCsv, downloadTextFile } from "@/lib/utils";

// If you have a specific TS type for latestReport, replace `any` accordingly.
export default function AssessmentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestReport, setLatestReport] = useState<any>(null);

  // This ref wraps ONLY the "Latest Report" card so PDF prints just this section.
  // Using `HTMLDivElement | null` keeps TypeScript happy during initial render.
  const pdfRef = useRef<HTMLDivElement | null>(null);

  // Call the Spring Boot trigger endpoint via our wrapper
  async function handleGenerateReport() {
    setLoading(true);
    setError(null);
    try {
      const data = await triggerAssessment({
        userId: 1,       // TODO: inject the real signed-in user id
        type: "GENERAL", // or "COMPREHENSIVE" etc.
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

  // Export only the Latest Report card into a printable window and call print().
  // No extra libraries are used to avoid bundle bloat and to keep your layout intact.
  function handleExportPdf() {
    const el = pdfRef.current;
    if (!el) {
      alert("No report found. Please generate a report first.");
      return;
    }

    const w = window.open("", "_blank");
    if (!w) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }

    // Minimal, print-friendly stylesheet. We inline it so the new window
    // does not depend on your app's CSS pipeline.
    const styles = `
      * { box-sizing: border-box; }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: #111827; padding: 18px; }
      h1, h2, h3 { margin: 0 0 12px; }
      .hm-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; box-shadow: 0 2px 12px rgba(17,24,39,.08); }
      .hm-section-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
      .meta p { margin: 4px 0; }
      strong { font-weight: 700; }
      @page { size: A4; margin: 14mm; }
      @media print {
        a { color: inherit; text-decoration: none; }
      }
    `;

    const docHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>HealthMate Report</title>
          <style>${styles}</style>
        </head>
        <body>
          ${el.innerHTML}
        </body>
      </html>`;

    w.document.open();
    w.document.write(docHtml);
    w.document.close();

    // Give the browser a tick to layout before printing.
    w.focus();
    w.print();
    // Optional: close the window after print dialog.
    w.close();
  }

  // Export the latest report as CSV (a single row). If you want history as well,
  // we can extend this to include a second table or multiple rows.
  function handleExportCsv() {
    if (!latestReport) {
      alert("No report found. Please generate a report first.");
      return;
    }
    const csv = buildLatestReportCsv(latestReport);
    const fname = `HealthMate_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadTextFile(fname, csv);
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
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <button
          className="btn btn-solid btn-lg"
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>

        <ExportButtons
          onExportPdf={handleExportPdf}
          onExportCsv={handleExportCsv}
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

      {/* Latest Report (this is what we print) */}
      <div ref={pdfRef} className="hm-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Latest Report
        </h2>

        {latestReport ? (
          <div className="meta">
            <p>
              <strong>Date:</strong>{" "}
              {latestReport.createdAt
                ? new Date(latestReport.createdAt).toLocaleString()
                : "-"}
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
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Report History
        </h2>
        <AssessmentHistory />
      </div>
    </main>
  );
}
