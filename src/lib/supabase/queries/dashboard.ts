import type { SupabaseClient } from "@supabase/supabase-js";
import { EMPTY_DASHBOARD } from "@/lib/dashboard/empty-data";
import type { DashboardData } from "@/types/dashboard";
import {
  isDemoCatalogCompanyId,
  isDemoCatalogJobId,
} from "@/lib/catalog/demo-ids";
import {
  assembleDashboardData,
  mapAiSuggestions,
  mapChatMessages,
  mapEmployabilityOverview,
  mapEmployabilitySkills,
  mapInterestedCompanies,
  mapKpiMetrics,
  mapMarketTrends,
  mapNotifications,
  mapRecommendation,
  mapTimelineEvents,
} from "@/lib/supabase/mappers/dashboard";
import { fetchJobCardsForUser } from "@/lib/supabase/queries/jobs";
import type { DbProfile } from "@/lib/supabase/types";

export async function fetchDashboardData(
  supabase: SupabaseClient,
  userId: string | null
): Promise<DashboardData> {
  if (!userId) {
    return EMPTY_DASHBOARD;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      email,
      full_name,
      first_name,
      avatar_url,
      initials,
      plan,
      current_role,
      summary,
      avatar_initials,
      seniority,
      goal_role,
      goal_location,
      goal_salary,
      goal_availability_label
    `
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) return EMPTY_DASHBOARD;

  const today = new Date().toISOString().slice(0, 10);

  const [
    timelineResult,
    kpiResult,
    recommendationResult,
    applicationsResult,
    jobsResult,
    marketResult,
    employabilitySkillsResult,
    employabilityOverviewResult,
    missionsResult,
    suggestionsResult,
    chatResult,
    notificationsResult,
    unreadNotificationsResult,
    unreadMessagesResult,
  ] = await Promise.all([
    supabase
      .from("timeline_events")
      .select(
        "id, title, description, href, actor, event_kind, created_at, is_live, job_id, company_id"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("kpi_metrics")
      .select(
        "id, metric_key, label, value, suffix, prefix, delta_label, delta_positive, sparkline, color_token"
      )
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(8),
    supabase
      .from("dashboard_recommendations")
      .select(
        "id, job_id, title, description, duration_label, company_name, cta_primary, cta_secondary, href"
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("job_applications")
      .select(
        `
        id,
        job_id,
        company_id,
        role_title,
        status_label,
        last_activity_at,
        companies (name, logo, brand_color, slug),
        jobs (slug)
      `
      )
      .eq("user_id", userId)
      .order("last_activity_at", { ascending: false })
      .limit(6),
    fetchJobCardsForUser(supabase, userId, 6),
    supabase
      .from("market_trends")
      .select("id, tech_name, change_percent, demand_score")
      .order("recorded_at", { ascending: false })
      .limit(6),
    supabase
      .from("employability_skills")
      .select("id, label, score, uplift_percent, explanation, market_context")
      .eq("user_id", userId)
      .order("sort_order"),
    supabase
      .from("employability_overviews")
      .select("score, goal_score")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("daily_missions")
      .select("id, label, uplift_percent, is_completed, href, icon_name")
      .eq("user_id", userId)
      .eq("mission_date", today)
      .order("created_at"),
    supabase
      .from("dashboard_ai_suggestions")
      .select(
        "id, title, description, impact_label, href, icon_name, color_token"
      )
      .eq("user_id", userId)
      .eq("is_dismissed", false)
      .order("sort_order"),
    supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("user_id", userId)
      .eq("context", "dashboard")
      .order("created_at", { ascending: true })
      .limit(20),
    supabase
      .from("notifications")
      .select(
        "id, title, description, notification_group, is_unread, action_label, href, icon_name, color_token, created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_unread", true),
    supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("role", "assistant")
      .gt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const demoKpiKeys = new Set([
    "jobs_found",
    "compatibility",
    "applications",
    "interviews",
  ]);

  const timelineRows = (timelineResult.data ?? []).filter(
    (row) =>
      (!row.job_id || !isDemoCatalogJobId(row.job_id)) &&
      (!row.company_id || !isDemoCatalogCompanyId(row.company_id))
  );

  const applicationRows = (applicationsResult.data ?? []).filter(
    (row) =>
      (!row.job_id || !isDemoCatalogJobId(row.job_id)) &&
      (!row.company_id || !isDemoCatalogCompanyId(row.company_id))
  );

  const kpiRows = (kpiResult.data ?? []).filter(
    (row) => !demoKpiKeys.has(row.metric_key)
  );

  const recommendationRow =
    recommendationResult.data &&
    recommendationResult.data.job_id &&
    isDemoCatalogJobId(recommendationResult.data.job_id)
      ? null
      : recommendationResult.data;

  return assembleDashboardData(profile as DbProfile, {
    timeline: mapTimelineEvents(timelineRows),
    kpis: mapKpiMetrics(kpiRows),
    recommendation: mapRecommendation(recommendationRow),
    companies: mapInterestedCompanies(applicationRows),
    jobs: jobsResult,
    market: mapMarketTrends(marketResult.data ?? []),
    employability: mapEmployabilitySkills(employabilitySkillsResult.data ?? []),
    employabilityOverview: mapEmployabilityOverview(
      employabilityOverviewResult.data,
      missionsResult.data ?? []
    ),
    suggestions: mapAiSuggestions(suggestionsResult.data ?? []),
    chat: mapChatMessages(chatResult.data ?? []),
    notifications: mapNotifications(notificationsResult.data ?? []),
    unreadNotifications: unreadNotificationsResult.count ?? 0,
    unreadMessages: unreadMessagesResult.count ?? 0,
  });
}
