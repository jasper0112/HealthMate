"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";

export default function FacilitiesPage() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    setLoading(true);
    const res = await fetch(`${base}/api/facilities`);
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = q ? `${base}/api/facilities/search?name=${encodeURIComponent(q)}` : `${base}/api/facilities`;
    const res = await fetch(url);
    setItems(await res.json());
    setLoading(false);
  }

  return (
    <main>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Facilities", current: true }]} />
      <h1 className="hm-section-title">Facilities</h1>

      <form onSubmit={onSearch} style={{ display: "flex", gap: ".5rem", marginBottom: "1rem" }}>
        <input placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-solid" type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
        <button type="button" className="btn" onClick={loadAll}>
          Reset
        </button>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul style={{ display: "grid", gap: ".5rem" }}>
          {items.map((f) => (
            <li key={f.facilityId} className="hm-card" style={{ padding: ".75rem" }}>
              <div style={{ fontWeight: 600 }}>{f.name}</div>
              <div style={{ color: "#6b7280" }}>{f.address}</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>{f.facilityType}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


