"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "../../lib/language-context";
import { cn } from "../../lib/utils";
import Image from "next/image";

const NAV_LINKS = [
  { labelAr: "الرئيسية", labelEn: "Home", href: "#" },
  { labelAr: "خدماتنا", labelEn: "Services", href: "#services" },
  { labelAr: "خارطة الطريق", labelEn: "Roadmap", href: "#roadmap" },
  { labelAr: "تواصل معنا", labelEn: "Contact", href: "#contact" },
];

export function Header() {
  const { dir, toggleLanguage } = useLanguage();
  const isRtl = dir === "rtl";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langHover, setLangHover] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        dir={dir}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border/60 shadow-sm shadow-black/5"
            : "bg-transparent",
        )}
      >
        {/* Top accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="container mx-auto px-5 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative">
                <motion.div
                  className="w-13 h-13 rounded-xl overflow-hidden shadow-lg shadow-primary/20"
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Image
                    src="/images/logo.png"
                    alt="CRAM Logo"
                    width={70}
                    height={70}
                    className="w-full h-full object-cover scale-110"
                  />
                </motion.div>
                {/* Ping dot */}
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background">
                  <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-60" />
                </span>
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <p className="text-sm font-black text-foreground tracking-tight leading-none">
                  CRAM
                </p>
                <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase leading-none mt-0.5">
                  {isRtl ? "استشارات" : "Consulting"}
                </p>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  whileHover={{ y: -1 }}
                  className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                >
                  {isRtl ? link.labelAr : link.labelEn}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-primary transition-all duration-300 group-hover:w-4/5" />
                </motion.a>
              ))}
            </nav>

            {/* ── Right actions ── */}
            <div
              className={cn(
                "flex items-center gap-2",
                isRtl ? "flex-row-reverse" : "",
              )}
            >
              {/* Language toggle */}
              <motion.button
                onClick={toggleLanguage}
                onHoverStart={() => setLangHover(true)}
                onHoverEnd={() => setLangHover(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold",
                  "border border-border/70 bg-card/60 backdrop-blur-sm",
                  "text-muted-foreground hover:text-foreground hover:border-primary/40",
                  "transition-all duration-200",
                )}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isRtl ? "EN" : "ع"}</span>
                <AnimatePresence>
                  {langHover && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-foreground text-background px-2 py-0.5 rounded whitespace-nowrap"
                    >
                      {isRtl ? "Switch to English" : "التبديل للعربية"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* CTA */}
              <motion.a
                href="#roadmap"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
              >
                {isRtl ? "ابدأ التقييم" : "Start Assessment"}
                <ChevronDown
                  className={cn("w-3.5 h-3.5 -rotate-90", isRtl && "rotate-90")}
                />
              </motion.a>

              {/* Mobile hamburger */}
              <motion.button
                onClick={() => setMobileOpen((v) => !v)}
                whileTap={{ scale: 0.9 }}
                className="md:hidden w-9 h-9 rounded-xl border border-border/70 bg-card/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div
                      key="x"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              dir={dir}
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="fixed top-[4.5rem] inset-x-4 z-50 md:hidden rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
            >
              <div className="p-4 space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    {isRtl ? link.labelAr : link.labelEn}
                  </motion.a>
                ))}
              </div>
              <div className="border-t border-border p-4">
                <a
                  href="#roadmap"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                >
                  {isRtl ? "ابدأ التقييم" : "Start Assessment"}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
