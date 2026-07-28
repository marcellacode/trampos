"use client";

import { useQuery } from "@tanstack/react-query";
import type { DiscoveryData, JobDetail } from "@/types/jobs";
import {
  fetchAdzunaJobDetailAction,
  fetchDiscoveryAction,
} from "@/app/actions/adzuna";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { fetchJobById } from "@/lib/supabase/queries/jobs";
import { getCurrentUserId } from "@/lib/supabase/queries/profile";
import { parseAdzunaJobId } from "@/lib/integrations/adzuna/mapper";

async function fetchDiscovery(searchQuery?: string): Promise<DiscoveryData> {
  const result = await fetchDiscoveryAction(
    searchQuery?.trim() ? { what: searchQuery.trim() } : {}
  );
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}

async function fetchJob(id: string): Promise<JobDetail | null> {
  if (parseAdzunaJobId(id)) {
    const result = await fetchAdzunaJobDetailAction(id);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  }

  const supabase = createBrowserSupabaseClient();
  const userId = await getCurrentUserId(supabase);
  return fetchJobById(supabase, id, userId);
}

export function useDiscovery(searchQuery?: string) {
  return useQuery({
    queryKey: ["discovery", searchQuery ?? ""],
    queryFn: () => fetchDiscovery(searchQuery),
    staleTime: 60_000,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => fetchJob(id),
    staleTime: 60_000,
    enabled: Boolean(id),
  });
}
