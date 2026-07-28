import type { JobRecommendation } from "@/types/jobs";

export const EXTERNAL_JOB_SOURCES = [
  "adzuna",
  "remotive",
  "arbeitnow",
  "remoteok",
  "jobicy",
] as const;

export type ExternalJobSource = (typeof EXTERNAL_JOB_SOURCES)[number];

export type JobSource = "internal" | ExternalJobSource;

const SOURCE_LABELS: Record<ExternalJobSource, string> = {
  adzuna: "Adzuna",
  remotive: "Remotive",
  arbeitnow: "Arbeitnow",
  remoteok: "RemoteOK",
  jobicy: "Jobicy",
};

export function externalJobRef(source: ExternalJobSource, id: string): string {
  return `${source}-${id}`;
}

export function parseExternalJobRef(
  ref: string
): { source: ExternalJobSource; id: string } | null {
  for (const source of EXTERNAL_JOB_SOURCES) {
    const prefix = `${source}-`;
    if (ref.startsWith(prefix)) {
      return { source, id: ref.slice(prefix.length) };
    }
  }
  return null;
}

export function isExternalJobSource(
  source: JobRecommendation["source"]
): source is ExternalJobSource {
  return source != null && source !== "internal";
}

export function isExternalJob(job: Pick<JobRecommendation, "source" | "externalUrl">): boolean {
  return isExternalJobSource(job.source) || Boolean(job.externalUrl);
}

export function getJobSourceLabel(source: JobRecommendation["source"]): string | null {
  if (!source || source === "internal") return null;
  return SOURCE_LABELS[source] ?? source;
}

export function providerFromExternalKey(externalKey: string): ExternalJobSource | "unknown" {
  const parsed = parseExternalJobRef(externalKey);
  return parsed?.source ?? "unknown";
}
