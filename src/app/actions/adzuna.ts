"use server";

import { z } from "zod";
import type { ActionResult } from "@/app/actions/ai";
import { AuthError } from "@/lib/auth/require-auth";
import { getOptionalAuth } from "@/lib/auth/require-auth";
import {
  fetchDiscoveryWithExternalJobs,
  type DiscoverySearchOptions,
} from "@/lib/discovery/fetch-discovery";
import { AdzunaApiError, getAdzunaJobById, searchAdzunaJobs } from "@/lib/integrations/adzuna/client";
import {
  mapAdzunaJobToDetail,
  mapAdzunaJobsToRecommendations,
  parseAdzunaJobId,
} from "@/lib/integrations/adzuna/mapper";
import type { DiscoveryData, JobDetail } from "@/types/jobs";

const searchSchema = z.object({
  what: z.string().max(200).optional(),
  where: z.string().max(200).optional(),
  page: z.number().int().min(1).max(50).optional(),
});

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof AdzunaApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export async function fetchDiscoveryAction(
  options: DiscoverySearchOptions = {}
): Promise<ActionResult<DiscoveryData>> {
  try {
    const { supabase, user } = await getOptionalAuth();
    const data = await fetchDiscoveryWithExternalJobs(
      supabase,
      user?.id ?? null,
      options
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function searchAdzunaJobsAction(
  input: z.infer<typeof searchSchema>
): Promise<ActionResult<DiscoveryData["jobs"]>> {
  try {
    const params = searchSchema.parse(input);
    const { supabase, user } = await getOptionalAuth();

    let what = params.what;
    let where = params.where;

    if (user && (!what || !where)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("goal_role, goal_location")
        .eq("id", user.id)
        .maybeSingle();

      what = what || profile?.goal_role || undefined;
      where = where || profile?.goal_location || undefined;
    }

    const response = await searchAdzunaJobs({
      what: what || "desenvolvedor",
      where: where || "Brasil",
      page: params.page ?? 1,
      resultsPerPage: 20,
    });

    return {
      success: true,
      data: mapAdzunaJobsToRecommendations(response.results ?? []),
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function fetchAdzunaJobDetailAction(
  id: string
): Promise<ActionResult<JobDetail | null>> {
  try {
    const adzunaId = parseAdzunaJobId(id);
    if (!adzunaId) {
      return { success: false, error: "ID de vaga Adzuna inválido." };
    }

    const job = await getAdzunaJobById(adzunaId);
    if (!job) {
      return { success: true, data: null };
    }

    return { success: true, data: mapAdzunaJobToDetail(job) };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
