"use server";

import type { ActionResult } from "@/app/actions/ai";
import { AuthError, getOptionalAuth } from "@/lib/auth/require-auth";
import { mapExternalJobToDetail } from "@/lib/integrations/jobs/shared-mapper";
import { fetchExternalJobRecommendation } from "@/lib/integrations/jobs/resolve-external-job";
import { upsertExternalJobFromRecommendation } from "@/lib/external-jobs/upsert-external-job";
import {
  applyMatchToJob,
  loadUserMatchesForJobs,
  upsertUserJobMatch,
} from "@/lib/matching/sync-user-matches";
import {
  computeJobMatch,
  loadProfileGoals,
  loadUserProfile,
} from "@/lib/matching/compute-compatibility";
import { parseExternalJobRef } from "@/lib/jobs/source-utils";
import type { JobDetail } from "@/types/jobs";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export async function fetchExternalJobDetailAction(
  id: string
): Promise<ActionResult<JobDetail | null>> {
  try {
    if (!parseExternalJobRef(id)) {
      return { success: false, error: "ID de vaga externa inválido." };
    }

    const recommendation = await fetchExternalJobRecommendation(id);
    if (!recommendation) {
      return { success: true, data: null };
    }

    const { supabase, user } = await getOptionalAuth();
    await upsertExternalJobFromRecommendation(supabase, recommendation);

    let detail = mapExternalJobToDetail(recommendation);

    if (user) {
      const matchMap = await loadUserMatchesForJobs(supabase, user.id, [id]);
      let match = matchMap.get(id);

      if (!match) {
        const [profile, goals] = await Promise.all([
          loadUserProfile(supabase, user.id),
          loadProfileGoals(supabase, user.id),
        ]);
        const computed = await computeJobMatch(recommendation, profile, goals);
        match = await upsertUserJobMatch(supabase, user.id, recommendation, computed);
      }

      detail = applyMatchToJob(detail, match) as JobDetail;
    }

    return { success: true, data: detail };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
