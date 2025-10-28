"use client";
import React, { useEffect, useMemo, useState } from "react";
import { HealthAssessmentResponse } from "../lib/types";
import { listAssessmentsByUser } from "../lib/api";
import { fmtDateTime } from "../lib/utils";
import "../styles/card.css";

const PAGE_SIZE = 10;

function useClientPaging<T>(all: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
  const slice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return all.slice(start, start + pageSize);
  }, [all, page, pageSize]);
  return { page, setPage, totalPages, slice };
}

export default function AssessmentHistory() {
  const [all, setAll] = useState<HealthAssessmentResponse[]>([]);
  const [sel, setSel] = useState<HealthAssessmentResponse[]>([]);

  async function load() {
    const res = await listAssessmentsByUser();
    // sort desc by createdAt
    res.sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setAll(res);
  }
  useEffect(()=>{ load(); }, []);

  const { page, setPage, totalPages, slice } = useClientPaging(all, PAGE_SIZE);

  function toggleSelect(item: HealthAssessmentResponse) {
    const exists = sel.find(s => s.id === item.id);
    setSel(exists ? sel.filter(s => s.id !== item.id) : [...sel.slice(-1), item]); // keep at most 2
  }

  const diff = (() => {
    if (sel.length !== 2) return null;
    const [a, b] = sel;
    const scoreA = a.overallScore ?? 0;
    const scoreB = b.overallScore ?? 0;
    return {
      score: scoreA - scoreB,
      traffic: `${a.traffic ?? "-"} → ${b.traffic ?? "-"}`
    };
  })();

  return (
    <div className="card">
      <h3>Report History</h3>
      <div style={{overflowX:"auto"}}>
        <table className="table">
          <thead>
            <tr>
              <th>Select</th><th>DateTime</th><th>Score</th><th>Traffic</th><th>Type</th>
            </tr>
          </thead>
          <tbody>
            {slice.map(it => (
              <tr key={it.id}>
                <td><input type="checkbox" checked={!!sel.find(s=>s.id===it.id)} onChange={()=> toggleSelect(it)} /></td>
                <td>{fmtDateTime(it.createdAt)}</td>
                <td>{it.overallScore ?? "-"}</td>
                <td>{it.traffic ?? "-"}</td>
                <td>{it.type ?? "-"}</td>
              </tr>
            ))}
            {slice.length === 0 && (
              <tr><td colSpan={5} style={{color:"var(--muted)"}}>No records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="actions" style={{marginTop:10}}>
        <button className="btn btn-ghost" onClick={()=> setPage(p=> Math.max(1, p-1))} disabled={page<=1}>Prev</button>
        <span className="badge">Page {page} / {totalPages}</span>
        <button className="btn btn-ghost" onClick={()=> setPage(p=> Math.min(totalPages, p+1))}>Next</button>
      </div>

      {diff && (
        <div className="card" style={{marginTop:12, background:"#fbfbfd"}}>
          <div className="badge">Comparison</div>
          <div style={{marginTop:6}}>Score change: <strong>{diff.score >= 0 ? `+${diff.score}` : diff.score}</strong></div>
          <div>Traffic change: <strong>{diff.traffic}</strong></div>
        </div>
      )}
    </div>
  );
}
