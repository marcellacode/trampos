import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApplicationStatus } from "@/lib/applications/status-labels";
import { applicationStatusLabel } from "@/lib/applications/status-labels";
import { fetchEditableCompany } from "@/lib/supabase/queries/company";

export interface CompanyJobApplicationRow {
  id: string;
  userId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string | null;
  jobTitle: string;
  roleTitle: string;
  status: ApplicationStatus;
  statusLabel: string;
  appliedAt: string | null;
  lastActivityAt: string;
  tailoredResumeText: string | null;
  coverLetterText: string | null;
  applicationSource: "internal" | "external";
}

export async function fetchCompanyJobApplications(
  supabase: SupabaseClient,
  userId: string,
  companyId: string,
  jobId?: string | null
): Promise<CompanyJobApplicationRow[]> {
  const editable = await fetchEditableCompany(supabase, userId, companyId);
  if (!editable) {
    throw new Error("Sem permissão para ver candidatos desta empresa.");
  }

  let query = supabase
    .from("job_applications")
    .select(
      `
      id,
      user_id,
      job_id,
      role_title,
      status,
      status_label,
      applied_at,
      last_activity_at,
      tailored_resume_text,
      cover_letter_text,
      application_source,
      jobs!job_applications_job_id_fkey (id, title),
      profiles!job_applications_user_id_fkey (
        full_name,
        email
      )
    `
    )
    .eq("company_id", companyId)
    .eq("application_source", "internal")
    .order("last_activity_at", { ascending: false });

  if (jobId) {
    query = query.eq("job_id", jobId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).flatMap((row) => {
    const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

    return [
      {
        id: row.id,
        userId: row.user_id,
        candidateName: (profile?.full_name as string | undefined)?.trim() || "Candidato",
        candidateEmail: (profile?.email as string | undefined)?.trim() || "",
        jobId: row.job_id,
        jobTitle: (job?.title as string | undefined) ?? row.role_title,
        roleTitle: row.role_title,
        status: row.status as ApplicationStatus,
        statusLabel: row.status_label,
        appliedAt: row.applied_at,
        lastActivityAt: row.last_activity_at,
        tailoredResumeText: row.tailored_resume_text,
        coverLetterText: row.cover_letter_text,
        applicationSource: row.application_source as "internal" | "external",
      },
    ];
  });
}

export async function updateCompanyApplicationStatus(
  supabase: SupabaseClient,
  userId: string,
  companyId: string,
  applicationId: string,
  status: ApplicationStatus
): Promise<void> {
  const editable = await fetchEditableCompany(supabase, userId, companyId);
  if (!editable) {
    throw new Error("Sem permissão para atualizar candidatos.");
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("job_applications")
    .update({
      status,
      status_label: applicationStatusLabel(status),
      last_activity_at: now,
    })
    .eq("id", applicationId)
    .eq("company_id", companyId);

  if (error) throw error;
}

export async function fetchUserInternalApplication(
  supabase: SupabaseClient,
  userId: string,
  jobId: string
) {
  const { data, error } = await supabase
    .from("job_applications")
    .select(
      "id, submission_status, tailored_resume_text, cover_letter_text, status, status_label"
    )
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .eq("application_source", "internal")
    .maybeSingle();

  if (error) throw error;
  return data;
}
