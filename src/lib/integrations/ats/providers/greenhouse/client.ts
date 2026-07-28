export interface GreenhouseJob {
  id: number;
  title: string;
  location: { name: string };
  content: string;
  absolute_url: string;
  updated_at: string;
  departments: { name: string }[];
  offices: { name: string }[];
}

export async function fetchGreenhouseJob(
  boardToken: string,
  jobId: string
): Promise<GreenhouseJob | null> {
  try {
    const res = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs/${jobId}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return null;
    return (await res.json()) as GreenhouseJob;
  } catch {
    return null;
  }
}

export async function enrichJobFromGreenhouseUrl(
  applyUrl: string
): Promise<{ description: string; title?: string; location?: string } | null> {
  const boardMatch = applyUrl.match(/boards\.greenhouse\.io\/([^/?#]+)/i);
  const jobMatch = applyUrl.match(/jobs\/(\d+)/i);
  if (!boardMatch || !jobMatch) return null;

  const job = await fetchGreenhouseJob(boardMatch[1], jobMatch[1]);
  if (!job) return null;

  const stripHtml = (html: string) =>
    html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  return {
    title: job.title,
    location: job.location?.name ?? job.offices?.[0]?.name,
    description: stripHtml(job.content ?? ""),
  };
}
