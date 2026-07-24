"use client";

import { useQuery } from "@tanstack/react-query";
import { MOCK_DASHBOARD } from "@/lib/dashboard/constants";
import type { DashboardData } from "@/types/dashboard";

async function fetchDashboard(): Promise<DashboardData> {
  // Simulated latency — ready to swap for Server Actions / Supabase / OpenAI
  await new Promise((resolve) => setTimeout(resolve, 900));
  return MOCK_DASHBOARD;
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 60_000,
  });
}

export function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
