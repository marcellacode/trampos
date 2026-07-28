import type { JobRecommendation } from "@/types/jobs";

const FOLLOWED_COMPANY_BOOST = 25;
const HIGH_MATCH_BOOST = 5;

export interface RankContext {
  followedCompanyIds: Set<string>;
  followedCompanyNames: Set<string>;
}

function normalizeCompanyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function buildRankContext(
  companyIds: string[],
  companyNames: string[]
): RankContext {
  return {
    followedCompanyIds: new Set(companyIds),
    followedCompanyNames: new Set(companyNames.map(normalizeCompanyName)),
  };
}

export function computeJobRankScore(
  job: JobRecommendation,
  context?: RankContext
): number {
  let score = job.compatibility;

  if (job.hasMatch && job.compatibility >= 80) {
    score += HIGH_MATCH_BOOST;
  }

  if (!context) return score;

  if (context.followedCompanyIds.has(job.companyId)) {
    score += FOLLOWED_COMPANY_BOOST;
  } else if (context.followedCompanyNames.has(normalizeCompanyName(job.company))) {
    score += FOLLOWED_COMPANY_BOOST;
  }

  return score;
}

export function rankJobsWithContext<T extends JobRecommendation>(
  jobs: T[],
  context?: RankContext
): T[] {
  return [...jobs].sort((a, b) => {
    const scoreDiff =
      computeJobRankScore(b, context) - computeJobRankScore(a, context);
    if (scoreDiff !== 0) return scoreDiff;
    if (b.compatibility !== a.compatibility) {
      return b.compatibility - a.compatibility;
    }
    return a.role.localeCompare(b.role, "pt-BR");
  });
}

export function isFromFollowedCompany(
  job: JobRecommendation,
  context?: RankContext
): boolean {
  if (!context) return false;
  return (
    context.followedCompanyIds.has(job.companyId) ||
    context.followedCompanyNames.has(normalizeCompanyName(job.company))
  );
}
