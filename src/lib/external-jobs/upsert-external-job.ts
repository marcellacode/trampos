import type { SupabaseClient } from "@supabase/supabase-js";
import { fromExtendedTable } from "@/lib/supabase/extended-client";
import { detectAtsProvider } from "@/lib/integrations/ats/detect-provider";
import { enrichJobFromGreenhouseUrl } from "@/lib/integrations/ats/providers/greenhouse/client";
import type { ExternalJobInput, ExternalJobRow } from "@/lib/external-jobs/types";
import { isExternalJobSource, providerFromExternalKey } from "@/lib/jobs/source-utils";
import type { JobRecommendation } from "@/types/jobs";

function rowToExternalJob(row: ExternalJobRow): ExternalJobInput & { id: string } {
  return {
    id: row.id,
    externalKey: row.external_key,
    provider: row.provider as ExternalJobInput["provider"],
    title: row.title,
    companyName: row.company_name,
    location: row.location,
    description: row.description,
    applyUrl: row.apply_url,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    remote: row.remote,
    stack: Array.isArray(row.stack) ? row.stack : [],
    rawPayload: row.raw_payload,
  };
}

export async function getExternalJobByKey(
  supabase: SupabaseClient,
  externalKey: string
): Promise<ExternalJobRow | null> {
  const { data, error } = await fromExtendedTable(supabase, "external_jobs")
    .select("*")
    .eq("external_key", externalKey)
    .maybeSingle();

  if (error) throw error;
  return data as ExternalJobRow | null;
}

export async function getExternalJobById(
  supabase: SupabaseClient,
  id: string
): Promise<ExternalJobRow | null> {
  const { data, error } = await fromExtendedTable(supabase, "external_jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as ExternalJobRow | null;
}

export async function upsertExternalJob(
  supabase: SupabaseClient,
  input: ExternalJobInput
): Promise<ExternalJobRow> {
  const { data, error } = await fromExtendedTable(supabase, "external_jobs")
    .upsert(
      {
        external_key: input.externalKey,
        provider: input.provider,
        title: input.title,
        company_name: input.companyName,
        location: input.location ?? "",
        description: input.description ?? "",
        apply_url: input.applyUrl ?? null,
        salary_min: input.salaryMin ?? null,
        salary_max: input.salaryMax ?? null,
        remote: input.remote ?? false,
        stack: input.stack ?? [],
        raw_payload: input.rawPayload ?? null,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "external_key" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data as ExternalJobRow;
}

export async function upsertExternalJobFromRecommendation(
  supabase: SupabaseClient,
  job: JobRecommendation
): Promise<ExternalJobRow | null> {
  if (!isExternalJobSource(job.source)) {
    return null;
  }

  let enrichedJob = job;
  const atsProvider = detectAtsProvider(job.externalUrl);
  if (atsProvider === "greenhouse" && job.externalUrl) {
    const enriched = await enrichJobFromGreenhouseUrl(job.externalUrl);
    if (enriched) {
      enrichedJob = {
        ...job,
        role: enriched.title ?? job.role,
        location: enriched.location ?? job.location,
        description: enriched.description || job.description,
        aiSummary: enriched.description.slice(0, 280) || job.aiSummary,
      };
    }
  }

  const provider = isExternalJobSource(enrichedJob.source)
    ? enrichedJob.source
    : providerFromExternalKey(enrichedJob.id);

  return upsertExternalJob(supabase, {
    externalKey: enrichedJob.id,
    provider: provider === "unknown" ? "unknown" : provider,
    title: enrichedJob.role,
    companyName: enrichedJob.company,
    location: enrichedJob.location,
    description: enrichedJob.description ?? enrichedJob.aiSummary,
    applyUrl: enrichedJob.externalUrl ?? null,
    salaryMin: enrichedJob.salaryMin || null,
    salaryMax: enrichedJob.salaryMax || null,
    remote: enrichedJob.remote,
    stack: enrichedJob.stack,
  });
}

export async function resolveExternalJobId(
  supabase: SupabaseClient,
  externalKey: string,
  job?: JobRecommendation
): Promise<string> {
  const existing = await getExternalJobByKey(supabase, externalKey);
  if (existing) return existing.id;

  if (job) {
    const row = await upsertExternalJobFromRecommendation(supabase, job);
    if (row) return row.id;
  }

  const { data, error } = await fromExtendedTable(supabase, "external_jobs")
    .upsert(
      {
        external_key: externalKey,
        provider: providerFromExternalKey(externalKey),
        title: job?.role ?? "Vaga externa",
        company_name: job?.company ?? "",
        location: job?.location ?? "",
        description: job?.description ?? "",
        apply_url: job?.externalUrl ?? null,
      },
      { onConflict: "external_key" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export { rowToExternalJob };
