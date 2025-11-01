// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";             // your existing global css
import "../index.css";       // <- add this line to load the new styles
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "HealthMate",
  description: "Health & Lifestyle Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        style={{
          background: "linear-gradient(180deg, #f8fafc 0%, #f9fafb 35%, #ffffff 100%)",
          color: "#111827",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        <TopBar />

        {/* 页面内容容器（上方留出内边距避免被顶部条覆盖） */}
        <div className="fade-up" style={{ maxWidth: 1120, margin: "0 auto", padding: "1.25rem", paddingTop: "1.5rem" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
