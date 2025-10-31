// src/lib/utils.ts
// Utility helpers: date, rounding, aggregates, CSV download, and local datetime helpers

/** Format any ISO/Date/number to a local datetime string. */
export function fmtDateTime(iso: string | number | Date) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export function round(n: number, digits = 1) {
  const k = Math.pow(10, digits);
  return Math.round(n * k) / k;
}

/** Return an ISO string 'n' days ago in UTC. */
export function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function avg(nums: number[]) {
  const valid = nums.filter((x) => Number.isFinite(x));
  if (!valid.length) return undefined;
  return round(valid.reduce((a, b) => a + b, 0) / valid.length, 1);
}

export function sum(nums: number[]) {
  const valid = nums.filter((x) => Number.isFinite(x));
  if (!valid.length) return undefined;
  return valid.reduce((a, b) => a + b, 0);
}

/** Convert rows to CSV text (RFC4180-compliant quoting). */
export function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[,"\n]/.test(s) ? `"${s}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

/** Trigger a browser download for a text content. */
export function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/* ---------------- Local datetime helpers for <input type="datetime-local"> ---------------- */

/** Build 'YYYY-MM-DDTHH:mm' in local time (no trailing 'Z'). */
export function toLocalInputValue(dt: Date | string | number): string {
  const d = new Date(dt);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

/** Parse local 'YYYY-MM-DDTHH:mm' back to ISO UTC. */
export function fromLocalInputValue(localStr: string): string {
  const d = new Date(localStr); // parsed as local time
  return d.toISOString();
}

/* ---------------- Robust print helper (iframe-based) ---------------- */

/**
 * Print a clean block of HTML using a hidden iframe.
 * This avoids blank pages/pop-up blockers and doesn't depend on the app's CSS.
 *
 * @param html - the inner HTML you want to print (we wrap it in a minimal document)
 * @param title - optional window title used by some PDF printers
 */
export function printHTML(html: string, title = "Print") {
  // Create a hidden iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  // Build a minimal standalone HTML (inline basic styles to ensure visible output)
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    alert("Print failed: cannot access print document.");
    return;
  }

  const full = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(title)}</title>
<style>
  /* Minimal resets & typography so content is readable without app CSS */
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "PingFang SC", "Microsoft Yahei", sans-serif;
         color: #0f172a; margin: 0; padding: 24px; }
  h1,h2,h3 { margin: 0 0 12px 0; }
  .muted { color: #475569; }
  .section { margin-bottom: 16px; }
  /* Tables and basic layout, just in case */
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
</style>
</head>
<body>
  ${html}
</body>
</html>`;

  // Write and print
  doc.open();
  doc.write(full);
  doc.close();

  // Images/fonts might need a tick to render before printing
  const doPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      // Cleanup after a short delay to allow print dialog to open
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  };

  // Wait a bit to ensure rendering is done (especially in Chrome)
  setTimeout(doPrint, 250);
}

// Basic HTML-escape so <title> is safe
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
