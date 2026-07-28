"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DailyMissions } from "@/components/dashboard/daily-missions";
import { EmployabilityMap } from "@/components/dashboard/employability-map";
import { MarketRadar } from "@/components/dashboard/market-radar";
import { AISuggestions } from "@/components/dashboard/ai-suggestions";
import { EmptyJobsState } from "@/components/dashboard/empty-states";
import { EmployabilityCrudSection } from "@/components/dashboard/modules/employability-crud-page";
import { useDashboardShell } from "@/lib/dashboard/hooks";

function EmployabilityContent() {
  const searchParams = useSearchParams();
  const skill = searchParams.get("skill") ?? undefined;
  const { shell, data } = useDashboardShell();
  const employability = data?.employability ?? shell.employability;
  const overview = data?.employabilityOverview ?? shell.employabilityOverview;
  const market = data?.market ?? shell.market;
  const suggestions = data?.suggestions ?? shell.suggestions;

  if (employability.length === 0) {
    return <EmptyJobsState />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Mapa de Empregabilidade
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Painel visual das competências que mais abrem portas nas vagas alinhadas
          ao seu objetivo. A IA estima o ganho de compatibilidade de cada
          investimento de aprendizado.
        </p>
      </div>

      {overview.missions.length > 0 && <DailyMissions overview={overview} />}

      <EmployabilityMap
        skills={employability}
        initialSkillId={skill ?? undefined}
      />

      {(market.length > 0 || suggestions.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-5">
          {market.length > 0 && (
            <MarketRadar trends={market} className="lg:col-span-3" />
          )}
          {suggestions.length > 0 && (
            <AISuggestions
              suggestions={suggestions}
              stacked
              className="lg:col-span-2"
            />
          )}
        </div>
      )}

      <EmployabilityCrudSection advancedOnly />
    </div>
  );
}

export function EmployabilityPage() {
  const { shell, isLoading } = useDashboardShell();

  return (
    <DashboardLayout
      user={shell.user}
      notifications={shell.notifications}
      unreadNotifications={shell.unreadNotifications}
      unreadMessages={shell.unreadMessages}
    >
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-2xl bg-muted/40" />
        }
      >
        {!isLoading && <EmployabilityContent />}
      </Suspense>
    </DashboardLayout>
  );
}
