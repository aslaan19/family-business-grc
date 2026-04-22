"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  ArrowUpRight,
  ExternalLink,
  Share2,
} from "lucide-react";
import { useLanguage } from "../../lib/language-context";
import { cn } from "../../lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SOCIAL_LINKS = [
  {
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
    href: "https://www.linkedin.com/in/cram-consulting-950626356/",
    label: "LinkedIn",
    color:
      "hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/5",
  },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    href: "https://www.facebook.com/CRAM.Consulting.Solutions",
    label: "Facebook",
    color:
      "hover:text-[#1877F2] hover:border-[#1877F2]/30 hover:bg-[#1877F2]/5",
  },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    href: "https://x.com/cramconsulting_",
    label: "X / Twitter",
    color:
      "hover:text-foreground hover:border-foreground/30 hover:bg-foreground/5",
  },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path
          fill="var(--background, white)"
          d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
        />
        <line
          x1="17.5"
          y1="6.5"
          x2="17.51"
          y2="6.5"
          stroke="var(--background, white)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    href: "https://www.instagram.com/cram.consulting.solutions/",
    label: "Instagram",
    color:
      "hover:text-[#E4405F] hover:border-[#E4405F]/30 hover:bg-[#E4405F]/5",
  },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon
          fill="var(--background, white)"
          points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
        />
      </svg>
    ),
    href: "https://www.youtube.com/@CRAMConsulting",
    label: "YouTube",
    color:
      "hover:text-[#FF0000] hover:border-[#FF0000]/30 hover:bg-[#FF0000]/5",
  },
];
const NAV_COLUMNS = {
  ar: [
    {
      title: "الخدمات",
      links: [
        { label: "التقييم الأولي", href: "#roadmap" },
        { label: "التقييم الشامل", href: "#roadmap" },
        { label: "العرض التقني", href: "#roadmap" },
        { label: "برامج التطوير", href: "#roadmap" },
      ],
    },
    {
      title: "الشركة",
      links: [
        { label: "من نحن", href: "https://cram.sa/about" },

        { label: "خدماتنا", href: "https://cram.sa/services" },
        { label: "تواصل معنا", href: "https://cram.sa/contact" },
      ],
    },
  ],
  en: [
    {
      title: "Services",
      links: [
        { label: "Initial Assessment", href: "#roadmap" },
        { label: "Full Assessment", href: "#roadmap" },
        { label: "Technical Proposal", href: "#roadmap" },
        { label: "Development Programs", href: "#roadmap" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "https://cram.sa/about" },
        { label: "Expert Team", href: "https://cram.sa/services" },
        { label: "Contact", href: "https://cram.sa/contact" },
      ],
    },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Footer() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";
  const columns = isRtl ? NAV_COLUMNS.ar : NAV_COLUMNS.en;
  const year = new Date().getFullYear();

  return (
    <footer
      dir={dir}
      className="relative bg-card border-t border-border overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="container mx-auto px-5 lg:px-10 relative">
        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pt-16 pb-12">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            {/* Logo */}
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

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              {isRtl
                ? "نقود مسيرة التميز المؤسسي من خلال حلول حوكمة متكاملة ومبتكرة، مصممة خصيصاً لتلبية احتياجات المؤسسات والشركات العائلية."
                : "Leading institutional excellence through integrated and innovative governance solutions, designed specifically for organizations and family businesses."}
            </p>

            {/* Contact info */}
            <div className="space-y-2.5 mb-6">
              <a
                href="mailto:gm@cram.sa"
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                </div>
                <span dir="ltr">gm@cram.sa</span>
              </a>
              <a
                href="tel:+966549584775"
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                </div>
                <span dir="ltr">+966 54 958 4775</span>
              </a>
              <a
                href="https://cram.sa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                </div>
                <span dir="ltr">cram.sa</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
              </a>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  whileHover={{ y: -2, scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  className={cn(
                    "w-9 h-9 rounded-xl border border-border/60 bg-background/50",
                    "flex items-center justify-center text-muted-foreground",
                    "transition-all duration-200",
                    s.color,
                  )}
                >
                  <s.icon />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Nav columns */}
          {columns.map((col, ci) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 + ci * 0.1 }}
            >
              <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span className="w-0 group-hover:w-3 h-px bg-primary transition-all duration-300 shrink-0" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── Profile PDF CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border border-primary/20 bg-primary/4 rounded-2xl px-6 py-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isRtl ? "تعرّف علينا أكثر" : "Learn More About Us"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRtl
                ? "حمّل بروفايل الشركة الكامل بصيغة PDF"
                : "Download our complete company profile as PDF"}
            </p>
          </div>
          <a
            href="https://drive.google.com/file/d/1rnhlQkvw_6eOT7AZonYMOzi7I6z70jOn/view"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
          >
            {isRtl ? "تحميل البروفايل" : "Download Profile"}
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-border/60 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-start">
            © {year} CRAM Consulting.{" "}
            {isRtl ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>
              {isRtl
                ? "Dr. Mohamed Soror — GM & Senior Consultant"
                : "Dr. Mohamed Soror — GM & Senior Consultant"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
