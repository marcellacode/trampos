import type { JobRecommendation } from "@/types/jobs";
import { isAdzunaConfigured } from "@/lib/integrations/adzuna/env";
import { searchAdzunaJobs } from "@/lib/integrations/adzuna/client";
import { mapAdzunaJobsToRecommendations } from "@/lib/integrations/adzuna/mapper";
import { searchRemotiveJobs } from "@/lib/integrations/jobs/providers/remotive/client";
import { mapRemotiveJobsToRecommendations } from "@/lib/integrations/jobs/providers/remotive/mapper";
import { searchArbeitnowJobs } from "@/lib/integrations/jobs/providers/arbeitnow/client";
import { mapArbeitnowJobsToRecommendations } from "@/lib/integrations/jobs/providers/arbeitnow/mapper";
import { searchRemoteOkJobs } from "@/lib/integrations/jobs/providers/remoteok/client";
import { mapRemoteOkJobsToRecommendations } from "@/lib/integrations/jobs/providers/remoteok/mapper";
import { searchJobicyJobs } from "@/lib/integrations/jobs/providers/jobicy/client";
import { mapJobicyJobsToRecommendations } from "@/lib/integrations/jobs/providers/jobicy/mapper";

export interface ExternalJobsSearchOptions {
  what?: string;
  where?: string;
  page?: number;
  /** Max jobs per external provider */
  perProvider?: number;
}

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function jobDedupKey(job: JobRecommendation): string {
  return `${normalizeKey(job.company)}::${normalizeKey(job.role)}`;
}

export function mergeExternalJobLists(
  lists: JobRecommendation[][]
): JobRecommendation[] {
  const seen = new Set<string>();
  const merged: JobRecommendation[] = [];

  for (const list of lists) {
    for (const job of list) {
      const key = jobDedupKey(job);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(job);
    }
  }

  return merged;
}

async function fetchAdzunaJobs(
  options: ExternalJobsSearchOptions,
  defaults: { what?: string; where?: string }
): Promise<JobRecommendation[]> {
  if (!isAdzunaConfigured()) return [];

  try {
    const what = options.what?.trim() || defaults.what || "desenvolvedor";
    const where = options.where?.trim() || defaults.where || "Brasil";
    const response = await searchAdzunaJobs({
      what,
      where,
      page: options.page ?? 1,
      resultsPerPage: options.perProvider ?? 8,
    });

    return mapAdzunaJobsToRecommendations(response.results ?? []);
  } catch (error) {
    console.error("[discovery] Adzuna fetch failed:", error);
    return [];
  }
}

async function fetchRemotiveJobs(
  options: ExternalJobsSearchOptions
): Promise<JobRecommendation[]> {
  try {
    const jobs = await searchRemotiveJobs({
      search: options.what?.trim(),
      limit: options.perProvider ?? 15,
    });
    return mapRemotiveJobsToRecommendations(jobs);
  } catch (error) {
    console.error("[discovery] Remotive fetch failed:", error);
    return [];
  }
}

async function fetchArbeitnowJobs(
  options: ExternalJobsSearchOptions
): Promise<JobRecommendation[]> {
  try {
    const jobs = await searchArbeitnowJobs({
      search: options.what?.trim(),
      limit: options.perProvider ?? 15,
    });
    return mapArbeitnowJobsToRecommendations(jobs);
  } catch (error) {
    console.error("[discovery] Arbeitnow fetch failed:", error);
    return [];
  }
}

async function fetchRemoteOkJobs(
  options: ExternalJobsSearchOptions
): Promise<JobRecommendation[]> {
  try {
    const jobs = await searchRemoteOkJobs({
      search: options.what?.trim(),
      limit: options.perProvider ?? 15,
    });
    return mapRemoteOkJobsToRecommendations(jobs);
  } catch (error) {
    console.error("[discovery] RemoteOK fetch failed:", error);
    return [];
  }
}

async function fetchJobicyJobs(
  options: ExternalJobsSearchOptions
): Promise<JobRecommendation[]> {
  try {
    const jobs = await searchJobicyJobs({
      search: options.what?.trim(),
      count: options.perProvider ?? 15,
    });
    return mapJobicyJobsToRecommendations(jobs);
  } catch (error) {
    console.error("[discovery] Jobicy fetch failed:", error);
    return [];
  }
}

export async function fetchAllExternalJobs(
  options: ExternalJobsSearchOptions = {},
  defaults: { what?: string; where?: string } = {}
): Promise<JobRecommendation[]> {
  const lists = await Promise.all([
    fetchAdzunaJobs(options, defaults),
    fetchRemotiveJobs(options),
    fetchArbeitnowJobs(options),
    fetchRemoteOkJobs(options),
    fetchJobicyJobs(options),
  ]);

  return mergeExternalJobLists(lists);
}
