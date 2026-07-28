import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobRecommendation } from "@/types/jobs";
import type { ExtractedProfile } from "@/types/onboarding";
import { detectAtsProvider } from "@/lib/integrations/ats/detect-provider";
import { enrichJobFromGreenhouseUrl } from "@/lib/integrations/ats/providers/greenhouse/enrich-job";
import { tailorResumeForJob } from "@/lib/integrations/ats/resume/tailor-for-job";
import { isInternalJobRef } from "@/lib/external-jobs/resolve-job-ref";
import {
  resolveExternalJobId,
  upsertExternalJobFromRecommendation,
} from "@/lib/external-jobs/upsert-external-job";
import { loadUserProfile } from "@/lib/matching/compute-compatibility";
import { applicationStatusLabel } from "@/lib/applications/status-labels";
import type { JobApplicationRow } from "@/lib/supabase/queries/mutations/applications";
import { createNotification } from "@/lib/supabase/queries/mutations/notifications";
import { createTimelineEvent } from "@/lib/supabase/queries/mutations/timeline";

export interface PrepareApplicationInput {
  jobRef: string;
  companyId?: string;
  roleTitle: string;
  companyName: string;
  externalUrl?: string | null;
  job?: JobRecommendation;
}

export interface PreparedApplication {
  application: JobApplicationRow;
  applyUrl: string | null;
  submissionStatus: string;
  tailoredResumeText: string | null;
  coverLetterText: string | null;
  isExternal: boolean;
}

async function getOrCreateCompanyId(
  supabase: SupabaseClient,
  companyName: string,
  existingCompanyId?: string
): Promise<string> {
  if (existingCompanyId) return existingCompanyId;

  const slug = companyName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 50);

  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .ilike("name", companyName)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabase
    .from("companies")
    .insert({
      slug: `${slug}-${Date.now().toString(36)}`,
      name: companyName,
      logo: companyName.slice(0, 2).toUpperCase(),
      brand_color: "#6366F1",
      href: "#",
    })
    .select("id")
    .single();

  if (error) throw error;
  return created.id as string;
}

async function validateProfileForApplication(
  supabase: SupabaseClient,
  userId: string,
  profile: ExtractedProfile | null
): Promise<void> {
  if (!profile?.name?.trim()) {
    throw new Error("Complete seu perfil com nome antes de se candidatar.");
  }

  const { data: authProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (!authProfile?.email?.trim()) {
    throw new Error("Adicione seu e-mail no perfil antes de se candidatar.");
  }

  const { count: resumeCount } = await supabase
    .from("resume_uploads")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed");

  const hasResumeContent =
    (resumeCount ?? 0) > 0 ||
    profile.experiences.length > 0 ||
    Boolean(profile.summary?.trim());

  if (!hasResumeContent) {
    throw new Error(
      "Envie seu currículo ou preencha experiências no perfil antes de se candidatar."
    );
  }
}

async function needsExternalConsent(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from("job_applications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("application_source", "external")
    .not("user_consent_at", "is", null);

  return (count ?? 0) === 0;
}

async function enrichJobDescription(
  applyUrl: string | null,
  job?: JobRecommendation
): Promise<{ description?: string; roleTitle?: string }> {
  let description = job?.description ?? job?.aiSummary;
  let roleTitle = job?.role;

  if (applyUrl && detectAtsProvider(applyUrl) === "greenhouse") {
    const enriched = await enrichJobFromGreenhouseUrl(applyUrl);
    if (enriched) {
      description = enriched.description || description;
      roleTitle = enriched.title || roleTitle;
    }
  }

  return { description, roleTitle };
}

export async function prepareApplication(
  supabase: SupabaseClient,
  userId: string,
  input: PrepareApplicationInput
): Promise<PreparedApplication> {
  const profile = await loadUserProfile(supabase, userId);
  await validateProfileForApplication(supabase, userId, profile);

  const isInternalRef = isInternalJobRef(input.jobRef);
  const usesExternal =
    !isInternalRef || input.job?.applicationMode === "external_redirect";
  const isExternal = usesExternal;
  let externalJobId: string | null = null;
  let applyUrl = input.externalUrl ?? input.job?.externalUrl ?? null;

  if (isExternal) {
    if (input.job) {
      await upsertExternalJobFromRecommendation(supabase, input.job);
    }
    externalJobId = await resolveExternalJobId(supabase, input.jobRef, input.job);
    applyUrl = applyUrl ?? input.job?.externalUrl ?? null;
  }

  const companyId = await getOrCreateCompanyId(
    supabase,
    input.companyName,
    input.companyId
  );

  const enriched = await enrichJobDescription(applyUrl, input.job);
  const roleTitle = enriched.roleTitle ?? input.roleTitle;

  const tailored = await tailorResumeForJob(profile!, {
    role: roleTitle,
    company: input.companyName,
    description: enriched.description,
    stack: input.job?.stack,
  });

  const now = new Date().toISOString();
  const atsProvider = detectAtsProvider(applyUrl);
  const submissionStatus = isExternal && applyUrl ? "pending_external" : "completed";
  const setConsent = isExternal && (await needsExternalConsent(supabase, userId));

  const payload: Record<string, unknown> = {
    user_id: userId,
    job_id: isExternal ? null : input.jobRef,
    external_job_id: externalJobId,
    company_id: companyId,
    role_title: roleTitle,
    status: "applied",
    status_label:
      submissionStatus === "pending_external"
        ? "Pronta — conclua no site"
        : "Candidatura registrada",
    applied_at: now,
    last_activity_at: now,
    application_source: isExternal ? "external" : "internal",
    ats_provider: atsProvider,
    external_apply_url: applyUrl,
    submission_status: submissionStatus,
    tailored_resume_text: tailored.resumeText,
    cover_letter_text: tailored.coverLetter,
  };

  if (setConsent) {
    payload.user_consent_at = now;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applications = () => (supabase as any).from("job_applications");

  const { data: existing } = await applications()
    .select("id")
    .eq("user_id", userId)
    .match(isExternal ? { external_job_id: externalJobId } : { job_id: input.jobRef })
    .maybeSingle();

  let application: JobApplicationRow;

  if (existing?.id) {
    const { data, error } = await applications()
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    application = data as JobApplicationRow;
  } else {
    const { data, error } = await applications()
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    application = data as JobApplicationRow;
  }

  await createTimelineEvent(supabase, userId, {
    title: `Currículo adaptado: ${roleTitle}`,
    description: `Personalizado para ${input.companyName}.`,
    href: "/dashboard/curriculo",
    event_kind: "resume_tailored",
    actor: "ai",
    icon_name: "filetext",
    color_token: "purple",
    job_id: isExternal ? null : input.jobRef,
    company_id: companyId,
  });

  await createTimelineEvent(supabase, userId, {
    title: `Candidatura preparada: ${roleTitle}`,
    description: isExternal
      ? `Abra o site da empresa para concluir em ${input.companyName}.`
      : `Candidatura registrada para ${roleTitle}.`,
    href: isExternal && applyUrl ? applyUrl : `/dashboard/vagas/${input.jobRef}`,
    event_kind: "application_sent",
    actor: "ai",
    icon_name: "send",
    color_token: "blue",
    job_id: isExternal ? null : input.jobRef,
    company_id: companyId,
  });

  return {
    application,
    applyUrl,
    submissionStatus,
    tailoredResumeText: tailored.resumeText,
    coverLetterText: tailored.coverLetter,
    isExternal,
  };
}

export interface ApplyInternalJobInput {
  jobId: string;
  job?: JobRecommendation;
}

export async function applyInternalJob(
  supabase: SupabaseClient,
  userId: string,
  input: ApplyInternalJobInput
): Promise<PreparedApplication> {
  const { data: jobRow, error: jobError } = await supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      is_active,
      application_mode,
      company_id,
      ai_summary,
      companies!jobs_company_id_fkey (id, name),
      job_stack (tech_name, sort_order),
      job_section_items (section_type, content, sort_order)
    `
    )
    .eq("id", input.jobId)
    .maybeSingle();

  if (jobError) throw jobError;
  if (!jobRow?.is_active) {
    throw new Error("Esta vaga não está mais disponível para candidatura.");
  }
  if (jobRow.application_mode !== "internal") {
    throw new Error("Esta vaga não aceita candidatura interna na plataforma.");
  }

  const company = Array.isArray(jobRow.companies)
    ? jobRow.companies[0]
    : jobRow.companies;
  const companyId = (company?.id as string | undefined) ?? jobRow.company_id;
  const companyName =
    input.job?.company ?? (company?.name as string | undefined) ?? "Empresa";
  const roleTitle = input.job?.role ?? (jobRow.title as string);

  const profile = await loadUserProfile(supabase, userId);
  await validateProfileForApplication(supabase, userId, profile);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applications = () => (supabase as any).from("job_applications");

  const { data: existing } = await applications()
    .select("*")
    .eq("user_id", userId)
    .eq("job_id", input.jobId)
    .maybeSingle();

  if (existing?.submission_status === "completed") {
    throw new Error("Você já se candidatou a esta vaga.");
  }

  const sectionItems = (jobRow.job_section_items ?? []) as {
    section_type: string;
    content: string;
    sort_order: number;
  }[];
  const description =
    input.job?.description ??
    sectionItems
      .filter((item) => item.section_type === "summary")
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => item.content)
      .join("\n\n") ??
    (jobRow.ai_summary as string);

  const stack =
    input.job?.stack ??
    ((jobRow.job_stack ?? []) as { tech_name: string }[]).map(
      (item) => item.tech_name
    );

  let tailoredResumeText = existing?.tailored_resume_text as string | null;
  let coverLetterText = existing?.cover_letter_text as string | null;

  if (!tailoredResumeText || !coverLetterText) {
    const tailored = await tailorResumeForJob(profile!, {
      role: roleTitle,
      company: companyName,
      description,
      stack,
    });
    tailoredResumeText = tailored.resumeText;
    coverLetterText = tailored.coverLetter;
  }

  const now = new Date().toISOString();
  const statusLabel = applicationStatusLabel("applied");

  const payload: Record<string, unknown> = {
    user_id: userId,
    job_id: input.jobId,
    external_job_id: null,
    company_id: companyId,
    role_title: roleTitle,
    status: "applied",
    status_label: statusLabel,
    applied_at: now,
    last_activity_at: now,
    application_source: "internal",
    submission_status: "completed",
    tailored_resume_text: tailoredResumeText,
    cover_letter_text: coverLetterText,
  };

  let application: JobApplicationRow;

  if (existing?.id) {
    const { data, error } = await applications()
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    application = data as JobApplicationRow;
  } else {
    const { data, error } = await applications()
      .insert(payload)
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") {
        throw new Error("Você já se candidatou a esta vaga.");
      }
      throw error;
    }
    application = data as JobApplicationRow;
  }

  await createTimelineEvent(supabase, userId, {
    title: `Candidatura enviada: ${roleTitle}`,
    description: `Sua candidatura para ${companyName} foi registrada na plataforma.`,
    href: `/dashboard/vagas/${input.jobId}`,
    event_kind: "application_sent",
    actor: "user",
    icon_name: "send",
    color_token: "green",
    job_id: input.jobId,
    company_id: companyId,
  });

  await createNotification(supabase, userId, {
    title: `Candidatura enviada — ${roleTitle}`,
    description: `${companyName} recebeu sua candidatura com currículo adaptado.`,
    href: `/dashboard/vagas/${input.jobId}`,
    action_label: "Ver vaga",
    icon_name: "send",
    color_token: "green",
    notification_group: "today",
  });

  return {
    application,
    applyUrl: null,
    submissionStatus: "completed",
    tailoredResumeText,
    coverLetterText,
    isExternal: false,
  };
}

export async function confirmExternalApplication(
  supabase: SupabaseClient,
  userId: string,
  applicationId: string
): Promise<JobApplicationRow> {
  const now = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("job_applications")
    .update({
      submission_status: "completed",
      status_label: "Candidatura concluída",
      user_confirmed_at: now,
      last_activity_at: now,
    })
    .eq("id", applicationId)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as JobApplicationRow;
}
