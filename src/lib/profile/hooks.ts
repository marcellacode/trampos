"use client";

import { useQuery } from "@tanstack/react-query";
import type { ExtractedProfile } from "@/types/onboarding";
import { EMPTY_PROFILE } from "@/lib/onboarding/constants";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  fetchProfileData,
  getCurrentUserId,
} from "@/lib/supabase/queries/profile";

async function fetchProfile(): Promise<ExtractedProfile | null> {
  const supabase = createBrowserSupabaseClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) return null;
  return fetchProfileData(supabase, userId);
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    staleTime: 60_000,
  });
}

export function useProfileOrEmpty() {
  const query = useProfile();
  return {
    ...query,
    profile: query.data ?? EMPTY_PROFILE,
    hasProfile: Boolean(query.data?.name),
  };
}
