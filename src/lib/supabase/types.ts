export interface DbCompany {
  id: string;
  slug: string;
  name: string;
  logo: string;
  brand_color: string;
  segment: string;
  employees_label: string;
  market_years: number | null;
  rating: number | null;
  verified: boolean;
  environment: string | null;
  remote_friendly: boolean;
  href: string | null;
  bio?: string;
  cover_url?: string | null;
  is_claimed?: boolean;
  claimed_at?: string | null;
  company_benefits?: { benefit: string; sort_order: number }[];
}

export interface DbJob {
  id: string;
  slug: string;
  title: string;
  location: string;
  salary_display: string;
  salary_min: number | null;
  salary_max: number | null;
  remote: boolean;
  published_at: string | null;
  verified: boolean;
  ai_summary: string;
  companies: DbCompany | DbCompany[] | null;
  job_stack?: { tech_name: string; sort_order: number }[];
  job_benefits?: { benefit: string; sort_order: number }[];
  job_stats?:
    | {
        response_days: number;
        process_days: number;
        steps: number;
        candidates: number;
      }
    | {
        response_days: number;
        process_days: number;
        steps: number;
        candidates: number;
      }[];
}

export interface DbJobMatch {
  id: string;
  job_id: string;
  compatibility: number;
  approval_level: string;
  approval_stars: number;
  best_send_day_label: string;
  best_send_time_range: string;
  best_send_insight: string;
  why_match_summary: string;
  approval_suggestion: string;
  salary_job_min: number | null;
  salary_job_max: number | null;
  salary_market_min: number | null;
  salary_market_max: number | null;
  salary_user_expectation: number | null;
  salary_insight: string;
  comparison_recommended_job_id: string | null;
  comparison_ai_conclusion: string;
  career_impact_explanation: string;
  job_match_reasons?: {
    id: string;
    text: string;
    reason_type: string;
    sort_order: number;
  }[];
  job_match_weight_factors?: {
    label: string;
    weight: number;
    sort_order: number;
  }[];
  job_match_approval_reasons?: { reason: string; sort_order: number }[];
  job_match_simulation_stages?: {
    id: string;
    label: string;
    status: string;
    sort_order: number;
  }[];
  job_match_tech_comparisons?: {
    id: string;
    tech_name: string;
    required_level: string;
    user_level: string;
    weight: number;
    sort_order: number;
  }[];
  job_match_resume_suggestions?: {
    id: string;
    text: string;
    suggestion_type: string;
    sort_order: number;
  }[];
  job_match_portfolio_projects?: {
    id: string;
    name: string;
    description: string;
    is_highlight: boolean;
    sort_order: number;
  }[];
  job_match_github_projects?: {
    id: string;
    name: string;
    description: string;
    relevance: string;
    sort_order: number;
  }[];
  job_match_apply_checklist?: {
    id: string;
    label: string;
    status: string;
    sort_order: number;
  }[];
  job_match_study_topics?: {
    id: string;
    title: string;
    priority: number;
    sort_order: number;
  }[];
  job_match_career_impact_roles?: {
    id: string;
    role_title: string;
    uplift_percent: number;
    sort_order: number;
  }[];
  job_match_comparison_items?: {
    id: string;
    compared_job_id: string;
    salary_display: string;
    remote_label: string;
    compatibility: number;
    process_steps: number;
    benefits_rating: number;
    sort_order: number;
    jobs?: {
      id: string;
      title: string;
      companies: DbCompany | DbCompany[] | null;
    } | {
      id: string;
      title: string;
      companies: DbCompany | DbCompany[] | null;
    }[] | null;
  }[];
}

export interface DbProfile {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  avatar_url: string | null;
  initials: string;
  plan: string;
  current_role: string;
  summary: string;
  avatar_initials: string;
  seniority: string;
  goal_role: string;
  goal_location: string;
  goal_salary: string;
  goal_availability_label: string;
}

export interface DbProfileExperience {
  id: string;
  company: string;
  role: string;
  period_label: string;
  description: string;
  sort_order: number;
}

export interface DbProfileSkill {
  skill_name: string;
  sort_order: number;
}

export interface DbProfileProject {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  profile_project_tech?: { tech_name: string; sort_order: number }[];
}

export interface DbProfileCertificate {
  id: string;
  name: string;
  issuer: string;
  year_label: string;
  sort_order: number;
}

export interface DbProfileEducation {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string;
  sort_order: number;
}

export interface DbProfileCourse {
  id: string;
  name: string;
  provider: string;
  completion_date: string | null;
  credential_url: string | null;
  description: string;
  sort_order: number;
}

export interface DbProfileLanguage {
  id: string;
  name: string;
  level_label: string;
  sort_order: number;
}

export function unwrapCompany(
  company: DbCompany | DbCompany[] | null | undefined
): DbCompany | null {
  if (!company) return null;
  return Array.isArray(company) ? (company[0] ?? null) : company;
}

export function unwrapSingle<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function sortByOrder<T extends { sort_order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}
