import { createTimelineEvent } from "@/lib/dashboard/timeline";
import type {
  AISuggestion,
  CareerGoal,
  ChatMessage,
  DashboardData,
  DashboardUser,
  EmployabilityOverview,
  EmployabilitySkill,
  InterestedCompany,
  KpiMetric,
  MarketTrend,
  NotificationItem,
  Recommendation,
  TimelineActivity,
} from "@/types/dashboard";
import type { DbProfile } from "@/lib/supabase/types";
import {
  formatChatTimestamp,
  formatPlan,
  formatRelativeTime,
  resolveColor,
  resolveGlow,
  resolveIcon,
} from "@/lib/supabase/utils";

export function mapDashboardUser(profile: DbProfile): DashboardUser {
  return {
    id: profile.id,
    name: profile.full_name || profile.first_name || "Usuário",
    firstName: profile.first_name || "Usuário",
    email: profile.email,
    avatar: profile.avatar_url ?? undefined,
    initials: profile.initials || profile.avatar_initials || "U",
    plan: formatPlan(profile.plan),
  };
}

export function mapCareerGoal(profile: DbProfile): CareerGoal {
  return {
    role: profile.goal_role || "Não definido",
    location: profile.goal_location || "Não definido",
    salary: profile.goal_salary || "Não definido",
    availability: profile.goal_availability_label || "Não definido",
  };
}

export function mapTimelineEvents(
  rows: {
    id: string;
    title: string;
    description: string | null;
    href: string;
    actor: string;
    event_kind: string;
    created_at: string;
    is_live: boolean;
  }[]
): TimelineActivity[] {
  return rows.map((row) =>
    createTimelineEvent({
      id: row.id,
      kind: row.event_kind as TimelineActivity["kind"],
      createdAt: row.created_at,
      title: row.title,
      description: row.description ?? undefined,
      href: row.href,
      isLive: row.is_live,
    })
  );
}

export function mapKpiMetrics(
  rows: {
    id: string;
    label: string;
    value: number;
    suffix: string | null;
    prefix: string | null;
    delta_label: string | null;
    delta_positive: boolean | null;
    sparkline: number[];
    color_token: string;
  }[]
): KpiMetric[] {
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    value: Number(row.value),
    suffix: row.suffix ?? undefined,
    prefix: row.prefix ?? undefined,
    delta: row.delta_label ?? undefined,
    deltaPositive: row.delta_positive ?? undefined,
    sparkline: row.sparkline.map(Number),
    color: resolveColor(row.color_token),
  }));
}

export function mapRecommendation(
  row:
    | {
        id: string;
        title: string;
        description: string;
        duration_label: string;
        company_name: string;
        cta_primary: string;
        cta_secondary: string;
        href: string;
      }
    | null
    | undefined
): Recommendation {
  if (!row) {
    return {
      id: "",
      title: "",
      description: "",
      duration: "",
      company: "",
      ctaPrimary: "",
      ctaSecondary: "",
      href: "/dashboard/vagas",
    };
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    duration: row.duration_label,
    company: row.company_name,
    ctaPrimary: row.cta_primary,
    ctaSecondary: row.cta_secondary,
    href: row.href,
  };
}

export function mapInterestedCompanies(
  rows: {
    id: string;
    role_title: string;
    status_label: string;
    last_activity_at: string;
    companies: { name: string; logo: string; brand_color: string; slug: string } | { name: string; logo: string; brand_color: string; slug: string }[] | null;
    jobs: { slug: string } | { slug: string }[] | null;
  }[]
): InterestedCompany[] {
  return rows.map((row) => {
    const company = Array.isArray(row.companies)
      ? row.companies[0]
      : row.companies;
    const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;

    return {
      id: row.id,
      name: company?.name ?? "Empresa",
      role: row.role_title,
      status: row.status_label,
      timeAgo: formatRelativeTime(row.last_activity_at),
      logo: company?.logo || company?.name?.slice(0, 2) || "?",
      color: company?.brand_color ?? "#6366F1",
      href: job?.slug
        ? `/dashboard/vagas/${job.slug}`
        : `/dashboard/empresas/${company?.slug ?? ""}`,
    };
  });
}

export function mapMarketTrends(
  rows: {
    id: string;
    tech_name: string;
    change_percent: number;
    demand_score: number;
  }[]
): MarketTrend[] {
  return rows.map((row) => ({
    id: row.id,
    tech: row.tech_name,
    change: Number(row.change_percent),
    demand: row.demand_score,
  }));
}

export function mapEmployabilitySkills(
  rows: {
    id: string;
    label: string;
    score: number;
    uplift_percent: number;
    explanation: string;
    market_context: string | null;
  }[]
): EmployabilitySkill[] {
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    score: row.score,
    upliftPercent: row.uplift_percent,
    explanation: row.explanation,
    context: row.market_context ?? undefined,
  }));
}

export function mapEmployabilityOverview(
  row:
    | {
        score: number;
        goal_score: number;
      }
    | null
    | undefined,
  missions: {
    id: string;
    label: string;
    uplift_percent: number;
    is_completed: boolean;
    href: string;
    icon_name: string;
  }[]
): EmployabilityOverview {
  return {
    score: row?.score ?? 0,
    goal: row?.goal_score ?? 100,
    missions: missions.map((mission) => ({
      id: mission.id,
      label: mission.label,
      upliftPercent: mission.uplift_percent,
      completed: mission.is_completed,
      href: mission.href,
      icon: resolveIcon(mission.icon_name),
    })),
  };
}

export function mapAiSuggestions(
  rows: {
    id: string;
    title: string;
    description: string;
    impact_label: string;
    href: string;
    icon_name: string;
    color_token: string;
  }[]
): AISuggestion[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    impact: row.impact_label,
    href: row.href,
    icon: resolveIcon(row.icon_name),
    color: resolveColor(row.color_token),
  }));
}

export function mapChatMessages(
  rows: {
    id: string;
    role: string;
    content: string;
    created_at: string;
  }[]
): ChatMessage[] {
  return rows.map((row) => ({
    id: row.id,
    role: row.role as ChatMessage["role"],
    content: row.content,
    timestamp: formatChatTimestamp(row.created_at),
  }));
}

export function mapNotifications(
  rows: {
    id: string;
    title: string;
    description: string;
    notification_group: string;
    is_unread: boolean;
    action_label: string;
    href: string;
    icon_name: string;
    color_token: string;
    created_at: string;
  }[]
): NotificationItem[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    time: formatRelativeTime(row.created_at),
    group: row.notification_group as NotificationItem["group"],
    unread: row.is_unread,
    actionLabel: row.action_label,
    href: row.href,
    icon: resolveIcon(row.icon_name),
    color: resolveColor(row.color_token),
  }));
}

export function assembleDashboardData(
  profile: DbProfile,
  parts: {
    timeline: TimelineActivity[];
    kpis: KpiMetric[];
    recommendation: Recommendation;
    companies: InterestedCompany[];
    jobs: DashboardData["jobs"];
    market: MarketTrend[];
    employability: EmployabilitySkill[];
    employabilityOverview: EmployabilityOverview;
    suggestions: AISuggestion[];
    chat: ChatMessage[];
    notifications: NotificationItem[];
    unreadNotifications: number;
    unreadMessages: number;
  }
): DashboardData {
  return {
    user: mapDashboardUser(profile),
    goal: mapCareerGoal(profile),
    timeline: parts.timeline,
    kpis: parts.kpis,
    recommendation: parts.recommendation,
    companies: parts.companies,
    jobs: parts.jobs,
    market: parts.market,
    employability: parts.employability,
    employabilityOverview: parts.employabilityOverview,
    suggestions: parts.suggestions,
    chat: parts.chat,
    notifications: parts.notifications,
    unreadNotifications: parts.unreadNotifications,
    unreadMessages: parts.unreadMessages,
  };
}

export { resolveGlow };
