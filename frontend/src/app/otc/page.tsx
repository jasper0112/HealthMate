"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  generateMedicationGuidance,
  listMedicationGuidanceByUser,
  getMedicationGuidance,
  deleteMedicationGuidance,
} from "@/lib/api";
import type { MedicationGuidance } from "@/lib/types";
import ExportButtons from "@/components/ExportButtons";
import { exportElementToPdf } from "@/lib/pdf";
import "@/styles/card.css";

// 地图组件（避免 SSR 报错）
const PharmacyMap = dynamic(() => import("@/components/PharmacyMap"), { ssr: false });

export default function OTCPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState("headache");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<MedicationGuidance | null>(null);

  // 历史记录（后端拉取）
  const [history, setHistory] = useState<MedicationGuidance[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 附近药房
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [nearby, setNearby] = useState<any[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyMsg, setNearbyMsg] = useState("");

  // PDF导出区域
  const printRef = useRef<HTMLDivElement | null>(null);

  /* -------- 登录与加载历史 -------- */
  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUserId(u.userId);
    loadHistory(u.userId);
  }, [router]);

  async function loadHistory(uid: number) {
    setLoadingHistory(true);
    try {
      const list = await listMedicationGuidanceByUser(uid);
      setHistory(Array.isArray(list) ? list.reverse() : []);
    } catch (e: any) {
      console.error("Failed to load history:", e);
      setError(e?.message || "Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  }

  /* -------- 自动定位 -------- */
  useEffect(() => {
    if (!navigator.geolocation) {
      setNearbyMsg("浏览器不支持定位，可点击“使用悉尼大学测试位置”。");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setGeo({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setNearbyMsg("未授权定位，请允许访问位置或使用测试位置。")
    );
  }, []);

  /* -------- 生成用药指导 -------- */
  async function onGenerate() {
    if (!userId || !symptoms.trim()) {
      setError("请先登录并输入症状");
      return;
    }
    try {
      setError("");
      setLoading(true);
      const res = await generateMedicationGuidance(userId, symptoms.trim());
      setData(res);
      await loadHistory(userId);
    } catch (e: any) {
      setError(e?.message || "生成失败");
    } finally {
      setLoading(false);
    }
  }

  /* -------- 附近药房 -------- */
  async function findNearby() {
    setNearbyMsg("");
    setNearby([]);
    setNearbyLoading(true);
    try {
      let center = geo;
      if (!center) throw new Error("无法获取当前位置");
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
      const res = await fetch(`${base}/api/facilities/nearby?lat=${center.lat}&lng=${center.lng}&distance=5`);
      if (!res.ok) throw new Error("请求失败");
      const list = await res.json();
      setNearby(list);
      if (!list.length) setNearbyMsg("5km内暂无药房");
    } catch (e: any) {
      setNearbyMsg(e.message || "无法获取附近药房");
    } finally {
      setNearbyLoading(false);
    }
  }

  /* -------- 导出功能 -------- */
  const handleExportPdf = () => {
    if (!printRef.current) return;
    const filename = data
      ? `OTC_${data.symptoms}_${new Date().toISOString().slice(0, 10)}.pdf`
      : "OTC_Guidance.pdf";
    exportElementToPdf(printRef.current, filename);
  };

  const handleExportCsv = () => {
    if (!data) return;
    const safe = (s?: string | null) => (s ?? "").replace(/\n/g, " ").trim();
    const rows = [
      ["Field", "Value"],
      ["Symptom", safe(data.symptoms)],
      ["Description", safe(data.conditionDescription)],
      ["OTC", safe(data.otcMedications)],
      ["Usage", safe(data.usageInstructions)],
      ["Precautions", safe(data.precautions)],
      ["Side Effects", safe(data.sideEffects)],
      ["Pharmacies", safe(data.recommendedPharmacies)],
      ["Guidance", safe(data.guidance)],
      ["User", safe(data.username)],
      ["Created At", data.createdAt ? new Date(data.createdAt).toLocaleString() : ""],
    ];
    const csv = rows.map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `OTC_${safe(data.symptoms)}.csv`;
    a.click();
  };

  /* -------- 删除 -------- */
  async function handleDelete(id: number) {
    if (!userId) return;
    if (!confirm("确认删除该记录？")) return;
    await deleteMedicationGuidance(id);
    await loadHistory(userId);
  }

  return (
    <div className="container page">
      <h1 className="text-2xl font-bold mb-4">OTC Medication Guidance</h1>

      {/* 生成区域 */}
      <div className="card scale-in" style={{ marginBottom: 24 }}>
        <div className="flex gap-2 mb-2">
          <input
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Enter symptoms, e.g. headache / cough / sore throat..."
            onKeyDown={(e) => e.key === "Enter" && onGenerate()}
            className="border px-3 py-2 rounded w-full"
          />
          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Generating..." : "Generate Guidance"}
          </button>
        </div>
        {error && <div style={{ color: "#dc2626", marginTop: 8 }}>{error}</div>}
      </div>

      {/* 指导内容 + 药房 */}
      <div ref={printRef}>
        {data && (
          <>
            <Section title="Symptom Description">{data.conditionDescription}</Section>
            <Section title="Recommended OTC Medications">{data.otcMedications}</Section>
            <Section title="Usage & Dosage">{data.usageInstructions}</Section>
            <Section title="Precautions">{data.precautions}</Section>
            <Section title="Possible Side Effects">{data.sideEffects}</Section>
            <Section title="Recommended Pharmacies">{data.recommendedPharmacies}</Section>
            <Section title="Guidance">{data.guidance}</Section>
            <div className="text-gray-500 text-sm mt-2">
              Submitted by {data.username ?? "unknown"} ·{" "}
              {data.createdAt ? new Date(data.createdAt).toLocaleString() : ""}
            </div>
          </>
        )}

        {/* 附近药房 */}
        <div className="card" style={{ marginTop: 32 }}>
          <h3>Nearby Pharmacies</h3>
          <div className="flex gap-2 mb-3">
            <button onClick={findNearby} disabled={nearbyLoading} className="btn btn-primary">
              {nearbyLoading ? "Searching..." : "Find Pharmacies within 5km"}
            </button>
            <button
              onClick={() => {
                const test = { lat: -33.8880, lng: 151.1950 }; // USYD test
                setGeo(test);
                findNearby();
              }}
              className="btn btn-ghost"
            >
              Use USYD Test Location
            </button>
          </div>
          {nearbyMsg && <div className="text-sm text-gray-600 mb-2">{nearbyMsg}</div>}
          {nearby.length > 0 && geo && (
            <>
              <PharmacyMap center={geo} facilities={nearby} />
              <ul className="mt-3">
                {nearby.map((f) => (
                  <li key={f.facilityId} className="border-b py-2">
                    <b>{f.name}</b> · {f.address}
                    <div className="text-sm text-gray-600">
                      <a href={`tel:${f.phoneNumber}`}>📞 Call</a> ·{" "}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${f.latitude},${f.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        🧭 Navigate
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* 导出按钮 */}
      <div className="mt-4">
        <ExportButtons onExportPdf={handleExportPdf} onExportCsv={handleExportCsv} />
      </div>

      {/* ★★★ 历史记录表格（放在页面底部） ★★★ */}
      <div className="card" style={{ marginTop: 40 }}>
        <h3>History / Search</h3>
        {loadingHistory ? (
          <p className="text-sm text-gray-600">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-600">No history records yet.</p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Symptoms</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.medGuidanceId}>
                    <td>#{h.medGuidanceId}</td>
                    <td>{h.symptoms}</td>
                    <td>{formatDate(h.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        onClick={async () => {
                          const full = await getMedicationGuidance(h.medGuidanceId!);
                          setData(full);
                          printRef.current?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(h.medGuidanceId!)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------- 工具函数 ------- */

function Section({ title, children }: { title: string; children?: any }) {
  if (!children) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: 8,
        boxShadow: "0 8px 24px rgba(2,6,23,0.06)",
        marginBottom: 16,
      }}
    >
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 700 }}>
        {title}
      </div>
      <div style={{ padding: "12px 16px", whiteSpace: "pre-wrap" }}>{children}</div>
    </div>
  );
}

function formatDate(d?: string | null) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}