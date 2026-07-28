"use server";

import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { chatCompletion } from "@/lib/ai/groq";
import { isGroqConfigured } from "@/lib/ai/env";
import type { ActionResult } from "@/app/actions/ai";

export {
  syncUserMatchesAction,
  scheduleMatchResyncAction,
  computeJobMatchAction,
  refreshDiscoverySummaryAction,
} from "@/lib/matching/match-action";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export async function interpretSmartFilterAction(
  query: string
): Promise<ActionResult<{ labels: string[]; searchQuery?: string }>> {
  try {
    const trimmed = query.trim();
    if (!trimmed) {
      return { success: false, error: "Digite um filtro." };
    }

    const { user } = await requireAuth();
    const rate = checkRateLimit(user.id);
    if (!rate.allowed) {
      return {
        success: false,
        error: "Muitas requisições. Aguarde e tente novamente.",
      };
    }

    if (!isGroqConfigured()) {
      return { success: true, data: { labels: [trimmed], searchQuery: trimmed } };
    }

    const raw = await chatCompletion(
      [
        {
          role: "system",
          content: `Interprete filtros de vagas em PT-BR.
Retorne JSON: { "labels": string[] (1-3 chips curtos), "searchQuery": string opcional }`,
        },
        { role: "user", content: trimmed },
      ],
      { jsonMode: true, temperature: 0.2 }
    );

    const parsed = JSON.parse(raw) as { labels: string[]; searchQuery?: string };
    return {
      success: true,
      data: {
        labels: parsed.labels?.length ? parsed.labels : [trimmed],
        searchQuery: parsed.searchQuery ?? trimmed,
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function saveJobAction(jobRef: string): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await requireAuth();
    const { saveJob } = await import("@/lib/supabase/queries/mutations/saved-jobs");
    await saveJob(supabase, user.id, jobRef);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function unsaveJobAction(jobRef: string): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await requireAuth();
    const { unsaveJob } = await import("@/lib/supabase/queries/mutations/saved-jobs");
    await unsaveJob(supabase, user.id, jobRef);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function hideJobByRefAction(
  jobRef: string,
  reason = "other"
): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await requireAuth();
    const { hideJobByRef } = await import("@/lib/supabase/queries/mutations/saved-jobs");
    await hideJobByRef(supabase, user.id, jobRef, reason);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function listSavedJobRefsAction(): Promise<ActionResult<string[]>> {
  try {
    const { supabase, user } = await requireAuth();
    const { listSavedJobRefs } = await import(
      "@/lib/supabase/queries/mutations/saved-jobs"
    );
    const refs = await listSavedJobRefs(supabase, user.id);
    return { success: true, data: [...refs] };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function listHiddenJobRefsAction(): Promise<ActionResult<string[]>> {
  try {
    const { supabase, user } = await requireAuth();
    const { listHiddenJobRefs } = await import(
      "@/lib/supabase/queries/mutations/saved-jobs"
    );
    const refs = await listHiddenJobRefs(supabase, user.id);
    return { success: true, data: [...refs] };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
