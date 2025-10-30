// src/lib/utils.ts

/**
 * ---- Date / number helpers -------------------------------------------------
 */

/** Format an ISO-like value to a local datetime string. */
export function fmtDateTime(iso: string | number | Date | null | undefined): string {
  if (iso == null) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleString();
}

/** Round a number to N digits (default 1). Returns NaN if input not finite. */
export function round(n: number, digits = 1): number {
  const k = Math.pow(10, digits);
  return Math.round(n * k) / k;
}

/** ISO timestamp for N days ago from now. */
export function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/** Average of finite numbers; returns undefined for empty/invalid arrays. */
export function avg(nums: number[]): number | undefined {
  const valid = nums.filter((x) => Number.isFinite(x));
  if (!valid.length) return undefined;
  return round(valid.reduce((a, b) => a + b, 0) / valid.length, 1);
}

/** Sum of finite numbers; returns undefined for empty/invalid arrays. */
export function sum(nums: number[]): number | undefined {
  const valid = nums.filter((x) => Number.isFinite(x));
  if (!valid.length) return undefined;
  return valid.reduce((a, b) => a + b, 0);
}

/**
 * ---- CSV helpers -----------------------------------------------------------
 */

/** RFC-4180–style CSV field escape. */
export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // Double quotes inside fields and wrap in quotes if field has comma, quote, or newline
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Convert an array of objects to CSV string.
 * - Uses keys of the first row as the header set (standard behavior).
 * - Values are escaped with csvEscape.
 */
export function toCSV(rows: Record<string, any>[]): string {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
  ];
  return lines.join("\n");
}

/**
 * Build a single-row CSV for the latest assessment report.
 * Extend fields as needed to match your backend response.
 */
export function buildLatestReportCsv(latestReport: any): string {
  const headers = ["id", "date", "overallScore", "summary"];
  const row = [
    csvEscape(latestReport?.id ?? ""),
    csvEscape(
      latestReport?.createdAt ? new Date(latestReport.createdAt).toISOString() : ""
    ),
    csvEscape(latestReport?.overallScore ?? ""),
    csvEscape(latestReport?.summary ?? ""),
  ];
  return `${headers.join(",")}\n${row.join(",")}\n`;
}

/**
 * Trigger a file download in the browser for plain text or CSV content.
 * - Appends <a> to DOM to satisfy Firefox/Safari click requirements.
 * - Adds UTF-8 BOM for .csv files so Excel opens with correct encoding.
 * - Automatically picks a content-type based on filename extension.
 */
export function downloadTextFile(filename: string, text: string) {
  // Choose MIME type by extension; fall back to text/plain
  const lower = filename.toLowerCase();
  const isCsv = lower.endsWith(".csv");
  const mime = isCsv ? "text/csv;charset=utf-8" : "text/plain;charset=utf-8";

  // Add BOM for CSV to make Excel happy; for plain text we keep original
  const payload = isCsv ? `\uFEFF${text}` : text;

  const blob = new Blob([payload], { type: mime });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Revoke on next tick to avoid revoking before the download starts
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
