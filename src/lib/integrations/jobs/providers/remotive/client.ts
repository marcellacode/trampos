import type { RemotiveJob, RemotiveSearchParams, RemotiveSearchResults } from "@/lib/integrations/jobs/providers/remotive/types";

const BASE_URL = "https://remotive.com/api/remote-jobs";

export async function searchRemotiveJobs(
  params: RemotiveSearchParams = {}
): Promise<RemotiveJob[]> {
  try {
    const url = new URL(BASE_URL);
    if (params.search?.trim()) url.searchParams.set("search", params.search.trim());
    if (params.category?.trim()) url.searchParams.set("category", params.category.trim());
    if (params.limit) url.searchParams.set("limit", String(params.limit));

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error("[remotive] search failed:", response.status);
      return [];
    }

    const data = (await response.json()) as RemotiveSearchResults;
    return data.jobs ?? [];
  } catch (error) {
    console.error("[remotive] search failed:", error);
    return [];
  }
}

export async function getRemotiveJobById(id: string): Promise<RemotiveJob | null> {
  const jobs = await searchRemotiveJobs({ limit: 200 });
  return jobs.find((job) => String(job.id) === id) ?? null;
}
