import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen w-full" style={{ background: "#f3f4f6" }}>
      {/* Simple Hero with only Login / Register */}
      <section style={{ padding: "88px 24px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
          <Image className="dark:invert" src="/next.svg" alt="Logo" width={140} height={36} />
          <h1 style={{ fontSize: 42, lineHeight: 1.1, fontWeight: 800, letterSpacing: -0.5, marginTop: 16 }}>Welcome to HealthMate</h1>
          <p style={{ fontSize: 16, color: "#4b5563", marginTop: 8 }}>Manage your health data and get personalized insights.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            <a href="/login" className="btn btn-solid" style={{ padding: "10px 16px" }}>Login</a>
            <a href="/register" className="btn" style={{ padding: "10px 16px", border: "1px solid #d1d5db" }}>Register</a>
          </div>
        </div>
      </section>
    </div>
  );
}
