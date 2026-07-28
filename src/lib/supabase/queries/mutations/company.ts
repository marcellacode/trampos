import type { SupabaseClient } from "@supabase/supabase-js";

export interface UpdateCompanyProfileInput {
  bio?: string;
  logo?: string;
  coverUrl?: string | null;
}

export async function updateCompanyProfile(
  supabase: SupabaseClient,
  companyId: string,
  input: UpdateCompanyProfileInput
) {
  const payload: Record<string, string | null> = {};
  if (input.bio !== undefined) payload.bio = input.bio;
  if (input.logo !== undefined) payload.logo = input.logo;
  if (input.coverUrl !== undefined) payload.cover_url = input.coverUrl;

  const { data, error } = await supabase
    .from("companies")
    .update(payload)
    .eq("id", companyId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Sem permissão para editar esta empresa.");
  return data;
}

export async function replaceCompanyBenefits(
  supabase: SupabaseClient,
  companyId: string,
  benefits: string[]
) {
  const normalized = benefits
    .map((benefit) => benefit.trim())
    .filter(Boolean);

  const { error: deleteError } = await supabase
    .from("company_benefits")
    .delete()
    .eq("company_id", companyId);

  if (deleteError) throw deleteError;

  if (normalized.length === 0) return;

  const { error: insertError } = await supabase.from("company_benefits").insert(
    normalized.map((benefit, index) => ({
      company_id: companyId,
      benefit,
      sort_order: index,
    }))
  );

  if (insertError) throw insertError;
}

export async function claimCompany(
  supabase: SupabaseClient,
  companyId: string
) {
  const { data, error } = await supabase.rpc("claim_company", {
    p_company_id: companyId,
  });

  if (error) throw error;
  return data;
}
