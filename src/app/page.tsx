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
import { fetchAllExternalJobs } from "@/lib/discovery/fetch-external-jobs";

export default async function HomePage() {
  let landingStats = { jobsCount: 0, companiesCount: 0, featuredJobs: [] as Awaited<ReturnType<typeof fetchLandingStats>>["featuredJobs"] };
  let companies: Awaited<ReturnType<typeof fetchLandingCompanies>> = [];
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) { try { const supabase = await createServerSupabaseClient(); [landingStats, companies] = await Promise.all([fetchLandingStats(supabase), fetchLandingCompanies(supabase)]); } catch {} }
  if (!landingStats.featuredJobs.length) { try { const external = await fetchAllExternalJobs({ perProvider: 4 }, { what: "desenvolvedor", where: "Brasil" }); landingStats.featuredJobs = external.slice(0,6); landingStats.jobsCount = external.length; if (!companies.length) { companies = [...new Set(external.map(j => j.company).filter(Boolean))].slice(0,12).map(name => ({ name, color: "#64748b", logo: name.slice(0,2).toUpperCase() })); landingStats.companiesCount = companies.length; } } catch {} }
  const heroStats = [ ...(landingStats.jobsCount ? [{ value: String(landingStats.jobsCount), label: "vagas disponíveis" }] : []), ...(landingStats.companiesCount ? [{ value: String(landingStats.companiesCount), label: "empresas" }] : []) ];
  return <><Header/><main><Hero stats={heroStats}/><FeaturedJobs jobs={landingStats.featuredJobs}/><CompanyLogos companies={companies}/><Features/><ForCompanies/><HowItWorks/><FAQ/><CtaFinal/></main><Footer/></>;
}
