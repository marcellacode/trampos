"use server";

import { chatCompletion } from "@/lib/ai/groq";
import { isGroqConfigured } from "@/lib/ai/env";
import { extractedProfileAiSchema, mapAiProfileToExtracted } from "@/lib/ai/schemas";
import { requireAuth } from "@/lib/auth/require-auth";
import type { ExtractedProfile } from "@/types/onboarding";

type SocialProvider = "github" | "linkedin";
type Result = { success: true; data: { profile: ExtractedProfile } } | { success: false; error: string };

function providerMatches(actual: string | undefined, requested: SocialProvider) {
  if (!actual) return false;
  return requested === "github"
    ? actual === "github"
    : actual === "linkedin_oidc" || actual === "linkedin";
}

export async function importConnectedSocialProfileAction(provider: SocialProvider): Promise<Result> {
  try {
    const { user } = await requireAuth();
    const identity = user.identities?.find((item) => providerMatches(item.provider, provider));
    const appProvider = typeof user.app_metadata?.provider === "string" ? user.app_metadata.provider : undefined;
    const appProviders = Array.isArray(user.app_metadata?.providers)
      ? user.app_metadata.providers.filter((value): value is string => typeof value === "string")
      : [];
    const isConnected = Boolean(identity) || providerMatches(appProvider, provider) || appProviders.some((value) => providerMatches(value, provider));

    if (!isConnected) {
      return { success: false, error: `Conecte sua conta ${provider === "github" ? "GitHub" : "LinkedIn"} para importar o perfil.` };
    }

    // Supabase may expose OIDC claims in user_metadata even when the provider
    // identity is not present in user.identities (for example after automatic
    // identity linking). Merge both sources instead of treating that as a
    // failed LinkedIn import.
    const metadata = {
      ...user.user_metadata,
      ...(identity?.identity_data ?? {}),
    } as Record<string, unknown>;

    const username = String(metadata.user_name ?? metadata.preferred_username ?? "").replace(/^@/, "");
    let source: unknown = metadata;

    if (provider === "github" && username) {
      const { fetchGitHubProfile } = await import("@/lib/integrations/github/profile");
      source = await fetchGitHubProfile(username);
    }

    if (!isGroqConfigured()) {
      if (provider === "github" && source && typeof source === "object" && "skills" in source) {
        return { success: true, data: { profile: source as ExtractedProfile } };
      }
      return { success: false, error: "IA indisponível para analisar o perfil social." };
    }

    const instructions = provider === "github"
      ? `Analise os dados autorizados do GitHub para configurar um perfil profissional no Jobera. Use perfil, linguagens e repositórios como evidências para identificar competências e projetos. Não deduza emprego ou senioridade apenas pela quantidade de repositórios.`
      : `Analise os dados autorizados do LinkedIn via OpenID Connect para configurar um perfil profissional no Jobera. O OIDC do LinkedIn normalmente fornece identidade básica, como nome, email e foto, e pode não fornecer experiências, competências, formação ou cargo. Extraia tudo que estiver realmente presente nos dados recebidos, mas deixe campos sem evidência vazios. Nunca invente histórico profissional, cargo, senioridade, skills, formação, certificados ou empresas.`;

    const raw = await chatCompletion([
      {
        role: "system",
        content: `${instructions}\nRetorne SOMENTE JSON válido com: name, currentRole, summary, avatarInitials, seniority, skills, experiences, languages, projects e certificates. experiences deve conter company, role, period e description; languages deve conter name e level; projects deve conter name, description e tech; certificates deve conter name, issuer e year.`,
      },
      {
        role: "user",
        content: `Dados autorizados do provider ${provider}:\n${JSON.stringify(source)}`,
      },
    ], { jsonMode: true, temperature: 0.05, maxTokens: 2048 });

    const parsed = extractedProfileAiSchema.parse(JSON.parse(raw));
    return { success: true, data: { profile: mapAiProfileToExtracted(parsed) } };
  } catch (error) {
    console.error(`[onboarding/social-import] ${provider}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Não foi possível analisar o perfil conectado." };
  }
}
