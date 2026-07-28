import type { JobRecommendation } from "@/types/jobs";

export interface ProfileGoals {
  role?: string;
  location?: string;
  salary?: string;
  seniority?: string;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parseSalaryExpectation(salaryLabel: string): number | null {
  const digits = salaryLabel.replace(/\D/g, "");
  if (!digits) return null;
  const value = Number(digits);
  return Number.isFinite(value) ? value : null;
}

function matchesRole(jobTitle: string, goalRole: string): boolean {
  const title = normalizeText(jobTitle);
  const goal = normalizeText(goalRole);
  if (!goal) return true;

  const tokens = goal.split(/\s+/).filter((token) => token.length > 2);
  if (tokens.length === 0) return title.includes(goal);

  const matched = tokens.filter((token) => title.includes(token));
  return matched.length >= Math.ceil(tokens.length / 2);
}

function matchesLocation(job: JobRecommendation, goalLocation: string): boolean {
  const location = normalizeText(goalLocation);
  if (!location || location === "nao definido") return true;

  const jobLocation = normalizeText(job.location);
  if (location.includes("remot")) return job.remote || jobLocation.includes("remot");
  if (location.includes("hibrid")) return jobLocation.includes("hibrid") || job.remote;

  const tokens = location.split(/[\s,/]+/).filter((token) => token.length > 2);
  return tokens.some((token) => jobLocation.includes(token));
}

function matchesSeniority(jobTitle: string, seniority: string): boolean {
  const level = normalizeText(seniority);
  if (!level) return true;

  const title = normalizeText(jobTitle);
  const seniorityMap: Record<string, string[]> = {
    junior: ["junior", "jr", "estagi", "trainee"],
    pleno: ["pleno", "mid", "intermedi"],
    senior: ["senior", "sr", "lead", "staff", "principal"],
  };

  for (const [key, keywords] of Object.entries(seniorityMap)) {
    if (level.includes(key)) {
      return keywords.some((keyword) => title.includes(keyword)) || !title.match(/junior|pleno|senior|sr|jr/);
    }
  }

  return true;
}

function matchesSalary(job: JobRecommendation, goalSalary: string): boolean {
  const expectation = parseSalaryExpectation(goalSalary);
  if (!expectation) return true;
  return job.salaryMax >= expectation * 0.7;
}

function profileScore(job: JobRecommendation, goals: ProfileGoals): number {
  let score = job.hasMatch ? job.compatibility : 50;

  if (goals.role && matchesRole(job.role, goals.role)) score += 15;
  if (goals.location && matchesLocation(job, goals.location)) score += 10;
  if (goals.seniority && matchesSeniority(job.role, goals.seniority)) score += 10;
  if (goals.salary && matchesSalary(job, goals.salary)) score += 10;

  return Math.min(score, 100);
}

export function filterJobsForProfile(
  jobs: JobRecommendation[],
  goals: ProfileGoals,
  excludeIds: Set<string>
): JobRecommendation[] {
  return jobs
    .filter((job) => !excludeIds.has(job.id))
    .map((job) => ({ job, score: profileScore(job, goals) }))
    .filter(({ score }) => score >= 55)
    .sort((a, b) => b.score - a.score || b.job.compatibility - a.job.compatibility)
    .map(({ job }) => job);
}

export function toChatJob(job: JobRecommendation) {
  return {
    id: job.id,
    companyId: job.companyId,
    role: job.role,
    company: job.company,
    location: job.location,
    salary: job.salary,
    compatibility: job.compatibility,
    logo: job.logo,
    color: job.color,
    href: job.href,
    remote: job.remote,
    aiSummary: job.aiSummary,
    stack: job.stack,
  };
}
