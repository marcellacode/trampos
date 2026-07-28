import type { JobRecommendation } from "@/types/jobs";

export type ApprovalLevel = "baixa" | "media" | "alta";
export type MatchReasonType = "match" | "warning";

export interface MatchReason {
  text: string;
  type: MatchReasonType;
}

export interface ComputedMatch {
  compatibility: number;
  approvalLevel: ApprovalLevel;
  approvalStars: number;
  reasons: MatchReason[];
  aiSummary: string;
  bestSendDayLabel: string;
  bestSendTimeRange: string;
}

export interface ProfileGoals {
  role?: string;
  location?: string;
  salary?: string;
  seniority?: string;
}

export interface UserJobMatchRow {
  id: string;
  user_id: string;
  job_id: string | null;
  external_job_id: string | null;
  compatibility: number;
  approval_level: string;
  approval_stars: number;
  match_reasons: { text: string; type: string }[];
  ai_summary: string;
  best_send_day_label: string;
  best_send_time_range: string;
}

export interface GroqMatchResponse {
  compatibility: number;
  approvalLevel: ApprovalLevel;
  approvalStars: number;
  reasons: MatchReason[];
  aiSummary: string;
  bestSendDayLabel: string;
  bestSendTimeRange: string;
}

export interface SyncUserMatchesOptions {
  limit?: number;
  skipRateLimit?: boolean;
}

export type JobForMatching = Pick<
  JobRecommendation,
  | "id"
  | "role"
  | "company"
  | "location"
  | "salaryMax"
  | "remote"
  | "stack"
  | "aiSummary"
>;
