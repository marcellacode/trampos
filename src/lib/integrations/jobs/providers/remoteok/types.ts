export interface RemoteOkJob {
  id: string;
  slug: string;
  epoch: number;
  date: string;
  company: string;
  company_logo?: string;
  position: string;
  tags: string[];
  description: string;
  location: string;
  apply_url: string;
  salary_min: number;
  salary_max: number;
  url: string;
}

export interface RemoteOkSearchParams {
  search?: string;
  limit?: number;
}
