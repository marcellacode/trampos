"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { JobsRanking } from "@/components/dashboard/jobs-ranking";
import {
  CompanyCarousel,
  ComparisonModal,
  DiscoverySkeleton,
  DiscoveryState,
  DiscoverySummaryBar,
  MarketInsights,
  MiniAIChat,
  OpportunityMap,
  RecommendationCard,
  SalaryRadar,
  SearchHero,
  SmartFilters,
} from "@/components/dashboard/jobs";
import { sortByCompatibility } from "@/lib/jobs/sort";
import { isDiscoveryEmpty } from "@/lib/jobs/empty-data";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import { useDiscovery } from "@/lib/jobs/hooks";
import type { HideReason, SmartFilter } from "@/types/jobs";

export function JobsDiscoveryPage() {
  const { shell } = useDashboardShell();
  const { data, isLoading, isError, refetch } = useDiscovery();
  const [filters, setFilters] = useState<SmartFilter[]>([]);
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [hiddenJobs, setHiddenJobs] = useState<Set<string>>(new Set());
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (data && !filtersInitialized) {
      setFilters(data.filters);
      setFiltersInitialized(true);
    }
  }, [data, filtersInitialized]);

  const visibleJobs = useMemo(() => {
    if (!data) return [];
    return sortByCompatibility(
      data.jobs.filter((j) => !hiddenJobs.has(j.id)),
      (job) => job.company
    );
  }, [data, hiddenJobs]);

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

  function handleHide(jobId: string, _reason: HideReason) {
    setHiddenJobs((prev) => new Set([...prev, jobId]));
    setCompareIds((prev) => prev.filter((id) => id !== jobId));
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

  const chatMessages = data?.chat ?? shell.chat;
  const isEmpty = data ? isDiscoveryEmpty(data) : false;

  return (
    <DashboardLayout
      user={shell.user}
      notifications={shell.notifications}
      unreadNotifications={shell.unreadNotifications}
      unreadMessages={shell.unreadMessages}
      chatMessages={chatMessages}
      chatPanel={({ open, onClose }) => (
        <MiniAIChat
          open={open}
          onClose={onClose}
          messages={chatMessages}
          userName={shell.user.firstName}
          onCompare={
            compareIds.length === 2 ? handleCompareOpen : undefined
          }
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
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Descobrir oportunidades
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[#9CA3AF]">
              Encontramos vagas baseadas no seu perfil, não apenas nas suas
              pesquisas.
            </p>
          </div>
          <DiscoveryState state="empty" />
        </div>
      )}

      {data && !isLoading && !isError && !isEmpty && (
        <div className="space-y-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-lg shrink-0">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Descobrir oportunidades
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-[#9CA3AF]">
                Encontramos vagas baseadas no seu perfil, não apenas nas suas
                pesquisas.
              </p>
            </div>
            <SearchHero
              onSearch={handleSearch}
              className="w-full lg:max-w-xl"
            />
          </div>

          <SmartFilters
            filters={filters}
            onChange={setFilters}
            onAiQuery={handleSearch}
          />

          <DiscoverySummaryBar summary={data.summary} />

          {visibleJobs.length > 0 && (
            <JobsRanking
              jobs={visibleJobs.map((job) => ({
                id: job.id,
                company: job.company,
                compatibility: job.compatibility,
                logo: job.logo,
                color: job.color,
                href: job.href,
              }))}
            />
          )}

          {compareIds.length > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-[#4F7CFF]/30 bg-[#4F7CFF]/8 px-4 py-3">
              <p className="text-sm text-white">
                {compareIds.length === 1
                  ? "Selecione mais uma vaga para comparar"
                  : "2 vagas selecionadas para comparação"}
              </p>
              {compareIds.length === 2 && (
                <button
                  type="button"
                  onClick={handleCompareOpen}
                  className="rounded-lg bg-[#4F7CFF] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#4F7CFF]/90"
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
                className="text-base font-semibold text-white"
              >
                Recomendadas para você
              </h2>
              <p className="mt-0.5 text-sm text-[#9CA3AF]">
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
                }}
              />
            ) : (
              <div className="grid gap-5">
                {visibleJobs.map((job) => (
                  <RecommendationCard
                    key={job.id}
                    job={job}
                    onHide={handleHide}
                    onSave={() => {}}
                    onCompare={handleCompare}
                    selected={compareIds.includes(job.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {data.companies.length > 0 && (
            <CompanyCarousel companies={data.companies} />
          )}

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
