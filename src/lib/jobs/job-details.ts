import type { JobDetail } from "@/types/jobs";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { fetchJobById } from "@/lib/supabase/queries/jobs";
import { getCurrentUserId } from "@/lib/supabase/queries/profile";

export async function getJobDetail(id: string): Promise<JobDetail | undefined> {
  if (!id) return undefined;

  const supabase = createBrowserSupabaseClient();
  const userId = await getCurrentUserId(supabase);
  const job = await fetchJobById(supabase, id, userId);
  return job ?? undefined;
}

export async function getAllJobIds(): Promise<string[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("id")
    .eq("is_active", true)
    .limit(100);

  if (error) throw error;
  return (data ?? []).map((job) => job.id);
}
