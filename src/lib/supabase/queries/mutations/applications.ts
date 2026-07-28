import type { SupabaseClient } from "@supabase/supabase-js";
import { prepareApplication } from "@/lib/integrations/ats/application-service";
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
    companyName?: string;
  }
): Promise<JobApplicationRow> {
  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", input.companyId)
    .maybeSingle();

  const result = await prepareApplication(supabase, userId, {
    jobRef: input.jobId,
    companyId: input.companyId,
    roleTitle: input.roleTitle,
    companyName: input.companyName ?? company?.name ?? "Empresa",
  });

  return result.application;
}
