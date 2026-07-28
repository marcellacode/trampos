import type { SupabaseClient } from "@supabase/supabase-js";
import { isInternalJobRef } from "@/lib/external-jobs/resolve-job-ref";
import { resolveExternalJobId } from "@/lib/external-jobs/upsert-external-job";
import type { JobRecommendation } from "@/types/jobs";

export async function listSavedJobRefs(
  supabase: SupabaseClient,
  userId: string
): Promise<Set<string>> {
  const { data, error } = await supabase.from("saved_jobs")
    .select("job_id, external_jobs(external_key)")
    .eq("user_id", userId);

  if (error) throw error;

  const refs = new Set<string>();
  for (const row of data ?? []) {
    if (row.job_id) refs.add(row.job_id as string);
    const external = row.external_jobs as unknown as { external_key: string } | null;
    if (external?.external_key) refs.add(external.external_key);
  }
  return refs;
}

export async function saveJob(
  supabase: SupabaseClient,
  userId: string,
  jobRef: string,
  job?: JobRecommendation
): Promise<void> {
  const isInternal = isInternalJobRef(jobRef);
  const externalJobId = isInternal
    ? null
    : await resolveExternalJobId(supabase, jobRef, job);

  const { data: existing } = await supabase.from("saved_jobs")
    .select("id")
    .eq("user_id", userId)
    .match(isInternal ? { job_id: jobRef } : { external_job_id: externalJobId })
    .maybeSingle();

  if (existing?.id) return;

  const { error } = await supabase.from("saved_jobs").insert({
    user_id: userId,
    job_id: isInternal ? jobRef : null,
    external_job_id: externalJobId,
  });
  if (error) throw error;
}

export async function unsaveJob(
  supabase: SupabaseClient,
  userId: string,
  jobRef: string
): Promise<void> {
  const isInternal = isInternalJobRef(jobRef);

  if (isInternal) {
    const { error } = await supabase.from("saved_jobs")
      .delete()
      .eq("user_id", userId)
      .eq("job_id", jobRef);
    if (error) throw error;
    return;
  }

  const externalJobId = await resolveExternalJobId(supabase, jobRef);
  const { error } = await supabase.from("saved_jobs")
    .delete()
    .eq("user_id", userId)
    .eq("external_job_id", externalJobId);
  if (error) throw error;
}

export async function listHiddenJobRefs(
  supabase: SupabaseClient,
  userId: string
): Promise<Set<string>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("user_hidden_jobs")
    .select("job_id, external_jobs(external_key)")
    .eq("user_id", userId);

  if (error) throw error;

  const refs = new Set<string>();
  for (const row of data ?? []) {
    if (row.job_id) refs.add(row.job_id as string);
    const external = row.external_jobs as unknown as { external_key: string } | null;
    if (external?.external_key) refs.add(external.external_key);
  }
  return refs;
}

export async function hideJobByRef(
  supabase: SupabaseClient,
  userId: string,
  jobRef: string,
  reason = "other",
  job?: JobRecommendation
): Promise<void> {
  const isInternal = isInternalJobRef(jobRef);

  if (isInternal) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("user_hidden_jobs").insert({
      user_id: userId,
      job_id: jobRef,
      reason,
    });
    if (error && !error.message.includes("duplicate")) throw error;
    return;
  }

  const externalJobId = await resolveExternalJobId(supabase, jobRef, job);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("user_hidden_jobs").insert({
    user_id: userId,
    external_job_id: externalJobId,
    reason,
  });
  if (error && !error.message.includes("duplicate")) throw error;
}
