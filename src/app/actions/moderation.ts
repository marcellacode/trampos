"use server";

import type { ActionResult } from "@/app/actions/ai";
import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import {
  blockUser,
  reportPost,
  unblockUser,
} from "@/lib/supabase/queries/moderation";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export async function reportPostAction(input: {
  postId: string;
  reason: string;
}): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await requireAuth();
    await reportPost(supabase, user.id, input.postId, input.reason);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function blockUserAction(
  blockedUserId: string
): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await requireAuth();
    await blockUser(supabase, user.id, blockedUserId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function unblockUserAction(
  blockedUserId: string
): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await requireAuth();
    await unblockUser(supabase, user.id, blockedUserId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
