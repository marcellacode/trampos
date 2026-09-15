import type { JobRecommendation } from "@/types/jobs";

const BRAZIL_LOCATION_PATTERN =
  /\b(brasil|brazil|br)\b|\b(ac|al|ap|am|ba|ce|df|es|go|ma|mt|ms|mg|pa|pb|pr|pe|pi|rj|rn|rs|ro|rr|sc|sp|se|to)\b|sao paulo|rio de janeiro|belo horizonte|brasilia|salvador|fortaleza|recife|curitiba|porto alegre|goiania|campinas|florianopolis|vitoria|manaus|belem|natal|joao pessoa|maceio|aracaju|cuiaba|campo grande|teresina|sao luis/i;

function normalizeLocation(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Keeps discovery limited to listings explicitly located in Brazil. */
export function isBrazilJob(job: JobRecommendation): boolean {
  return BRAZIL_LOCATION_PATTERN.test(normalizeLocation(job.location));
}

export function filterBrazilJobs(
  jobs: JobRecommendation[]
): JobRecommendation[] {
  return jobs.filter(isBrazilJob);
}
