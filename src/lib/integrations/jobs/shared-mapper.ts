import { companyInitials } from "@/lib/supabase/utils";
import type { ExternalJobSource } from "@/lib/jobs/source-utils";
import { externalJobRef } from "@/lib/jobs/source-utils";
import type { JobDetail, JobRecommendation } from "@/types/jobs";

export const DEFAULT_JOB_COLOR = "#6366F1";

/** Keep discovery payloads small enough for server actions. */
export const DISCOVERY_DESCRIPTION_MAX = 600;

const REMOTE_KEYWORDS =
  /\b(remot[oa]|home\s*office|trabalho\s*remoto|remote|hibrid[oa]|hybrid)\b/i;

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateForDiscovery(text: string, max = DISCOVERY_DESCRIPTION_MAX): string {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

export function inferRemote(...parts: (string | undefined)[]): boolean {
  const haystack = parts.filter(Boolean).join(" ");
  return REMOTE_KEYWORDS.test(haystack);
}

export function formatSalaryDisplay(options: {
  min?: number;
  max?: number;
  currency?: string;
  label?: string;
}): { label: string; min: number; max: number } {
  if (options.label?.trim()) {
    return { label: options.label.trim(), min: options.min ?? 0, max: options.max ?? 0 };
  }

  const min = options.min ?? 0;
  const max = options.max ?? 0;
  if (!min && !max) {
    return { label: "A combinar", min: 0, max: 0 };
  }

  const currency = options.currency ?? "USD";
  const fmt = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });

  if (min && max && min !== max) {
    return { label: `${fmt(min)} – ${fmt(max)}`, min, max };
  }

  return { label: fmt(min || max), min: min || max, max: max || min };
}

export function buildExternalJobRecommendation(input: {
  source: ExternalJobSource;
  externalId: string;
  company: string;
  role: string;
  externalUrl: string;
  description?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryLabel?: string;
  stack?: string[];
  remote?: boolean;
}): JobRecommendation {
  const id = externalJobRef(input.source, input.externalId);
  const description = input.description
    ? truncateForDiscovery(input.description)
    : "";
  const salary = formatSalaryDisplay({
    min: input.salaryMin,
    max: input.salaryMax,
    currency: input.salaryCurrency,
    label: input.salaryLabel,
  });

  return {
    id,
    companyId: "",
    company: input.company || "Empresa",
    role: input.role,
    source: input.source,
    externalUrl: input.externalUrl,
    description,
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
    salary: salary.label,
    salaryMin: salary.min,
    salaryMax: salary.max,
    location: input.location || "Remoto",
    logo: companyInitials(input.company || "E"),
    color: DEFAULT_JOB_COLOR,
    href: `/dashboard/vagas/${id}`,
    stack: input.stack ?? [],
    reasons: [],
    stats: {
      responseDays: 0,
      processDays: 0,
      steps: 0,
      candidates: 0,
    },
    benefits: [],
    remote: input.remote ?? inferRemote(input.location, description, input.role),
    aiSummary: description.slice(0, 280),
  };
}

export function mapExternalJobToDetail(job: JobRecommendation): JobDetail {
  const description = job.description ?? job.aiSummary ?? "";
  const paragraphs = description
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const sourceLabel = job.source ?? "externa";

  return {
    ...job,
    publishedAt: new Date().toISOString().slice(0, 10),
    verified: false,
    whyMatchSummary: `Vaga encontrada via ${sourceLabel}. Compatibilidade calculada com seu perfil Jobera.`,
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
      segment: job.stack[0] ?? "",
      employees: "",
      marketYears: 0,
      rating: 0,
      verified: false,
    },
    culture: [],
    salaryComparison: {
      jobMin: job.salaryMin,
      jobMax: job.salaryMax,
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
