import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { TemplatesSection } from "@/components/landing/templates-section"
import { SimplePricingSection } from "@/components/landing/simple-pricing-section"
import { FooterSection } from "@/components/landing/footer-section"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <TemplatesSection />
        <SimplePricingSection />
      </main>
      <FooterSection />
    </div>
  )
}
