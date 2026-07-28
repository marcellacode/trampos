import type { AdzunaJobResult, AdzunaJobView } from "@/lib/integrations/adzuna/types";
import { applyMatchToJob } from "@/lib/matching/sync-user-matches";
import type { UserJobMatchRow } from "@/lib/matching/types";
import type { JobDetail, JobRecommendation } from "@/types/jobs";
import { companyInitials } from "@/lib/supabase/utils";
import { truncateForDiscovery } from "@/lib/integrations/jobs/shared-mapper";

const DEFAULT_COLOR = "#6366F1";

const REMOTE_KEYWORDS =
  /\b(remot[oa]|home\s*office|trabalho\s*remoto|remote|hibrid[oa]|hybrid)\b/i;

function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return "A combinar";
  const fmt = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  if (min && max && min !== max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min ?? max ?? 0);
}

function inferRemote(job: Pick<AdzunaJobResult, "title" | "description" | "location">): boolean {
  const haystack = [
    job.title,
    job.description,
    job.location.display_name,
  ].join(" ");
  return REMOTE_KEYWORDS.test(haystack);
}

function extractStack(job: AdzunaJobResult): string[] {
  const stack: string[] = [];
  if (job.category?.label) stack.push(job.category.label);
  if (job.contract_type) stack.push(job.contract_type);
  if (job.contract_time) stack.push(job.contract_time);
  return stack;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function adzunaJobId(adzunaId: string | number): string {
  return `adzuna-${adzunaId}`;
}

export function parseAdzunaJobId(id: string): string | null {
  if (!id.startsWith("adzuna-")) return null;
  return id.slice("adzuna-".length);
}

export function mapAdzunaJobToRecommendation(
  job: AdzunaJobResult,
  userMatch?: UserJobMatchRow
): JobRecommendation {
  const company = job.company.display_name || "Empresa";
  const id = adzunaJobId(job.id);

  const base: JobRecommendation = {
    id,
    companyId: "",
    company,
    role: job.title,
    source: "adzuna",
    externalUrl: job.redirect_url,
    description: truncateForDiscovery(job.description),
    hasMatch: false,
    compatibility: 0,
    approvalProbability: {
      level: "baixa",
      stars: 0,
      reasons: [],
      simulation: { stages: [], suggestion: "" },
    },
    bestSendTime: {
      dayLabel: "",
      timeRange: "",
      insight: "",
    },
    salary: formatSalary(job.salary_min, job.salary_max),
    salaryMin: job.salary_min ?? 0,
    salaryMax: job.salary_max ?? 0,
    location: job.location.display_name || "Brasil",
    logo: companyInitials(company),
    color: DEFAULT_COLOR,
    href: `/dashboard/vagas/${id}`,
    stack: extractStack(job),
    reasons: [],
    stats: {
      responseDays: 0,
      processDays: 0,
      steps: 0,
      candidates: 0,
    },
    benefits: [],
    remote: inferRemote(job),
    aiSummary: truncateForDiscovery(job.description, 280),
  };

  return userMatch ? applyMatchToJob(base, userMatch) : base;
}

export function mapAdzunaJobToDetail(job: AdzunaJobView): JobDetail {
  const base = mapAdzunaJobToRecommendation(job);
  const description = stripHtml(job.description);
  const paragraphs = description
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    ...base,
    publishedAt: job.created?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    verified: false,
    whyMatchSummary: "Vaga encontrada via Adzuna. Compatibilidade personalizada não disponível para fontes externas.",
    weightFactors: [],
    sections: {
      summary: paragraphs.slice(0, 2),
      responsibilities: [],
      requirements: paragraphs.slice(2),
      differentials: [],
      benefits: [],
    },
    techComparison: [],
    companyProfile: {
      segment: job.category?.label ?? "",
      employees: "",
      marketYears: 0,
      rating: 0,
      verified: false,
    },
    culture: [],
    salaryComparison: {
      jobMin: base.salaryMin,
      jobMax: base.salaryMax,
      marketMin: 0,
      marketMax: 0,
      userExpectation: 0,
      insight: "",
    },
    hiringTimeline: [],
    faqs: [],
    interviewQuestions: [],
    githubProjects: [],
    resumeSuggestions: [],
    portfolioProjects: [],
    similarCompanies: [],
    relatedJobs: [],
    applyChecklist: [],
    aiSummaryReasons: [],
    studyPlan: { topics: [] },
    teamInfo: {
      teamName: "",
      size: 0,
      stack: [],
      averageTenureYears: 0,
      available: false,
    },
    careerImpact: { roles: [], explanation: "" },
    comparison: {
      jobs: [],
      recommendedCompanyId: "",
      aiConclusion: "",
    },
  };
}

export function mapAdzunaJobsToRecommendations(
  jobs: AdzunaJobResult[],
  matchMap?: Map<string, UserJobMatchRow>
): JobRecommendation[] {
  return jobs.map((job) =>
    mapAdzunaJobToRecommendation(job, matchMap?.get(adzunaJobId(job.id)))
  );
}
