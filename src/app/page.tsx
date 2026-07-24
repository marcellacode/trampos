import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { CompanyLogos } from "@/components/landing/company-logos";
import { FeaturedJobs } from "@/components/landing/featured-jobs";
import { HowItWorks } from "@/components/landing/how-it-works";
import { DemoSection } from "@/components/landing/demo-section";
import { Features } from "@/components/landing/features";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Testimonials } from "@/components/landing/testimonials";
import { Comparison } from "@/components/landing/comparison";
import { FAQ } from "@/components/landing/faq";
import { CtaFinal } from "@/components/landing/cta-final";
import { Footer } from "@/components/landing/footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  fetchLandingCompanies,
  fetchLandingStats,
} from "@/lib/supabase/queries/discovery";
import {
  fetchLandingPlatformStats,
  fetchRecentJobActivity,
  fetchTestimonials,
} from "@/lib/supabase/queries/content";

export default async function HomePage() {
  let landingStats = {
    jobsCount: 0,
    companiesCount: 0,
    featuredJobs: [] as Awaited<
      ReturnType<typeof fetchLandingStats>
    >["featuredJobs"],
  };
  let companies: Awaited<ReturnType<typeof fetchLandingCompanies>> = [];
  let testimonials: Awaited<ReturnType<typeof fetchTestimonials>> = [];
  let terminalActions: Awaited<ReturnType<typeof fetchRecentJobActivity>> = [];
  let platformStats = { opportunities: 0, trends: 0 };

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createServerSupabaseClient();
      [
        landingStats,
        companies,
        testimonials,
        terminalActions,
        platformStats,
      ] = await Promise.all([
        fetchLandingStats(supabase),
        fetchLandingCompanies(supabase),
        fetchTestimonials(supabase),
        fetchRecentJobActivity(supabase),
        fetchLandingPlatformStats(supabase),
      ]);
    } catch {
      // Sections hide themselves when data is unavailable.
    }
  }

  const featuredJob = landingStats.featuredJobs[0];
  const heroStats = [
    {
      value: String(landingStats.jobsCount),
      label: "vagas ativas monitoradas",
    },
    {
      value: String(landingStats.companiesCount),
      label: "empresas no catálogo",
    },
    ...(platformStats.opportunities > 0
      ? [
          {
            value: String(platformStats.opportunities),
            label: "oportunidades mapeadas",
          },
        ]
      : []),
  ];

  return (
    <>
      <Header />
      <main>
        <Hero stats={heroStats} terminalActions={terminalActions} />
        <CompanyLogos companies={companies} />
        <FeaturedJobs jobs={landingStats.featuredJobs} />
        {featuredJob && (
          <DemoSection
            userMessage={`Quero uma vaga ${featuredJob.role} ${featuredJob.remote ? "remota" : ""} · ${featuredJob.salary}`.trim()}
            assistantMessage={featuredJob.aiSummary}
            jobTitle={featuredJob.role}
            companyName={featuredJob.company}
          />
        )}
        <HowItWorks />
        <Features />
        <DashboardPreview
          stats={{
            jobs: landingStats.jobsCount,
            companies: landingStats.companiesCount,
            trends: platformStats.trends,
            opportunities: platformStats.opportunities,
          }}
        />
        <Testimonials testimonials={testimonials} />
        <Comparison />
        <FAQ />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
