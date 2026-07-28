"use server";

import { requireAuth, AuthError } from "@/lib/auth/require-auth";
import {
  filterJobsForProfile,
  toChatJob,
  type ProfileGoals,
} from "@/lib/jobe/filter-jobs";
import { applyToJob } from "@/lib/supabase/queries/mutations/applications";
import { hideJob, listHiddenJobs } from "@/lib/supabase/queries/mutations/settings";
import { fetchJobsForUser } from "@/lib/supabase/queries/jobs";
import { isAdzunaConfigured } from "@/lib/integrations/adzuna/env";
import { searchAdzunaJobs } from "@/lib/integrations/adzuna/client";
import { mapAdzunaJobsToRecommendations } from "@/lib/integrations/adzuna/mapper";
import type { JobRecommendation } from "@/types/jobs";
import type { ActionResult } from "@/app/actions/ai";
import type { ApplicationSummary, ChatJob } from "@/types/jobe-chat";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

async function loadProfileGoals(
  supabase: Awaited<ReturnType<typeof requireAuth>>["supabase"],
  userId: string
): Promise<ProfileGoals> {
  const { data } = await supabase
    .from("profiles")
    .select("goal_role, goal_location, goal_salary, seniority")
    .eq("id", userId)
    .maybeSingle();

  return {
    role: data?.goal_role || undefined,
    location: data?.goal_location || undefined,
    salary: data?.goal_salary || undefined,
    seniority: data?.seniority || undefined,
  };
}

async function loadExcludedJobIds(
  supabase: Awaited<ReturnType<typeof requireAuth>>["supabase"],
  userId: string,
  clientExcluded: string[]
): Promise<Set<string>> {
  const excluded = new Set(clientExcluded);

  const [hiddenJobs, applicationsResult] = await Promise.all([
    listHiddenJobs(supabase, userId),
    supabase
      .from("job_applications")
      .select("job_id")
      .eq("user_id", userId)
      .not("job_id", "is", null),
  ]);

  for (const row of hiddenJobs) excluded.add(row.job_id);
  for (const row of applicationsResult.data ?? []) {
    if (row.job_id) excluded.add(row.job_id);
  }

  return excluded;
}

async function loadJobsWithAdzuna(
  supabase: Awaited<ReturnType<typeof requireAuth>>["supabase"],
  userId: string,
  goals: ProfileGoals,
  limit = 40
): Promise<JobRecommendation[]> {
  const [supabaseJobs, adzunaJobs] = await Promise.all([
    fetchJobsForUser(supabase, userId, limit),
    isAdzunaConfigured()
      ? searchAdzunaJobs({
          what: goals.role || "desenvolvedor",
          where: goals.location || "Brasil",
          resultsPerPage: 20,
        }).then((res) => mapAdzunaJobsToRecommendations(res.results ?? []))
      : Promise.resolve([]),
  ]);

  const seen = new Set(
    supabaseJobs.map((j) => `${j.company.toLowerCase()}::${j.role.toLowerCase()}`)
  );
  const merged = [...supabaseJobs];
  for (const job of adzunaJobs) {
    const key = `${job.company.toLowerCase()}::${job.role.toLowerCase()}`;
    if (!seen.has(key)) merged.push(job);
  }
  return merged;
}

export async function fetchNewJobsForChatAction(
  shownJobIds: string[] = []
): Promise<ActionResult<ChatJob[]>> {
  try {
    const { supabase, user } = await requireAuth();
    const goals = await loadProfileGoals(supabase, user.id);
    const [jobs, excluded] = await Promise.all([
      loadJobsWithAdzuna(supabase, user.id, goals, 40),
      loadExcludedJobIds(supabase, user.id, shownJobIds),
    ]);

    const filtered = filterJobsForProfile(jobs, goals, excluded).slice(0, 8);
    return { success: true, data: filtered.map(toChatJob) };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function bulkApplyJobsAction(
  jobs: { jobId: string; companyId: string; roleTitle: string }[]
): Promise<ActionResult<{ count: number }>> {
  try {
    if (jobs.length === 0) {
      return { success: false, error: "Nenhuma vaga selecionada." };
    }

    const { supabase, user } = await requireAuth();

    await Promise.all(
      jobs.map((job) =>
        applyToJob(supabase, user.id, {
          jobId: job.jobId,
          companyId: job.companyId,
          roleTitle: job.roleTitle,
        })
      )
    );

    return { success: true, data: { count: jobs.length } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function bulkDismissJobsAction(
  jobIds: string[]
): Promise<ActionResult<{ count: number }>> {
  try {
    if (jobIds.length === 0) {
      return { success: false, error: "Nenhuma vaga para dispensar." };
    }

    const { supabase, user } = await requireAuth();

    await Promise.all(
      jobIds.map((jobId) => hideJob(supabase, user.id, jobId, "other"))
    );

    return { success: true, data: { count: jobIds.length } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function fetchApplicationsSummaryAction(): Promise<
  ActionResult<ApplicationSummary[]>
> {
  try {
    const { supabase, user } = await requireAuth();

    const { data, error } = await supabase
      .from("job_applications")
      .select(
        `
        id,
        role_title,
        status_label,
        applied_at,
        companies (name)
      `
      )
      .eq("user_id", user.id)
      .order("last_activity_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    const summaries: ApplicationSummary[] = (data ?? []).map((row) => {
      const company = row.companies as { name: string } | { name: string }[] | null;
      const companyName = Array.isArray(company)
        ? company[0]?.name ?? "Empresa"
        : company?.name ?? "Empresa";

      return {
        id: row.id,
        roleTitle: row.role_title,
        companyName,
        statusLabel: row.status_label,
        appliedAt: row.applied_at,
      };
    });

    return { success: true, data: summaries };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function searchJobsForChatAction(
  query: string
): Promise<ActionResult<ChatJob[]>> {
  try {
    const { supabase, user } = await requireAuth();
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return { success: false, error: "Digite o que você procura." };
    }

    const goals = await loadProfileGoals(supabase, user.id);
    const [baseJobs, adzunaJobs, excluded] = await Promise.all([
      fetchJobsForUser(supabase, user.id, 40),
      isAdzunaConfigured()
        ? searchAdzunaJobs({
            what: query.trim(),
            where: goals.location || "Brasil",
            resultsPerPage: 20,
          }).then((res) => mapAdzunaJobsToRecommendations(res.results ?? []))
        : Promise.resolve([]),
      loadExcludedJobIds(supabase, user.id, []),
    ]);

    const seen = new Set(
      baseJobs.map((j) => `${j.company.toLowerCase()}::${j.role.toLowerCase()}`)
    );
    const jobs = [...baseJobs];
    for (const job of adzunaJobs) {
      const key = `${job.company.toLowerCase()}::${job.role.toLowerCase()}`;
      if (!seen.has(key)) jobs.push(job);
    }

    const filtered = jobs
      .filter((job) => !excluded.has(job.id))
      .filter((job) => {
        const haystack = [
          job.role,
          job.company,
          job.location,
          job.aiSummary,
          job.description ?? "",
          ...job.stack,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalized);
      })
      .slice(0, 8);

    return { success: true, data: filtered.map(toChatJob) };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
