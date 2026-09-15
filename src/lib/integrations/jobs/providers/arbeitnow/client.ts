import type {
  ArbeitnowJob,
  ArbeitnowSearchParams,
  ArbeitnowSearchResults,
} from "@/lib/integrations/jobs/providers/arbeitnow/types";

const BASE_URL = "https://www.arbeitnow.com/api/job-board-api";

function isNextDynamicServerUsage(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { digest?: unknown; message?: unknown };
  return (
    candidate.digest === "DYNAMIC_SERVER_USAGE" ||
    (typeof candidate.message === "string" &&
      candidate.message.includes("Dynamic server usage"))
  );
}

export async function searchArbeitnowJobs(
  params: ArbeitnowSearchParams = {}
): Promise<ArbeitnowJob[]> {
  try {
    // The Arbeitnow payload exceeds Next.js' 2 MB data-cache item limit.
    // Keep it uncached at runtime. During static prerender Next.js throws its
    // own dynamic-usage signal; rethrow it so the framework can handle it.
    const response = await fetch(BASE_URL, {
      headers: { Accept: "application/json" },
      cache: "no-store",
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
    if (isNextDynamicServerUsage(error)) throw error;
    console.error("[arbeitnow] search failed:", error);
    return [];
  }
}

export async function getArbeitnowJobBySlug(slug: string): Promise<ArbeitnowJob | null> {
  const jobs = await searchArbeitnowJobs({ limit: 500 });
  return jobs.find((job) => job.slug === slug) ?? null;
}
