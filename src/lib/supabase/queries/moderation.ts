import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchBlockedUserIds(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase.from("blocked_users")
    .select("blocked_id")
    .eq("blocker_id", userId);

  if (error) throw error;
  return ((data ?? []) as { blocked_id: string }[]).map((row) => row.blocked_id);
}

export async function reportPost(
  supabase: SupabaseClient,
  reporterId: string,
  postId: string,
  reason: string
): Promise<void> {
  const { error } = await supabase.from("post_reports").insert({
    post_id: postId,
    reporter_user_id: reporterId,
    reason: reason.trim() || "Denúncia",
  });

  if (error) throw error;
}

export async function blockUser(
  supabase: SupabaseClient,
  blockerId: string,
  blockedId: string
): Promise<void> {
  if (blockerId === blockedId) {
    throw new Error("Você não pode bloquear a si mesmo.");
  }

  const { error } = await supabase.from("blocked_users").insert({
    blocker_id: blockerId,
    blocked_id: blockedId,
  });

  if (error && error.code !== "23505") throw error;
}

export async function unblockUser(
  supabase: SupabaseClient,
  blockerId: string,
  blockedId: string
): Promise<void> {
  const { error } = await supabase.from("blocked_users")
    .delete()
    .eq("blocker_id", blockerId)
    .eq("blocked_id", blockedId);

  if (error) throw error;
}
