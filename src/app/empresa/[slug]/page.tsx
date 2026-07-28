import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Heart, Sparkles } from "lucide-react";
import { ClaimCompanyBanner } from "@/components/company/claim-company-banner";
import { CompanyJobsList } from "@/components/company/company-jobs-list";
import { CompanyAnalysis } from "@/components/dashboard/jobs/details/company-analysis";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { fetchPublicCompanyBySlug } from "@/lib/supabase/queries/company";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PublicCompany } from "@/types/company";

interface CompanyPublicPageProps {
  params: Promise<{ slug: string }>;
}

async function resolveCompany(slug: string): Promise<{
  company: PublicCompany;
  isAuthenticated: boolean;
  isMember: boolean;
} | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const company = await fetchPublicCompanyBySlug(supabase, slug);
  if (!company) return null;

  let isMember = false;
  if (user) {
    const { data } = await supabase
      .from("company_members")
      .select("id")
      .eq("company_id", company.id)
      .eq("user_id", user.id)
      .maybeSingle();
    isMember = Boolean(data);
  }

  return {
    company,
    isAuthenticated: Boolean(user),
    isMember,
  };
}

export async function generateMetadata({
  params,
}: CompanyPublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveCompany(slug);

  if (!resolved) {
    return { title: "Empresa não encontrada — Jobera" };
  }

  const { company } = resolved;
  const title = `${company.name} — Jobera`;
  const description =
    company.bio.slice(0, 160) ||
    `${company.name} · ${company.segment}. Veja benefícios e vagas abertas.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function CompanyPublicRoute({
  params,
}: CompanyPublicPageProps) {
  const { slug } = await params;
  const resolved = await resolveCompany(slug);

  if (!resolved) notFound();

  const { company, isAuthenticated, isMember } = resolved;

  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          {isMember ? (
            <Button variant="outline" size="sm" render={<Link href="/dashboard/empresa" />}>
              Gerenciar empresa
            </Button>
          ) : (
            <Button variant="outline" size="sm" render={<Link href="/login" />}>
              Entrar na Jobera
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-0 sm:px-6">
        <CompanyHero company={company} />

        <div className="mt-6 space-y-6">
          {!company.isClaimed ? (
            <ClaimCompanyBanner
              companyId={company.id}
              companyName={company.name}
              companySlug={company.slug}
              isAuthenticated={isAuthenticated}
            />
          ) : null}

          {company.bio ? (
            <section className="rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Sobre a empresa
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                {company.bio}
              </p>
            </section>
          ) : null}

          {company.benefits.length > 0 ? (
            <section className="rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Benefícios
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2" role="list">
                {company.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-foreground/90"
                  >
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <CompanyAnalysis
            company={company.name}
            logo={company.logo}
            color={company.brandColor}
            profile={company.profile}
            stats={company.stats}
          />

          <CompanyJobsList jobs={company.jobs} companyName={company.name} />
        </div>
      </main>
    </div>
  );
}

function CompanyHero({ company }: { company: PublicCompany }) {
  return (
    <section aria-label="Cabeçalho da empresa">
      <div
        className="relative -mx-4 h-36 overflow-hidden rounded-b-2xl sm:-mx-6 sm:h-44"
        style={
          company.coverUrl
            ? {
                backgroundImage: `url(${company.coverUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background: `linear-gradient(135deg, ${company.brandColor}55, ${company.brandColor}22 45%, transparent)`,
              }
        }
      />

      <div className="relative -mt-16 flex flex-col gap-4 px-1 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-4">
          <div
            className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-background text-3xl font-bold shadow-lg sm:h-32 sm:w-32"
            style={{
              backgroundColor: `${company.brandColor}22`,
              color: company.brandColor,
            }}
          >
            {company.logo}
          </div>
          <div className="pb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {company.name}
              </h1>
              {company.verified ? (
                <BadgeCheck
                  className="h-5 w-5 text-success"
                  aria-label="Empresa verificada"
                />
              ) : null}
            </div>
            <p className="mt-1 text-base text-foreground/90">{company.segment}</p>
            {company.remoteFriendly ? (
              <p className="mt-1 text-sm text-primary">Remote-friendly</p>
            ) : null}
          </div>
        </div>

        <Button type="button" variant="outline" disabled className="w-fit">
          <Heart className="h-4 w-4" aria-hidden="true" />
          Seguir empresa
          <span className="sr-only"> (em breve)</span>
        </Button>
      </div>
    </section>
  );
}
