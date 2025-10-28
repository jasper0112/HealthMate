"use client";
// src/app/record/page.tsx
import Breadcrumb from "@/components/Breadcrumb";
import DataRecordForm from "@/components/DataRecordForm";
import DataHistoryTable from "@/components/DataHistoryTable";
import { useState } from "react";
import Link from "next/link";

export default function RecordPage() {
  const [reloadSignal, setReloadSignal] = useState(0);
  return (
    <main>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Record", current: true },
        ]}
      />
      <h1 className="hm-section-title">Record Data</h1>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>

        <Link
          href="/assessment"
          className="btn btn-solid btn-lg"
          aria-label="Go to Assessment page"
          style={{ textDecoration: "none" }}
        >
          Go to Assessment
        </Link>
      </div>

      <div className="hm-card" style={{ marginBottom: "1rem" }}>
        <DataRecordForm onSaved={() => setReloadSignal((n) => n + 1)} />
      </div>

      <div className="hm-card">
        <DataHistoryTable reloadSignal={reloadSignal} />
      </div>
    </main>
  );
}
