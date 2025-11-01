// src/app/record/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import DataRecordForm from "@/components/DataRecordForm";
import DataHistoryTable from "@/components/DataHistoryTable";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default function RecordPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setUserId(user.userId);
  }, [router]);

  if (!userId) {
    return null; // 等待重定向
  }

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
              <DataRecordForm userId={userId} />
            </div>

            <div className="hm-card">
              <DataHistoryTable userId={userId} />
            </div>
    </main>
  );
}
