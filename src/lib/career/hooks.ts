"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import { deriveCareerContext } from "@/lib/career/derive-context";
import { invalidateCareerQueries } from "@/lib/career/invalidate";
import { careerKeys } from "@/lib/career/query-keys";
import { useJobApplications } from "@/lib/crud/hooks";
import { useFollowingList } from "@/lib/follows/hooks";
import { useExperiences, useSkills, useEducation } from "@/lib/crud/hooks";
import type { CareerContext } from "@/types/career-context";

export function useCareerContext(): {
  context: CareerContext | null;
  isLoading: boolean;
  invalidate: () => void;
} {
  const { data: dashboard, isLoading: dashboardLoading } = useDashboardShell();
  const applicationsQuery = useJobApplications();
  const followingQuery = useFollowingList();
  const experiencesQuery = useExperiences();
  const skillsQuery = useSkills();
  const educationQuery = useEducation();
  const queryClient = useQueryClient();

  const isLoading =
    dashboardLoading ||
    applicationsQuery.isLoading ||
    followingQuery.isLoading;

  const context = useMemo(() => {
    if (!dashboard) return null;

    return deriveCareerContext({
      dashboard,
      applications: applicationsQuery.data,
      following: followingQuery.data,
      experiencesCount: experiencesQuery.data?.length ?? 0,
      skillsCount: skillsQuery.data?.length ?? 0,
      educationCount: educationQuery.data?.length ?? 0,
    });
  }, [
    dashboard,
    applicationsQuery.data,
    followingQuery.data,
    experiencesQuery.data?.length,
    skillsQuery.data?.length,
    educationQuery.data?.length,
  ]);

  return {
    context,
    isLoading,
    invalidate: () => invalidateCareerQueries(queryClient),
  };
}

export function useCareerNavBadges() {
  const { context, isLoading } = useCareerContext();
  return {
    badges: context?.navBadges ?? {
      vagas: 0,
      agenda: 0,
      mensagens: 0,
      curriculo: 0,
    },
    isLoading,
  };
}

export function useCachedCareerContext() {
  return useQuery({
    queryKey: careerKeys.context(),
    queryFn: async () => null as CareerContext | null,
    enabled: false,
    initialData: null,
  });
}
