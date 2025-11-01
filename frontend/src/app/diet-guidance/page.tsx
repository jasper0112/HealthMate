"use client";
import { useEffect, useState, useRef } from "react";
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
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingPreviewId, setLoadingPreviewId] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

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
      setError(e?.message || "Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function onGenerate() {
    if (userId == null || !form.healthIssue.trim()) {
      setError("Please fill in the health issue");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await generateDietGuidance(userId, form.healthIssue.trim());
      setPreview(res);
      await loadHistory(userId);
    } catch (e: any) {
      setError(e?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function onSearch() {
    if (!search.trim()) {
      // If search is empty, reload all history
      if (userId != null) await loadHistory(userId);
      return;
    }
    if (userId == null) {
      setError("User not logged in");
      return;
    }
    setLoadingHistory(true);
    setError(null);
    try {
      // First get all user data, then filter on frontend
      const allUserData = await listDietGuidanceByUser(userId);
      const searchTerm = search.trim().toLowerCase();
      // Search matching data in all fields
      const filtered = allUserData.filter((item) => {
        const fields = [
          item.healthIssue,
          item.foodRecommendations,
          item.avoidFoods,
          item.supplementRecommendations,
          item.mealSuggestions,
          item.cookingTips,
          item.guidance,
          item.nutritionalBenefits,
          item.sampleMenu,
          item.summary,
          item.recommendations,
          item.aiInsights,
        ];
        return fields.some(field => field?.toLowerCase().includes(searchTerm));
      });
      setHistory(filtered);
    } catch (e: any) {
      setError(e?.message || "Search failed");
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
      {/* Form */}
      <div className="card scale-in">
        <h3>Generate Diet Guidance</h3>
        <form className="row" style={{ gridTemplateColumns: "repeat(2, minmax(230px, 1fr))" }} onSubmit={(e) => { e.preventDefault(); }}>
          <div>
            <label>User ID</label>
            <input disabled value={userId ?? ""} type="text" />
          </div>
          <div>
            <label>Health Issue (healthIssue)</label>
            <input type="text" value={form.healthIssue} onChange={(e) => setForm({ ...form, healthIssue: e.target.value })} placeholder="e.g., Hypertension/Diabetes/Weight Loss/High Uric Acid" />
          </div>
          <div>
            <label>Diet Preference (Optional)</label>
            <input type="text" value={form.dietPreference} onChange={(e) => setForm({ ...form, dietPreference: e.target.value })} placeholder="Mediterranean/Low-Carb/Vegetarian/Light" />
          </div>
          <div>
            <label>Allergies/Contraindications (Optional)</label>
            <input type="text" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Peanut allergy/No seafood" />
          </div>
          <div>
            <label>Budget/Kitchen Equipment (Optional)</label>
            <input type="text" value={form.budgetEquipments} onChange={(e) => setForm({ ...form, budgetEquipments: e.target.value })} placeholder="Oven/Air Fryer/Student Budget" />
          </div>
          <div>
            <label>Notes (Optional)</label>
            <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g., Poor sleep recently, want to reduce late-night snacks" style={{ width: "100%", marginTop: "6px", padding: "11px 12px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff", fontSize: "15px", fontFamily: "inherit" }} />
          </div>
          <div className="actions" style={{ gridColumn: "1 / -1", marginTop: 4 }}>
            <button type="button" onClick={onGenerate} disabled={generating} className="btn btn-primary">
              {generating ? "Generating..." : "Generate with AI"}
            </button>
            {error && <span className="badge" style={{ background: "#fee2e2", color: "#dc2626" }}>{error}</span>}
          </div>
        </form>
      </div>

      <div ref={previewRef} className="card scale-in">
        <div className="flex items-center justify-between mb-2">
          <h3>AI Result Preview</h3>
        </div>
        {loadingPreview ? (
          <div className="text-sm text-gray-600" style={{ padding: "20px 0" }}>Loading...</div>
        ) : preview ? (
          <DietPreview data={preview} />
        ) : (
          <p className="text-sm text-gray-600">No preview available. Click the "View" button in the history to view details.</p>
        )}
      </div>

      {/* History Table */}
      <div className="card">
        <h3>History / Search</h3>
        <div className="flex items-center gap-2 mb-2" style={{ marginTop: "6px" }}>
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
            placeholder="Search by health issue, e.g., Hypertension" 
            style={{ flex: 1, padding: "11px 12px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff", fontSize: "15px" }}
          />
          <button onClick={onSearch} className="btn btn-primary">
            Search
          </button>
        </div>
        {loadingHistory ? (
          <div className="text-sm text-gray-600" style={{ marginTop: 12 }}>Loading...</div>
        ) : (
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Health Issue</th>
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
                              if (id != null) setLoadingPreviewId(id);
                              setLoadingPreview(true);
                              setError(null);
                              try {
                                // Prioritize using id to get complete data, if id is invalid use existing data
                                if (id != null && !isNaN(id) && id > 0) {
                                  try {
                                    console.log("Fetching diet guidance with ID:", id);
                                    const data = await getDietGuidance(id);
                                    console.log("Fetched data:", data);
                                    // Ensure id field exists (use dietGuidanceId or id)
                                    if (!data.id && data.dietGuidanceId) {
                                      data.id = data.dietGuidanceId;
                                    }
                                    setPreview(data);
                                  } catch (apiError: any) {
                                    // If API call fails, use current row data
                                    console.warn("Failed to fetch from API, using local data:", apiError);
                                    console.log("Local data:", d);
                                    // Ensure id field exists
                                    const localData = { ...d };
                                    if (!localData.id && localData.dietGuidanceId) {
                                      localData.id = localData.dietGuidanceId;
                                    }
                                    setPreview(localData);
                                  }
                                } else {
                                  // If no valid id, directly use current row data
                                  console.log("No valid ID, using local data:", d);
                                  const localData = { ...d };
                                  if (!localData.id && localData.dietGuidanceId) {
                                    localData.id = localData.dietGuidanceId;
                                  }
                                  setPreview(localData);
                                }
                                // Scroll to preview area
                                setTimeout(() => {
                                  previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }, 100);
                              } catch (e: any) {
                                console.error("Error loading preview:", e);
                                setError(e?.message || "Failed to load record");
                                // Even if error occurs, try to display existing data
                                const localData = { ...d };
                                if (!localData.id && localData.dietGuidanceId) {
                                  localData.id = localData.dietGuidanceId;
                                }
                                if (localData && (localData.foodRecommendations || localData.guidance || localData.summary || localData.recommendations || localData.aiInsights)) {
                                  setPreview(localData);
                                }
                              } finally {
                                setLoadingPreview(false);
                                setLoadingPreviewId(null);
                              }
                            }}
                            disabled={loadingPreview && loadingPreviewId === id}
                            style={{ marginRight: 4 }}
                          >
                            {(loadingPreview && loadingPreviewId === id && id != null) ? "Loading..." : "View"}
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              if (id != null) onDelete(id);
                            }}
                          >
                            Delete
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
            <p style={{ fontSize: 14, color: "#4B5563", marginBottom: 16 }}>Are you sure you want to delete this diet guidance? This action cannot be undone.</p>
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
  const id = getDietId(data);
  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-3">
        ID #{id ?? "—"} • {formatDate(data.createdAt)}
        {data.healthIssue && (
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
            {data.healthIssue}
          </span>
        )}
        {data.username && (
          <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
            User: {data.username}
          </span>
        )}
      </div>
      
      {/* Display all backend fields */}
      <Section title="Health Issue"><TextBlock text={data.healthIssue} /></Section>
      <Section title="Food Recommendations"><TextBlock text={data.foodRecommendations} /></Section>
      <Section title="Avoid Foods"><TextBlock text={data.avoidFoods} /></Section>
      <Section title="Supplement Recommendations"><TextBlock text={data.supplementRecommendations} /></Section>
      <Section title="Meal Suggestions"><TextBlock text={data.mealSuggestions} /></Section>
      <Section title="Cooking Tips"><TextBlock text={data.cookingTips} /></Section>
      <Section title="Guidance"><TextBlock text={data.guidance} /></Section>
      <Section title="Nutritional Benefits"><TextBlock text={data.nutritionalBenefits} /></Section>
      <Section title="Sample Menu"><TextBlock text={data.sampleMenu} /></Section>
      
      {/* Compatible with old frontend fields */}
      
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
  // Prioritize using backend dietGuidanceId field
  const v = d?.dietGuidanceId ?? d?.id ?? d?.guidanceId ?? d?.dietId ?? d?.guidanceID ?? d?.diet_id;
  return typeof v === "number" ? v : (v ? Number(v) : null);
}


