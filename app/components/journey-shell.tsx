"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, LockKeyhole, ArrowUpRight, Globe2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "../lib/language-context";
import type { ReactNode } from "react";

export function JourneyShell({
  children,
  step = 0,
}: {
  children: ReactNode;
  step?: number;
}) {
  const { dir, toggleLanguage } = useLanguage();
  const ar = dir === "rtl";
  const labels = ar
    ? ["بياناتك", "تقييم الحوكمة", "التقييم المؤسسي", "العرض المالي"]
    : [
        "Your details",
        "Governance",
        "Institutional profile",
        "Financial proposal",
      ];
  return (
    <div className="workspace" dir={dir}>
      <header className="workspace-header">
        <Link className="brand" href="/">
          <Image src="/images/logo.png" alt="CRAM" width={44} height={44} />
          <span>
            <strong>
              CRAM<span className="brand-dot">.</span>
            </strong>
            <small>{ar ? "الاستشارات المؤسسية" : "BUSINESS ADVISORY"}</small>
          </span>
        </Link>
        <div className="header-actions">
          <Link href="/assessment" className="profile-link">
            {ar ? "ملفي" : "My profile"}
          </Link>
          <span className="header-caption">
            {ar ? "مساحة التقييم" : "ASSESSMENT WORKSPACE"}
          </span>
          <button className="button-quiet" onClick={toggleLanguage}>
            <Globe2 size={16} />
            {ar ? "English" : "العربية"}
          </button>
        </div>
      </header>
      <nav
        className="journey-track"
        aria-label={ar ? "مراحل رحلتك" : "Your journey"}
      >
        {labels.map((label, i) => (
          <div
            className={`journey-step ${i < step ? "is-done" : ""} ${i === step ? "is-current" : ""}`}
            key={label}
            aria-current={i === step ? "step" : undefined}
          >
            <span>
              {i < step ? (
                <Check size={15} />
              ) : i > step ? (
                <LockKeyhole size={13} />
              ) : (
                `0${i + 1}`
              )}
            </span>
            <b>{label}</b>
          </div>
        ))}
      </nav>
      <main id="main-content" className="workspace-main">
        {children}
      </main>
      <footer className="workspace-footer">
        <span>© {new Date().getFullYear()} CRAM Consulting</span>
        <span>
          {ar ? "كل خطوة، برؤية أوضح." : "Every step. A clearer perspective."}
        </span>
      </footer>
    </div>
  );
}

export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.div>
  );
}

export function Notice({
  title,
  children,
  href,
  action,
}: {
  title: string;
  children: ReactNode;
  href?: string;
  action?: string;
}) {
  return (
    <Reveal className="notice-panel">
      <div className="status-icon">
        <LockKeyhole size={26} />
      </div>
      <h1>{title}</h1>
      <p>{children}</p>
      {href && (
        <Link className="button-primary" href={href}>
          {action}
          <ArrowUpRight size={18} />
        </Link>
      )}
    </Reveal>
  );
}

export function SectionNav({
  titles,
  active,
  complete,
  onSelect,
  review = false,
}: {
  titles: string[];
  active: number;
  complete: (i: number) => boolean;
  onSelect: (i: number) => void;
  review?: boolean;
}) {
  const { dir } = useLanguage();
  return (
    <aside className="section-sidebar">
      <p className="eyebrow">
        {dir === "rtl" ? "أقسام التقييم" : "IN THIS ASSESSMENT"}
      </p>
      <nav aria-label={dir === "rtl" ? "أقسام التقييم" : "Assessment sections"}>
        {titles.map((title, i) => (
          <button
            key={title}
            className={`section-link ${active === i && !review ? "active" : ""}`}
            aria-current={active === i && !review ? "step" : undefined}
            aria-label={`${i + 1}. ${title}`}
            title={title}
            onClick={() => onSelect(i)}
          >
            <span
              className={complete(i) ? "section-number done" : "section-number"}
            >
              {complete(i) ? (
                <Check size={14} />
              ) : (
                String(i + 1).padStart(2, "0")
              )}
            </span>
            <span>{title}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-note">
        {dir === "rtl"
          ? "خذ وقتك. يمكنك العودة لأي قسم وتعديل إجاباتك قبل الإرسال."
          : "Take your time. You can revisit any section and change your answers before submitting."}
      </div>
    </aside>
  );
}
