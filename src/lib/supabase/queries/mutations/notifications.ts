import type { SupabaseClient } from "@supabase/supabase-js";
import { createCrud } from "@/lib/supabase/crud/factory";

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  notification_group: string;
  is_unread: boolean;
  action_label: string;
  href: string;
  icon_name: string;
  color_token: string;
  created_at: string;
  read_at: string | null;
}

export interface CreateNotificationInput {
  title: string;
  description?: string;
  notification_group?: string;
  action_label?: string;
  href?: string;
  icon_name?: string;
  color_token?: string;
}

export interface UpdateNotificationInput {
  title?: string;
  description?: string;
  is_unread?: boolean;
  read_at?: string | null;
  action_label?: string;
  href?: string;
}

const crud = createCrud<
  NotificationRow,
  CreateNotificationInput,
  UpdateNotificationInput
>("notifications");

export const listNotifications = crud.list;
export const getNotification = crud.get;
export const createNotification = crud.create;
export const updateNotification = crud.update;
export const deleteNotification = crud.remove;

export async function markNotificationRead(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<NotificationRow> {
  return updateNotification(supabase, userId, id, {
    is_unread: false,
    read_at: new Date().toISOString(),
  });
}

export async function markAllNotificationsRead(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_unread: false, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_unread", true);

  if (error) throw error;
}
