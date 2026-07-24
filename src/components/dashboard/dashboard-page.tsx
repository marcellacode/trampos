"use client";

import { Timeline } from "@/components/dashboard/timeline";
import { KPIGrid } from "@/components/dashboard/kpi-grid";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { GoalCard } from "@/components/dashboard/goal-card";
import { CompaniesCard } from "@/components/dashboard/companies-card";
import { JobsRanking } from "@/components/dashboard/jobs-ranking";
import { EmployabilityMap } from "@/components/dashboard/employability-map";
import { MarketRadar } from "@/components/dashboard/market-radar";
import { AISuggestions } from "@/components/dashboard/ai-suggestions";
import { LoadingSkeletons } from "@/components/dashboard/loading-skeletons";
import {
  EmptyInterviewsState,
  EmptyJobsState,
  EmptyMessagesState,
  NewUserState,
} from "@/components/dashboard/empty-states";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useDashboard } from "@/lib/dashboard/hooks";
import { MOCK_DASHBOARD } from "@/lib/dashboard/constants";
import type { DashboardViewState } from "@/types/dashboard";

interface DashboardPageProps {
  /** Override for demos / empty states */
  viewState?: DashboardViewState;
}

export function DashboardPage({ viewState = "default" }: DashboardPageProps) {
  const { data, isLoading, isError } = useDashboard();
  const shell = data ?? MOCK_DASHBOARD;

  if (isLoading || viewState === "loading") {
    return (
      <DashboardLayout
        user={shell.user}
        notifications={[]}
        unreadNotifications={0}
        unreadMessages={0}
        chatMessages={shell.chat}
      >
        <LoadingSkeletons />
      </DashboardLayout>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090A] px-4">
        <p className="text-sm text-[#9CA3AF]">
          Não foi possível carregar o dashboard. Tente novamente.
        </p>
      </div>
    );
  }

  if (viewState === "new-user") {
    return (
      <DashboardLayout
        user={data.user}
        notifications={[]}
        unreadNotifications={0}
        unreadMessages={0}
        chatMessages={data.chat}
      >
        <NewUserState firstName={data.user.firstName} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={data.user}
      notifications={data.notifications}
      unreadNotifications={data.unreadNotifications}
      unreadMessages={data.unreadMessages}
      chatMessages={data.chat}
    >
      <div className="space-y-8">
        <Timeline items={data.timeline} />

        <KPIGrid metrics={data.kpis} />

        <RecommendationCard recommendation={data.recommendation} />

        <div className="grid gap-4 lg:grid-cols-2">
          <GoalCard goal={data.goal} />
          {viewState === "empty-messages" ? (
            <EmptyMessagesState />
          ) : (
            <CompaniesCard companies={data.companies} />
          )}
        </div>

        {viewState === "empty-jobs" ? (
          <EmptyJobsState />
        ) : (
          <JobsRanking jobs={data.jobs} />
        )}

        <EmployabilityMap skills={data.employability} compact />

        <div className="grid gap-4 lg:grid-cols-5">
          <MarketRadar trends={data.market} className="lg:col-span-3" />
          <div className="space-y-4 lg:col-span-2">
            {viewState === "empty-interviews" ? (
              <EmptyInterviewsState />
            ) : (
              <AISuggestions suggestions={data.suggestions} stacked />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
