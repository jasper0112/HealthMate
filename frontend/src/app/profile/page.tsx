"use client";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getUserById, updateUser, UserResponse } from "@/lib/api";
import { useRouter } from "next/navigation";
import "@/styles/card.css";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const auth = getCurrentUser();
    if (!auth) {
      router.replace("/login");
      return;
    }
    getUserById(auth.userId)
      .then(setUser)
      .catch(() => setError("Failed to load user information"));
  }, [router]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  if (!user) {
    return <div className="max-w-6xl mx-auto">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="card scale-in">
        <h3>Personal Information</h3>
        {edit ? (
          <EditForm user={user} onCancel={() => setEdit(false)} onSave={async (payload) => {
            setSaving(true);
            setError(null);
            try {
              const updated = await updateUser(user.id, payload);
              setUser(updated);
              setEdit(false);
              setShowSuccess(true);
            } catch (e: any) {
              setError(e?.message || "Update failed");
            } finally {
              setSaving(false);
            }
          }} saving={saving} />
        ) : (
          <>
            <div className="row" style={{ gridTemplateColumns: "repeat(2, minmax(230px, 1fr))" }}>
              <ReadOnlyField label="ID" value={String(user.id)} />
              <ReadOnlyField label="Username" value={user.username} />
              <ReadOnlyField label="Email" value={user.email} />
              <ReadOnlyField label="Full Name" value={user.fullName || ""} />
              <ReadOnlyField label="Gender" value={user.gender || ""} />
              <ReadOnlyField label="Date of Birth" value={user.dateOfBirth ? user.dateOfBirth.substring(0, 10) : ""} />
              <ReadOnlyField label="Phone" value={user.phoneNumber || ""} />
              <ReadOnlyField label="Address" value={user.address || ""} />
              <ReadOnlyField label="User Info" value={user.userInfo || ""} style={{ gridColumn: "1 / -1" }} />
              <ReadOnlyField label="Health Profile" value={user.healthProfile || ""} style={{ gridColumn: "1 / -1" }} />
              <ReadOnlyField label="Health Goal" value={user.healthGoal || ""} style={{ gridColumn: "1 / -1" }} />
            </div>
            {error && <span className="badge" style={{ background: "#fee2e2", color: "#dc2626", marginTop: 12 }}>{error}</span>}
            <div className="actions" style={{ marginTop: 12 }}>
              <button onClick={() => setEdit(true)} className="btn btn-primary">
                Edit
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Success toast */}
      {showSuccess && (
        <Toast onClose={() => setShowSuccess(false)} />
      )}
    </div>
  );
}

function Toast({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideInUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        animation: "slideInUp 0.3s ease-out",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
          padding: "16px 20px",
          minWidth: "280px",
          border: "1px solid var(--border)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" fill="white"/>
          </svg>
        </div>
        <span style={{ fontSize: "15px", color: "#111827", flex: 1 }}>
          Update successful
        </span>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            transition: "background-color 0.15s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5L15 15" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value, style }: { label: string; value: string; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label>{label}</label>
      <input disabled value={value || "—"} type="text" />
    </div>
  );
}

function EditForm({ user, onCancel, onSave, saving }: {
  user: UserResponse;
  onCancel: () => void;
  onSave: (payload: any) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    username: user.username || "",
    email: user.email || "",
    fullName: user.fullName || "",
    gender: user.gender || "OTHER",
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.substring(0, 10) : "",
    phoneNumber: user.phoneNumber || "",
    address: user.address || "",
    userInfo: user.userInfo || "",
    healthProfile: user.healthProfile || "",
    healthGoal: user.healthGoal || "",
  });
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="row"
      style={{ gridTemplateColumns: "repeat(2, minmax(230px, 1fr))" }}
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const payload = {
          ...form,
          dateOfBirth: form.dateOfBirth ? `${form.dateOfBirth}T00:00:00` : undefined,
        };
        try {
          await onSave(payload);
        } catch (e: any) {
          setError(e?.message || "Save failed");
        }
      }}
    >
      <div>
        <label>ID</label>
        <input disabled value={String(user.id)} type="text" />
      </div>
      <div>
        <label>Username</label>
        <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
      </div>
      <div>
        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <label>Full Name</label>
        <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
      </div>
      <div>
        <label>Gender</label>
        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} style={{ width: "100%", marginTop: "6px", padding: "11px 12px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff", fontSize: "15px" }}>
          <option value="MALE">MALE</option>
          <option value="FEMALE">FEMALE</option>
          <option value="OTHER">OTHER</option>
        </select>
      </div>
      <div>
        <label>Date of Birth</label>
        <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
      </div>
      <div>
        <label>Phone</label>
        <input type="text" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
      </div>
      <div>
        <label>Address</label>
        <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <label>User Info</label>
        <textarea rows={3} value={form.userInfo} onChange={(e) => setForm({ ...form, userInfo: e.target.value })} style={{ width: "100%", marginTop: "6px", padding: "11px 12px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff", fontSize: "15px", fontFamily: "inherit", resize: "vertical" }} />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <label>Health Profile</label>
        <textarea rows={3} value={form.healthProfile} onChange={(e) => setForm({ ...form, healthProfile: e.target.value })} style={{ width: "100%", marginTop: "6px", padding: "11px 12px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff", fontSize: "15px", fontFamily: "inherit", resize: "vertical" }} />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <label>Health Goal</label>
        <textarea rows={3} value={form.healthGoal} onChange={(e) => setForm({ ...form, healthGoal: e.target.value })} style={{ width: "100%", marginTop: "6px", padding: "11px 12px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff", fontSize: "15px", fontFamily: "inherit", resize: "vertical" }} />
      </div>
      <div className="actions" style={{ gridColumn: "1 / -1", marginTop: 4 }}>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancel
        </button>
        {error && <span className="badge" style={{ background: "#fee2e2", color: "#dc2626" }}>{error}</span>}
      </div>
    </form>
  );
}


