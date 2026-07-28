import type { SupabaseClient } from "@supabase/supabase-js";

/** Access tables added before `database.types.ts` is regenerated. */
export function fromExtendedTable(
  supabase: SupabaseClient,
  table:
    | "external_jobs"
    | "user_job_matches"
    | "saved_jobs"
    | "interview_sessions"
    | "posts"
    | "follows"
    | "post_reactions"
    | "post_comments"
    | "post_shares"
    | "post_counts"
    | "post_reports"
    | "blocked_users"
    | "conversations"
    | "conversation_participants"
    | "direct_messages"
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table);
}
