"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { JobeChat } from "@/components/dashboard/jobe-chat";
import {
  ComparisonModal,
  DiscoverySkeleton,
  DiscoveryState,
  DiscoverySummaryBar,
  MarketInsights,
  OpportunityMap,
  RecommendationCard,
  SalaryRadar,
  SearchHero,
  SmartFilters,
} from "@/components/dashboard/jobs";
import { sortByCompatibility } from "@/lib/jobs/sort";
import {
  buildRankContext,
  rankJobsWithContext,
} from "@/lib/jobs/rank-with-context";
import { useCareerContext } from "@/lib/career/hooks";
import { isPlatformApply } from "@/lib/jobs/source-utils";
import { isDiscoveryEmpty } from "@/lib/jobs/empty-data";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import { useDiscovery } from "@/lib/jobs/hooks";
import type { HideReason, SmartFilter } from "@/types/jobs";
import {
  hideJobByRefAction,
  interpretSmartFilterAction,
  listHiddenJobRefsAction,
  listSavedJobRefsAction,
  saveJobAction,
  unsaveJobAction,
} from "@/app/actions/discovery";

export function JobsDiscoveryPage() {
  const { shell } = useDashboardShell();
  const { context } = useCareerContext();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isError, refetch } = useDiscovery(searchQuery);
  const [filters, setFilters] = useState<SmartFilter[]>([]);
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [hiddenJobs, setHiddenJobs] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [aiFilterQuery, setAiFilterQuery] = useState("");
  const [platformOnly, setPlatformOnly] = useState(false);

  useEffect(() => {
    if (data && !filtersInitialized) {
      setFilters(data.filters);
      setFiltersInitialized(true);
    }
  }, [data, filtersInitialized]);

  useEffect(() => {
    void listHiddenJobRefsAction().then((result) => {
      if (result.success) setHiddenJobs(new Set(result.data));
    });
    void listSavedJobRefsAction().then((result) => {
      if (result.success) setSavedJobs(new Set(result.data));
    });
  }, []);

  const visibleJobs = useMemo(() => {
    if (!data) return [];
    let jobs = data.jobs.filter((j) => !hiddenJobs.has(j.id));

    const activeFilterLabels = filters.map((f) => f.label.toLowerCase()).filter(Boolean);

    if (activeFilterLabels.length > 0) {
      jobs = jobs.filter((job) => {
        const haystack = [job.role, job.company, job.location, ...job.stack, job.aiSummary]
          .join(" ")
          .toLowerCase();
        return activeFilterLabels.every((label) => haystack.includes(label));
      });
    }

    if (aiFilterQuery.trim()) {
      const q = aiFilterQuery.toLowerCase();
      jobs = jobs.filter((job) => {
        const haystack = [job.role, job.company, job.location, ...job.stack, job.aiSummary]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    if (platformOnly) {
      jobs = jobs.filter((job) => isPlatformApply(job));
    }

    if (context) {
      const rankContext = buildRankContext(
        context.followedEntities.companyIds,
        context.followedEntities.companyNames
      );
      return rankJobsWithContext(jobs, rankContext);
    }

    return sortByCompatibility(jobs, (job) => job.company);
  }, [data, hiddenJobs, aiFilterQuery, filters, platformOnly, context]);

  const compareJobs = useMemo(() => {
    if (!data) return [];
    return compareIds
      .map((id) => data.jobs.find((j) => j.id === id))
      .filter(Boolean) as NonNullable<typeof data.jobs>;
  }, [data, compareIds]);

  const handleCompareOpen = useCallback(() => {
    if (compareIds.length === 2) {
      setShowComparison(true);
    }
  }, [compareIds.length]);

  function handleSearch(query: string) {
    setSearchQuery(query);
    const label = query.split(/[.,!?]/)[0]?.trim();
    if (
      label &&
      !filters.some((f) => f.label.toLowerCase() === label.toLowerCase())
    ) {
      setFilters((prev) => [...prev, { id: `search-${Date.now()}`, label }]);
    }
  }

  async function handleHide(jobId: string, reason: HideReason) {
    setHiddenJobs((prev) => new Set([...prev, jobId]));
    setCompareIds((prev) => prev.filter((id) => id !== jobId));
    const job = data?.jobs.find((j) => j.id === jobId);
    await hideJobByRefAction(jobId, reason, job);
  }

  async function handleSave(jobId: string) {
    const isSaved = savedJobs.has(jobId);
    const job = data?.jobs.find((j) => j.id === jobId);
    if (isSaved) {
      setSavedJobs((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      await unsaveJobAction(jobId);
    } else {
      setSavedJobs((prev) => new Set([...prev, jobId]));
      await saveJobAction(jobId, job);
    }
  }

  async function handleAiFilter(query: string) {
    const result = await interpretSmartFilterAction(query);
    if (result.success) {
      setAiFilterQuery(result.data.searchQuery ?? query);
      for (const label of result.data.labels) {
        if (!filters.some((f) => f.label.toLowerCase() === label.toLowerCase())) {
          setFilters((prev) => [...prev, { id: `ai-${Date.now()}-${label}`, label }]);
        }
      }
    } else {
      setAiFilterQuery(query);
    }
  }

  function handleCompare(jobId: string) {
    setCompareIds((prev) => {
      if (prev.includes(jobId)) {
        return prev.filter((id) => id !== jobId);
      }
      if (prev.length >= 2) {
        return [prev[1], jobId];
      }
      return [...prev, jobId];
    });
  }

  const isEmpty = data ? isDiscoveryEmpty(data) : false;

  return (
    <DashboardLayout
      user={shell.user}
      notifications={shell.notifications}
      unreadNotifications={shell.unreadNotifications}
      unreadMessages={shell.unreadMessages}
      chatContext="discovery"
      chatPanel={({ open, onClose }) => (
        <JobeChat
          open={open}
          onClose={onClose}
          userId={shell.user.id}
          userName={shell.user.firstName}
          context="discovery"
          className="xl:fixed xl:inset-y-0 xl:right-0 xl:w-[340px]"
        />
      )}
    >
      {isLoading && <DiscoverySkeleton />}

      {isError && (
        <DiscoveryState state="error" onAction={() => refetch()} />
      )}

      {data && !isLoading && !isError && isEmpty && (
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Descobrir oportunidades
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Encontramos vagas baseadas no seu perfil, não apenas nas suas
              pesquisas.
            </p>
          </div>
          <DiscoveryState
            state="empty"
            onAction={() => refetch()}
          />
        </div>
      )}

      {data && !isLoading && !isError && !isEmpty && (
        <div className="space-y-8">
          <SearchHero onSearch={handleSearch} />
          <DiscoverySummaryBar summary={data.summary} />
          <SmartFilters
            filters={filters}
            onChange={setFilters}
            onAiQuery={(q) => void handleAiFilter(q)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPlatformOnly((value) => !value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                platformOnly
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              Só candidatura na plataforma
            </button>
          </div>
          {compareIds.length > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                {compareIds.length === 1
                  ? "1 vaga selecionada para comparação"
                  : "2 vagas selecionadas para comparação"}
              </p>
              {compareIds.length === 2 && (
                <button
                  type="button"
                  onClick={handleCompareOpen}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Comparar agora
                </button>
              )}
            </div>
          )}

          <section aria-labelledby="recommended-heading">
            <div className="mb-5">
              <h2
                id="recommended-heading"
                className="text-base font-semibold text-foreground"
              >
                Recomendadas para você
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {searchQuery
                  ? `Resultados para "${searchQuery}"`
                  : "Ordenadas por compatibilidade com o seu perfil"}
              </p>
            </div>

            {visibleJobs.length === 0 ? (
              <DiscoveryState
                state="no-results"
                onAction={() => {
                  setFilters(data.filters);
                  setSearchQuery("");
                  setHiddenJobs(new Set());
                  setAiFilterQuery("");
                }}
              />
            ) : (
              <div className="grid gap-5">
                {visibleJobs.map((job) => (
                  <RecommendationCard
                    key={job.id}
                    job={job}
                    onHide={handleHide}
                    onSave={handleSave}
                    saved={savedJobs.has(job.id)}
                    onCompare={handleCompare}
                    selected={compareIds.includes(job.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {(data.regions.length > 0 || data.salaryRadar.length > 0) && (
            <div className="grid gap-5 lg:grid-cols-2">
              {data.regions.length > 0 && (
                <OpportunityMap regions={data.regions} />
              )}
              {data.salaryRadar.length > 0 && (
                <SalaryRadar data={data.salaryRadar} />
              )}
            </div>
          )}

          {data.marketInsights.length > 0 && (
            <MarketInsights insights={data.marketInsights} />
          )}
        </div>
      )}

      <ComparisonModal
        jobs={compareJobs}
        open={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </DashboardLayout>
  );
}
