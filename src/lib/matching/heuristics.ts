import type { JobRecommendation } from "@/types/jobs";

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function matchesRole(jobTitle: string, goalRole: string): boolean {
  const title = normalizeText(jobTitle);
  const goal = normalizeText(goalRole);
  if (!goal) return true;

  const tokens = goal.split(/\s+/).filter((token) => token.length > 2);
  if (tokens.length === 0) return title.includes(goal);

  const matched = tokens.filter((token) => title.includes(token));
  return matched.length >= Math.ceil(tokens.length / 2);
}

export function matchesLocation(
  job: Pick<JobRecommendation, "location" | "remote">,
  goalLocation: string
): boolean {
  const location = normalizeText(goalLocation);
  if (!location || location === "nao definido") return true;

  const jobLocation = normalizeText(job.location);
  if (location.includes("remot")) return job.remote || jobLocation.includes("remot");
  if (location.includes("hibrid")) return jobLocation.includes("hibrid") || job.remote;

  const tokens = location.split(/[\s,/]+/).filter((token) => token.length > 2);
  return tokens.some((token) => jobLocation.includes(token));
}

export function matchesSeniority(jobTitle: string, seniority: string): boolean {
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
      return (
        keywords.some((keyword) => title.includes(keyword)) ||
        !title.match(/junior|pleno|senior|sr|jr/)
      );
    }
  }

  return true;
}

function parseSalaryExpectation(salaryLabel: string): number | null {
  const digits = salaryLabel.replace(/\D/g, "");
  if (!digits) return null;
  const value = Number(digits);
  return Number.isFinite(value) ? value : null;
}

export function matchesSalary(
  job: Pick<JobRecommendation, "salaryMax">,
  goalSalary: string
): boolean {
  const expectation = parseSalaryExpectation(goalSalary);
  if (!expectation) return true;
  return job.salaryMax >= expectation * 0.7;
}
