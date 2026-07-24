import type { ChatMessage } from "@/types/dashboard";

export type MatchReasonType = "match" | "warning";

export interface MatchReason {
  id: string;
  text: string;
  type: MatchReasonType;
}

export interface JobStats {
  responseDays: number;
  processDays: number;
  steps: number;
  candidates: number;
}

export type ApprovalLevel = "baixa" | "media" | "alta";

export type SimulationStageStatus = "pass" | "warning" | "fail";

export interface SimulationStage {
  id: string;
  label: string;
  status: SimulationStageStatus;
}

export interface ApprovalSimulation {
  stages: SimulationStage[];
  suggestion: string;
}

export interface ApprovalProbability {
  level: ApprovalLevel;
  stars: number;
  reasons: string[];
  simulation: ApprovalSimulation;
}

export interface BestSendTime {
  dayLabel: string;
  timeRange: string;
  insight: string;
}

export interface JobRecommendation {
  id: string;
  company: string;
  role: string;
  compatibility: number;
  approvalProbability: ApprovalProbability;
  bestSendTime: BestSendTime;
  salary: string;
  salaryMin: number;
  salaryMax: number;
  location: string;
  logo: string;
  color: string;
  href: string;
  stack: string[];
  reasons: MatchReason[];
  stats: JobStats;
  benefits: string[];
  remote: boolean;
}

export interface SmartFilter {
  id: string;
  label: string;
}

export interface DiscoverySummary {
  analyzed: number;
  compatible: number;
  veryCompatible: number;
  perfect: number;
}

export type CompanyEnvironment = "Startup" | "Scale-up" | "Corporativa";

export interface CompanyMatch {
  id: string;
  name: string;
  logo: string;
  color: string;
  compatibility: number;
  environment: CompanyEnvironment;
  remote: boolean;
  benefits: string[];
  href: string;
}

export interface OpportunityRegion {
  id: string;
  country: string;
  flag: string;
  count: number;
  x: number;
  y: number;
}

export interface SalaryDataPoint {
  tech: string;
  min: number;
  avg: number;
  max: number;
}

export interface MarketInsight {
  id: string;
  tech: string;
  change: number;
}

export type DiscoveryViewState =
  | "default"
  | "loading"
  | "empty"
  | "first-access"
  | "no-results"
  | "error";

export interface DiscoveryData {
  summary: DiscoverySummary;
  filters: SmartFilter[];
  jobs: JobRecommendation[];
  companies: CompanyMatch[];
  regions: OpportunityRegion[];
  salaryRadar: SalaryDataPoint[];
  marketInsights: MarketInsight[];
  chat: ChatMessage[];
}

export type HideReason =
  | "distance"
  | "salary"
  | "tech"
  | "company"
  | "other";
