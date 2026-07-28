import type { SupabaseClient } from "@supabase/supabase-js";

export type UniversalSearchResultItem =
  | { type: "job"; id: string; label: string; subtitle: string; href: string }
  | { type: "profile"; id: string; label: string; subtitle: string; href: string }
  | { type: "company"; id: string; label: string; subtitle: string; href: string };

export interface UniversalSearchResults {
  items: UniversalSearchResultItem[];
  looksLikeQuestion: boolean;
}

const QUESTION_PATTERN =
  /^(como|qual|quais|quanto|por que|porque|o que|onde|when|what|how|why|help|ajuda|\?)/i;

export async function searchPlatformEntities(
  supabase: SupabaseClient,
  query: string,
  limit = 5
): Promise<UniversalSearchResults> {
  const trimmed = query.trim();
  const looksLikeQuestion =
    trimmed.includes("?") || QUESTION_PATTERN.test(trimmed);

  if (!trimmed || trimmed.length < 2) {
    return { items: [], looksLikeQuestion };
  }

  const pattern = `%${trimmed.replace(/[%_]/g, "")}%`;
  const items: UniversalSearchResultItem[] = [];

  const [jobsResult, profilesResult, companiesResult] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, slug, title, location, companies!jobs_company_id_fkey (name)")
      .eq("is_active", true)
      .or(`title.ilike.${pattern},slug.ilike.${pattern}`)
      .limit(limit),
    supabase
      .from("profiles")
      .select("id, slug, full_name, headline, location")
      .eq("is_public", true)
      .not("slug", "is", null)
      .or(`full_name.ilike.${pattern},headline.ilike.${pattern},slug.ilike.${pattern}`)
      .limit(limit),
    supabase
      .from("companies")
      .select("id, slug, name, segment")
      .or(`name.ilike.${pattern},slug.ilike.${pattern},segment.ilike.${pattern}`)
      .limit(limit),
  ]);

  for (const job of jobsResult.data ?? []) {
    const company = Array.isArray(job.companies) ? job.companies[0] : job.companies;
    items.push({
      type: "job",
      id: job.id,
      label: job.title,
      subtitle: `${company?.name ?? "Empresa"} · ${job.location}`,
      href: `/dashboard/vagas/${job.slug ?? job.id}`,
    });
  }

  for (const profile of profilesResult.data ?? []) {
    if (!profile.slug) continue;
    items.push({
      type: "profile",
      id: profile.id,
      label: profile.full_name,
      subtitle: profile.headline || profile.location || "Profissional",
      href: `/perfil/${profile.slug}`,
    });
  }

  for (const company of companiesResult.data ?? []) {
    items.push({
      type: "company",
      id: company.id,
      label: company.name,
      subtitle: company.segment || "Empresa",
      href: `/empresa/${company.slug}`,
    });
  }

  return { items, looksLikeQuestion };
}
