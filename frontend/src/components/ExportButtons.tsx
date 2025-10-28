// src/components/ExportButtons.tsx
"use client";

type Props = {
  onExportPdf?: () => void;
  onExportCsv?: () => void;
};

export default function ExportButtons({ onExportPdf, onExportCsv }: Props) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={onExportPdf}
        aria-label="Export PDF (Print)"
      >
        Export PDF (Print)
      </button>

      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={onExportCsv}
        aria-label="Export CSV"
      >
        Export CSV
      </button>
    </div>
  );
}
