"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  generateHealthPlan,
  latestHealthPlanByUser,
  listHealthPlansByUser,
  listHealthPlansByType,
  activeHealthPlanByUser,
  deleteHealthPlan,
  type HealthPlanResponse,
  type HealthPlanType,
} from "@/lib/api";
import "@/styles/card.css";

export default function HealthPlansPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [form, setForm] = useState({
    type: "DAILY" as HealthPlanType,
    startDate: "",
    endDate: "",
    daysBack: 14,
    healthGoals: "",
    dietPreference: "",
    allergies: "",
    activityLevel: "",
  });
  const [preview, setPreview] = useState<HealthPlanResponse | null>(null);
  const [history, setHistory] = useState<HealthPlanResponse[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | HealthPlanType>("ALL");
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
    // Load latest and history
    latestHealthPlanByUser(u.userId).then(setPreview).catch(() => {});
    loadHistory(u.userId, "ALL");
  }, [router]);

  async function loadHistory(uid: number, type: "ALL" | HealthPlanType) {
    setLoadingHistory(true);
    setError(null);
    try {
      const list =
        type === "ALL"
          ? await listHealthPlansByUser(uid)
          : await listHealthPlansByType(uid, type);
      setHistory(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load history plans");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function onGenerate() {
    if (userId == null) return;
    setGenerating(true);
    setError(null);
    try {
      const body = {
        userId,
        type: form.type,
        daysBack: form.daysBack || undefined,
        startDate: form.startDate ? `${form.startDate}T00:00:00` : null,
        endDate: form.endDate ? `${form.endDate}T00:00:00` : null,
        healthGoals: form.healthGoals || null,
      };
      const plan = await generateHealthPlan(body);
      setPreview(plan);
      await loadHistory(userId, filterType);
    } catch (e: any) {
      setError(e?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function onLoadLatest() {
    if (userId == null) return;
    const p = await latestHealthPlanByUser(userId);
    setPreview(p);
  }

  async function onLoadActive() {
    if (userId == null) return;
    const p = await activeHealthPlanByUser(userId);
    setPreview(p);
  }

  async function onDelete(id: number) {
    setShowDeleteConfirm(id);
  }

  async function handleConfirmDelete() {
    if (showDeleteConfirm == null) return;
    await deleteHealthPlan(showDeleteConfirm);
    setShowDeleteConfirm(null);
    if (userId != null) await loadHistory(userId, filterType);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Form */}
      <div className="card scale-in">
        <h3>Generate Plan</h3>
        <form className="row" style={{ gridTemplateColumns: "repeat(2, minmax(230px, 1fr))" }} onSubmit={(e) => { e.preventDefault(); }}>
            <div>
              <label>User ID</label>
              <input disabled value={userId ?? ""} type="text" />
            </div>
            <div>
              <label>Plan Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as HealthPlanType })} style={{ width: "100%", marginTop: "6px", padding: "11px 12px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff", fontSize: "15px" }}>
                <option value="DAILY">DAILY</option>
                <option value="WEEKLY">WEEKLY</option>
                <option value="MONTHLY">MONTHLY</option>
              </select>
            </div>
            <div>
              <label>End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div>
              <label>Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label>Days Back (Optional)</label>
              <input type="number" min={0} value={form.daysBack} onChange={(e) => setForm({ ...form, daysBack: Number(e.target.value) })} />
            </div>
            <div>
              <label>Health Goals</label>
              <input type="text" value={form.healthGoals} onChange={(e) => setForm({ ...form, healthGoals: e.target.value })} placeholder="e.g., Weight loss, Improve sleep" />
            </div>
            <div>
              <label>Diet Preference (Optional)</label>
              <input type="text" value={form.dietPreference} onChange={(e) => setForm({ ...form, dietPreference: e.target.value })} placeholder="Low sugar/High protein/Vegetarian..." />
            </div>
            <div>
              <label>Allergies/Contraindications (Optional)</label>
              <input type="text" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Peanut allergy/Lactose intolerant..." />
            </div>
            <div>
              <label>Activity Level (Optional)</label>
              <input type="text" value={form.activityLevel} onChange={(e) => setForm({ ...form, activityLevel: e.target.value })} placeholder="Sedentary/Moderate/High intensity" />
            </div>
            <div className="actions" style={{ gridColumn: "1 / -1", marginTop: 4 }}>
              <button type="button" onClick={onGenerate} disabled={generating} className="btn btn-primary">
                {generating ? "Generating..." : "Generate with AI"}
              </button>
              {error && <span className="badge" style={{ background: "#fee2e2", color: "#dc2626" }}>{error}</span>}
            </div>
          </form>
      </div>

      <div className="card scale-in">
          <div className="flex items-center justify-between mb-2">
            <h3>Plan Preview</h3>
            <div className="flex gap-2">
              <button 
                onClick={onLoadLatest} 
                className="btn btn-primary"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1d4ed8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#2563eb";
                }}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  borderColor: "#1e40af",
                }}
              >
                Latest
              </button>
              <button 
                onClick={onLoadActive} 
                className="btn btn-primary"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1d4ed8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#2563eb";
                }}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  borderColor: "#1e40af",
                }}
              >
                Active
              </button>
            </div>
          </div>
          {preview ? (
            <PlanPreview plan={preview} />
          ) : (
            <p className="text-sm text-gray-600">No plan available for preview</p>
          )}
        </div>

        {/* History Plans Table */}
        <div className="card">
          <h3>History Plans</h3>
          <div className="flex items-center justify-between mb-2">
            <select value={filterType} onChange={async (e) => { const t = e.target.value as any; setFilterType(t); if (userId!=null) await loadHistory(userId, t); }} style={{ width: "100%", marginTop: "6px", padding: "11px 12px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff", fontSize: "15px" }}>
              <option value="ALL">All</option>
              <option value="DAILY">DAILY</option>
              <option value="WEEKLY">WEEKLY</option>
              <option value="MONTHLY">MONTHLY</option>
            </select>
          </div>
          {loadingHistory ? (
            <div className="text-sm text-gray-600" style={{ marginTop: 12 }}>Loading...</div>
          ) : (
            <div style={{ marginTop: 12, overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ color: "var(--muted)" }}>
                        No records
                      </td>
                    </tr>
                  ) : (
                    history.map((p) => (
                      <tr key={p.id}>
                        <td>#{p.id}</td>
                        <td>{p.type}</td>
                        <td>{formatDate(p.createdAt)}</td>
                        <td>
                          <button
                            className="btn btn-ghost"
                            onClick={() => setPreview(p)}
                            style={{ marginRight: 4 }}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => onDelete(p.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Delete Confirmation Dialog */}
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
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Confirm Delete</h3>
            <p style={{ fontSize: 14, color: "#4B5563", marginBottom: 16 }}>Are you sure you want to delete this plan? This action cannot be undone.</p>
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
                Cancel
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
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-600">{label}</label>
      {children}
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

function PlanPreview({ plan }: { plan: any }) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">ID #{plan.id} • Type {plan.type} • {formatDate(plan.createdAt)}</div>
      <Section title="Plan Summary"><TextBlock text={plan.planSummary || plan.summary} /></Section>
      <Section title="Diet Strategy"><TextBlock text={plan.dietOverview || plan.foodRecommendations} /></Section>
      <Section title="Nutrition Goals"><TextBlock text={plan.nutritionGoals} /></Section>
      <Section title="Daily Meal Plan Example"><TextBlock text={plan.dailyMealPlan} /></Section>
      <Section title="Exercise Strategy"><TextBlock text={plan.exerciseOverview || plan.weeklyWorkoutPlan} /></Section>
      <Section title="Fitness Goals"><TextBlock text={plan.fitnessGoals} /></Section>
      <Section title="Exercise Recommendations"><TextBlock text={plan.exerciseRecommendations} /></Section>
      <Section title="Lifestyle"><TextBlock text={plan.lifestyleOverview || plan.dailyRoutine} /></Section>
      <Section title="Sleep Recommendations"><TextBlock text={plan.sleepRecommendations} /></Section>
      <Section title="Stress Management"><TextBlock text={plan.stressManagementTips} /></Section>
      <Section title="Hydration Goals"><TextBlock text={plan.hydrationGoals} /></Section>
      <Section title="Long-term Goals"><TextBlock text={plan.longTermGoals} /></Section>
      <Section title="Progress Tracking"><TextBlock text={plan.progressTrackingTips} /></Section>
      <Section title="Motivational Notes"><TextBlock text={plan.motivationalNotes} /></Section>
    </div>
  );
}
