"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  generateDietGuidance,
  listDietGuidanceByUser,
  getDietGuidance,
  searchDietGuidance,
  deleteDietGuidance,
  type DietGuidance,
} from "@/lib/api";
import "@/styles/card.css";

export default function DietGuidancePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [form, setForm] = useState({
    healthIssue: "",
    dietPreference: "",
    allergies: "",
    budgetEquipments: "",
    notes: "",
  });
  const [preview, setPreview] = useState<DietGuidance | null>(null);
  const [history, setHistory] = useState<DietGuidance[]>([]);
  const [search, setSearch] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

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
    setError(null);
    try {
      const list = await listDietGuidanceByUser(uid);
      setHistory(list);
    } catch (e: any) {
      setError(e?.message || "加载历史失败");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function onGenerate() {
    if (userId == null || !form.healthIssue.trim()) {
      setError("请填写健康问题 healthIssue");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await generateDietGuidance(userId, form.healthIssue.trim());
      setPreview(res);
      await loadHistory(userId);
    } catch (e: any) {
      setError(e?.message || "生成失败");
    } finally {
      setGenerating(false);
    }
  }

  async function onSearch() {
    if (!search.trim()) {
      // 如果搜索为空，重新加载所有历史
      if (userId != null) await loadHistory(userId);
      return;
    }
    setLoadingHistory(true);
    setError(null);
    try {
      const list = await searchDietGuidance(search.trim());
      setHistory(list);
    } catch (e: any) {
      setError(e?.message || "搜索失败");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function onDelete(id: number) {
    setShowDeleteConfirm(id);
  }

  async function handleConfirmDelete() {
    if (showDeleteConfirm == null) return;
    await deleteDietGuidance(showDeleteConfirm);
    setShowDeleteConfirm(null);
    if (userId != null) await loadHistory(userId);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* 表单 */}
      <div className="card scale-in">
        <h3>生成饮食指导</h3>
        <form className="row" style={{ gridTemplateColumns: "repeat(2, minmax(230px, 1fr))" }} onSubmit={(e) => { e.preventDefault(); }}>
          <div>
            <label>用户ID</label>
            <input disabled value={userId ?? ""} type="text" />
          </div>
          <div>
            <label>健康问题（healthIssue）</label>
            <input type="text" value={form.healthIssue} onChange={(e) => setForm({ ...form, healthIssue: e.target.value })} placeholder="如：高血压/糖尿病/减脂/高尿酸" />
          </div>
          <div>
            <label>饮食偏好（可选）</label>
            <input type="text" value={form.dietPreference} onChange={(e) => setForm({ ...form, dietPreference: e.target.value })} placeholder="地中海/低碳/素食/清淡" />
          </div>
          <div>
            <label>过敏/禁忌（可选）</label>
            <input type="text" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="花生过敏/不吃海鲜" />
          </div>
          <div>
            <label>预算/厨房设备（可选）</label>
            <input type="text" value={form.budgetEquipments} onChange={(e) => setForm({ ...form, budgetEquipments: e.target.value })} placeholder="烤箱/空气炸锅/学生党预算" />
          </div>
          <div>
            <label>备注（可选）</label>
            <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="如：最近睡眠差，想减少夜宵" style={{ width: "100%", marginTop: "6px", padding: "11px 12px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff", fontSize: "15px", fontFamily: "inherit" }} />
          </div>
          <div className="actions" style={{ gridColumn: "1 / -1", marginTop: 4 }}>
            <button type="button" onClick={onGenerate} disabled={generating} className="btn btn-primary">
              {generating ? "生成中..." : "Generate with AI"}
            </button>
            {error && <span className="badge" style={{ background: "#fee2e2", color: "#dc2626" }}>{error}</span>}
          </div>
        </form>
      </div>

      <div className="card scale-in">
        <div className="flex items-center justify-between mb-2">
          <h3>AI 结果预览</h3>
        </div>
        {preview ? (
          <DietPreview data={preview} />
        ) : (
          <p className="text-sm text-gray-600">暂无预览</p>
        )}
      </div>

      {/* 历史记录表格 */}
      <div className="card">
        <h3>历史记录 / 搜索</h3>
        <div className="flex items-center gap-2 mb-2" style={{ marginTop: "6px" }}>
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
            placeholder="按健康问题搜索，如 高血压" 
            style={{ flex: 1, padding: "11px 12px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff", fontSize: "15px" }}
          />
          <button onClick={onSearch} className="btn btn-primary">
            搜索
          </button>
        </div>
        {loadingHistory ? (
          <div className="text-sm text-gray-600" style={{ marginTop: 12 }}>加载中...</div>
        ) : (
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>健康问题</th>
                  <th>创建日期</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ color: "var(--muted)" }}>
                      暂无记录
                    </td>
                  </tr>
                ) : (
                  history.map((d, idx) => {
                    const id = getDietId(d);
                    return (
                      <tr key={id ?? idx}>
                        <td>#{id ?? idx + 1}</td>
                        <td>{d.healthIssue || "—"}</td>
                        <td>{formatDate(d.createdAt)}</td>
                        <td>
                          <button
                            className="btn btn-ghost"
                            onClick={async () => {
                              if (id != null) {
                                setPreview(await getDietGuidance(id));
                              } else {
                                setPreview(d);
                              }
                            }}
                            style={{ marginRight: 4 }}
                          >
                            查看
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              if (id != null) onDelete(id);
                            }}
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm != null && (
        <div
          onClick={() => setShowDeleteConfirm(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: "white", 
              borderRadius: 12, 
              padding: 20, 
              width: 360, 
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              position: "relative",
              margin: "auto",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>确认删除</h3>
            <p style={{ fontSize: 14, color: "#4B5563", marginBottom: 16 }}>确定要删除此饮食指导吗？此操作不可撤销。</p>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: ".55rem 0",
                  borderRadius: 8,
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  padding: ".55rem 0",
                  borderRadius: 8,
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "#dc2626",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="mb-3">
      <h3 className="font-medium mb-1 text-sm">{title}</h3>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  );
}

function TextBlock({ text }: { text?: string | null }) {
  if (!text) return null;
  return <div className="whitespace-pre-wrap leading-6">{text}</div>;
}

function DietPreview({ data }: { data: DietGuidance }) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">ID #{getDietId(data) ?? data.id ?? "—"} • {formatDate(data.createdAt)}</div>
      <Section title="Summary"><TextBlock text={data.summary} /></Section>
      <Section title="Recommendations"><TextBlock text={data.recommendations} /></Section>
      <Section title="AI Insights"><TextBlock text={data.aiInsights} /></Section>
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

function getDietId(d: any): number | null {
  const v = d?.id ?? d?.guidanceId ?? d?.dietId ?? d?.dietGuidanceId ?? d?.guidanceID ?? d?.diet_id;
  return typeof v === "number" ? v : (v ? Number(v) : null);
}


