import type { SupabaseClient } from "@supabase/supabase-js";
import { createCrud } from "@/lib/supabase/crud/factory";

export interface JobApplicationRow {
  id: string;
  user_id: string;
  job_id: string | null;
  company_id: string;
  role_title: string;
  status: string;
  status_label: string;
  applied_at: string | null;
  last_activity_at: string;
  created_at: string;
}

export interface CreateJobApplicationInput {
  job_id?: string | null;
  company_id: string;
  role_title: string;
  status?: string;
  status_label?: string;
  applied_at?: string | null;
}

export interface UpdateJobApplicationInput {
  role_title?: string;
  status?: string;
  status_label?: string;
  applied_at?: string | null;
  last_activity_at?: string;
}

const crud = createCrud<
  JobApplicationRow,
  CreateJobApplicationInput,
  UpdateJobApplicationInput
>("job_applications", { orderColumn: "last_activity_at" });

export const listJobApplications = crud.list;
export const getJobApplication = crud.get;
export const createJobApplication = crud.create;
export const updateJobApplication = crud.update;
export const deleteJobApplication = crud.remove;

export async function applyToJob(
  supabase: SupabaseClient,
  userId: string,
  input: {
    jobId: string;
    companyId: string;
    roleTitle: string;
  }
): Promise<JobApplicationRow> {
  const { data: existing } = await supabase
    .from("job_applications")
    .select("id")
    .eq("user_id", userId)
    .eq("job_id", input.jobId)
    .maybeSingle();

  if (existing) {
    return updateJobApplication(supabase, userId, existing.id, {
      status: "applied",
      status_label: "Candidatura enviada",
      applied_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    });
  }

  return createJobApplication(supabase, userId, {
    job_id: input.jobId,
    company_id: input.companyId,
    role_title: input.roleTitle,
    status: "applied",
    status_label: "Candidatura enviada",
    applied_at: new Date().toISOString(),
  });
}
