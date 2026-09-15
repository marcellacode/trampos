"use server";

import { chatCompletion } from "@/lib/ai/groq";
import { isGroqConfigured } from "@/lib/ai/env";
import { extractedProfileAiSchema, mapAiProfileToExtracted } from "@/lib/ai/schemas";
import { requireAuth } from "@/lib/auth/require-auth";
import type { ExtractedProfile } from "@/types/onboarding";

type SocialProvider = "github" | "linkedin";
type Result = { success: true; data: { profile: ExtractedProfile } } | { success: false; error: string };

export async function importConnectedSocialProfileAction(provider: SocialProvider): Promise<Result> {
  try {
    const { user } = await requireAuth();
    const identity = user.identities?.find((item) => provider === "github" ? item.provider === "github" : item.provider === "linkedin_oidc");
    if (!identity) return { success: false, error: `Conecte sua conta ${provider === "github" ? "GitHub" : "LinkedIn"} para importar o perfil.` };

    const metadata = { ...user.user_metadata, ...identity.identity_data } as Record<string, unknown>;
    const username = String(metadata.user_name ?? metadata.preferred_username ?? "").replace(/^@/, "");

    let source: unknown = metadata;
    if (provider === "github" && username) {
      const { fetchGitHubProfile } = await import("@/lib/integrations/github/profile");
      source = await fetchGitHubProfile(username);
    }

    if (!isGroqConfigured()) {
      if (provider === "github" && source && typeof source === "object" && "skills" in source) return { success: true, data: { profile: source as ExtractedProfile } };
      return { success: false, error: "IA indisponível para analisar o perfil social." };
    }

    const raw = await chatCompletion([
      { role: "system", content: `Você configura perfis profissionais da Jobera a partir de dados autorizados de uma conta ${provider}. Retorne JSON com name, currentRole, summary, avatarInitials, seniority, skills, experiences, languages, projects e certificates. Não invente experiências, formação, senioridade ou competências que não possam ser sustentadas pelos dados. Para GitHub, interprete tecnologias e projetos pelo contexto dos repositórios. Para LinkedIn, use somente os campos realmente disponibilizados pelo OpenID Connect.` },
      { role: "user", content: JSON.stringify(source) },
    ], { jsonMode: true, temperature: 0.1, maxTokens: 2048 });

    const parsed = extractedProfileAiSchema.parse(JSON.parse(raw));
    return { success: true, data: { profile: mapAiProfileToExtracted(parsed) } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Não foi possível analisar o perfil conectado." };
  }
}
