export interface AdzunaCompany {
  display_name: string;
  __CLASS__?: string;
}

export interface AdzunaLocation {
  display_name: string;
  area?: string[];
  __CLASS__?: string;
}

export interface AdzunaCategory {
  tag?: string;
  label?: string;
  __CLASS__?: string;
}

export interface AdzunaJobResult {
  id: string;
  title: string;
  description: string;
  created: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  contract_type?: string;
  contract_time?: string;
  company: AdzunaCompany;
  location: AdzunaLocation;
  category?: AdzunaCategory;
  latitude?: number;
  longitude?: number;
}

export interface AdzunaJobSearchResults {
  count: number;
  mean?: number;
  results: AdzunaJobResult[];
  __CLASS__?: string;
}

export interface AdzunaCategoryResults {
  results: { tag: string; label: string }[];
}

export interface AdzunaSearchParams {
  what?: string;
  where?: string;
  page?: number;
  resultsPerPage?: number;
  sortBy?: "date" | "salary" | "relevance";
  maxDaysOld?: number;
  category?: string;
}

export interface AdzunaJobView extends AdzunaJobResult {
  adref?: string;
}
