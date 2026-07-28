import type { JobApplicationMode, JobRecommendation } from "@/types/jobs";

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

export function usesExternalApply(
  job: Pick<JobRecommendation, "source" | "externalUrl" | "applicationMode">
): boolean {
  if (isExternalJobSource(job.source)) return true;
  if (job.applicationMode === "external_redirect") return true;
  return false;
}

export function isExternalJob(
  job: Pick<JobRecommendation, "source" | "externalUrl" | "applicationMode">
): boolean {
  return usesExternalApply(job);
}

export function isExternalListing(
  job: Pick<JobRecommendation, "source">
): boolean {
  return isExternalJobSource(job.source);
}

export function isPlatformApply(
  job: Pick<JobRecommendation, "source" | "applicationMode">
): boolean {
  return job.source === "internal" && (job.applicationMode ?? "internal") === "internal";
}

export function getJobSourceLabel(source: JobRecommendation["source"]): string | null {
  if (!source || source === "internal") return null;
  return SOURCE_LABELS[source] ?? source;
}

export function getJobDiscoveryBadge(
  job: Pick<JobRecommendation, "source">
): "Vaga Jobera" | "Externa" {
  return job.source === "internal" ? "Vaga Jobera" : "Externa";
}

export function getApplyButtonLabel(
  state: "idle" | "preparing" | "prepared" | "completed",
  options: {
    applyUrl?: string | null;
    usesExternalApply: boolean;
    applicationMode?: JobApplicationMode;
  }
): string {
  if (state === "preparing") {
    return options.applicationMode === "internal" && !options.usesExternalApply
      ? "Enviando..."
      : "Preparando...";
  }
  if (state === "completed") {
    return options.applicationMode === "internal" && !options.usesExternalApply
      ? "Candidatura enviada"
      : "Concluída";
  }
  if (state === "prepared" && options.applyUrl) return "Abrir candidatura";
  if (state === "prepared") return "Candidatura registrada";
  if (options.applicationMode === "internal" && !options.usesExternalApply) {
    return "Enviar candidatura";
  }
  if (options.usesExternalApply) return "Preparar candidatura com IA";
  return "Candidatar-se na plataforma";
}

export function providerFromExternalKey(externalKey: string): ExternalJobSource | "unknown" {
  const parsed = parseExternalJobRef(externalKey);
  return parsed?.source ?? "unknown";
}
