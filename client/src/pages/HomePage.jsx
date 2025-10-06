import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { RoleSection } from "@/components/landing/RoleSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#0F1624] relative">
      <div className="absolute inset-0">
        <img src="/gradients/gradient-1.svg" alt="gradient" />
      </div>
      <div className="absolute right-0 top-40">
        <img src="/gradients/gradient-2.svg" alt="gradient" />
      </div>
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <RoleSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
