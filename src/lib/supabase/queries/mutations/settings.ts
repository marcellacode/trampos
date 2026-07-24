import type { SupabaseClient } from "@supabase/supabase-js";
import { createCrud } from "@/lib/supabase/crud/factory";

export interface HiddenJobRow {
  user_id: string;
  job_id: string;
  reason: string;
  hidden_at: string;
}

export interface UserCompanyMatchRow {
  user_id: string;
  company_id: string;
  compatibility: number;
  created_at: string;
}

export async function listHiddenJobs(
  supabase: SupabaseClient,
  userId: string
): Promise<HiddenJobRow[]> {
  const { data, error } = await supabase
    .from("user_hidden_jobs")
    .select("*")
    .eq("user_id", userId)
    .order("hidden_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as HiddenJobRow[];
}

export async function hideJob(
  supabase: SupabaseClient,
  userId: string,
  jobId: string,
  reason = "other"
): Promise<HiddenJobRow> {
  const { data, error } = await supabase
    .from("user_hidden_jobs")
    .upsert(
      { user_id: userId, job_id: jobId, reason, hidden_at: new Date().toISOString() },
      { onConflict: "user_id,job_id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data as HiddenJobRow;
}

export async function unhideJob(
  supabase: SupabaseClient,
  userId: string,
  jobId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_hidden_jobs")
    .delete()
    .eq("user_id", userId)
    .eq("job_id", jobId);

  if (error) throw error;
}

export async function listUserCompanyMatches(
  supabase: SupabaseClient,
  userId: string
): Promise<UserCompanyMatchRow[]> {
  const { data, error } = await supabase
    .from("user_company_matches")
    .select("*")
    .eq("user_id", userId)
    .order("compatibility", { ascending: false });

  if (error) throw error;
  return (data ?? []) as UserCompanyMatchRow[];
}

export async function addFavoriteCompany(
  supabase: SupabaseClient,
  userId: string,
  companyId: string,
  compatibility = 80
): Promise<UserCompanyMatchRow> {
  const { data, error } = await supabase
    .from("user_company_matches")
    .upsert(
      { user_id: userId, company_id: companyId, compatibility },
      { onConflict: "user_id,company_id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data as UserCompanyMatchRow;
}

export async function removeFavoriteCompany(
  supabase: SupabaseClient,
  userId: string,
  companyId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_company_matches")
    .delete()
    .eq("user_id", userId)
    .eq("company_id", companyId);

  if (error) throw error;
}

export async function updateFavoriteCompany(
  supabase: SupabaseClient,
  userId: string,
  companyId: string,
  compatibility: number
): Promise<UserCompanyMatchRow> {
  const { data, error } = await supabase
    .from("user_company_matches")
    .update({ compatibility })
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .select("*")
    .single();

  if (error) throw error;
  return data as UserCompanyMatchRow;
}

export interface ResumeUploadRow {
  id: string;
  user_id: string;
  original_filename: string;
  storage_url: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface CreateResumeUploadInput {
  original_filename: string;
  storage_url?: string | null;
  mime_type?: string | null;
  file_size_bytes?: number | null;
  status?: string;
}

export interface UpdateResumeUploadInput {
  storage_url?: string | null;
  status?: string;
  error_message?: string | null;
}

const resumeCrud = createCrud<
  ResumeUploadRow,
  CreateResumeUploadInput,
  UpdateResumeUploadInput
>("resume_uploads");

export const listResumeUploads = resumeCrud.list;
export const createResumeUpload = resumeCrud.create;
export const updateResumeUpload = resumeCrud.update;
export const deleteResumeUpload = resumeCrud.remove;

export interface OauthConnectionRow {
  id: string;
  user_id: string;
  provider: string;
  provider_user_id: string | null;
  profile_url: string | null;
  connected_at: string;
  last_synced_at: string | null;
}

export interface CreateOauthConnectionInput {
  provider: string;
  provider_user_id?: string | null;
  profile_url?: string | null;
}

export interface UpdateOauthConnectionInput {
  provider_user_id?: string | null;
  profile_url?: string | null;
  last_synced_at?: string | null;
}

const oauthCrud = createCrud<
  OauthConnectionRow,
  CreateOauthConnectionInput,
  UpdateOauthConnectionInput
>("oauth_connections", { orderColumn: "connected_at" });

export const listOauthConnections = oauthCrud.list;
export const createOauthConnection = oauthCrud.create;
export const updateOauthConnection = oauthCrud.update;
export const deleteOauthConnection = oauthCrud.remove;

export async function updateProfileSettings(
  supabase: SupabaseClient,
  userId: string,
  input: {
    full_name?: string;
    current_role?: string;
    summary?: string;
    seniority?: string;
    copilot_status?: string;
    avatar_url?: string | null;
  }
): Promise<void> {
  const { error } = await supabase.from("profiles").update(input).eq("id", userId);
  if (error) throw error;
}
