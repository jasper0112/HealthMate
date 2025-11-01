"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { generateMedicationGuidance } from "@/lib/api";
import type { MedicationGuidance } from "@/lib/types";
import ExportButtons from "@/components/ExportButtons";
import { exportElementToPdf } from "@/lib/pdf";

// 地图组件（避免 SSR 报错）
const PharmacyMap = dynamic(() => import("@/components/PharmacyMap"), { ssr: false });

export default function OTCPage() {
  const [symptoms, setSymptoms] = useState("headache");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<MedicationGuidance | null>(null);

  const [history, setHistory] = useState<string[]>([]);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);

  const [nearby, setNearby] = useState<any[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyMsg, setNearbyMsg] = useState("");

  // 需要导出的 DOM 容器
  const printRef = useRef<HTMLDivElement | null>(null);

  /* -------- 查询历史 -------- */
  useEffect(() => {
    const raw = localStorage.getItem("otc_history");
    if (raw) setHistory(JSON.parse(raw));
  }, []);
  useEffect(() => {
    if (history.length) localStorage.setItem("otc_history", JSON.stringify(history));
  }, [history]);

  /* -------- 自动定位（获取失败也给提示）-------- */
  useEffect(() => {
    if (!navigator.geolocation) {
      setNearbyMsg("当前浏览器不支持定位。可点击下方“使用悉尼 CBD 测试位置”演示。");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setGeo({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (err) => {
        console.warn("Geolocation error:", err);
        setNearbyMsg("未获得定位权限。请授权定位或点击“使用悉尼 CBD 测试位置”。");
      }
    );
  }, []);

  async function onGenerate() {
    try {
      setError("");
      setLoading(true);
      const userId = Number(process.env.NEXT_PUBLIC_USER_ID || 1);
      const res = await generateMedicationGuidance(userId, symptoms.trim());
      setData(res);
      setHistory((h) => Array.from(new Set([symptoms.trim(), ...h])).slice(0, 10));
    } catch (e: any) {
      setError(e?.message || "Request failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function findNearby() {
    setNearbyMsg("");
    setError("");
    setNearby([]);
    setNearbyLoading(true);
    try {
      let center = geo;
      if (!center && navigator.geolocation) {
        // 再尝试一次即时定位
        center = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 8000 }
          );
        });
        setGeo(center);
      }
      if (!center) {
        setNearbyMsg("无法获取当前位置，请先授权定位，或使用下方“使用悉尼 CBD 测试位置”。");
        return;
      }

      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
      const res = await fetch(
        `${base}/api/facilities/nearby?lat=${center.lat}&lng=${center.lng}&distance=5`
      );
      if (!res.ok) throw new Error(`Nearby request failed: ${res.status}`);
      const list = await res.json();
      setNearby(list);
      if (!Array.isArray(list) || list.length === 0) {
        setNearbyMsg("5km 内没有找到药房（或数据为空）。可增大距离或使用测试位置。");
      }
    } catch (err: any) {
      console.error(err);
      setError("获取附近药房失败，请确认后端运行、允许定位或使用测试位置。");
    } finally {
      setNearbyLoading(false);
    }
  }

  // 导出 PDF（把 printRef 里的内容导出）
  const handleExportPdf = () => {
    const el = printRef.current;
    if (!el) return;
    const filename = data
      ? `OTC_${data.symptoms}_${data.createdAt ? new Date(data.createdAt as any).toISOString().slice(0, 10) : "today"}.pdf`
      : "OTC_Guidance.pdf";
    exportElementToPdf(el, filename);
  };

  // 简单导出 CSV
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
      ["Purchase", safe(data.recommendedPharmacies)],
      ["Price Tips", safe(data.priceComparison)],
      ["Guidance", safe(data.guidance)],
      ["By", safe(data.username)],
      ["Created At", data.createdAt ? new Date(data.createdAt as any).toLocaleString() : ""],
    ];
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OTC_${safe(data.symptoms) || "guidance"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container" style={{ maxWidth: 960, margin: "40px auto" }}>
      <h1 className="text-2xl font-bold mb-4">OTC Medication Guidance</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <input
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Enter symptoms, e.g. headache / sore throat / cough..."
          onKeyDown={(e) => e.key === "Enter" && onGenerate()}
          className="border px-3 py-2 rounded w-full"
        />
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading || !symptoms.trim()}
          className="px-4 py-2 rounded text-white"
          style={{ background: loading ? "#9ca3af" : "#2563eb" }}
        >
          {loading ? "Generating..." : "Generate Guidance"}
        </button>
      </div>

      {error && <div style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</div>}

      {history.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <span className="text-sm text-gray-600 mr-2">Recent searches:</span>
          {history.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setSymptoms(h)}
              className="border px-2 py-1 rounded mr-2 mb-2 text-sm hover:bg-gray-100"
            >
              {h}
            </button>
          ))}
        </div>
      )}

      {/* ★ 这个容器里的内容会被导出到 PDF */}
      <div ref={printRef}>
        {data && (
          <>
            <Section title="Symptom Description">{data.conditionDescription}</Section>
            <Section title="Recommended OTC Medications">{nl2br(data.otcMedications)}</Section>
            <Section title="Usage & Dosage">{nl2br(data.usageInstructions)}</Section>
            <Section title="Precautions">{nl2br(data.precautions)}</Section>
            <Section title="Possible Side Effects">{nl2br(data.sideEffects)}</Section>
            <Section title="Recommended Purchase Channels">{data.recommendedPharmacies}</Section>
            <Section title="Price Comparison & Tips">{data.priceComparison}</Section>
            <Section title="Overall Guidance">{nl2br(data.guidance)}</Section>
            <div className="text-gray-500 text-sm mt-2">
              Submitted by {data.username ?? "unknown"} · {data.createdAt ? new Date(data.createdAt as any).toLocaleString() : ""}
            </div>
          </>
        )}

        {/* 附近药房 */}
        <div style={{ marginTop: 40 }}>
          <h2 className="text-xl font-semibold mb-2">Nearby Pharmacies</h2>

          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={findNearby}
              disabled={nearbyLoading}
              className="px-3 py-1 border rounded hover:bg-gray-50"
              style={{ position: "relative", zIndex: 5 }}
            >
              {nearbyLoading ? "Searching..." : "Find Pharmacies within 5km"}
            </button>

            <button
              type="button"
              onClick={() => {
                const test = { lat: -33.8880, lng: 151.1950 }; //  CBD
                setGeo(test);
                findNearby();
              }}
              className="px-3 py-1 border rounded hover:bg-gray-50"
              title="sydney"
            >
              test position
            </button>
          </div>

          {nearbyMsg && <div className="text-sm text-gray-600 mb-2">{nearbyMsg}</div>}
          {nearby.length > 0 && (
            <>
              {geo && <PharmacyMap center={geo} facilities={nearby} />}
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

      {/* 导出按钮放容器外，避免被 onclone 隐藏 */}
      <div className="mt-4">
        <ExportButtons onExportPdf={handleExportPdf} onExportCsv={handleExportCsv} />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
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

function nl2br(s?: string | null) {
  return (s ?? "").split("\n").map((line, i) => <div key={i}>{line}</div>);
}
