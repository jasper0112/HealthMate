// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";             // your existing global css
import "../index.css";       // <- add this line to load the new styles

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
          background: "#fafbff",
          color: "#111827",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1rem" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
