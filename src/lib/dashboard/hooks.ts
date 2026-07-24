"use client";

import { useQuery } from "@tanstack/react-query";
import { EMPTY_DASHBOARD } from "@/lib/dashboard/empty-data";
import type { DashboardData } from "@/types/dashboard";

async function fetchDashboard(): Promise<DashboardData> {
  // TODO: Server Actions / Supabase — return real user dashboard data
  await new Promise((resolve) => setTimeout(resolve, 300));
  return EMPTY_DASHBOARD;
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 60_000,
  });
}

export function useDashboardShell() {
  const query = useDashboard();
  const shell = query.data ?? EMPTY_DASHBOARD;

  return {
    ...query,
    shell,
  };
}

export { useLiveTimeline } from "@/lib/dashboard/use-live-timeline";

export function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
