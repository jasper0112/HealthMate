// frontend/src/lib/otc-exports.ts
import type { MedicationGuidance } from "./types";

// 兼容导入：不假设具体导出名
import * as CSVMod from "./csv";
import * as PDFMod from "./pdf";

// ---- 解析外部可能的导出名（都转成 any 以避免类型报红）----
const csvExportFn: undefined | ((header: string[], rows: (string | number)[][], filename: string) => void) =
  (CSVMod as any).exportCSV ??
  (CSVMod as any).downloadCSV ??
  (CSVMod as any).exportToCSV ??
  (CSVMod as any).toCSV;

const pdfCreateFn: undefined | ((title: string, blocks: { heading: string; lines: string[] }[], filename: string) => void) =
  (PDFMod as any).createBasicPdf ??
  (PDFMod as any).createPdf ??
  (PDFMod as any).makePdf ??
  (PDFMod as any).buildPdf;

// ---- 本地兜底：CSV 导出 ----
function fallbackExportCSV(header: string[], rows: (string | number)[][], filename: string) {
  const esc = (v: any) => {
    const s = v == null ? "" : String(v);
    // 如果包含逗号/引号/换行，用双引号包裹并转义引号
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [header, ...rows].map(line => line.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---- 本地兜底：PDF 导出（简单可打印 HTML）----
function fallbackCreatePdf(title: string, blocks: { heading: string; lines: string[] }[], filename: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  const html = `
  <html>
  <head>
    <meta charset="utf-8"/>
    <title>${title}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding: 24px; }
      h1 { font-size: 20px; margin-bottom: 12px; }
      .card { border:1px solid #e5e7eb; border-radius: 10px; padding: 12px 14px; margin: 10px 0; }
      .h { font-weight: 600; margin-bottom: 6px; }
      .l { margin: 2px 0; white-space: pre-wrap; }
      @media print {
        a { text-decoration: none; color: inherit; }
      }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    ${blocks.map(b => `
      <div class="card">
        <div class="h">${b.heading}</div>
        ${b.lines.map(l => `<div class="l">${l}</div>`).join("")}
      </div>
    `).join("")}
  </body>
  </html>`;
  w.document.write(html);
  w.document.close();
  // 可选择自动打印：w.print();
}

// ---- 统一包装，优先用团队工具，缺失则兜底 ----
export function exportMedicationCSV(rows: MedicationGuidance[]) {
  const header = ["ID","Datetime","Symptoms","OTC","Usage","Precautions","SideEffects"];
  const data = rows.map(r => [
    r.medGuidanceId ?? "",
    r.createdAt ?? "",
    r.symptoms ?? "",
    r.otcMedications ?? "",
    r.usageInstructions ?? "",
    r.precautions ?? "",
    r.sideEffects ?? "",
  ]);
  const filename = `medication-${new Date().toISOString().slice(0,10)}.csv`;

  if (typeof csvExportFn === "function") {
    csvExportFn(header, data, filename);
  } else {
    fallbackExportCSV(header, data, filename);
  }
}

export function exportMedicationPDF(rows: MedicationGuidance[]) {
  const title = "Medication Guidance Report";
  const blocks = rows.map(r => ({
    heading: `#${r.medGuidanceId ?? ""}  ${r.symptoms || ""}`,
    lines: [
      `Date: ${r.createdAt || "—"}`,
      `Description: ${r.conditionDescription || "—"}`,
      `OTC: ${r.otcMedications || "—"}`,
      `Usage: ${r.usageInstructions || "—"}`,
      `Precautions: ${r.precautions || "—"}`,
      `Side Effects: ${r.sideEffects || "—"}`,
      `Pharmacies: ${r.recommendedPharmacies || "—"}`,
    ]
  }));
  const filename = `medication-${Date.now()}.pdf`;

  if (typeof pdfCreateFn === "function") {
    pdfCreateFn(title, blocks, filename);
  } else {
    // 没有团队 PDF 工具时，用打印版兜底
    fallbackCreatePdf(title, blocks, filename);
  }
}