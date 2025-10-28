// src/components/Breadcrumb.tsx
"use client"; // Force this component to be client-side
import Link from "next/link";

type Crumb = { label: string; href?: string; current?: boolean };

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  // Normalize: Always use Dashboard as the root instead of Home
  const rest = items.filter(i => !(i.label === "Home" || i.href === "/"));
  const normalized: Crumb[] = [{ label: "Dashboard", href: "/dashboard" }, ...rest];
  // Mark last as current; if only root, make it current
  if (normalized.length === 1) {
    normalized[0] = { label: "Dashboard", current: true };
  } else {
    normalized.forEach((c, idx) => (c.current = idx === normalized.length - 1));
  }

  return (
    <nav className="hm-breadcrumb" aria-label="Breadcrumb">
      {normalized.map((item, idx) => {
        const isLast = idx === normalized.length - 1;
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
