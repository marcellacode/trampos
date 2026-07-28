"use server";

import type { ActionResult } from "@/app/actions/ai";
import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import {
  listConversations,
  listMessages,
  markConversationRead,
  sendDirectMessage,
  startConversationFromApplication,
} from "@/lib/supabase/queries/direct-messages";
import type {
  ConversationSummary,
  DirectMessageRow,
} from "@/lib/supabase/queries/direct-messages";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export async function startConversationFromApplicationAction(
  applicationId: string
): Promise<ActionResult<{ conversationId: string }>> {
  try {
    const { supabase, user } = await requireAuth();
    const conversationId = await startConversationFromApplication(
      supabase,
      user.id,
      applicationId
    );
    return { success: true, data: { conversationId } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function sendDirectMessageAction(input: {
  conversationId: string;
  content: string;
}): Promise<ActionResult<DirectMessageRow>> {
  try {
    const { supabase, user } = await requireAuth();
    const message = await sendDirectMessage(
      supabase,
      user.id,
      input.conversationId,
      input.content
    );
    return { success: true, data: message };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function listConversationsAction(): Promise<
  ActionResult<ConversationSummary[]>
> {
  try {
    const { supabase, user } = await requireAuth();
    const conversations = await listConversations(supabase, user.id);
    return { success: true, data: conversations };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function listMessagesAction(
  conversationId: string
): Promise<ActionResult<DirectMessageRow[]>> {
  try {
    const { supabase, user } = await requireAuth();
    const messages = await listMessages(supabase, user.id, conversationId);
    await markConversationRead(supabase, user.id, conversationId);
    return { success: true, data: messages };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function markConversationReadAction(
  conversationId: string
): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await requireAuth();
    await markConversationRead(supabase, user.id, conversationId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
