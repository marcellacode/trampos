import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobRecommendation } from "@/types/jobs";
import { isInternalJobRef } from "@/lib/external-jobs/resolve-job-ref";
import { resolveExternalJobId } from "@/lib/external-jobs/upsert-external-job";
import { enrichJobFromGreenhouseUrl } from "@/lib/integrations/ats/providers/greenhouse/client";
import { checkMatchSyncRateLimit } from "@/lib/matching/match-rate-limit";
import {
  computeJobMatch,
  loadProfileGoals,
  loadUserProfile,
} from "@/lib/matching/compute-compatibility";
import type {
  ComputedMatch,
  SyncUserMatchesOptions,
  UserJobMatchRow,
} from "@/lib/matching/types";

export type { UserJobMatchRow };

async function enrichExternalJobIfNeeded(job: JobRecommendation): Promise<JobRecommendation> {
  const applyUrl = job.externalUrl;
  if (!applyUrl || job.source === "adzuna") return job;

  if (!applyUrl.includes("greenhouse.io")) return job;

  try {
    const enriched = await enrichJobFromGreenhouseUrl(applyUrl);
    if (!enriched) return job;

    return {
      ...job,
      role: enriched.title ?? job.role,
      location: enriched.location ?? job.location,
      description: enriched.description || job.description,
      aiSummary: enriched.description.slice(0, 280) || job.aiSummary,
    };
  } catch {
    return job;
  }
}

export async function upsertUserJobMatch(
  supabase: SupabaseClient,
  userId: string,
  job: JobRecommendation,
  match: ComputedMatch
): Promise<UserJobMatchRow> {
  const isInternal = isInternalJobRef(job.id);
  let externalJobId: string | null = null;

  if (!isInternal) {
    externalJobId = await resolveExternalJobId(supabase, job.id, job);
  }

  const payload = {
    user_id: userId,
    job_id: isInternal ? job.id : null,
    external_job_id: externalJobId,
    compatibility: match.compatibility,
    approval_level: match.approvalLevel,
    approval_stars: match.approvalStars,
    match_reasons: match.reasons,
    ai_summary: match.aiSummary,
    best_send_day_label: match.bestSendDayLabel,
    best_send_time_range: match.bestSendTimeRange,
    computed_at: new Date().toISOString(),
  };

  const conflictColumn = isInternal ? "user_id,job_id" : "user_id,external_job_id";

  const { data, error } = await supabase.from("user_job_matches")
    .upsert(payload, {
      onConflict: conflictColumn,
      ignoreDuplicates: false,
    })
    .select("*")
    .single();

  if (error) {
    const filter = isInternal
      ? { user_id: userId, job_id: job.id }
      : { user_id: userId, external_job_id: externalJobId };

    const { data: existing } = await supabase.from("user_job_matches")
      .select("id")
      .match(filter)
      .maybeSingle();

    if (existing?.id) {
      const { data: updated, error: updateError } = await supabase.from("user_job_matches")
        .update(payload)
        .eq("id", existing.id)
        .select("*")
        .single();
      if (updateError) throw updateError;
      return updated as UserJobMatchRow;
    }

    const { data: inserted, error: insertError } = await supabase.from("user_job_matches")
      .insert(payload)
      .select("*")
      .single();
    if (insertError) throw insertError;
    return inserted as UserJobMatchRow;
  }

  return data as UserJobMatchRow;
}

export async function updateDiscoverySummary(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { data } = await supabase.from("user_job_matches")
    .select("compatibility")
    .eq("user_id", userId);

  const scores = ((data ?? []) as { compatibility: number }[]).map((row) => row.compatibility);
  const analyzed = scores.length;
  const compatible = scores.filter((score) => score >= 60).length;
  const veryCompatible = scores.filter((score) => score >= 80).length;
  const perfect = scores.filter((score) => score >= 95).length;

  await supabase.from("discovery_summaries").upsert(
    {
      user_id: userId,
      analyzed,
      compatible,
      very_compatible: veryCompatible,
      perfect,
      computed_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

export async function syncUserMatches(
  supabase: SupabaseClient,
  userId: string,
  jobs: JobRecommendation[],
  limit = 24,
  options: SyncUserMatchesOptions = {}
): Promise<number> {
  if (!options.skipRateLimit) {
    const rate = checkMatchSyncRateLimit(userId);
    if (!rate.allowed) return 0;
  }

  const [profile, goals] = await Promise.all([
    loadUserProfile(supabase, userId),
    loadProfileGoals(supabase, userId),
  ]);

  const batch = jobs.slice(0, limit);
  let synced = 0;

  for (const rawJob of batch) {
    const job = await enrichExternalJobIfNeeded(rawJob);
    const match = await computeJobMatch(job, profile, goals);
    await upsertUserJobMatch(supabase, userId, job, match);
    synced += 1;
  }

  if (synced > 0) {
    await updateDiscoverySummary(supabase, userId);
  }

  return synced;
}

export async function loadUserMatchesForJobs(
  supabase: SupabaseClient,
  userId: string,
  jobRefs: string[]
): Promise<Map<string, UserJobMatchRow>> {
  const internalIds = jobRefs.filter(isInternalJobRef);
  const externalKeys = jobRefs.filter((ref) => !isInternalJobRef(ref));

  const map = new Map<string, UserJobMatchRow>();

  if (internalIds.length > 0) {
    const { data } = await supabase.from("user_job_matches")
      .select("*")
      .eq("user_id", userId)
      .in("job_id", internalIds);

    for (const row of (data ?? []) as UserJobMatchRow[]) {
      if (row.job_id) map.set(row.job_id, row);
    }
  }

  if (externalKeys.length > 0) {
    const { data: externalJobs } = await supabase.from("external_jobs")
      .select("id, external_key")
      .in("external_key", externalKeys);

    const keyById = new Map<string, string>(
      (externalJobs ?? []).map((ej: Record<string, unknown>) => [
        ej.id as string,
        ej.external_key as string,
      ])
    );
    const externalIds = [...keyById.keys()];

    if (externalIds.length > 0) {
      const { data } = await supabase.from("user_job_matches")
        .select("*")
        .eq("user_id", userId)
        .in("external_job_id", externalIds);

      for (const row of (data ?? []) as UserJobMatchRow[]) {
        const key = row.external_job_id ? keyById.get(row.external_job_id) : null;
        if (key) map.set(key, row);
      }
    }
  }

  return map;
}

export function applyMatchToJob(
  job: JobRecommendation,
  match: UserJobMatchRow | undefined
): JobRecommendation {
  if (!match) return job;

  return {
    ...job,
    hasMatch: true,
    compatibility: match.compatibility,
    aiSummary: match.ai_summary || job.aiSummary,
    approvalProbability: {
      ...job.approvalProbability,
      level: match.approval_level as JobRecommendation["approvalProbability"]["level"],
      stars: match.approval_stars,
      reasons: (match.match_reasons ?? []).map((r) => r.text),
    },
    bestSendTime: {
      dayLabel: match.best_send_day_label,
      timeRange: match.best_send_time_range,
      insight: job.bestSendTime.insight,
    },
    reasons: (match.match_reasons ?? []).map((r, i) => ({
      id: `match-${i}`,
      text: r.text,
      type: (r.type === "warning" ? "warning" : "match") as "match" | "warning",
    })),
  };
}
