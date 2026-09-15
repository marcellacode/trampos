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

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

function linkedinFallback(metadata: Record<string, unknown>, email?: string): ExtractedProfile {
  const givenName = text(metadata.given_name);
  const familyName = text(metadata.family_name);
  const name = text(metadata.full_name) || text(metadata.name) || [givenName, familyName].filter(Boolean).join(" ") || text(metadata.preferred_username) || email?.split("@")[0] || "Perfil LinkedIn";
  const headline = text(metadata.headline) || text(metadata.job_title) || text(metadata.title);
  const summary = text(metadata.summary) || text(metadata.bio) || text(metadata.description);

  return {
    name,
    currentRole: headline,
    summary,
    avatarInitials: initials(name),
    seniority: "",
    skills: [],
    experiences: [],
    languages: [],
    projects: [],
    certificates: [],
  };
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

    const metadata = {
      ...user.user_metadata,
      ...(identity?.identity_data ?? {}),
    } as Record<string, unknown>;

    const username = String(metadata.user_name ?? metadata.preferred_username ?? "").replace(/^@/, "");
    let source: unknown = metadata;
    const fallback = provider === "linkedin" ? linkedinFallback(metadata, user.email) : null;

    if (provider === "github" && username) {
      const { fetchGitHubProfile } = await import("@/lib/integrations/github/profile");
      source = await fetchGitHubProfile(username);
    }

    if (!isGroqConfigured()) {
      if (provider === "github" && source && typeof source === "object" && "skills" in source) {
        return { success: true, data: { profile: source as ExtractedProfile } };
      }
      if (fallback) return { success: true, data: { profile: fallback } };
      return { success: false, error: "IA indisponível para analisar o perfil social." };
    }

    const instructions = provider === "github"
      ? "Analise os dados autorizados do GitHub para configurar um perfil profissional no Jobera. Use perfil, linguagens e repositórios como evidências para identificar competências e projetos. Não deduza emprego ou senioridade apenas pela quantidade de repositórios."
      : "Analise os claims autorizados do LinkedIn OpenID Connect para configurar um perfil no Jobera. Preserve o nome real recebido. O LinkedIn OIDC pode fornecer apenas identidade básica; campos profissionais ausentes DEVEM ser strings vazias ou arrays vazios. Não use null. Nunca invente cargo, empresa, experiência, senioridade, competência, formação, idioma ou certificado.";

    try {
      const raw = await chatCompletion([
        {
          role: "system",
          content: `${instructions}\nRetorne SOMENTE um objeto JSON válido. Todos estes campos são obrigatórios: name (string não vazia), currentRole (string), summary (string), avatarInitials (string), seniority (string), skills (string[]), experiences ({company:string,role:string,period:string,description:string}[]), languages ({name:string,level:string}[]), projects ({name:string,description:string,tech:string[]}[]) e certificates ({name:string,issuer:string,year:string}[]). Nunca retorne null; quando não houver evidência use "" ou [].`,
        },
        {
          role: "user",
          content: `Dados autorizados do provider ${provider}:\n${JSON.stringify(source)}`,
        },
      ], { jsonMode: true, temperature: 0.05, maxTokens: 2048 });

      const json = JSON.parse(raw) as Record<string, unknown>;
      if (provider === "linkedin" && fallback && !text(json.name)) json.name = fallback.name;
      const parsed = extractedProfileAiSchema.parse(json);
      return { success: true, data: { profile: mapAiProfileToExtracted(parsed) } };
    } catch (aiError) {
      console.error(`[onboarding/social-import/ai] ${provider}:`, aiError);
      // LinkedIn OIDC often exposes only basic identity claims. A malformed AI
      // response must not make a successful OAuth import look like a connection
      // failure; continue with the verified claims and let the user review/edit.
      if (fallback) return { success: true, data: { profile: fallback } };
      throw aiError;
    }
  } catch (error) {
    console.error(`[onboarding/social-import] ${provider}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Não foi possível analisar o perfil conectado." };
  }
}
