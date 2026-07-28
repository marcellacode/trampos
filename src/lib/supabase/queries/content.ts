import type { SupabaseClient } from "@supabase/supabase-js";
import type { Testimonial } from "@/types/auth";
import type { TestimonialItem } from "@/lib/constants";

export async function fetchTestimonials(
  supabase: SupabaseClient
): Promise<TestimonialItem[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, role_title, company_name, avatar_url, quote")
    .eq("is_published", true)
    .order("sort_order");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    name: row.name,
    role: row.role_title,
    company: row.company_name,
    avatar: row.avatar_url || row.name.slice(0, 2).toUpperCase(),
    text: row.quote,
  }));
}

export async function fetchAuthTestimonials(
  supabase: SupabaseClient
): Promise<Testimonial[]> {
  const rows = await fetchTestimonials(supabase);
  return rows.map((row, index) => ({
    id: String(index + 1),
    name: row.name,
    role: row.role,
    company: row.company,
    avatar: row.avatar,
    quote: row.text,
  }));
}

export async function fetchRecentJobActivity(
  supabase: SupabaseClient,
  limit = 5
) {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, companies!jobs_company_id_fkey(name)")
    .eq("is_active", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((job) => {
    const companies = job.companies as
      | { name: string }
      | { name: string }[]
      | null;
    const company = Array.isArray(companies)
      ? companies[0]?.name
      : companies?.name;
    const label = company
      ? `Analisando ${job.title} · ${company}`
      : `Analisando ${job.title}`;
    return { id: job.id, label };
  });
}

export async function fetchLandingPlatformStats(supabase: SupabaseClient) {
  const [regions, trends] = await Promise.all([
    supabase
      .from("opportunity_regions")
      .select("opportunity_count")
      .order("recorded_at", { ascending: false })
      .limit(20),
    supabase
      .from("market_trends")
      .select("id", { count: "exact", head: true }),
  ]);

  const opportunities = (regions.data ?? []).reduce(
    (sum, row) => sum + row.opportunity_count,
    0
  );

  return {
    opportunities,
    trends: trends.count ?? 0,
  };
}
