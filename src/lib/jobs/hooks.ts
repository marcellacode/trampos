"use client";

import { useQuery } from "@tanstack/react-query";
import type { DiscoveryData } from "@/types/jobs";
import { MOCK_DISCOVERY } from "@/lib/jobs/constants";

async function fetchDiscovery(): Promise<DiscoveryData> {
  await new Promise((r) => setTimeout(r, 600));
  return MOCK_DISCOVERY;
}

export function useDiscovery() {
  return useQuery({
    queryKey: ["discovery"],
    queryFn: fetchDiscovery,
    staleTime: 60_000,
  });
}
