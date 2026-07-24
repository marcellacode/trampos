import type { SupabaseClient } from "@supabase/supabase-js";
import { createCrud } from "@/lib/supabase/crud/factory";

export interface ChatMessageRow {
  id: string;
  user_id: string;
  context: string;
  job_id: string | null;
  role: string;
  content: string;
  created_at: string;
}

export interface CreateChatMessageInput {
  context?: string;
  job_id?: string | null;
  role: string;
  content: string;
}

export interface UpdateChatMessageInput {
  content?: string;
}

const crud = createCrud<
  ChatMessageRow,
  CreateChatMessageInput,
  UpdateChatMessageInput
>("chat_messages");

export const listChatMessages = crud.list;
export const getChatMessage = crud.get;
export const createChatMessage = crud.create;
export const updateChatMessage = crud.update;
export const deleteChatMessage = crud.remove;

export async function listChatMessagesByContext(
  supabase: SupabaseClient,
  userId: string,
  context: string
): Promise<ChatMessageRow[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .eq("context", context)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ChatMessageRow[];
}

export async function markChatContextRead(
  supabase: SupabaseClient,
  userId: string,
  context: string
): Promise<void> {
  const { error } = await supabase.from("chat_read_state").upsert(
    {
      user_id: userId,
      context,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: "user_id,context" }
  );

  if (error) throw error;
}
