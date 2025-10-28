"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      // 伪登录：仅在 localStorage 写入 user 信息，后续可改为真实登录
      if (!username) throw new Error("Please enter username");
      if (!userId || isNaN(Number(userId))) throw new Error("Please enter valid user id");
      localStorage.setItem("hm_user", JSON.stringify({ id: Number(userId), username }));
      // 同步到 NEXT_PUBLIC_USER_ID 的使用场景：前端 API 默认读取该值；这里仅作为演示
      // 注意：NEXT_PUBLIC_* 是构建时变量，这里只做运行时替代给页面使用
      // 实际 API 调用处仍读取 .env 值或自行传参
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Login failed");
    }
  }

  return (
    <main>
      <h1 className="hm-section-title" style={{ textAlign: "center" }}>Welcome back</h1>

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#b91c1c", padding: "10px 12px", borderRadius: 10, marginBottom: 14 }}>{error}</div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14, maxWidth: 520, margin: "0 auto" }}>
        <div className="hm-card" style={{ padding: 22, display: "grid", gap: 14 }}>
          <label className="hm-field">
            <span>Username</span>
            <input placeholder="Enter your name" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label className="hm-field">
            <span>User ID</span>
            <input placeholder="Enter your user id" value={userId} onChange={(e) => setUserId(e.target.value)} />
          </label>
          <button className="btn btn-solid" type="submit">Login</button>
        </div>
      </form>
    </main>
  );
}


