"use client";

import Navbar from "./Navbar";
import HeroSection from "./sections/HeroSection";
import StorySection from "./sections/StorySection";
import ProblemSection from "./sections/ProblemSection";
import SolutionSection from "./sections/SolutionSection";
import FeaturesSection from "./sections/FeaturesSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import FinalCTASection from "./sections/FinalCTASection";

export default function LandingPage() {
  return (
    <main className="bg-void text-cream overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StorySection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FinalCTASection />
    </main>
  );
}
