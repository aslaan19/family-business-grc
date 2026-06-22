"use client";

import { RoadmapSection } from "./components/ui/roadmap-section";
import { ProductsSection } from "./components/ui/products-section";
import { useLanguage } from "../app/lib/language-context";
import { HeroSection } from "./components/ui/hero-section";
import { Header } from "./components/ui/Header";
import { Footer } from "./components/ui/Footer";

export default function Home() {
  const { dir } = useLanguage();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background" dir={dir}>
        <div className="flex justify-end p-6"></div>
        <HeroSection />
        <RoadmapSection />
        <ProductsSection />
      </main>
      <Footer />
    </>
  );
}
