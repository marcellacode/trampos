"use server";

import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { chatCompletion } from "@/lib/ai/groq";
import { isGroqConfigured } from "@/lib/ai/env";
import type { ActionResult } from "@/app/actions/ai";

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

    const { supabase, user } = await requireAuth();
    const rate = checkRateLimit(user.id);
    if (!rate.allowed) {
      return {
        success: false,
        error: "Muitas requisições. Aguarde e tente novamente.",
      };
    }

    let labels: string[];
    let searchQuery: string;

    if (!isGroqConfigured()) {
      labels = [trimmed];
      searchQuery = trimmed;
    } else {
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
      labels = parsed.labels?.length ? parsed.labels : [trimmed];
      searchQuery = parsed.searchQuery ?? trimmed;
    }

    const { createSmartFilter, listSmartFilters } = await import(
      "@/lib/supabase/queries/mutations/goals"
    );
    const existing = await listSmartFilters(supabase, user.id);
    const existingLabels = new Set(existing.map((f) => f.label.toLowerCase()));

    for (const label of labels) {
      if (existingLabels.has(label.toLowerCase())) continue;
      await createSmartFilter(supabase, user.id, {
        label,
        is_active: true,
        sort_order: existing.length,
      });
      existingLabels.add(label.toLowerCase());
    }

    return {
      success: true,
      data: { labels, searchQuery },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function saveJobAction(
  jobRef: string,
  job?: import("@/types/jobs").JobRecommendation
): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await requireAuth();
    const { saveJob } = await import("@/lib/supabase/queries/mutations/saved-jobs");
    await saveJob(supabase, user.id, jobRef, job);
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
  reason = "other",
  job?: import("@/types/jobs").JobRecommendation
): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await requireAuth();
    const { hideJobByRef } = await import("@/lib/supabase/queries/mutations/saved-jobs");
    await hideJobByRef(supabase, user.id, jobRef, reason, job);
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
