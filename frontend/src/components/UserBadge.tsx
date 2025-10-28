"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LocalUser = { id: number; username?: string; email?: string } | null;

export default function UserBadge() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  const fallbackId = Number(process.env.NEXT_PUBLIC_USER_ID || 1);

  const [userId, setUserId] = useState<number>(fallbackId);
  const [username, setUsername] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hm_user");
      if (raw) {
        const u: LocalUser = JSON.parse(raw);
        if (u?.id) setUserId(u.id);
        if (u?.username) setUsername(u.username);
      }
    } catch {}
  }, []);

  useEffect(() => {
    // If username absent, try fetch from backend
    if (username) return;
    (async () => {
      try {
        const res = await fetch(`${base}/api/users/${userId}`);
        if (!res.ok) return;
        const j = await res.json();
        if (j?.username) setUsername(j.username);
      } catch {}
    })();
  }, [base, userId, username]);

  const display = username ? username : `User #${userId}`;
  const initial = (username || "U").trim().charAt(0).toUpperCase() || "U";

  return (
    <Link href="/profile" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, color: "#6b7280" }}>Signed in as</div>
        <div style={{ fontWeight: 700 }}>{display}</div>
      </div>
      <div
        aria-label="User avatar"
        style={{ width: 32, height: 32, borderRadius: 9999, background: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}
      >
        {initial}
      </div>
    </Link>
  );
}


