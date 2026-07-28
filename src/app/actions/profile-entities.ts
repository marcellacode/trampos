"use server";

import type { ActionResult } from "@/app/actions/ai";
import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import { createSystemPostIfEnabled } from "@/lib/feed/system-posts";
import { createCertificate } from "@/lib/supabase/queries/mutations/profile-entities";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export async function createCertificateAction(
  input: Parameters<typeof createCertificate>[2]
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireAuth();
    const row = await createCertificate(supabase, user.id, input);
    await createSystemPostIfEnabled(supabase, user.id, "certificate_added", {
      name: String(input.name ?? ""),
    });
    return { success: true, data: { id: row.id as string } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
