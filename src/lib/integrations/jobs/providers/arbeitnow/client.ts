import type {
  ArbeitnowJob,
  ArbeitnowSearchParams,
  ArbeitnowSearchResults,
} from "@/lib/integrations/jobs/providers/arbeitnow/types";

const BASE_URL = "https://www.arbeitnow.com/api/job-board-api";

export async function searchArbeitnowJobs(
  params: ArbeitnowSearchParams = {}
): Promise<ArbeitnowJob[]> {
  try {
    const response = await fetch(BASE_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error("[arbeitnow] search failed:", response.status);
      return [];
    }

    const data = (await response.json()) as ArbeitnowSearchResults;
    let jobs = data.data ?? [];

    if (params.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      jobs = jobs.filter((job) => {
        const haystack = [job.title, job.company_name, job.location, ...job.tags]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    if (params.limit) {
      jobs = jobs.slice(0, params.limit);
    }

    return jobs;
  } catch (error) {
    console.error("[arbeitnow] search failed:", error);
    return [];
  }
}

export async function getArbeitnowJobBySlug(slug: string): Promise<ArbeitnowJob | null> {
  const jobs = await searchArbeitnowJobs({ limit: 500 });
  return jobs.find((job) => job.slug === slug) ?? null;
}
