// src/components/Breadcrumb.tsx
"use client"; // Force this component to be client-side
import Link from "next/link";

type Crumb = { label: string; href?: string; current?: boolean };

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="hm-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} style={{ display: "inline-flex", alignItems: "center" }}>
            {item.href && !item.current ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span className={item.current ? "current" : undefined}>{item.label}</span>
            )}
            {!isLast && <span className="sep" style={{ margin: "0 .25rem" }}>/</span>}
          </span>
        );
      })}
    </nav>
  );
}
