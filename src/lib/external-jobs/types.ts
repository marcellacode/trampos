export type ExternalJobProvider =
  | "adzuna"
  | "remotive"
  | "arbeitnow"
  | "remoteok"
  | "jobicy"
  | "greenhouse"
  | "gupy"
  | "workable"
  | "unknown";

export interface ExternalJobRow {
  id: string;
  external_key: string;
  provider: string;
  title: string;
  company_name: string;
  location: string;
  description: string;
  apply_url: string | null;
  salary_min: number | null;
  salary_max: number | null;
  remote: boolean;
  stack: string[];
  raw_payload: Record<string, unknown> | null;
  fetched_at: string;
}

export interface ExternalJobInput {
  externalKey: string;
  provider: ExternalJobProvider;
  title: string;
  companyName: string;
  location?: string;
  description?: string;
  applyUrl?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  remote?: boolean;
  stack?: string[];
  rawPayload?: Record<string, unknown> | null;
}

export interface JobRef {
  /** Public ref: UUID for internal jobs, `adzuna-123` for external */
  ref: string;
  internalJobId?: string;
  externalJobId?: string;
  externalKey?: string;
  isExternal: boolean;
}
