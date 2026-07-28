import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapPublicCompany,
  type DbPublicCompanyRow,
} from "@/lib/supabase/mappers/company";
import type { CompanyMembership, EditableCompany } from "@/types/company";

const PUBLIC_COMPANY_SELECT = `
  id,
  slug,
  name,
  logo,
  brand_color,
  segment,
  bio,
  cover_url,
  is_claimed,
  claimed_at,
  verified,
  remote_friendly,
  employees_label,
  market_years,
  rating,
  company_benefits (benefit, sort_order),
  jobs!jobs_company_id_fkey (
    id,
    slug,
    title,
    location,
    salary_display,
    remote,
    is_active,
    job_stats (response_days, process_days, steps, candidates)
  )
`;

export async function fetchPublicCompanyBySlug(
  supabase: SupabaseClient,
  slug: string
) {
  const { data, error } = await supabase
    .from("companies")
    .select(PUBLIC_COMPANY_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as DbPublicCompanyRow;
  const activeJobs = (row.jobs ?? []).filter((job) => job?.is_active === true);

  return mapPublicCompany({ ...row, jobs: activeJobs });
}

export async function fetchCompanyMemberships(
  supabase: SupabaseClient,
  userId: string
): Promise<CompanyMembership[]> {
  const { data, error } = await supabase
    .from("company_members")
    .select(
      `
      id,
      company_id,
      role,
      created_at,
      companies!company_members_company_id_fkey (
        id,
        slug,
        name,
        logo,
        brand_color,
        is_claimed
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).flatMap((row) => {
    const company = Array.isArray(row.companies)
      ? row.companies[0]
      : row.companies;
    if (!company) return [];

    return [
      {
        id: row.id,
        companyId: row.company_id,
        role: row.role,
        createdAt: row.created_at,
        company: {
          id: company.id,
          slug: company.slug,
          name: company.name,
          logo: company.logo,
          brandColor: company.brand_color,
          isClaimed: company.is_claimed,
        },
      },
    ];
  });
}

export async function fetchEditableCompany(
  supabase: SupabaseClient,
  userId: string,
  companyId: string
): Promise<EditableCompany | null> {
  const { data: membership, error: membershipError } = await supabase
    .from("company_members")
    .select("role")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (!membership || !["admin", "recruiter"].includes(membership.role)) {
    return null;
  }

  const { data, error } = await supabase
    .from("companies")
    .select(
      `
      id,
      slug,
      name,
      logo,
      brand_color,
      segment,
      bio,
      cover_url,
      company_benefits (benefit, sort_order)
    `
    )
    .eq("id", companyId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const benefits = (data.company_benefits ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => item.benefit);

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    logo: data.logo,
    brandColor: data.brand_color,
    segment: data.segment,
    bio: data.bio,
    coverUrl: data.cover_url,
    benefits,
    role: membership.role,
  };
}

export async function fetchCompanyActiveJobs(
  supabase: SupabaseClient,
  companyId: string
) {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, slug, title, location, salary_display, remote, published_at")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function isUserCompanyMember(
  supabase: SupabaseClient,
  userId: string,
  companyId: string
) {
  const { data, error } = await supabase
    .from("company_members")
    .select("id")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}
