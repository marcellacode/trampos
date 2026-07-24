"use client";

import { useQuery } from "@tanstack/react-query";
import type { DiscoveryData, JobDetail } from "@/types/jobs";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { fetchDiscoveryData } from "@/lib/supabase/queries/discovery";
import { fetchJobById } from "@/lib/supabase/queries/jobs";
import { getCurrentUserId } from "@/lib/supabase/queries/profile";

async function fetchDiscovery(): Promise<DiscoveryData> {
  const supabase = createBrowserSupabaseClient();
  const userId = await getCurrentUserId(supabase);
  return fetchDiscoveryData(supabase, userId);
}

async function fetchJob(id: string): Promise<JobDetail | null> {
  const supabase = createBrowserSupabaseClient();
  const userId = await getCurrentUserId(supabase);
  return fetchJobById(supabase, id, userId);
}

export function useDiscovery() {
  return useQuery({
    queryKey: ["discovery"],
    queryFn: fetchDiscovery,
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
