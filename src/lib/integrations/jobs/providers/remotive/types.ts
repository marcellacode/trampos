export interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

export interface RemotiveSearchResults {
  "job-count"?: number;
  jobs: RemotiveJob[];
}

export interface RemotiveSearchParams {
  search?: string;
  category?: string;
  limit?: number;
}
