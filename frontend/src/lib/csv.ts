// src/lib/csv.ts
// Export latest report + history to UTF-8 CSV with BOM (compatible with Excel)

export type ReportRow = {
  date: string;     // formatted date string
  score: number;
  summary: string;
  detailed?: string;
};

export function exportReportsToCsv(
  latest: ReportRow,
  history: ReportRow[] = [],
  filename = "HealthMate_Report.csv"
) {
  const rows: string[][] = [];
  rows.push(["Date", "Score", "Summary", "Detailed"]); // added Detailed column

  rows.push([
    latest.date,
    String(latest.score),
    sanitize(latest.summary),
    sanitizeDetailed(latest.detailed ?? "")
  ]);

  for (const r of history) {
    rows.push([
      r.date,
      String(r.score),
      sanitize(r.summary),
      sanitizeDetailed(r.detailed ?? "")
    ]);
  }

  const csv = rows.map(r => r.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Escape fields with quotes when needed */
function csvEscape(value: string) {
  const needsQuotes = /[",\r\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

/** Remove line breaks for CSV */
function sanitize(value: string) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

/** Remove Markdown headings (#, ## etc) then compact text */
function sanitizeDetailed(text: string) {
  return text
    .replace(/^#{1,6}\s.*$/gm, "") // remove headings like #, ##, ### etc.
    .replace(/\s+/g, " ")          // collapse linebreaks/spaces
    .trim();
}
