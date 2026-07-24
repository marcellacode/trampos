"use client";

import { useQuery } from "@tanstack/react-query";
import { EMPTY_DASHBOARD } from "@/lib/dashboard/empty-data";
import type { DashboardData } from "@/types/dashboard";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { fetchDashboardData } from "@/lib/supabase/queries/dashboard";
import { getCurrentUserId } from "@/lib/supabase/queries/profile";

async function fetchDashboard(): Promise<DashboardData> {
  const supabase = createBrowserSupabaseClient();
  const userId = await getCurrentUserId(supabase);
  return fetchDashboardData(supabase, userId);
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

  return {
    ...query,
    shell: query.data ?? EMPTY_DASHBOARD,
  };
}

export { useLiveTimeline } from "@/lib/dashboard/use-live-timeline";

export function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
