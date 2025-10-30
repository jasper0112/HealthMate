// src/lib/csv.ts
// Export latest report + history to UTF-8 CSV with BOM (works well with Excel)

export type ReportRow = {
  date: string;   // formatted date string
  score: number;
  summary: string;
};

export function exportReportsToCsv(
  latest: ReportRow,
  history: ReportRow[] = [],
  filename = "HealthMate_Report.csv"
) {
  const rows: string[][] = [];
  rows.push(["Date", "Score", "Summary"]); // header

  rows.push([latest.date, String(latest.score), sanitize(latest.summary)]);
  for (const r of history) {
    rows.push([r.date, String(r.score), sanitize(r.summary)]);
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

function csvEscape(value: string) {
  const needsQuotes = /[",\r\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function sanitize(value: string) {
  return (value ?? "").replace(/\r?\n/g, " ").trim();
}
