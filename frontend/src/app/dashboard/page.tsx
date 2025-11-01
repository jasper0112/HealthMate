"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">Please select a module to start</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ModuleCard title="Health Data Recording" desc="Weight, height, blood pressure, heart rate, sleep, exercise, and more">
          <Link className="underline" href="/record">Enter HealthData Module</Link>
        </ModuleCard>
        <ModuleCard title="AI Health Assessment" desc="Automatically generate summaries, risk levels, and recommendations">
          <Link className="underline" href="/assessment">Enter Health Assessment Module</Link>
        </ModuleCard>
        <ModuleCard title="AI Health Plan" desc="Generate personalized daily/weekly/monthly plans">
          <Link className="underline" href="/health-plans">Enter HealthPlan Module</Link>
        </ModuleCard>
        <ModuleCard title="AI Diet Guidance" desc="AI recipe recommendations, nutrition advice, and precautions">
          <Link className="underline" href="/diet-guidance">Enter Diet Module</Link>
        </ModuleCard>
      </div>
    </div>
  );
}

function ModuleCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-black/10 p-4 bg-white">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-2">{desc}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}


