"use client";

import { Timeline } from "@/components/dashboard/timeline";
import { KPIGrid } from "@/components/dashboard/kpi-grid";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { GoalCard } from "@/components/dashboard/goal-card";
import { CompaniesCard } from "@/components/dashboard/companies-card";
import { EmployabilityMap } from "@/components/dashboard/employability-map";
import { AISuggestions } from "@/components/dashboard/ai-suggestions";
import { LoadingSkeletons } from "@/components/dashboard/loading-skeletons";
import {
  EmptyInterviewsState,
  EmptyJobsState,
  EmptyMessagesState,
  EmptyTimelineState,
  NewUserState,
} from "@/components/dashboard/empty-states";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import { isDashboardEmpty } from "@/lib/dashboard/empty-data";
import type { DashboardViewState } from "@/types/dashboard";
import Link from "next/link";

interface DashboardPageProps {
  viewState?: DashboardViewState;
}

export function DashboardPage({ viewState = "default" }: DashboardPageProps) {
  const { shell, data, isLoading, isError } = useDashboardShell();
  const isEmpty = data ? isDashboardEmpty(data) : true;

  if (isLoading || viewState === "loading") {
    return (
      <DashboardLayout
        user={shell.user}
        notifications={[]}
        unreadNotifications={0}
        unreadMessages={0}
      >
        <LoadingSkeletons />
      </DashboardLayout>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar o dashboard. Tente novamente.
        </p>
      </div>
    );
  }

  if (viewState === "new-user" || isEmpty) {
    return (
      <DashboardLayout
        user={data.user}
        notifications={[]}
        unreadNotifications={0}
        unreadMessages={0}
      >
        <NewUserState firstName={data.user.firstName} />
      </DashboardLayout>
    );
  }

  const matchedJobs = data.jobs.filter((j) => j.hasMatch);

  return (
    <DashboardLayout
      user={data.user}
      notifications={data.notifications}
      unreadNotifications={data.unreadNotifications}
      unreadMessages={data.unreadMessages}
    >
      <div className="space-y-8">
        {data.timeline.length > 0 ? (
          <Timeline items={data.timeline} />
        ) : (
          <EmptyTimelineState />
        )}

        {data.kpis.length > 0 && <KPIGrid metrics={data.kpis} />}

        {data.recommendation.title && (
          <RecommendationCard recommendation={data.recommendation} />
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <GoalCard goal={data.goal} />
          {data.companies.length > 0 ? (
            <CompaniesCard companies={data.companies} />
          ) : (
            <EmptyMessagesState />
          )}
        </div>

        {matchedJobs.length > 0 ? (
          <section aria-labelledby="matched-jobs-heading">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2
                  id="matched-jobs-heading"
                  className="text-base font-bold text-foreground"
                >
                  Vagas com match
                </h2>
                <p className="text-sm text-muted-foreground">
                  Com base no seu perfil
                </p>
              </div>
              <Link
                href="/dashboard/vagas"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Buscar mais vagas
              </Link>
            </div>
            <ul className="divide-y divide-border rounded-lg border border-border bg-card" role="list">
              {matchedJobs.slice(0, 5).map((job) => (
                <li key={job.id}>
                  <Link
                    href={job.href}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-primary">{job.role}</p>
                      <p className="truncate text-sm text-muted-foreground">{job.company}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-success">
                      {job.compatibility}%
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <EmptyJobsState />
        )}

        {data.employability.length > 0 && (
          <EmployabilityMap skills={data.employability} compact />
        )}

        {data.suggestions.length > 0 && (
          <AISuggestions suggestions={data.suggestions} stacked />
        )}

        {viewState === "empty-interviews" && <EmptyInterviewsState />}
      </div>
    </DashboardLayout>
  );
}
