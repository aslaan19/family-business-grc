"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll } from "framer-motion";
import {
  ClipboardCheck,
  Building2,
  FileText,
  CheckCircle2,
  ArrowLeft,
  BadgeCheck,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";
import { useLanguage } from "../../lib/language-context";
import { AssessmentFormModal } from "../ui/assessment-form-modal";
import {
  USER_STORAGE_KEY,
  SUBMISSION_STORAGE_KEY,
} from "../ui/assessment-form-modal";

const SUBMISSION2_STORAGE_KEY = "karam_submission2_done";

// Brand accents
const GOLD = "#c5a059";
const DEEP_EMERALD = "#0a3d2c";

interface Step {
  id: number;
  num: string;
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  href?: string;
}

const steps: Step[] = [
  {
    id: 1,
    num: "01",
    icon: ClipboardCheck,
    titleKey: "step1.title",
    descriptionKey: "step1.description",
    href: "/assessment",
  },
  {
    id: 2,
    num: "02",
    icon: Building2,
    titleKey: "step2.title",
    descriptionKey: "step2.description",
    href: "/assessment2",
  },
  {
    id: 3,
    num: "03",
    icon: FileText,
    titleKey: "step3.title",
    descriptionKey: "step3.description",
  },
];

// ─── Step Card ────────────────────────────────────────────────────────────────

interface StepCardProps {
  step: Step;
  isCompleted: boolean;
  onOpenModal?: () => void;
  index: number;
}

function StepCard({ step, isCompleted, onOpenModal, index }: StepCardProps) {
  const { t, dir } = useLanguage();
  const Icon = step.icon;
  const isOutput = !step.href;

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: "easeOut" }}
      className="relative group"
    >
      {/* Subtle gold halo on hover */}
      <div
        className="absolute -inset-px rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${GOLD}40, transparent 40%, transparent 60%, ${GOLD}40)`,
        }}
      />

      <div
        className={cn(
          "relative rounded-[28px] overflow-hidden transition-all duration-500",
          "bg-white dark:bg-[#0f1614]",
          isCompleted
            ? "shadow-[0_10px_40px_-15px_rgba(16,185,129,0.4)]"
            : "shadow-[0_10px_40px_-20px_rgba(0,0,0,0.25)] group-hover:shadow-[0_20px_60px_-15px_rgba(10,61,44,0.4)]",
          "border border-foreground/[0.06]",
        )}
      >
        {/* ── Dark emerald header strip ── */}
        <div
          className="relative px-6 md:px-10 pt-6 md:pt-7 pb-5 md:pb-6 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${DEEP_EMERALD} 0%, #0d4d37 100%)`,
          }}
        >
          {/* Texture / pattern overlay */}
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />

          {/* Gold corner accent */}
          <div
            className={cn(
              "absolute top-0 h-[2px]",
              dir === "rtl" ? "right-0" : "left-0",
            )}
            style={{ background: GOLD, width: "64px" }}
          />

          {/* Oversized faded watermark number */}
          <span
            className={cn(
              "absolute select-none font-serif font-bold leading-none text-white/[0.07] pointer-events-none",
              dir === "rtl"
                ? "left-5 md:left-8 top-2"
                : "right-5 md:right-8 top-2",
            )}
            style={{ fontSize: "8rem" }}
            aria-hidden="true"
          >
            {step.num}
          </span>

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Icon in gold-bordered square */}
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: `1px solid ${GOLD}80`,
                }}
              >
                {isCompleted ? (
                  <BadgeCheck className="w-6 h-6 md:w-7 md:h-7" style={{ color: GOLD }} />
                ) : (
                  <Icon className="w-6 h-6 md:w-7 md:h-7" style={{ color: GOLD }} />
                )}
              </div>

              <div>
                <div
                  className="text-[10px] md:text-xs font-semibold tracking-[0.25em] uppercase mb-1"
                  style={{ color: GOLD }}
                >
                  {dir === "rtl" ? `الخطوة ${step.id}` : `Step ${step.id}`}
                </div>
                <div className="text-[11px] md:text-xs text-white/60 tracking-wide">
                  {t("stage.before")} · {t("step1.duration")}
                </div>
              </div>
            </div>

            {/* Status chip */}
            {isCompleted ? (
              <div
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-full shrink-0"
                style={{
                  background: "rgba(197, 160, 89, 0.12)",
                  border: `1px solid ${GOLD}66`,
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: GOLD }} />
                <span
                  className="text-[10px] md:text-xs font-semibold"
                  style={{ color: GOLD }}
                >
                  {dir === "rtl" ? "مكتمل" : "Completed"}
                </span>
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-full shrink-0"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: GOLD }}
                />
                <span className="text-[10px] md:text-xs font-semibold text-white/80">
                  {isOutput
                    ? dir === "rtl" ? "مخرج" : "Output"
                    : dir === "rtl" ? "متاح" : "Available"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="relative px-6 md:px-10 pt-7 md:pt-9 pb-6 md:pb-8">
          {/* Title */}
          <h3 className="text-2xl md:text-[28px] font-bold text-foreground mb-3 md:mb-4 leading-tight tracking-tight">
            {t(step.titleKey)}
          </h3>

          {/* Gold underline */}
          <div
            className="h-[2px] mb-5 md:mb-6"
            style={{ background: GOLD, width: "44px" }}
          />

          {/* Description */}
          <p className="text-sm md:text-[15px] leading-relaxed text-muted-foreground mb-7 md:mb-8">
            {t(step.descriptionKey)}
          </p>

          {/* CTA */}
          {isCompleted ? (
            <div
              className="flex items-center justify-center gap-3 py-4 px-5 rounded-2xl"
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}
            >
              <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs md:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {dir === "rtl"
                  ? "تم إكمال هذه المرحلة"
                  : "This step is completed"}
              </span>
            </div>
          ) : isOutput ? (
            <div
              className="flex items-start gap-3 py-4 px-5 rounded-2xl"
              style={{
                background: "rgba(197, 160, 89, 0.06)",
                border: `1px solid ${GOLD}40`,
              }}
            >
              <FileText
                className="w-4 h-4 md:w-5 md:h-5 mt-0.5 shrink-0"
                style={{ color: GOLD }}
              />
              <span className="text-xs md:text-sm font-semibold text-foreground/80 leading-relaxed">
                {dir === "rtl"
                  ? "يُعد فريقنا العرض المخصص بعد إكمال التقييمين"
                  : "Our team prepares your tailored proposal after both assessments"}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {/* Animated text + underline */}
              <div className="relative inline-flex items-center gap-2">
                <span className="text-sm md:text-base font-semibold text-foreground tracking-wide">
                  {t("step1.cta")}
                </span>
                <span
                  className={cn(
                    "absolute -bottom-1 h-[2px] transition-all duration-500",
                    dir === "rtl" ? "right-0" : "left-0",
                  )}
                  style={{
                    background: GOLD,
                    width: "20px",
                  }}
                />
                <span
                  className={cn(
                    "absolute -bottom-1 h-[2px] transition-all duration-500 group-hover:w-full",
                    dir === "rtl" ? "right-0 w-0" : "left-0 w-0",
                  )}
                  style={{ background: GOLD }}
                />
              </div>

              {/* Arrow CTA */}
              <div
                className="relative w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                style={{ background: DEEP_EMERALD }}
              >
                <ArrowLeft
                  className={cn(
                    "w-4 h-4 md:w-5 md:h-5 transition-transform duration-500",
                    dir === "ltr" && "rotate-180",
                    "group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5",
                  )}
                  style={{ color: GOLD }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (step.id === 1 && onOpenModal) {
    return (
      <button
        type="button"
        onClick={onOpenModal}
        className="block w-full text-start"
      >
        {card}
      </button>
    );
  }

  if (step.href && !isCompleted) {
    return <Link href={step.href}>{card}</Link>;
  }

  return card;
}

// ─── RoadmapSection ───────────────────────────────────────────────────────────

export function RoadmapSection() {
  const { t, dir } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  useScroll({ target: containerRef, offset: ["start end", "end start"] });

  const [submissionDone, setSubmissionDone] = useState(false);
  const [submission2Done, setSubmission2Done] = useState(false);
  const [userRegistered, setUserRegistered] = useState(false);

  useEffect(() => {
    function sync() {
      setSubmissionDone(!!localStorage.getItem(SUBMISSION_STORAGE_KEY));
      setSubmission2Done(!!localStorage.getItem(SUBMISSION2_STORAGE_KEY));
      setUserRegistered(!!localStorage.getItem(USER_STORAGE_KEY));
    }
    window.addEventListener("storage", sync);
    sync();
    return () => window.removeEventListener("storage", sync);
  }, []);

  function handleStartAssessment() {
    if (userRegistered) router.push("/assessment");
    else setModalOpen(true);
  }

  function handleFormSubmit(data: object) {
    setModalOpen(false);
    setUserRegistered(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("assessmentUser", JSON.stringify(data));
    }
    router.push("/assessment");
  }

  return (
    <section
      id="roadmap"
      ref={containerRef}
      className="relative py-20 md:py-32 overflow-hidden"
    >
      {/* Layered background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/40 to-background" />
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14 md:mb-20"
        >
          {/* Top gold kicker */}
          <div className="inline-flex items-center gap-3 mb-6 md:mb-8">
            <div className="h-px w-8 md:w-12" style={{ background: GOLD }} />
            <span
              className="text-[10px] md:text-xs font-semibold tracking-[0.35em] uppercase"
              style={{ color: GOLD }}
            >
              {t("roadmap.description")}
            </span>
            <div className="h-px w-8 md:w-12" style={{ background: GOLD }} />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 md:mb-6 leading-[1.1] tracking-tight">
            {t("roadmap.title")}
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2 font-light">
            {t("roadmap.subtitle")}
          </p>
        </motion.div>

        {/* ── Steps ── */}
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          {steps.map((step, i) => {
            const isCompleted =
              (step.id === 1 && submissionDone) ||
              (step.id === 2 && submission2Done);
            return (
              <StepCard
                key={step.id}
                step={step}
                isCompleted={isCompleted}
                onOpenModal={handleStartAssessment}
                index={i}
              />
            );
          })}

          {/* Scroll hint */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="!mt-14 md:!mt-20 flex flex-col items-center text-muted-foreground"
          >
            <span
              className="text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase mb-2"
              style={{ color: GOLD }}
            >
              {dir === "rtl" ? "اكتشف منتجاتنا" : "Explore our products"}
            </span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </div>

      <AssessmentFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </section>
  );
}
