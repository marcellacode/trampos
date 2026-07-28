"use server";

import { revalidatePath } from "next/cache";
import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import {
  claimCompany,
  replaceCompanyBenefits,
  updateCompanyProfile,
} from "@/lib/supabase/queries/mutations/company";
import {
  fetchEditableCompany,
  fetchPublicCompanyBySlug,
} from "@/lib/supabase/queries/company";
import type { ActionResult } from "@/app/actions/ai";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export async function claimCompanyAction(
  companyId: string
): Promise<ActionResult<{ companySlug: string }>> {
  try {
    const { supabase, user } = await requireAuth();
    await claimCompany(supabase, companyId);

    const { data: company } = await supabase
      .from("companies")
      .select("slug")
      .eq("id", companyId)
      .maybeSingle();

    const slug = company?.slug;
    if (slug) {
      revalidatePath(`/empresa/${slug}`);
      revalidatePath("/dashboard/empresa");
    }

    return {
      success: true,
      data: { companySlug: slug ?? "" },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCompanyProfileAction(input: {
  companyId: string;
  bio?: string;
  logo?: string;
  coverUrl?: string | null;
}): Promise<ActionResult<{ slug: string }>> {
  try {
    const { supabase, user } = await requireAuth();
    const editable = await fetchEditableCompany(
      supabase,
      user.id,
      input.companyId
    );
    if (!editable) {
      return { success: false, error: "Sem permissão para editar esta empresa." };
    }

    await updateCompanyProfile(supabase, input.companyId, {
      bio: input.bio,
      logo: input.logo,
      coverUrl: input.coverUrl,
    });

    revalidatePath(`/empresa/${editable.slug}`);
    revalidatePath("/dashboard/empresa");

    return { success: true, data: { slug: editable.slug } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCompanyBenefitsAction(input: {
  companyId: string;
  benefits: string[];
}): Promise<ActionResult<{ slug: string }>> {
  try {
    const { supabase, user } = await requireAuth();
    const editable = await fetchEditableCompany(
      supabase,
      user.id,
      input.companyId
    );
    if (!editable) {
      return { success: false, error: "Sem permissão para editar esta empresa." };
    }

    await replaceCompanyBenefits(supabase, input.companyId, input.benefits);

    revalidatePath(`/empresa/${editable.slug}`);
    revalidatePath("/dashboard/empresa");

    return { success: true, data: { slug: editable.slug } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getClaimEligibilityAction(
  slug: string
): Promise<
  ActionResult<{
    canClaim: boolean;
    reason: string | null;
    companyId: string | null;
    isClaimed: boolean;
  }>
> {
  try {
    const { supabase, user } = await requireAuth();
    const company = await fetchPublicCompanyBySlug(supabase, slug);
    if (!company) {
      return { success: false, error: "Empresa não encontrada." };
    }

    if (company.isClaimed) {
      return {
        success: true,
        data: {
          canClaim: false,
          reason: "Esta empresa já foi reivindicada.",
          companyId: company.id,
          isClaimed: true,
        },
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .maybeSingle();

    const email = profile?.email ?? user.email ?? "";
    const domainRoot = email.split("@")[1]?.split(".")[0]?.toLowerCase() ?? "";
    const canClaim = domainRoot === company.slug.toLowerCase();

    return {
      success: true,
      data: {
        canClaim,
        reason: canClaim
          ? null
          : `Use um e-mail corporativo @${company.slug} para reivindicar automaticamente.`,
        companyId: company.id,
        isClaimed: false,
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
