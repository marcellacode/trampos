/**
 * Integration stubs for onboarding.
 * Frontend-only — wire real SDKs / webhooks when backend is ready.
 *
 * Planned providers:
 * - Supabase (auth + profile persistence)
 * - OpenAI / Anthropic (CV parsing, goal interpretation, suggestions)
 * - GitHub API (repos, languages, README)
 * - LinkedIn API (profile import)
 * - Google Drive (document fetch)
 * - Cloudinary (resume / avatar storage)
 * - n8n Webhooks (orchestration pipelines)
 */

import type {
  ExtractedProfile,
  GoalChip,
  ImportMethod,
  OnboardingData,
} from "@/types/onboarding";
import { MOCK_EXTRACTED_PROFILE } from "@/lib/onboarding/constants";
import { parseGoalText } from "@/lib/onboarding/goal-parser";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function importLinkedInProfile(): Promise<ExtractedProfile> {
  // TODO: OAuth LinkedIn → n8n webhook → OpenAI extraction → Supabase
  await delay(1200);
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw Object.assign(new Error("offline"), { code: "offline" });
  }
  return {
    ...MOCK_EXTRACTED_PROFILE,
    summary:
      "Perfil importado do LinkedIn. Front-end com trajetória sólida em produtos digitais.",
  };
}

export async function importGitHubProfile(
  username = "demo"
): Promise<ExtractedProfile> {
  // TODO: GitHub OAuth / public API → languages + README → Anthropic summary
  await delay(1200);
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw Object.assign(new Error("offline"), { code: "offline" });
  }
  return {
    ...MOCK_EXTRACTED_PROFILE,
    name: username === "demo" ? MOCK_EXTRACTED_PROFILE.name : username,
    projects: MOCK_EXTRACTED_PROFILE.projects.map((p) => ({
      ...p,
      stars: (p.stars ?? 0) + 12,
    })),
    summary:
      "Perfil enriquecido com análise de repositórios, linguagens e READMEs do GitHub.",
  };
}

export async function uploadResumeToCloudinary(
  file: File
): Promise<{ url: string; publicId: string }> {
  // TODO: Cloudinary signed upload
  await delay(800);
  return {
    url: `https://res.cloudinary.com/demo/raw/upload/${encodeURIComponent(file.name)}`,
    publicId: `resumes/${Date.now()}`,
  };
}

export async function parseResumeWithAI(
  _file: File
): Promise<ExtractedProfile> {
  // TODO: Upload → OpenAI/Anthropic document understanding → structured JSON
  await delay(500);
  return MOCK_EXTRACTED_PROFILE;
}

export async function interpretGoalsWithAI(
  text: string
): Promise<GoalChip[]> {
  // TODO: OpenAI structured output for intent parsing
  await delay(400);
  return parseGoalText(text);
}

export async function persistOnboardingProfile(
  data: OnboardingData
): Promise<{ id: string }> {
  // TODO: Supabase upsert into profiles + preferences tables
  await delay(600);
  return { id: `profile_${Date.now()}` };
}

export async function triggerN8nOnboardingWebhook(
  payload: Record<string, unknown>
): Promise<void> {
  // TODO: POST to n8n webhook URL
  await delay(200);
  void payload;
}

export async function fetchGoogleDriveDocument(
  _fileId: string
): Promise<Blob> {
  // TODO: Google Drive API
  throw new Error("Google Drive integration not configured yet.");
}

export function buildScratchProfile(): ExtractedProfile {
  return {
    name: "Seu Nome",
    currentRole: "Profissional em transição",
    summary:
      "Estamos construindo seu perfil do zero. Complete as próximas etapas para a IA conhecer sua carreira.",
    avatarInitials: "EU",
    experiences: [],
    skills: [],
    languages: [{ id: "lang-pt", name: "Português", level: "Nativo" }],
    projects: [],
    certificates: [],
    seniority: "A definir",
  };
}

export async function resolveImport(
  method: ImportMethod,
  file?: File | null
): Promise<ExtractedProfile> {
  switch (method) {
    case "linkedin":
      return importLinkedInProfile();
    case "github":
      return importGitHubProfile();
    case "resume":
      if (!file) throw Object.assign(new Error("missing_file"), { code: "invalid_file" });
      await uploadResumeToCloudinary(file);
      return parseResumeWithAI(file);
    case "scratch":
      return buildScratchProfile();
    default:
      throw Object.assign(new Error("unknown"), { code: "unknown" });
  }
}
