"use client";
import React from "react";

// Lightweight SVG sparkline to visualize trends (e.g., weight).
export default function Sparkline({ values, width=180, height=40 }: { values: number[]; width?: number; height?: number }) {
  if (!values?.length) return <div style={{height}} />;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const norm = (v:number)=> (max===min ? height/2 : (height - (v - min) / (max - min) * height));
  const points = values.map((v,i)=> `${(i/(values.length-1))*width},${norm(v)}`).join(" ");
  return (
    <svg width={width} height={height}>
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
}
