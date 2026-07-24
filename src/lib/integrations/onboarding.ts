/**
 * Onboarding integrations wired to Supabase + Groq Server Actions.
 */

import type {
  ExtractedProfile,
  GoalChip,
  ImportMethod,
  OnboardingData,
} from "@/types/onboarding";
import {
  interpretGoalsAction,
  parseResumeAction,
  processOnboardingCompleteAction,
} from "@/app/actions/ai";
import { buildScratchProfile } from "@/lib/integrations/onboarding-scratch";
import { parseGoalText } from "@/lib/onboarding/goal-parser";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  getCurrentUserId,
  persistOnboardingProfileToSupabase,
} from "@/lib/supabase/queries/profile";

export async function importLinkedInProfile(): Promise<ExtractedProfile> {
  await delay(800);
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw Object.assign(new Error("offline"), { code: "offline" });
  }
  throw Object.assign(new Error("linkedin_failed"), { code: "linkedin_failed" });
}

export async function importGitHubProfile(
  _username?: string
): Promise<ExtractedProfile> {
  await delay(800);
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw Object.assign(new Error("offline"), { code: "offline" });
  }
  throw Object.assign(new Error("github_failed"), { code: "github_failed" });
}

export async function uploadResumeToCloudinary(
  file: File
): Promise<{ url: string; publicId: string }> {
  await delay(300);
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw Object.assign(new Error("offline"), { code: "offline" });
  }
  void file;
  return { url: "", publicId: "" };
}

export async function parseResumeWithAI(
  file: File
): Promise<ExtractedProfile> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw Object.assign(new Error("offline"), { code: "offline" });
  }

  const formData = new FormData();
  formData.set("file", file);

  const result = await parseResumeAction(formData);
  if (!result.success) {
    throw Object.assign(new Error("upload_failed"), {
      code: "upload_failed",
      message: result.error,
    });
  }

  return result.data.profile;
}

export async function interpretGoalsWithAI(
  text: string
): Promise<GoalChip[]> {
  const result = await interpretGoalsAction(text);
  if (!result.success) {
    return parseGoalText(text);
  }
  return result.data.chips.length > 0
    ? result.data.chips
    : parseGoalText(text);
}

export async function persistOnboardingProfile(
  data: OnboardingData
): Promise<{ id: string }> {
  const supabase = createBrowserSupabaseClient();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    throw Object.assign(new Error("auth_required"), { code: "auth_required" });
  }

  return persistOnboardingProfileToSupabase(supabase, userId, data);
}

export async function processOnboardingComplete(
  payload: Record<string, unknown>
): Promise<void> {
  const result = await processOnboardingCompleteAction({
    event: String(payload.event ?? "onboarding.completed"),
    profileId: String(payload.profileId ?? ""),
    importMethod:
      payload.importMethod != null ? String(payload.importMethod) : null,
    goalText:
      payload.goalText != null ? String(payload.goalText) : undefined,
  });

  if (!result.success) {
    console.warn("[onboarding] processOnboardingComplete:", result.error);
  }
}

/** @deprecated Use processOnboardingComplete */
export const triggerN8nOnboardingWebhook = processOnboardingComplete;

export async function fetchGoogleDriveDocument(
  _fileId: string
): Promise<Blob> {
  throw new Error("Google Drive integration not configured yet.");
}

export { buildScratchProfile } from "@/lib/integrations/onboarding-scratch";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
      if (!file) {
        throw Object.assign(new Error("missing_file"), { code: "invalid_file" });
      }
      await uploadResumeToCloudinary(file);
      return parseResumeWithAI(file);
    case "scratch":
      return buildScratchProfile();
    default:
      throw Object.assign(new Error("unknown"), { code: "unknown" });
  }
}
