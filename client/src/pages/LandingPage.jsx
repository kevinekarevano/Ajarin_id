import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { RoleSection } from "@/components/landing/RoleSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <RoleSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
