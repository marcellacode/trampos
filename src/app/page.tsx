import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { LandingBackground } from "@/components/landing/landing-background";
import { CompanyLogos } from "@/components/landing/company-logos";
import { FeaturedJobs } from "@/components/landing/featured-jobs";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { FAQ } from "@/components/landing/faq";
import { CtaFinal } from "@/components/landing/cta-final";
import { Footer } from "@/components/landing/footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  fetchLandingCompanies,
  fetchLandingStats,
} from "@/lib/supabase/queries/discovery";
import { fetchAllExternalJobs } from "@/lib/discovery/fetch-external-jobs";

export default async function HomePage() {
  let landingStats = {
    jobsCount: 0,
    companiesCount: 0,
    featuredJobs: [] as Awaited<
      ReturnType<typeof fetchLandingStats>
    >["featuredJobs"],
  };
  let companies: Awaited<ReturnType<typeof fetchLandingCompanies>> = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createServerSupabaseClient();
      [landingStats, companies] = await Promise.all([
        fetchLandingStats(supabase),
        fetchLandingCompanies(supabase),
      ]);
    } catch {
      // Sections hide themselves when data is unavailable.
    }
  }

  if (landingStats.featuredJobs.length === 0) {
    try {
      const external = await fetchAllExternalJobs(
        { perProvider: 4 },
        { what: "desenvolvedor", where: "Brasil" }
      );
      landingStats.featuredJobs = external.slice(0, 6);
      landingStats.jobsCount = external.length;
      if (companies.length === 0) {
        companies = [
          ...new Set(external.map((j) => j.company).filter(Boolean)),
        ]
          .slice(0, 12)
          .map((name) => ({
            name,
            color: "#a1a1aa",
            logo: name.slice(0, 2).toUpperCase(),
          }));
        landingStats.companiesCount = companies.length;
      }
    } catch {
      // External providers unavailable — sections stay empty.
    }
  }

  const heroStats = [
    ...(landingStats.jobsCount > 0
      ? [{ value: String(landingStats.jobsCount), label: "vagas indexadas" }]
      : []),
    ...(landingStats.companiesCount > 0
      ? [
          {
            value: String(landingStats.companiesCount),
            label: "empresas",
          },
        ]
      : []),
  ];

  const terminalActions = [
    { id: "scan", label: "Varrendo Adzuna, Remotive, RemoteOK..." },
    ...landingStats.featuredJobs.slice(0, 5).map((job) => ({
      id: job.id,
      label: `${job.role} @ ${job.company}${
        job.hasMatch && job.compatibility > 0
          ? ` — ${job.compatibility}% match`
          : ""
      }`,
    })),
  ];

  const topMatch = landingStats.featuredJobs.find(
    (j) => j.hasMatch && j.compatibility > 0
  );

  return (
    <>
      <LandingBackground />
      <Header />
      <main className="relative">
        <Hero
          stats={heroStats}
          terminalActions={terminalActions}
          featuredScore={
            topMatch
              ? {
                  score: topMatch.compatibility,
                  role: topMatch.role,
                  company: topMatch.company,
                }
              : undefined
          }
        />
        <FeaturedJobs jobs={landingStats.featuredJobs} />
        <CompanyLogos companies={companies} />
        <HowItWorks />
        <Features />
        <FAQ />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
