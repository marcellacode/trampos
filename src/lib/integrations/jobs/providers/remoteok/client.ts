import type {
  RemoteOkJob,
  RemoteOkSearchParams,
} from "@/lib/integrations/jobs/providers/remoteok/types";

const BASE_URL = "https://remoteok.com/api";

function isRemoteOkJob(entry: unknown): entry is RemoteOkJob {
  return (
    typeof entry === "object" &&
    entry !== null &&
    "id" in entry &&
    "position" in entry &&
    "company" in entry
  );
}

export async function searchRemoteOkJobs(
  params: RemoteOkSearchParams = {}
): Promise<RemoteOkJob[]> {
  try {
    const response = await fetch(BASE_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Jobera/1.0 (job discovery; +https://jobera.app)",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error("[remoteok] search failed:", response.status);
      return [];
    }

    const data = (await response.json()) as unknown[];
    let jobs = data.filter(isRemoteOkJob);

    if (params.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      jobs = jobs.filter((job) => {
        const haystack = [job.position, job.company, job.location, ...job.tags]
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
    console.error("[remoteok] search failed:", error);
    return [];
  }
}

export async function getRemoteOkJobById(id: string): Promise<RemoteOkJob | null> {
  const jobs = await searchRemoteOkJobs({ limit: 300 });
  return jobs.find((job) => String(job.id) === id) ?? null;
}
