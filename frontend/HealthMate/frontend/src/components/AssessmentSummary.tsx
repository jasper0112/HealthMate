"use client";
import React from "react";
import { HealthAssessmentResponse } from "../lib/types";
import "../styles/card.css";

// Printable assessment card with clear emphasis on score/traffic.
export default function AssessmentSummary({ a }: { a: HealthAssessmentResponse | null }) {
  if (!a) return <div className="card"><h3>Latest Report</h3><div className="badge">No report yet.</div></div>;
  return (
    <div className="card" id="printable-report">
      <h3>Latest Report</h3>
      <div className="traffic" style={{marginBottom:12}}>
        <span className={`dot ${a.traffic ?? "yellow"}`} />
        <strong style={{fontSize:18}}>Overall Score: {a.overallScore ?? "-"}</strong>
        <span className="badge">{new Date(a.createdAt).toLocaleString()}</span>
        {a.type && <span className="badge">{a.type}</span>}
      </div>

      {a.highlights?.length ? (
        <div>
          <div className="badge">Highlights</div>
          <ul style={{marginTop:8}}>{a.highlights.map((h,i)=><li key={i}>{h}</li>)}</ul>
        </div>
      ) : null}

      {a.recommendations?.length ? (
        <div style={{marginTop:12}}>
          <div className="badge">Recommendations</div>
          <ul style={{marginTop:8}}>{a.recommendations.map((r,i)=><li key={i}>{r}</li>)}</ul>
        </div>
      ) : null}

      {a.kpis?.length ? (
        <div style={{marginTop:12}}>
          <div className="badge">KPIs</div>
          <ul style={{marginTop:8}}>
            {a.kpis.map((k,i)=>(
              <li key={i} className="traffic">
                <span className={`dot ${k.traffic}`} /> {k.name}: <strong style={{marginLeft:4}}>{k.value}</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
