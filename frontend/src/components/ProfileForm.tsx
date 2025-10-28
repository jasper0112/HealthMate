"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  role?: string;
  enabled?: boolean;
};

export default function ProfileForm() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  const userId = Number(process.env.NEXT_PUBLIC_USER_ID || 1);

  const [data, setData] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const res = await fetch(`${base}/api/users/${userId}`);
        if (!res.ok) throw new Error("Failed to load profile");
        setData(await res.json());
      } catch (e: any) {
        setError(e.message || "Failed to load profile");
      }
    })();
  }, [base, userId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch(`${base}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          fullName: data.fullName,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          phoneNumber: data.phoneNumber,
          address: data.address,
          role: data.role,
          enabled: data.enabled,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Save failed");
      }
      setOk("Saved");
    } catch (e: any) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <div>Loading profile...</div>;

  const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    alignItems: "center",
    gap: 16,
  };
  const inputStyle: React.CSSProperties = {
    padding: "14px 16px",
    fontSize: 16,
    border: "1px solid var(--border)",
    borderRadius: 12,
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 18, maxWidth: 920, margin: "0 auto" }}>
      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#b91c1c", padding: "8px 10px", borderRadius: 8 }}>
          {error}
        </div>
      )}
      {ok && (
        <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "8px 10px", borderRadius: 8 }}>
          {ok}
        </div>
      )}

      <div style={rowStyle}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Username</span>
        <input style={inputStyle} value={data.username || ""} onChange={(e) => setData({ ...(data as User), username: e.target.value })} />
      </div>

      <div style={rowStyle}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Email</span>
        <input style={inputStyle} type="email" value={data.email || ""} onChange={(e) => setData({ ...(data as User), email: e.target.value })} />
      </div>

      <div style={rowStyle}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Full name</span>
        <input style={inputStyle} value={data.fullName || ""} onChange={(e) => setData({ ...(data as User), fullName: e.target.value })} />
      </div>

      <div style={rowStyle}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Gender</span>
        <select style={inputStyle as any} value={data.gender || "OTHER"} onChange={(e) => setData({ ...(data as User), gender: e.target.value as any })}>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div style={rowStyle}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Phone</span>
        <input style={inputStyle} value={data.phoneNumber || ""} onChange={(e) => setData({ ...(data as User), phoneNumber: e.target.value })} />
      </div>

      <div style={rowStyle}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Address</span>
        <input style={inputStyle} value={data.address || ""} onChange={(e) => setData({ ...(data as User), address: e.target.value })} />
      </div>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: 10 }}>
        <button className="btn btn-solid" type="submit" disabled={saving} style={{ padding: "12px 20px", borderRadius: 12, fontSize: 16 }}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}


