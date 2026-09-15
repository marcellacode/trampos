import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { CompanyLogos } from "@/components/landing/company-logos";
import { FeaturedJobs } from "@/components/landing/featured-jobs";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { ForCompanies } from "@/components/landing/for-companies";
import { FAQ } from "@/components/landing/faq";
import { CtaFinal } from "@/components/landing/cta-final";
import { Footer } from "@/components/landing/footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchLandingCompanies, fetchLandingStats } from "@/lib/supabase/queries/discovery";

export default async function HomePage() {
  let landingStats = {
    jobsCount: 0,
    companiesCount: 0,
    featuredJobs: [] as Awaited<ReturnType<typeof fetchLandingStats>>["featuredJobs"],
  };
  let companies: Awaited<ReturnType<typeof fetchLandingCompanies>> = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createServerSupabaseClient();
      [landingStats, companies] = await Promise.all([
        fetchLandingStats(supabase),
        fetchLandingCompanies(supabase),
      ]);
    } catch {}
  }

  // Keep the public landing page statically renderable. External providers such
  // as Arbeitnow can return multi-megabyte payloads and are intentionally fetched
  // only by the runtime discovery flow, not while Next.js prerenders `/`.
  const heroStats = [
    ...(landingStats.jobsCount
      ? [{ value: String(landingStats.jobsCount), label: "vagas disponíveis" }]
      : []),
    ...(landingStats.companiesCount
      ? [{ value: String(landingStats.companiesCount), label: "empresas" }]
      : []),
  ];

  return (
    <>
      <Header />
      <main>
        <Hero stats={heroStats} />
        <FeaturedJobs jobs={landingStats.featuredJobs} />
        <CompanyLogos companies={companies} />
        <Features />
        <ForCompanies />
        <HowItWorks />
        <FAQ />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
