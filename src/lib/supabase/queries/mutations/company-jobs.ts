import type { SupabaseClient } from "@supabase/supabase-js";

export type JobApplicationMode = "internal" | "external_redirect";

export interface JobSectionsInput {
  summary: string[];
  responsibilities: string[];
  requirements: string[];
  differentials: string[];
}

export interface CreateCompanyJobInput {
  companyId: string;
  userId: string;
  title: string;
  location: string;
  salaryDisplay: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  remote: boolean;
  applicationMode: JobApplicationMode;
  externalApplyUrl?: string | null;
  stack: string[];
  benefits: string[];
  sections: JobSectionsInput;
}

export interface UpdateCompanyJobInput extends Omit<
  CreateCompanyJobInput,
  "companyId" | "userId"
> {
  isActive: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueJobSlug(
  supabase: SupabaseClient,
  companySlug: string,
  title: string
): Promise<string> {
  const base = slugify(`${companySlug}-${title}`).slice(0, 72) || "vaga";
  let candidate = base;
  let attempt = 0;

  while (attempt < 5) {
    const { data } = await supabase
      .from("jobs")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) return candidate;
    attempt += 1;
    candidate = `${base}-${Date.now().toString(36)}`;
  }

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function cleanLines(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

async function replaceJobStack(
  supabase: SupabaseClient,
  jobId: string,
  stack: string[]
) {
  await supabase.from("job_stack").delete().eq("job_id", jobId);

  const items = cleanLines(stack);
  if (items.length === 0) return;

  const { error } = await supabase.from("job_stack").insert(
    items.map((tech_name, index) => ({
      job_id: jobId,
      tech_name,
      sort_order: index,
    }))
  );
  if (error) throw error;
}

async function replaceJobBenefits(
  supabase: SupabaseClient,
  jobId: string,
  benefits: string[]
) {
  await supabase.from("job_benefits").delete().eq("job_id", jobId);

  const items = cleanLines(benefits);
  if (items.length === 0) return;

  const { error } = await supabase.from("job_benefits").insert(
    items.map((benefit, index) => ({
      job_id: jobId,
      benefit,
      sort_order: index,
    }))
  );
  if (error) throw error;
}

async function replaceJobSections(
  supabase: SupabaseClient,
  jobId: string,
  sections: JobSectionsInput
) {
  await supabase.from("job_section_items").delete().eq("job_id", jobId);

  const rows: {
    job_id: string;
    section_type: keyof JobSectionsInput;
    content: string;
    sort_order: number;
  }[] = [];

  for (const sectionType of [
    "summary",
    "responsibilities",
    "requirements",
    "differentials",
  ] as const) {
    cleanLines(sections[sectionType]).forEach((content, index) => {
      rows.push({
        job_id: jobId,
        section_type: sectionType,
        content,
        sort_order: index,
      });
    });
  }

  if (rows.length === 0) return;

  const { error } = await supabase.from("job_section_items").insert(rows);
  if (error) throw error;
}

function buildAiSummary(sections: JobSectionsInput, title: string): string {
  const summary = cleanLines(sections.summary)[0];
  if (summary) return summary.slice(0, 280);
  const requirement = cleanLines(sections.requirements)[0];
  if (requirement) return requirement.slice(0, 280);
  return title;
}

export async function createCompanyJob(
  supabase: SupabaseClient,
  input: CreateCompanyJobInput
) {
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("slug")
    .eq("id", input.companyId)
    .maybeSingle();

  if (companyError) throw companyError;
  if (!company?.slug) throw new Error("Empresa não encontrada.");

  const slug = await uniqueJobSlug(supabase, company.slug, input.title);
  const today = new Date().toISOString().slice(0, 10);

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      slug,
      company_id: input.companyId,
      title: input.title.trim(),
      location: input.location.trim(),
      salary_display: input.salaryDisplay.trim(),
      salary_min: input.salaryMin ?? null,
      salary_max: input.salaryMax ?? null,
      remote: input.remote,
      application_mode: input.applicationMode,
      external_apply_url:
        input.applicationMode === "external_redirect"
          ? input.externalApplyUrl?.trim() ?? null
          : null,
      created_by_user_id: input.userId,
      published_at: today,
      is_active: true,
      ai_summary: buildAiSummary(input.sections, input.title),
    })
    .select("id, slug")
    .single();

  if (error) throw error;

  await Promise.all([
    replaceJobStack(supabase, job.id, input.stack),
    replaceJobBenefits(supabase, job.id, input.benefits),
    replaceJobSections(supabase, job.id, input.sections),
    supabase.from("job_stats").upsert({ job_id: job.id }),
  ]);

  return job;
}

export async function updateCompanyJob(
  supabase: SupabaseClient,
  jobId: string,
  companyId: string,
  input: UpdateCompanyJobInput
) {
  const { error } = await supabase
    .from("jobs")
    .update({
      title: input.title.trim(),
      location: input.location.trim(),
      salary_display: input.salaryDisplay.trim(),
      salary_min: input.salaryMin ?? null,
      salary_max: input.salaryMax ?? null,
      remote: input.remote,
      application_mode: input.applicationMode,
      external_apply_url:
        input.applicationMode === "external_redirect"
          ? input.externalApplyUrl?.trim() ?? null
          : null,
      is_active: input.isActive,
      ai_summary: buildAiSummary(input.sections, input.title),
    })
    .eq("id", jobId)
    .eq("company_id", companyId);

  if (error) throw error;

  await Promise.all([
    replaceJobStack(supabase, jobId, input.stack),
    replaceJobBenefits(supabase, jobId, input.benefits),
    replaceJobSections(supabase, jobId, input.sections),
  ]);

  const { data } = await supabase
    .from("jobs")
    .select("id, slug")
    .eq("id", jobId)
    .maybeSingle();

  return data;
}

export interface RecruiterJobRow {
  id: string;
  slug: string;
  title: string;
  location: string;
  salary_display: string;
  remote: boolean;
  is_active: boolean;
  application_mode: JobApplicationMode;
  external_apply_url: string | null;
  published_at: string | null;
  job_stack: { tech_name: string; sort_order: number }[];
  job_benefits: { benefit: string; sort_order: number }[];
  job_section_items: {
    section_type: string;
    content: string;
    sort_order: number;
  }[];
}

export async function fetchCompanyJobForEdit(
  supabase: SupabaseClient,
  companyId: string,
  jobId: string
): Promise<RecruiterJobRow | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      id,
      slug,
      title,
      location,
      salary_display,
      salary_min,
      salary_max,
      remote,
      is_active,
      application_mode,
      external_apply_url,
      published_at,
      job_stack (tech_name, sort_order),
      job_benefits (benefit, sort_order),
      job_section_items (section_type, content, sort_order)
    `
    )
    .eq("id", jobId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) throw error;
  return (data as RecruiterJobRow | null) ?? null;
}

export async function fetchCompanyJobsForRecruiter(
  supabase: SupabaseClient,
  companyId: string
) {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, slug, title, location, salary_display, remote, is_active, application_mode, published_at"
    )
    .eq("company_id", companyId)
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
