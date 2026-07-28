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

export type JobSource = "internal" | "adzuna";

export interface JobRecommendation {
  id: string;
  companyId: string;
  company: string;
  role: string;
  /** Data source — internal Supabase jobs vs external Adzuna listings */
  source?: JobSource;
  /** External apply URL (Adzuna redirect_url) */
  externalUrl?: string;
  /** Plain-text description for external jobs */
  description?: string;
  /** Present only when the user has a personalized match in Supabase */
  hasMatch: boolean;
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
  aiSummary: string;
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
  hasMatch: boolean;
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

export type TechLevel = "básico" | "intermediário" | "avançado";

export interface TechRequirement {
  name: string;
  requiredLevel: TechLevel;
  userLevel: TechLevel;
  weight: number;
}

export interface CultureIndicator {
  id: string;
  label: string;
  score: number;
  description: string;
}

export interface CompanyProfile {
  segment: string;
  employees: string;
  marketYears: number;
  rating: number;
  verified: boolean;
}

export interface SalaryComparisonData {
  jobMin: number;
  jobMax: number;
  marketMin: number;
  marketMax: number;
  userExpectation: number;
  insight: string;
}

export interface HiringStage {
  id: string;
  label: string;
  avgDays: number;
}

export interface JobFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface InterviewQuestion {
  id: string;
  tech: string;
  question: string;
}

export interface GithubProject {
  id: string;
  name: string;
  description: string;
  relevance: string;
}

export interface ResumeSuggestion {
  id: string;
  text: string;
  type: "add" | "move" | "highlight";
}

export interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  highlight: boolean;
}

export interface SimilarCompany {
  id: string;
  name: string;
  logo: string;
  color: string;
  hasMatch: boolean;
  compatibility: number;
  href: string;
}

export interface RelatedJob {
  id: string;
  company: string;
  role: string;
  hasMatch: boolean;
  compatibility: number;
  salary: string;
  logo: string;
  color: string;
  href: string;
}

export interface ApplyChecklistItem {
  id: string;
  label: string;
  status: "done" | "pending" | "auto";
}

export interface WeightFactor {
  label: string;
  weight: number;
}

export interface JobSections {
  summary: string[];
  responsibilities: string[];
  requirements: string[];
  differentials: string[];
  benefits: string[];
}

export interface StudyTopic {
  id: string;
  title: string;
  priority: 1 | 2 | 3 | 4 | 5;
}

export interface StudyPlan {
  topics: StudyTopic[];
}

export interface TeamInfo {
  teamName: string;
  size: number;
  stack: string[];
  averageTenureYears: number;
  available: boolean;
}

export interface CareerImpactRole {
  id: string;
  role: string;
  upliftPercent: number;
}

export interface CareerImpact {
  roles: CareerImpactRole[];
  explanation: string;
}

export interface JobComparisonItem {
  id: string;
  company: string;
  logo: string;
  color: string;
  salary: string;
  remote: string;
  compatibility: number;
  processSteps: number;
  benefitsRating: number;
}

export interface JobComparison {
  jobs: JobComparisonItem[];
  recommendedCompanyId: string;
  aiConclusion: string;
}

export interface JobDetail extends JobRecommendation {
  publishedAt: string;
  verified: boolean;
  whyMatchSummary: string;
  weightFactors: WeightFactor[];
  sections: JobSections;
  techComparison: TechRequirement[];
  companyProfile: CompanyProfile;
  culture: CultureIndicator[];
  salaryComparison: SalaryComparisonData;
  hiringTimeline: HiringStage[];
  faqs: JobFAQ[];
  interviewQuestions: InterviewQuestion[];
  githubProjects: GithubProject[];
  resumeSuggestions: ResumeSuggestion[];
  portfolioProjects: PortfolioProject[];
  similarCompanies: SimilarCompany[];
  relatedJobs: RelatedJob[];
  applyChecklist: ApplyChecklistItem[];
  aiSummary: string;
  aiSummaryReasons: string[];
  studyPlan: StudyPlan;
  teamInfo: TeamInfo;
  careerImpact: CareerImpact;
  comparison: JobComparison;
}
