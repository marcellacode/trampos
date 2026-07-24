"use client";

import { useQuery } from "@tanstack/react-query";
import type { DiscoveryData, JobDetail } from "@/types/jobs";
import { EMPTY_DISCOVERY } from "@/lib/jobs/empty-data";
import { getJobDetail } from "@/lib/jobs/job-details";

async function fetchDiscovery(): Promise<DiscoveryData> {
  // TODO: Server Actions / Supabase — return real job discovery data
  await new Promise((r) => setTimeout(r, 300));
  return EMPTY_DISCOVERY;
}

async function fetchJob(id: string): Promise<JobDetail | null> {
  await new Promise((r) => setTimeout(r, 200));
  return getJobDetail(id) ?? null;
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
