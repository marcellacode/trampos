"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DailyMissions } from "@/components/dashboard/daily-missions";
import { EmployabilityMap } from "@/components/dashboard/employability-map";
import { MarketRadar } from "@/components/dashboard/market-radar";
import { AISuggestions } from "@/components/dashboard/ai-suggestions";
import { MOCK_DASHBOARD } from "@/lib/dashboard/constants";

function EmployabilityContent() {
  const searchParams = useSearchParams();
  const skill = searchParams.get("skill") ?? undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Mapa de Empregabilidade
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-[#9CA3AF]">
          Painel visual das competências que mais abrem portas nas vagas alinhadas
          ao seu objetivo. A IA estima o ganho de compatibilidade de cada
          investimento de aprendizado.
        </p>
      </div>

      <DailyMissions overview={MOCK_DASHBOARD.employabilityOverview} />

      <EmployabilityMap
        skills={MOCK_DASHBOARD.employability}
        initialSkillId={skill ?? undefined}
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <MarketRadar trends={MOCK_DASHBOARD.market} className="lg:col-span-3" />
        <AISuggestions
          suggestions={MOCK_DASHBOARD.suggestions}
          stacked
          className="lg:col-span-2"
        />
      </div>
    </div>
  );
}

export function EmployabilityPage() {
  return (
    <DashboardLayout
      user={MOCK_DASHBOARD.user}
      notifications={MOCK_DASHBOARD.notifications}
      unreadNotifications={MOCK_DASHBOARD.unreadNotifications}
      unreadMessages={MOCK_DASHBOARD.unreadMessages}
      chatMessages={MOCK_DASHBOARD.chat}
    >
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-2xl bg-white/[0.03]" />
        }
      >
        <EmployabilityContent />
      </Suspense>
    </DashboardLayout>
  );
}
