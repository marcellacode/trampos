import type { ExtractedProfile } from "@/types/onboarding";
import { EMPTY_PROFILE } from "@/lib/onboarding/constants";

export function buildScratchProfile(): ExtractedProfile {
  return { ...EMPTY_PROFILE };
}
