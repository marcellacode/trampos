"use server";

import { z } from "zod";
import type { ActionResult } from "@/app/actions/ai";
import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import { fetchDiscoveryWithExternalJobs } from "@/lib/discovery/fetch-discovery";
import { checkMatchSyncRateLimit } from "@/lib/matching/match-rate-limit";
import {
  computeJobMatch,
  loadProfileGoals,
  loadUserProfile,
} from "@/lib/matching/compute-compatibility";
import {
  syncUserMatches,
  upsertUserJobMatch,
  updateDiscoverySummary,
} from "@/lib/matching/sync-user-matches";
import type { ComputedMatch } from "@/lib/matching/types";
import { fetchDiscoveryData } from "@/lib/supabase/queries/discovery";
import { fetchJobById } from "@/lib/supabase/queries/jobs";
import { parseAdzunaJobId } from "@/lib/integrations/adzuna/mapper";
import { getAdzunaJobById } from "@/lib/integrations/adzuna/client";
import { mapAdzunaJobToRecommendation } from "@/lib/integrations/adzuna/mapper";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

const jobRefSchema = z.string().min(1).max(200);

export async function syncUserMatchesAction(
  limit = 24
): Promise<ActionResult<{ synced: number }>> {
  try {
    const { supabase, user } = await requireAuth();
    const discovery = await fetchDiscoveryWithExternalJobs(supabase, user.id, {
      skipBackgroundSync: true,
    });
    const synced = await syncUserMatches(supabase, user.id, discovery.jobs, limit, {
      skipRateLimit: true,
    });
    return { success: true, data: { synced } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function scheduleMatchResyncAction(): Promise<
  ActionResult<{ synced: number; skipped: boolean }>
> {
  try {
    const { supabase, user } = await requireAuth();
    const rate = checkMatchSyncRateLimit(user.id);
    if (!rate.allowed) {
      return { success: true, data: { synced: 0, skipped: true } };
    }

    const discovery = await fetchDiscoveryWithExternalJobs(supabase, user.id, {
      skipBackgroundSync: true,
    });
    const synced = await syncUserMatches(supabase, user.id, discovery.jobs, 24, {
      skipRateLimit: true,
    });
    return { success: true, data: { synced, skipped: false } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function computeJobMatchAction(
  jobRef: string
): Promise<ActionResult<ComputedMatch>> {
  try {
    const ref = jobRefSchema.parse(jobRef);
    const { supabase, user } = await requireAuth();

    const [profile, goals] = await Promise.all([
      loadUserProfile(supabase, user.id),
      loadProfileGoals(supabase, user.id),
    ]);

    let job;
    const adzunaId = parseAdzunaJobId(ref);
    if (adzunaId) {
      const adzunaJob = await getAdzunaJobById(adzunaId);
      if (!adzunaJob) {
        return { success: false, error: "Vaga não encontrada." };
      }
      job = mapAdzunaJobToRecommendation(adzunaJob);
    } else {
      const detail = await fetchJobById(supabase, ref, user.id);
      if (!detail) {
        return { success: false, error: "Vaga não encontrada." };
      }
      job = detail;
    }

    const match = await computeJobMatch(job, profile, goals);
    await upsertUserJobMatch(supabase, user.id, job, match);
    await updateDiscoverySummary(supabase, user.id);

    return { success: true, data: match };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function refreshDiscoverySummaryAction(): Promise<
  ActionResult<{ analyzed: number }>
> {
  try {
    const { supabase, user } = await requireAuth();
    await updateDiscoverySummary(supabase, user.id);
    const discovery = await fetchDiscoveryData(supabase, user.id);
    return {
      success: true,
      data: { analyzed: discovery.summary.analyzed },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
