import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { StatsSection } from "@/components/landing/stats-section";
import { TemplatesSection } from "@/components/landing/templates-section";
import { SimplePricingSection } from "@/components/landing/simple-pricing-section";
import { FooterSection } from "@/components/landing/footer-section";
import { CTASection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <StatsSection />
        <TemplatesSection />
        <SimplePricingSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}
