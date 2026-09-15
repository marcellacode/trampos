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
import { createChatMessage, listChatMessagesByContext } from "@/lib/supabase/queries/mutations/chat";
import type { Database } from "@/lib/supabase/database.types";
import type { ExtractedProfile, GoalChip } from "@/types/onboarding";

export type ChatContext = Database["public"]["Enums"]["chat_context"];
export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError || error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string") return (error as { message: string }).message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}
function toActionError(error: unknown): ActionResult<never> { return { success: false, error: getErrorMessage(error) }; }

async function loadChatJobSummaries(supabase: Awaited<ReturnType<typeof requireAuth>>["supabase"], userId: string) {
  try { const jobCards = await fetchJobCardsForUser(supabase, userId, 8); return jobCards.map((job) => ({ title: job.role, company: job.company, location: job.location, salary: job.salary, remote: /remot/i.test(job.location), compatibility: job.compatibility, href: job.href })); }
  catch (error) { console.error("[jobeChatAction] jobs fetch failed:", error); return []; }
}
async function loadChatHistory(supabase: Awaited<ReturnType<typeof requireAuth>>["supabase"], userId: string, context: ChatContext) {
  try { return await listChatMessagesByContext(supabase, userId, context); }
  catch (error) { console.error("[jobeChatAction] history fetch failed:", error); return []; }
}
function enforceRateLimit(userId: string): ActionResult<never> | null {
  const { allowed, retryAfterMs } = checkRateLimit(userId); if (allowed) return null;
  return { success: false, error: `Muitas requisições. Aguarde ${Math.ceil((retryAfterMs ?? 60_000) / 1000)}s e tente novamente.` };
}

export async function jobeChatAction(message: string, context: ChatContext = "dashboard"): Promise<ActionResult<{ content: string }>> {
  try {
    const trimmed = message.trim(); if (!trimmed) return { success: false, error: "Digite uma mensagem." };
    const { supabase, user } = await requireAuth(); const rateError = enforceRateLimit(user.id); if (rateError) return rateError;
    if (!isGroqConfigured()) return { success: false, error: "A IA do Jobe não está configurada. Adicione GROQ_API_KEY ao servidor." };
    let profile: ExtractedProfile | null = null; try { profile = await fetchProfileData(supabase, user.id); } catch (error) { console.error("[jobeChatAction] profile fetch failed:", error); }
    const [{ data: profileGoals }, jobSummaries, history] = await Promise.all([supabase.from("profiles").select("goal_role, goal_location, goal_salary, goal_availability_label").eq("id", user.id).maybeSingle(), loadChatJobSummaries(supabase, user.id), loadChatHistory(supabase, user.id, context)]);
    const systemContent = `${JOBE_SYSTEM_PROMPT}\n\n${buildJobeContext(profile, jobSummaries, profileGoals ? { role: profileGoals.goal_role || undefined, location: profileGoals.goal_location || undefined, salary: profileGoals.goal_salary || undefined, availability: profileGoals.goal_availability_label || undefined } : undefined)}`;
    const chatMessages: ChatMessage[] = [{ role: "system", content: systemContent }, ...history.slice(-10).filter((msg) => msg.role === "user" || msg.role === "assistant").map((msg) => ({ role: msg.role as "user" | "assistant", content: msg.content })), { role: "user", content: trimmed }];
    const content = await chatCompletion(chatMessages);
    try { await createChatMessage(supabase, user.id, { context, role: "user", content: trimmed }); await createChatMessage(supabase, user.id, { context, role: "assistant", content }); } catch (persistError) { console.error("[jobeChatAction] persist failed:", persistError); }
    return { success: true, data: { content } };
  } catch (error) { return toActionError(error); }
}

export async function interpretGoalsAction(text: string): Promise<ActionResult<{ chips: GoalChip[] }>> {
  try {
    const trimmed = text.trim(); if (trimmed.length < 10) return { success: true, data: { chips: [] } };
    const { user } = await requireAuth(); const rateError = enforceRateLimit(user.id); if (rateError) return rateError;
    if (!isGroqConfigured()) return { success: true, data: { chips: parseGoalText(trimmed) } };
    try {
      const raw = await chatCompletion([{ role: "system", content: `Você interpreta objetivos de carreira em português brasileiro.\nRetorne JSON: { "chips": [{ "label": string, "category": "skill"|"role"|"location"|"salary"|"contract"|"model" }] }\nExtraia habilidades, cargo desejado, localização, salário, tipo de contrato e modelo de trabalho.\nMáximo 12 chips. Labels curtos em PT-BR.` }, { role: "user", content: trimmed }], { jsonMode: true, temperature: 0.2 });
      const parsed = interpretGoalsResponseSchema.parse(JSON.parse(raw)); return { success: true, data: { chips: mapAiChipsToGoalChips(parsed.chips) } };
    } catch { return { success: true, data: { chips: parseGoalText(trimmed) } }; }
  } catch (error) { return toActionError(error); }
}

export async function parseResumeAction(formData: FormData): Promise<ActionResult<{ profile: ExtractedProfile }>> {
  try {
    const { user } = await requireAuth(); const rateError = enforceRateLimit(user.id); if (rateError) return rateError;
    const file = formData.get("file");
    if (!(file instanceof File)) return { success: false, error: "Arquivo obrigatório." };
    console.info("[resume.start]", { type: file.type || "unknown", size: file.size });

    const extracted = await extractResumeText(file);
    if ("error" in extracted) { console.error("[resume.extract]", extracted.error); return { success: false, error: extracted.error }; }
    console.info("[resume.extract] success", { chars: extracted.text.length });

    if (!isGroqConfigured()) { console.error("[resume.ai] GROQ_API_KEY missing"); return { success: false, error: "A análise por IA está temporariamente indisponível." }; }

    let raw: string;
    try {
      raw = await chatCompletion([
        { role: "system", content: `Você é um extrator de currículos. Responda SOMENTE com um objeto JSON válido.\nCampos: name, currentRole, summary, avatarInitials, seniority, skills, experiences, languages, projects, certificates.\nUse strings vazias e arrays vazios quando um dado não existir.\nexperiences: [{company, role, period, description}]\nlanguages: [{name, level}]\nprojects: [{name, description, tech}]\ncertificates: [{name, issuer, year}]\nNão invente dados. Preserve nomes próprios, empresas, cargos, tecnologias, idiomas, cursos e certificações presentes no currículo.` },
        { role: "user", content: extracted.text },
      ], { jsonMode: true, temperature: 0, maxTokens: 4096 });
      console.info("[resume.ai] success", { responseChars: raw.length });
    } catch (error) {
      console.error("[resume.ai] failed", getErrorMessage(error));
      return { success: false, error: "Não foi possível analisar o currículo com a IA. Tente novamente em instantes." };
    }

    let json: unknown;
    try { json = JSON.parse(raw); }
    catch (error) { console.error("[resume.json] invalid response", getErrorMessage(error)); return { success: false, error: "A IA retornou uma análise inválida. Tente novamente." }; }

    const candidate = json && typeof json === "object" ? json as Record<string, unknown> : {};
    if (typeof candidate.name !== "string" || !candidate.name.trim()) {
      const firstUsefulLine = extracted.text.split(/\r?\n/).map((line) => line.trim()).find((line) => line.length >= 3 && line.length <= 100 && !/@|https?:|www\./i.test(line));
      candidate.name = firstUsefulLine || "Perfil importado";
    }
    const parsedResult = extractedProfileAiSchema.safeParse(candidate);
    if (!parsedResult.success) {
      console.error("[resume.schema] invalid AI payload", parsedResult.error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code })));
      return { success: false, error: "A IA não conseguiu estruturar todos os dados do currículo. Tente novamente." };
    }
    console.info("[resume.schema] success");
    return { success: true, data: { profile: mapAiProfileToExtracted(parsedResult.data) } };
  } catch (error) {
    console.error("[resume.unexpected]", getErrorMessage(error));
    return { success: false, error: "Não foi possível processar o currículo. Tente novamente." };
  }
}

const onboardingPayloadSchema = z.object({ event: z.string(), profileId: z.string(), importMethod: z.string().nullable(), goalText: z.string().optional() });
export async function processOnboardingCompleteAction(payload: z.infer<typeof onboardingPayloadSchema>): Promise<ActionResult<{ suggestionsCount: number }>> {
  try {
    const { supabase, user } = await requireAuth(); const data = onboardingPayloadSchema.parse(payload); if (data.profileId !== user.id) return { success: false, error: "Perfil inválido." }; const rateError = enforceRateLimit(user.id); if (rateError) return rateError; let suggestionsCount = 0;
    if (isGroqConfigured()) {
      const profile = await fetchProfileData(supabase, user.id);
      if (profile) {
        const goalContext = data.goalText ? `\nMetas: ${data.goalText}` : "";
        const raw = await chatCompletion([{ role: "system", content: `Você enriquece perfis profissionais para a Jobera.\nRetorne JSON: {\n  "predominantProfile": string,\n  "strengths": string[] (3-5 pontos fortes),\n  "suggestions": [{ "title", "description", "actionLabel", "type": "github"|"linkedin"|"skill"|"project"|"experience" }] (2-4 sugestões)\n}\nBaseie-se apenas no perfil real. PT-BR.` }, { role: "user", content: `${buildJobeContext(profile)}${goalContext}\nMétodo de importação: ${data.importMethod ?? "desconhecido"}` }], { jsonMode: true, temperature: 0.4 });
        const parsed = onboardingCompleteResponseSchema.parse(JSON.parse(raw)); suggestionsCount = parsed.suggestions.length;
        await supabase.from("profile_ai_suggestions").delete().eq("user_id", user.id);
        if (parsed.suggestions.length > 0) { const { error } = await supabase.from("profile_ai_suggestions").insert(parsed.suggestions.map((suggestion) => ({ user_id: user.id, title: suggestion.title, description: suggestion.description, action_label: suggestion.actionLabel, suggestion_type: suggestion.type }))); if (error) throw error; }
        if (parsed.predominantProfile || parsed.strengths.length > 0) {
          const { data: existingDna } = await supabase.from("professional_dna").select("id").eq("user_id", user.id).maybeSingle(); if (existingDna?.id) await supabase.from("dna_strengths").delete().eq("dna_id", existingDna.id);
          const { data: dnaRow, error: dnaError } = await supabase.from("professional_dna").upsert({ user_id: user.id, predominant_profile: parsed.predominantProfile ?? profile.currentRole ?? "Perfil em construção", with_skills_label: "novas competências" }, { onConflict: "user_id" }).select("id").single(); if (dnaError) throw dnaError;
          if (parsed.strengths.length > 0) { const { error: strengthsError } = await supabase.from("dna_strengths").insert(parsed.strengths.map((strength, index) => ({ dna_id: dnaRow.id, strength, sort_order: index }))); if (strengthsError) throw strengthsError; }
        }
      }
    }
    try { const { syncUserMatchesAction } = await import("@/lib/matching/match-action"); await syncUserMatchesAction(); } catch (syncError) { console.warn("[onboarding] match sync failed:", syncError); }
    const { emitCareerEvent } = await import("@/lib/career/event-bus"); await emitCareerEvent(supabase, user.id, "onboarding_completed"); await emitCareerEvent(supabase, user.id, "profile_updated"); return { success: true, data: { suggestionsCount } };
  } catch (error) { return toActionError(error); }
}

export async function universalSearchAction(query: string): Promise<ActionResult<UniversalSearchResult>> {
  try {
    const trimmed = query.trim(); if (!trimmed) return { success: false, error: "Digite uma busca." }; const { supabase, user } = await requireAuth(); const platformResults = await searchPlatformEntities(supabase, trimmed);
    if (platformResults.items.length > 0 && !platformResults.looksLikeQuestion) return { success: true, data: { type: "entities", items: platformResults.items.map((item) => ({ type: item.type, label: item.label, subtitle: item.subtitle, href: item.href })) } };
    const rateError = enforceRateLimit(user.id); if (rateError) return rateError;
    if (!isGroqConfigured()) { if (platformResults.items.length > 0) return { success: true, data: { type: "entities", items: platformResults.items.map((item) => ({ type: item.type, label: item.label, subtitle: item.subtitle, href: item.href })) } }; return { success: false, error: "Busca por IA indisponível no momento." }; }
    const raw = await chatCompletion([{ role: "system", content: "Responda a busca profissional em JSON válido com type, answer e items quando aplicável." }, { role: "user", content: trimmed }], { jsonMode: true, temperature: 0.2 });
    return { success: true, data: universalSearchResponseSchema.parse(JSON.parse(raw)) };
  } catch (error) { return toActionError(error); }
}

export async function uploadResumeStorageAction(formData: FormData): Promise<ActionResult<{ url: string; path: string }>> {
  try {
    const { supabase, user } = await requireAuth(); const file = formData.get("file"); if (!(file instanceof File)) return { success: false, error: "Arquivo obrigatório." };
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf"; const path = `${user.id}/${Date.now()}-resume.${ext}`; const { error } = await supabase.storage.from("resumes").upload(path, file, { upsert: true, contentType: file.type || undefined }); if (error) throw error;
    const { data } = supabase.storage.from("resumes").getPublicUrl(path); return { success: true, data: { url: data.publicUrl, path } };
  } catch (error) { return toActionError(error); }
}
