"use server";

import { z } from "zod";
import { chatCompletion } from "@/lib/ai/groq";
import { isGroqConfigured } from "@/lib/ai/env";
import { buildJobeContext, JOBE_SYSTEM_PROMPT } from "@/lib/ai/jobe-prompt";
import type { ChatMessage } from "@/lib/ai/groq";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { extractResumeText } from "@/lib/ai/resume-text";
import {
  extractedProfileAiSchema,
  interpretGoalsResponseSchema,
  mapAiChipsToGoalChips,
  mapAiProfileToExtracted,
  onboardingCompleteResponseSchema,
  universalSearchResponseSchema,
  type UniversalSearchResult,
} from "@/lib/ai/schemas";
import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import { parseGoalText } from "@/lib/onboarding/goal-parser";
import { fetchProfileData } from "@/lib/supabase/queries/profile";
import { fetchJobCardsForUser } from "@/lib/supabase/queries/jobs";
import { searchPlatformEntities } from "@/lib/supabase/queries/universal-search";
import { createSystemPostIfEnabled } from "@/lib/feed/system-posts";
import {
  createChatMessage,
  listChatMessagesByContext,
} from "@/lib/supabase/queries/mutations/chat";
import type { Database } from "@/lib/supabase/database.types";
import type { ExtractedProfile, GoalChip } from "@/types/onboarding";

export type ChatContext = Database["public"]["Enums"]["chat_context"];

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}

function toActionError(error: unknown): ActionResult<never> {
  return { success: false, error: getErrorMessage(error) };
}

async function loadChatJobSummaries(
  supabase: Awaited<ReturnType<typeof requireAuth>>["supabase"],
  userId: string
) {
  try {
    const jobCards = await fetchJobCardsForUser(supabase, userId, 8);
    return jobCards.map((job) => ({
      title: job.role,
      company: job.company,
      location: job.location,
      salary: job.salary,
      remote: /remot/i.test(job.location),
      compatibility: job.compatibility,
      href: job.href,
    }));
  } catch (error) {
    console.error("[jobeChatAction] jobs fetch failed:", error);
    return [];
  }
}

async function loadChatHistory(
  supabase: Awaited<ReturnType<typeof requireAuth>>["supabase"],
  userId: string,
  context: ChatContext
) {
  try {
    return await listChatMessagesByContext(supabase, userId, context);
  } catch (error) {
    console.error("[jobeChatAction] history fetch failed:", error);
    return [];
  }
}

function enforceRateLimit(userId: string): ActionResult<never> | null {
  const { allowed, retryAfterMs } = checkRateLimit(userId);
  if (!allowed) {
    const seconds = Math.ceil((retryAfterMs ?? 60_000) / 1000);
    return {
      success: false,
      error: `Muitas requisições. Aguarde ${seconds}s e tente novamente.`,
    };
  }
  return null;
}

export async function jobeChatAction(
  message: string,
  context: ChatContext = "dashboard"
): Promise<ActionResult<{ content: string }>> {
  try {
    const trimmed = message.trim();
    if (!trimmed) {
      return { success: false, error: "Digite uma mensagem." };
    }

    const { supabase, user } = await requireAuth();
    const rateError = enforceRateLimit(user.id);
    if (rateError) return rateError;

    if (!isGroqConfigured()) {
      return {
        success: false,
        error:
          "A IA do Jobe não está configurada. Adicione GROQ_API_KEY ao servidor.",
      };
    }

    let profile: ExtractedProfile | null = null;
    try {
      profile = await fetchProfileData(supabase, user.id);
    } catch (error) {
      console.error("[jobeChatAction] profile fetch failed:", error);
    }

    const [{ data: profileGoals }, jobSummaries, history] = await Promise.all([
      supabase
        .from("profiles")
        .select("goal_role, goal_location, goal_salary, goal_availability_label")
        .eq("id", user.id)
        .maybeSingle(),
      loadChatJobSummaries(supabase, user.id),
      loadChatHistory(supabase, user.id, context),
    ]);

    const systemContent = `${JOBE_SYSTEM_PROMPT}\n\n${buildJobeContext(
      profile,
      jobSummaries,
      profileGoals
        ? {
            role: profileGoals.goal_role || undefined,
            location: profileGoals.goal_location || undefined,
            salary: profileGoals.goal_salary || undefined,
            availability: profileGoals.goal_availability_label || undefined,
          }
        : undefined
    )}`;

    const chatMessages: ChatMessage[] = [
      { role: "system", content: systemContent },
      ...history
        .slice(-10)
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      { role: "user", content: trimmed },
    ];

    const content = await chatCompletion(chatMessages);

    try {
      await createChatMessage(supabase, user.id, {
        context,
        role: "user",
        content: trimmed,
      });
      await createChatMessage(supabase, user.id, {
        context,
        role: "assistant",
        content,
      });
    } catch (persistError) {
      console.error("[jobeChatAction] persist failed:", persistError);
    }

    return { success: true, data: { content } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function interpretGoalsAction(
  text: string
): Promise<ActionResult<{ chips: GoalChip[] }>> {
  try {
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      return { success: true, data: { chips: [] } };
    }

    const { user } = await requireAuth();
    const rateError = enforceRateLimit(user.id);
    if (rateError) return rateError;

    if (!isGroqConfigured()) {
      return { success: true, data: { chips: parseGoalText(trimmed) } };
    }

    try {
      const raw = await chatCompletion(
        [
          {
            role: "system",
            content: `Você interpreta objetivos de carreira em português brasileiro.
Retorne JSON: { "chips": [{ "label": string, "category": "skill"|"role"|"location"|"salary"|"contract"|"model" }] }
Extraia habilidades, cargo desejado, localização, salário, tipo de contrato e modelo de trabalho.
Máximo 12 chips. Labels curtos em PT-BR.`,
          },
          { role: "user", content: trimmed },
        ],
        { jsonMode: true, temperature: 0.2 }
      );

      const parsed = interpretGoalsResponseSchema.parse(JSON.parse(raw));
      return {
        success: true,
        data: { chips: mapAiChipsToGoalChips(parsed.chips) },
      };
    } catch {
      return { success: true, data: { chips: parseGoalText(trimmed) } };
    }
  } catch (error) {
    return toActionError(error);
  }
}

export async function parseResumeAction(
  formData: FormData
): Promise<ActionResult<{ profile: ExtractedProfile }>> {
  try {
    const { user } = await requireAuth();
    const rateError = enforceRateLimit(user.id);
    if (rateError) return rateError;

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { success: false, error: "Arquivo obrigatório." };
    }

    const extracted = await extractResumeText(file);
    if ("error" in extracted) {
      return { success: false, error: extracted.error };
    }

    if (!isGroqConfigured()) {
      return {
        success: false,
        error:
          "IA indisponível para analisar currículos. Configure GROQ_API_KEY.",
      };
    }

    const raw = await chatCompletion(
      [
        {
          role: "system",
          content: `Extraia dados de currículo em português ou inglês.
Retorne JSON com: name, currentRole, summary, avatarInitials (2 letras), seniority,
skills (string[]), experiences [{company, role, period, description}],
languages [{name, level}], projects [{name, description, tech[]}], certificates [{name, issuer, year}].
Não invente informações ausentes no texto.`,
        },
        { role: "user", content: extracted.text },
      ],
      { jsonMode: true, temperature: 0.1, maxTokens: 2048 }
    );

    const parsed = extractedProfileAiSchema.parse(JSON.parse(raw));
    return {
      success: true,
      data: { profile: mapAiProfileToExtracted(parsed) },
    };
  } catch (error) {
    return toActionError(error);
  }
}

const onboardingPayloadSchema = z.object({
  event: z.string(),
  profileId: z.string(),
  importMethod: z.string().nullable(),
  goalText: z.string().optional(),
});

export async function processOnboardingCompleteAction(
  payload: z.infer<typeof onboardingPayloadSchema>
): Promise<ActionResult<{ suggestionsCount: number }>> {
  try {
    const { supabase, user } = await requireAuth();
    const data = onboardingPayloadSchema.parse(payload);

    if (data.profileId !== user.id) {
      return { success: false, error: "Perfil inválido." };
    }

    const rateError = enforceRateLimit(user.id);
    if (rateError) return rateError;

    let suggestionsCount = 0;

    if (isGroqConfigured()) {
      const profile = await fetchProfileData(supabase, user.id);
      if (profile) {
        const goalContext = data.goalText ? `\nMetas: ${data.goalText}` : "";

        const raw = await chatCompletion(
          [
            {
              role: "system",
              content: `Você enriquece perfis profissionais para a Jobera.
Retorne JSON: {
  "predominantProfile": string,
  "strengths": string[] (3-5 pontos fortes),
  "suggestions": [{ "title", "description", "actionLabel", "type": "github"|"linkedin"|"skill"|"project"|"experience" }] (2-4 sugestões)
}
Baseie-se apenas no perfil real. PT-BR.`,
            },
            {
              role: "user",
              content: `${buildJobeContext(profile)}${goalContext}\nMétodo de importação: ${data.importMethod ?? "desconhecido"}`,
            },
          ],
          { jsonMode: true, temperature: 0.4 }
        );

        const parsed = onboardingCompleteResponseSchema.parse(JSON.parse(raw));
        suggestionsCount = parsed.suggestions.length;

        await supabase.from("profile_ai_suggestions").delete().eq("user_id", user.id);

        if (parsed.suggestions.length > 0) {
          const { error } = await supabase.from("profile_ai_suggestions").insert(
            parsed.suggestions.map((suggestion) => ({
              user_id: user.id,
              title: suggestion.title,
              description: suggestion.description,
              action_label: suggestion.actionLabel,
              suggestion_type: suggestion.type,
            }))
          );
          if (error) throw error;
        }

        if (parsed.predominantProfile || parsed.strengths.length > 0) {
          const { data: existingDna } = await supabase
            .from("professional_dna")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (existingDna?.id) {
            await supabase
              .from("dna_strengths")
              .delete()
              .eq("dna_id", existingDna.id);
          }

          const { data: dnaRow, error: dnaError } = await supabase
            .from("professional_dna")
            .upsert(
              {
                user_id: user.id,
                predominant_profile:
                  parsed.predominantProfile ?? profile.currentRole ?? "Perfil em construção",
                with_skills_label: "novas competências",
              },
              { onConflict: "user_id" }
            )
            .select("id")
            .single();

          if (dnaError) throw dnaError;

          if (parsed.strengths.length > 0) {
            const { error: strengthsError } = await supabase
              .from("dna_strengths")
              .insert(
                parsed.strengths.map((strength, index) => ({
                  dna_id: dnaRow.id,
                  strength,
                  sort_order: index,
                }))
              );
            if (strengthsError) throw strengthsError;
          }
        }
      }
    }

    try {
      const { syncUserMatchesAction } = await import("@/lib/matching/match-action");
      await syncUserMatchesAction();
    } catch (syncError) {
      console.warn("[onboarding] match sync failed:", syncError);
    }

    const { createTimelineEvent } = await import(
      "@/lib/supabase/queries/mutations/timeline"
    );
    await createTimelineEvent(supabase, user.id, {
      title: "Busca de vagas iniciada",
      description: "Estamos encontrando oportunidades compatíveis com seu perfil.",
      href: "/dashboard/vagas",
      event_kind: "job_found",
      actor: "ai",
      icon_name: "search",
      color_token: "blue",
    });

    await createSystemPostIfEnabled(supabase, user.id, "onboarding_completed");

    return {
      success: true,
      data: { suggestionsCount },
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function universalSearchAction(
  query: string
): Promise<ActionResult<UniversalSearchResult>> {
  try {
    const trimmed = query.trim();
    if (!trimmed) {
      return { success: false, error: "Digite uma busca." };
    }

    const { supabase, user } = await requireAuth();

    const platformResults = await searchPlatformEntities(supabase, trimmed);
    if (platformResults.items.length > 0 && !platformResults.looksLikeQuestion) {
      return {
        success: true,
        data: {
          type: "entities",
          items: platformResults.items.map((item) => ({
            type: item.type,
            label: item.label,
            subtitle: item.subtitle,
            href: item.href,
          })),
        },
      };
    }

    const rateError = enforceRateLimit(user.id);
    if (rateError) return rateError;

    if (!isGroqConfigured()) {
      if (platformResults.items.length > 0) {
        return {
          success: true,
          data: {
            type: "entities",
            items: platformResults.items.map((item) => ({
              type: item.type,
              label: item.label,
              subtitle: item.subtitle,
              href: item.href,
            })),
          },
        };
      }
      return {
        success: true,
        data: {
          type: "answer",
          content:
            "Configure GROQ_API_KEY para busca inteligente ou digite o nome de uma vaga, perfil ou empresa.",
        },
      };
    }

    const profile = await fetchProfileData(supabase, user.id);

    const raw = await chatCompletion(
      [
        {
          role: "system",
          content: `Você interpreta buscas no dashboard Jobera.
Rotas disponíveis: /dashboard, /dashboard/vagas, /dashboard/curriculo, /dashboard/objetivos, /dashboard/empregabilidade, /dashboard/entrevistas, /dashboard/mensagens, /dashboard/configuracoes.
Retorne JSON:
- { "type": "navigate", "href": "/dashboard/...", "message": "opcional" } para navegar
- { "type": "answer", "content": "resposta curta" } para perguntas gerais
Para vagas remotas/React/etc, use /dashboard/vagas com query params se fizer sentido.`,
        },
        {
          role: "user",
          content: `Busca: "${trimmed}"\n${buildJobeContext(profile)}`,
        },
      ],
      { jsonMode: true, temperature: 0.2 }
    );

    const parsed = universalSearchResponseSchema.parse(JSON.parse(raw));
    return { success: true, data: parsed };
  } catch (error) {
    return toActionError(error);
  }
}

export async function importGitHubProfileAction(
  username: string
): Promise<ActionResult<{ profile: ExtractedProfile }>> {
  try {
    const { user } = await requireAuth();
    const rateError = enforceRateLimit(user.id);
    if (rateError) return rateError;

    const { fetchGitHubProfile } = await import("@/lib/integrations/github/profile");
    const profile = await fetchGitHubProfile(username);
    return { success: true, data: { profile } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function importProfileTextAction(
  text: string
): Promise<ActionResult<{ profile: ExtractedProfile }>> {
  try {
    const trimmed = text.trim();
    if (trimmed.length < 50) {
      return { success: false, error: "Cole mais informações do perfil." };
    }

    const { user } = await requireAuth();
    const rateError = enforceRateLimit(user.id);
    if (rateError) return rateError;

    if (!isGroqConfigured()) {
      return { success: false, error: "IA indisponível. Configure GROQ_API_KEY." };
    }

    const raw = await chatCompletion(
      [
        {
          role: "system",
          content: `Extraia perfil profissional de texto colado (LinkedIn/export).
Retorne JSON com: name, currentRole, summary, avatarInitials, seniority, skills, experiences, languages, projects, certificates.`,
        },
        { role: "user", content: trimmed },
      ],
      { jsonMode: true, temperature: 0.1, maxTokens: 2048 }
    );

    const parsed = extractedProfileAiSchema.parse(JSON.parse(raw));
    return {
      success: true,
      data: { profile: mapAiProfileToExtracted(parsed) },
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function uploadResumeStorageAction(
  formData: FormData
): Promise<ActionResult<{ url: string; path: string }>> {
  try {
    const { supabase, user } = await requireAuth();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { success: false, error: "Arquivo obrigatório." };
    }

    const ext = file.name.split(".").pop() ?? "pdf";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.warn("[uploadResumeStorage]", uploadError.message);
    }

    const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(path);

    await supabase.from("resume_uploads").insert({
      user_id: user.id,
      original_filename: file.name,
      storage_url: urlData.publicUrl,
      mime_type: file.type,
      file_size_bytes: file.size,
      status: "completed",
    });

    return { success: true, data: { url: urlData.publicUrl, path } };
  } catch (error) {
    return toActionError(error);
  }
}

