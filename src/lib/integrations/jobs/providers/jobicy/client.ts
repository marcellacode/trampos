import type {
  JobicyJob,
  JobicySearchParams,
  JobicySearchResults,
} from "@/lib/integrations/jobs/providers/jobicy/types";

const BASE_URL = "https://jobicy.com/api/v2/remote-jobs";

export async function searchJobicyJobs(
  params: JobicySearchParams = {}
): Promise<JobicyJob[]> {
  try {
    const url = new URL(BASE_URL);
    url.searchParams.set("count", String(params.count ?? 50));
    if (params.geo?.trim()) url.searchParams.set("geo", params.geo.trim());

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error("[jobicy] search failed:", response.status);
      return [];
    }

    const data = (await response.json()) as JobicySearchResults;
    let jobs = data.jobs ?? [];

    if (params.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      jobs = jobs.filter((job) => {
        const haystack = [
          job.jobTitle,
          job.companyName,
          job.jobGeo,
          job.jobLevel,
          ...job.jobIndustry,
          ...job.jobType,
          job.jobExcerpt,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    return jobs;
  } catch (error) {
    console.error("[jobicy] search failed:", error);
    return [];
  }
}

export async function getJobicyJobById(id: string): Promise<JobicyJob | null> {
  const jobs = await searchJobicyJobs({ count: 100 });
  return jobs.find((job) => String(job.id) === id) ?? null;
}
