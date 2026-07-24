import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { CompanyLogos } from "@/components/landing/company-logos";
import { HowItWorks } from "@/components/landing/how-it-works";
import { DemoSection } from "@/components/landing/demo-section";
import { Features } from "@/components/landing/features";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Comparison } from "@/components/landing/comparison";
import { FAQ } from "@/components/landing/faq";
import { CtaFinal } from "@/components/landing/cta-final";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CompanyLogos />
        <HowItWorks />
        <DemoSection />
        <Features />
        <DashboardPreview />
        <Comparison />
        <FAQ />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
