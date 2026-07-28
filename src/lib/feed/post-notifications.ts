import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";
import type { CreateNotificationInput } from "@/lib/supabase/queries/mutations/notifications";
import type { SupabaseClient } from "@supabase/supabase-js";

interface PostAuthorRow {
  author_user_id: string | null;
  author_company_id: string | null;
}

const DEFAULT_NOTIFICATION: Partial<CreateNotificationInput> = {
  notification_group: "today",
  action_label: "Ver publicação",
  href: "/dashboard/feed",
};

export async function getPostNotificationRecipients(
  supabase: SupabaseClient,
  postId: string
): Promise<string[]> {
  const { data: post, error } = await supabase.from("posts")
    .select("author_user_id, author_company_id")
    .eq("id", postId)
    .maybeSingle();

  if (error) throw error;
  if (!post) return [];

  const row = post as PostAuthorRow;

  if (row.author_user_id) {
    return [row.author_user_id];
  }

  if (!row.author_company_id) return [];

  const { data: members, error: membersError } = await supabase
    .from("company_members")
    .select("user_id")
    .eq("company_id", row.author_company_id)
    .in("role", ["admin", "recruiter"]);

  if (membersError) throw membersError;

  return (members ?? []).map((member) => member.user_id as string);
}

export async function notifyPostEngagement(
  recipients: string[],
  actorUserId: string,
  input: CreateNotificationInput
): Promise<void> {
  if (!isSupabaseServiceConfigured()) return;

  const targets = [...new Set(recipients)].filter((id) => id !== actorUserId);
  if (targets.length === 0) return;

  const admin = createAdminSupabaseClient();
  const payload = {
    ...DEFAULT_NOTIFICATION,
    ...input,
    is_unread: true,
  };

  const { error } = await admin.from("notifications").insert(
    targets.map((userId) => ({
      user_id: userId,
      title: payload.title ?? "Nova interação",
      description: payload.description ?? "",
      notification_group: (payload.notification_group ?? "today") as
        | "today"
        | "yesterday"
        | "week",
      action_label: payload.action_label ?? "Ver",
      href: payload.href ?? "/dashboard/feed",
      icon_name: payload.icon_name ?? "bell",
      color_token: payload.color_token ?? "blue",
      is_unread: true,
    }))
  );

  if (error) throw error;
}

export async function notifyPostAuthor(
  supabase: SupabaseClient,
  postId: string,
  actorUserId: string,
  actorName: string,
  input: CreateNotificationInput
): Promise<void> {
  const recipients = await getPostNotificationRecipients(supabase, postId);
  const description =
    input.description ?? `${actorName} interagiu com sua publicação.`;

  await notifyPostEngagement(recipients, actorUserId, {
    ...input,
    description,
  });
}
