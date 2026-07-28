import type {
  ApplicationSummary,
  CareerActivity,
  CareerContext,
  CareerNavBadges,
  CareerStage,
  FollowedEntities,
  MatchInsights,
} from "@/types/career-context";
import type { DashboardData, TimelineActivity } from "@/types/dashboard";
import type { FollowingList } from "@/types/follows";
import type { JobApplicationRow } from "@/lib/supabase/queries/mutations/applications";
import { buildLivingProfile } from "@/lib/profile/completeness";

const ACTIVE_STATUSES = new Set(["interested", "applied", "viewed", "interview"]);

function mapApplication(row: JobApplicationRow): ApplicationSummary {
  return {
    id: row.id,
    roleTitle: row.role_title,
    companyId: row.company_id,
    status: row.status,
    statusLabel: row.status_label,
    appliedAt: row.applied_at,
    lastActivityAt: row.last_activity_at,
    jobRef: row.job_id,
  };
}

function deriveStage(
  profileCompleteness: number,
  applications: ApplicationSummary[],
  timeline: TimelineActivity[],
  followedCount: number
): CareerStage {
  const hasInterviewTimeline = timeline.some((e) => e.kind === "interview_invite");
  const hasInterviewApp = applications.some((a) => a.status === "interview");

  if (hasInterviewTimeline || hasInterviewApp) return "interviewing";

  const activeApps = applications.filter((a) => ACTIVE_STATUSES.has(a.status));
  if (activeApps.length > 0) return "applying";

  if (profileCompleteness < 55) return "onboarding";

  if (followedCount >= 3 && applications.length === 0) return "networking";

  return "exploring";
}

function deriveFollowedEntities(following: FollowingList | undefined): FollowedEntities {
  const companies = following?.companies ?? [];
  const users = following?.users ?? [];

  return {
    companyIds: companies.map((c) => c.id),
    userIds: users.map((u) => u.id),
    companyNames: companies.map((c) => c.name),
  };
}

function deriveMatchInsights(jobs: DashboardData["jobs"]): MatchInsights {
  const matched = jobs.filter((j) => j.hasMatch);
  const topJobs = [...matched]
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, 5);

  const avgCompatibility =
    matched.length > 0
      ? Math.round(
          matched.reduce((sum, j) => sum + j.compatibility, 0) / matched.length
        )
      : 0;

  const newMatchesCount = matched.filter((j) => j.compatibility >= 80).length;

  return { topJobs, avgCompatibility, newMatchesCount };
}

function deriveNavBadges(
  data: DashboardData,
  applications: ApplicationSummary[],
  profileCompleteness: number
): CareerNavBadges {
  const upcomingCount = data.timeline.filter((e) =>
    ["application_sent", "interview_invite"].includes(e.kind)
  ).length;

  return {
    vagas: deriveMatchInsights(data.jobs).newMatchesCount,
    agenda: upcomingCount,
    mensagens: data.unreadMessages,
    curriculo:
      profileCompleteness < 90
        ? Math.max(1, Math.ceil((100 - profileCompleteness) / 20))
        : 0,
  };
}

function mapRecentActivity(timeline: TimelineActivity[]): CareerActivity[] {
  return timeline.slice(0, 8).map((item) => ({
    id: item.id,
    kind: item.kind,
    title: item.title,
    description: item.description,
    href: item.href,
    createdAt: item.createdAt,
    time: item.time,
  }));
}

export interface DeriveCareerContextInput {
  dashboard: DashboardData;
  applications?: JobApplicationRow[];
  following?: FollowingList;
  experiencesCount?: number;
  skillsCount?: number;
  educationCount?: number;
  languagesCount?: number;
}

export function deriveCareerContext(input: DeriveCareerContextInput): CareerContext {
  const { dashboard } = input;
  const applications = (input.applications ?? []).map(mapApplication);
  const activeApplications = applications.filter((a) =>
    ACTIVE_STATUSES.has(a.status)
  );
  const followedEntities = deriveFollowedEntities(input.following);
  const followedCount =
    followedEntities.companyIds.length + followedEntities.userIds.length;

  const profile = buildLivingProfile({
    fullName: dashboard.user.name,
    summary: null,
    currentRole: dashboard.goal.role !== "Não definido" ? dashboard.goal.role : null,
    goalRole: dashboard.goal.role !== "Não definido" ? dashboard.goal.role : null,
    goalLocation:
      dashboard.goal.location !== "Não definido" ? dashboard.goal.location : null,
    experiencesCount: input.experiencesCount ?? (profileHasExperiences(dashboard) ? 1 : 0),
    skillsCount: input.skillsCount ?? (dashboard.employability.length > 0 ? 1 : 0),
    educationCount: input.educationCount ?? 0,
    languagesCount: input.languagesCount ?? 0,
    goals: dashboard.goal,
    hasSummary: dashboard.goal.role !== "Não definido",
  });

  const stage = deriveStage(
    profile.completeness,
    applications,
    dashboard.timeline,
    followedCount
  );

  const upcomingEvents = dashboard.timeline
    .filter((e) =>
      ["application_sent", "interview_invite", "resume_tailored"].includes(e.kind)
    )
    .slice(0, 10);

  return {
    stage,
    user: dashboard.user,
    profile,
    activeApplications,
    upcomingEvents,
    followedEntities,
    matchInsights: deriveMatchInsights(dashboard.jobs),
    aiSuggestions: dashboard.suggestions,
    recentActivity: mapRecentActivity(dashboard.timeline),
    navBadges: deriveNavBadges(dashboard, applications, profile.completeness),
  };
}

function profileHasExperiences(dashboard: DashboardData): boolean {
  return dashboard.employability.length > 0 || dashboard.kpis.length > 0;
}

export function countUpcomingAgendaEvents(timeline: TimelineActivity[]): number {
  return timeline.filter((e) =>
    ["application_sent", "interview_invite"].includes(e.kind)
  ).length;
}
