import type {
  AISuggestion,
  CareerGoal,
  DashboardUser,
  JobCard,
  TimelineActivity,
} from "@/types/dashboard";

export type CareerStage =
  | "onboarding"
  | "exploring"
  | "applying"
  | "interviewing"
  | "networking";

export interface ApplicationSummary {
  id: string;
  roleTitle: string;
  companyId: string;
  status: string;
  statusLabel: string;
  appliedAt: string | null;
  lastActivityAt: string;
  jobRef: string | null;
}

export interface LivingProfile {
  completeness: number;
  missingFields: string[];
  hasExperiences: boolean;
  hasSkills: boolean;
  hasSummary: boolean;
  goals: CareerGoal;
  lastUpdated: string | null;
}

export interface FollowedEntities {
  companyIds: string[];
  userIds: string[];
  companyNames: string[];
}

export interface MatchInsights {
  topJobs: JobCard[];
  avgCompatibility: number;
  newMatchesCount: number;
}

export interface CareerActivity {
  id: string;
  kind: TimelineActivity["kind"];
  title: string;
  description?: string;
  href: string;
  createdAt: string;
  time: string;
}

export interface CopilotSuggestion {
  id: string;
  title: string;
  description: string;
  href: string;
  prompt?: string;
}

export interface CareerContext {
  stage: CareerStage;
  user: DashboardUser;
  profile: LivingProfile;
  activeApplications: ApplicationSummary[];
  upcomingEvents: TimelineActivity[];
  followedEntities: FollowedEntities;
  matchInsights: MatchInsights;
  aiSuggestions: AISuggestion[];
  recentActivity: CareerActivity[];
  navBadges: CareerNavBadges;
}

export interface CareerNavBadges {
  vagas: number;
  agenda: number;
  mensagens: number;
  curriculo: number;
}

export interface GuidedEmptyStep {
  label: string;
  href: string;
  done: boolean;
}

export interface GuidedEmptyState {
  title: string;
  description: string;
  steps: GuidedEmptyStep[];
  copilotPrompt?: string;
  highlightHref?: string;
  highlightLabel?: string;
}
