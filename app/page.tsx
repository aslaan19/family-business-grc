"use client";

import { RoadmapSection } from "./components/ui/roadmap-section";
import { LanguageToggle } from "../app/components/ui/language-toggle";
import { useLanguage } from "../app/lib/language-context";
import { HeroSection } from "./components/ui/hero-section";

export default function Home() {
  const { dir } = useLanguage();

  return (
    <main className="min-h-screen bg-background" dir={dir}>
      <div className="flex justify-end p-6">
        <LanguageToggle />
      </div>
      <HeroSection />
      <RoadmapSection />
    </main>
  );
}
