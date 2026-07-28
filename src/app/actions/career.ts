"use server";

import type { ActionResult } from "@/app/actions/ai";
import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import {
  emitCareerEvent,
  type CareerEventKind,
  type CareerEventPayload,
} from "@/lib/career/event-bus";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export async function emitCareerEventAction(input: {
  kind: CareerEventKind;
  payload?: CareerEventPayload;
}): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await requireAuth();
    await emitCareerEvent(supabase, user.id, input.kind, input.payload ?? {});
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
