"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";

export default function RegisterPage() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "", fullName: "", gender: "OTHER" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function validateLocally() {
    if (form.username.trim().length < 3) return "Username must be at least 3 characters";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Email format is invalid";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    const v = validateLocally();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName || undefined,
          gender: form.gender, // 后端有默认 OTHER，这里可传也可不传
        }),
      });

      if (!res.ok) {
        let message = "Registration failed";
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const j = await res.json();
            message = j.error || j.message || (j.errors && Array.isArray(j.errors) ? j.errors.map((x:any)=>x.defaultMessage || x.message).join("; ") : JSON.stringify(j));
          } else {
            message = await res.text();
          }
        } catch {}
        throw new Error(message || `HTTP ${res.status}`);
      }

      // 注册成功：保存用户信息并跳转到仪表盘
      const user = await res.json().catch(() => null);
      if (user && user.id) {
        try { localStorage.setItem("hm_user", JSON.stringify({ id: user.id, username: user.username, email: user.email })); } catch {}
      }
      setOk("Registration successful. Redirecting to dashboard...");
      setTimeout(() => router.push("/dashboard"), 600);
    } catch (e: any) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 className="hm-section-title" style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", textAlign: "center" }}>
          <Image src="/file.svg" alt="icon" width={22} height={22} />
          Create your account
        </h1>

        <div className="hm-card" style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
          {error && (
            <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#b91c1c", padding: "12px 14px", borderRadius: 10, marginBottom: 14, whiteSpace: "pre-wrap" }}>{error}</div>
          )}
          {ok && (
            <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "12px 14px", borderRadius: 10, marginBottom: 14 }}>{ok}</div>
          )}

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
            <label className="hm-field" style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Username</span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Image src="/globe.svg" alt="" width={18} height={18} />
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="alice"
                  style={{ flex: 1, padding: "12px 14px", border: "1px solid #d1d5db", borderRadius: 10 }}
                />
              </div>
              <small style={{ color: "#6b7280" }}>3-50 characters</small>
            </label>

            <label className="hm-field" style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Email</span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Image src="/window.svg" alt="" width={18} height={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="alice@example.com"
                  style={{ flex: 1, padding: "12px 14px", border: "1px solid #d1d5db", borderRadius: 10 }}
                />
              </div>
            </label>

            <label className="hm-field" style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Password</span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Image src="/vercel.svg" alt="" width={18} height={18} />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
                  style={{ flex: 1, padding: "12px 14px", border: "1px solid #d1d5db", borderRadius: 10 }}
                />
              </div>
            </label>

            <label className="hm-field" style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Full name</span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Image src="/file.svg" alt="" width={18} height={18} />
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Alice Lee"
                  style={{ flex: 1, padding: "12px 14px", border: "1px solid #d1d5db", borderRadius: 10 }}
                />
              </div>
            </label>

            <label className="hm-field" style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Gender</span>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                style={{ padding: "12px 14px", border: "1px solid #d1d5db", borderRadius: 10 }}
              >
                <option value="OTHER">Other</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </label>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 4 }}>
              <button className="btn btn-solid" type="submit" disabled={loading} style={{ padding: "12px 18px", borderRadius: 10 }}>
                {loading ? "Registering..." : "Register"}
              </button>
              <a className="btn" href="/login" style={{ border: "1px solid #d1d5db", padding: "12px 18px", borderRadius: 10 }}>Go to Login</a>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}


