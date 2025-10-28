"use client";

import Breadcrumb from "@/components/Breadcrumb";
import ProfileForm from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <main>
      <Breadcrumb items={[{ label: "Profile", current: true }]} />
      <h1 className="hm-section-title" style={{ textAlign: "center" }}>Profile</h1>

      <div className="hm-card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <ProfileForm />
      </div>
    </main>
  );
}


