/* eslint-disable react-hooks/refs */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useScroll,
  useInView,
  AnimatePresence,
  useSpring,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import {
  ClipboardCheck,
  Building2,
  FileText,
  GraduationCap,
  Lightbulb,
  Lock,
  Check,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { cn } from "../../lib/utils";
import Link from "next/link";
import { useLanguage } from "../../lib/language-context";
import { AssessmentFormModal } from "../ui/assessment-form-modal";
import {
  USER_STORAGE_KEY,
  SUBMISSION_STORAGE_KEY,
} from "../ui/assessment-form-modal";

const SUBMISSION2_STORAGE_KEY = "karam_submission2_done";

type StageType = "before" | "during" | "after";

interface Step {
  id: number;
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  status: "available" | "locked" | "output";
  stage: StageType;
  href?: string;
}

const stageConfig = {
  before: {
    labelKey: "stage.before",
    color: "from-emerald-500 to-emerald-600",
    textColor: "text-emerald-600 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
    solidColor: "#10b981",
    numeral: "I",
  },
  during: {
    labelKey: "stage.during",
    color: "from-teal-500 to-cyan-500",
    textColor: "text-teal-600 dark:text-teal-400",
    dotColor: "bg-teal-500",
    solidColor: "#14b8a6",
    numeral: "II",
  },
  after: {
    labelKey: "stage.after",
    color: "from-green-600 to-green-700",
    textColor: "text-green-700 dark:text-green-400",
    dotColor: "bg-green-600",
    solidColor: "#16a34a",
    numeral: "III",
  },
} as const;

const roadmapSteps: Step[] = [
  {
    id: 1,
    icon: ClipboardCheck,
    titleKey: "step1.title",
    descriptionKey: "step1.description",
    status: "available",
    stage: "before",
    href: "/assessment",
  },
  {
    id: 2,
    icon: Building2,
    titleKey: "step2.title",
    descriptionKey: "step2.description",
    status: "locked",
    stage: "before",
    href: "/assessment2",
  },
  {
    id: 3,
    icon: FileText,
    titleKey: "step3.title",
    descriptionKey: "step3.description",
    status: "locked",
    stage: "before",
  },
  {
    id: 4,
    icon: GraduationCap,
    titleKey: "step4.title",
    descriptionKey: "step4.description",
    status: "locked",
    stage: "during",
  },
  {
    id: 5,
    icon: Lightbulb,
    titleKey: "step5.title",
    descriptionKey: "step5.description",
    status: "locked",
    stage: "after",
  },
];

const managementTypes = [
  {
    titleKey: "step4.type1",
    icon: "01",
    color: "from-emerald-500 to-emerald-600",
  },
  { titleKey: "step4.type2", icon: "02", color: "from-teal-500 to-cyan-500" },
  { titleKey: "step4.type3", icon: "03", color: "from-cyan-500 to-teal-600" },
  { titleKey: "step4.type4", icon: "04", color: "from-green-600 to-green-700" },
];

// ─── Path config ──────────────────────────────────────────────────────────────
// SVG viewBox 0 0 100 1000, path curves left/right
// t values (0..1) for each step along the path
// side: which side of the center line the card appears on
const PATH_D = "M 50 0 C 30 200, 70 350, 50 500 S 30 800, 50 1000";
const STEP_CONFIG = [
  { t: 0.08, side: "right" as const }, // step 1 — path curves left → card right
  { t: 0.24, side: "left" as const }, // step 2 — path near right → card left
  { t: 0.42, side: "right" as const }, // step 3 — back left → card right
  { t: 0.62, side: "left" as const }, // step 4 — path right → card left
  { t: 0.82, side: "right" as const }, // step 5 — path left → card right
];

// Container height in px — tall enough so cards don't overlap
const JOURNEY_HEIGHT = 2400;
const tToY = (t: number) => t * JOURNEY_HEIGHT;

// ─── Grain ────────────────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
      }}
    />
  );
}

// ─── Segmented progress (mobile) ─────────────────────────────────────────────
function SegmentedProgress({ completed }: { completed: number }) {
  const { dir } = useLanguage();
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="relative h-1.5 flex-1 rounded-full bg-muted overflow-hidden"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: i < completed ? 1 : 0 }}
            transition={{
              duration: 0.9,
              delay: 0.15 + i * 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ originX: dir === "rtl" ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"
          />
        </div>
      ))}
    </div>
  );
}

// ─── Mobile step row ──────────────────────────────────────────────────────────
function MobileStepRow({
  step,
  isCompleted,
  isUnlocked,
  isStep3FirstUnlock,
  isStep3FullyUnlocked,
  onOpenModal,
  index,
  isLast,
}: {
  step: Step;
  isCompleted: boolean;
  isUnlocked: boolean;
  isStep3FirstUnlock: boolean;
  isStep3FullyUnlocked: boolean;
  onOpenModal?: () => void;
  index: number;
  isLast: boolean;
}) {
  const { t, dir } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const config = stageConfig[step.stage];

  const effectivelyLocked =
    step.status === "locked" &&
    !isUnlocked &&
    !isStep3FirstUnlock &&
    !isStep3FullyUnlocked;
  const isPartiallyUnlocked = isStep3FirstUnlock && !isStep3FullyUnlocked;
  const isFullGreen = isCompleted || isStep3FullyUnlocked;
  const Icon = step.icon;

  const handleClick = useCallback(() => {
    if (effectivelyLocked) return;
    if (step.id === 1 && onOpenModal) {
      onOpenModal();
      return;
    }
    setExpanded((v) => !v);
  }, [effectivelyLocked, step.id, onOpenModal]);

  return (
    <motion.div
      initial={{ opacity: 0, x: dir === "rtl" ? 16 : -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.55,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative"
    >
      {!isLast && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6, delay: 0.2 + index * 0.07 }}
          style={{ originY: 0 }}
          className={cn(
            "absolute top-12 bottom-[-1.25rem] w-px",
            dir === "rtl" ? "right-[1.4rem]" : "left-[1.4rem]",
            isFullGreen
              ? "bg-gradient-to-b from-emerald-400 to-emerald-200 dark:from-emerald-600 dark:to-emerald-900"
              : "bg-border",
          )}
        />
      )}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.4,
          delay: 0.1 + index * 0.07,
          type: "spring",
          stiffness: 220,
        }}
        className={cn(
          "absolute top-3 z-10 w-12 h-12 rounded-full flex items-center justify-center ring-4 ring-background",
          dir === "rtl" ? "right-0" : "left-0",
          isFullGreen
            ? "bg-emerald-500 text-white"
            : isPartiallyUnlocked
              ? "bg-amber-500 text-white"
              : effectivelyLocked
                ? "bg-muted text-muted-foreground"
                : `bg-gradient-to-br ${config.color} text-white`,
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isFullGreen ? (
            <motion.div
              key="c"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 260 }}
            >
              <Check className="w-5 h-5" strokeWidth={3} />
            </motion.div>
          ) : effectivelyLocked ? (
            <motion.div
              key="l"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Lock className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="i"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
        {!effectivelyLocked && !isFullGreen && (
          <motion.span
            className={cn(
              "absolute inset-0 rounded-full",
              isPartiallyUnlocked ? "bg-amber-400" : "bg-emerald-400",
            )}
            animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.div>

      <div className={cn(dir === "rtl" ? "pr-16" : "pl-16")}>
        <motion.button
          type="button"
          onClick={handleClick}
          disabled={effectivelyLocked}
          whileTap={!effectivelyLocked ? { scale: 0.985 } : {}}
          className={cn(
            "w-full text-left rtl:text-right rounded-2xl p-4 transition-all duration-300",
            isFullGreen
              ? "bg-emerald-50/60 dark:bg-emerald-950/20 ring-1 ring-emerald-200/60 dark:ring-emerald-800/60"
              : isPartiallyUnlocked
                ? "bg-amber-50/60 dark:bg-amber-950/20 ring-1 ring-amber-200/60 dark:ring-amber-800/60"
                : effectivelyLocked
                  ? "bg-muted/20"
                  : "bg-card ring-1 ring-border/70 active:ring-emerald-400/60",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className={cn(
                    "font-mono text-[11px] tracking-widest",
                    effectivelyLocked
                      ? "text-muted-foreground/60"
                      : "text-muted-foreground",
                  )}
                >
                  {String(step.id).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "h-px w-4",
                    effectivelyLocked ? "bg-border" : "bg-foreground/20",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-[0.18em] font-medium",
                    effectivelyLocked
                      ? "text-muted-foreground/50"
                      : config.textColor,
                  )}
                >
                  {t(config.labelKey)}
                </span>
              </div>
              <h4
                className={cn(
                  "font-semibold text-[15px] leading-snug",
                  effectivelyLocked
                    ? "text-muted-foreground"
                    : "text-foreground",
                )}
              >
                {t(step.titleKey)}
              </h4>
            </div>
            {!effectivelyLocked && (
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="shrink-0 mt-1"
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            )}
          </div>
          <AnimatePresence initial={false}>
            {expanded && !effectivelyLocked && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="text-sm text-muted-foreground leading-relaxed pt-3 mt-3 border-t border-border/50">
                  {t(step.descriptionKey)}
                </p>
                {!isCompleted &&
                  !isStep3FullyUnlocked &&
                  !isPartiallyUnlocked &&
                  (step.id === 1 ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenModal?.();
                      }}
                      className={cn(
                        "mt-4 inline-flex items-center gap-2 text-sm font-medium cursor-pointer",
                        config.textColor,
                      )}
                    >
                      <span>{t("step1.cta")}</span>
                      {dir === "rtl" ? (
                        <ArrowLeft className="w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </div>
                  ) : step.href ? (
                    <Link
                      href={step.href}
                      className={cn(
                        "mt-4 inline-flex items-center gap-2 text-sm font-medium",
                        config.textColor,
                      )}
                    >
                      <span>{t("step1.cta")}</span>
                      {dir === "rtl" ? (
                        <ArrowLeft className="w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </Link>
                  ) : null)}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Desktop card ─────────────────────────────────────────────────────────────
function DesktopCard({
  step,
  isCompleted,
  isUnlocked,
  isStep3FirstUnlock,
  isStep3FullyUnlocked,
  onOpenModal,
  side,
  revealed,
}: {
  step: Step;
  isCompleted: boolean;
  isUnlocked: boolean;
  isStep3FirstUnlock: boolean;
  isStep3FullyUnlocked: boolean;
  onOpenModal?: () => void;
  side: "left" | "right";
  revealed: boolean;
}) {
  const { t, dir } = useLanguage();
  const config = stageConfig[step.stage];

  const isPartiallyUnlocked = isStep3FirstUnlock && !isStep3FullyUnlocked;
  const effectivelyLocked =
    step.status === "locked" &&
    !isUnlocked &&
    !isStep3FirstUnlock &&
    !isStep3FullyUnlocked;
  const isFullGreen = isCompleted || isStep3FullyUnlocked;
  const Icon = step.icon;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 150, damping: 20 });
  const sy = useSpring(my, { stiffness: 150, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(380px circle at ${sx}px ${sy}px, ${config.solidColor}1a, transparent 60%)`;

  const enterX = side === "left" ? -36 : 36;

  const inner = (
    <motion.div
      initial={{ opacity: 0, x: enterX, scale: 0.97 }}
      animate={
        revealed
          ? { opacity: 1, x: 0, scale: 1 }
          : { opacity: 0, x: enterX, scale: 0.97 }
      }
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      className={cn(
        "group relative rounded-2xl overflow-hidden transition-all duration-500 cursor-default",
        isFullGreen
          ? "bg-emerald-50/60 dark:bg-emerald-950/25 ring-1 ring-emerald-300/50 dark:ring-emerald-800/50"
          : isPartiallyUnlocked
            ? "bg-amber-50/60 dark:bg-amber-950/25 ring-1 ring-amber-300/50 dark:ring-amber-800/50"
            : effectivelyLocked
              ? "bg-muted/10 ring-1 ring-border/25 opacity-60"
              : "bg-card ring-1 ring-border/70 hover:ring-border/90",
      )}
    >
      {/* Cursor spotlight */}
      {!effectivelyLocked && !isFullGreen && !isPartiallyUnlocked && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: spotlight }}
        />
      )}

      {/* Left accent bar */}
      <div
        className={cn(
          "absolute top-0 bottom-0 w-[3px]",
          dir === "rtl" ? "right-0" : "left-0",
          isFullGreen
            ? "bg-gradient-to-b from-emerald-400 to-emerald-600"
            : isPartiallyUnlocked
              ? "bg-amber-400"
              : effectivelyLocked
                ? "bg-border/30"
                : `bg-gradient-to-b ${config.color}`,
        )}
      />

      <div
        className={cn("relative p-6 lg:p-8", dir === "rtl" ? "pr-9" : "pl-9")}
      >
        {/* Meta row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "font-mono text-[11px] tracking-[0.2em]",
                effectivelyLocked
                  ? "text-muted-foreground/40"
                  : "text-muted-foreground",
              )}
            >
              {String(step.id).padStart(2, "0")}
            </span>
            <span className="h-px w-6 bg-border/60" />
            <span
              className={cn(
                "text-[10px] uppercase tracking-[0.2em] font-semibold",
                effectivelyLocked
                  ? "text-muted-foreground/40"
                  : config.textColor,
              )}
            >
              {t(config.labelKey)}
            </span>
          </div>

          {/* Status dot */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
              isFullGreen
                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                : isPartiallyUnlocked
                  ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                  : effectivelyLocked
                    ? "bg-muted text-muted-foreground/50"
                    : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
            )}
          >
            {isFullGreen ? (
              <Check className="w-2.5 h-2.5" strokeWidth={3} />
            ) : isPartiallyUnlocked ? (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            ) : effectivelyLocked ? (
              <Lock className="w-2.5 h-2.5" />
            ) : (
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
            <span>
              {isFullGreen
                ? dir === "rtl"
                  ? "مكتمل"
                  : "Done"
                : isPartiallyUnlocked
                  ? dir === "rtl"
                    ? "جارٍ"
                    : "Pending"
                  : effectivelyLocked
                    ? dir === "rtl"
                      ? "مقفل"
                      : "Locked"
                    : dir === "rtl"
                      ? "ابدأ"
                      : "Start"}
            </span>
          </div>
        </div>

        {/* Icon + title */}
        <div
          className={cn(
            "flex items-start gap-4 mb-4",
            dir === "rtl" && "flex-row-reverse",
          )}
        >
          <motion.div
            whileHover={!effectivelyLocked ? { rotate: 6, scale: 1.05 } : {}}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              isFullGreen
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                : isPartiallyUnlocked
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                  : effectivelyLocked
                    ? "bg-muted text-muted-foreground/40"
                    : `bg-gradient-to-br ${config.color} text-white shadow-md`,
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isFullGreen ? (
                <motion.div
                  key="c"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 260 }}
                >
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                </motion.div>
              ) : effectivelyLocked ? (
                <motion.div
                  key="l"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Lock className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="i"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div
            className={cn("flex-1", dir === "rtl" ? "text-right" : "text-left")}
          >
            <h3
              className={cn(
                "text-xl font-semibold leading-tight mb-2",
                effectivelyLocked
                  ? "text-muted-foreground/60"
                  : "text-foreground",
              )}
            >
              {t(step.titleKey)}
            </h3>
            <p
              className={cn(
                "text-[13px] leading-relaxed",
                effectivelyLocked
                  ? "text-muted-foreground/40"
                  : "text-muted-foreground",
              )}
            >
              {t(step.descriptionKey)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-border/40">
          {isCompleted ? (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {dir === "rtl" ? "تم بنجاح" : "Completed"}
              </span>
            </div>
          ) : isPartiallyUnlocked ? (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {dir === "rtl"
                  ? "بانتظار التقييم الثاني"
                  : "Awaiting assessment 2"}
              </span>
            </div>
          ) : isStep3FullyUnlocked ? (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {dir === "rtl"
                  ? "خبراؤنا يحضّرون عرضك"
                  : "Our experts are preparing your proposal"}
              </span>
            </div>
          ) : !effectivelyLocked ? (
            <div
              className={cn(
                "flex items-center justify-between",
                dir === "rtl" && "flex-row-reverse",
              )}
            >
              <span className={cn("text-xs font-semibold", config.textColor)}>
                {t("step1.cta")}
              </span>
              <motion.div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  `bg-gradient-to-br ${config.color} text-white`,
                )}
                whileHover={{ x: dir === "rtl" ? -4 : 4, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {dir === "rtl" ? (
                  <ArrowLeft className="w-3.5 h-3.5" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </motion.div>
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center gap-2",
                dir === "rtl" && "flex-row-reverse",
              )}
            >
              <Lock className="w-3 h-3 text-muted-foreground/40" />
              <span className="text-[11px] text-muted-foreground/50">
                {dir === "rtl"
                  ? "يُفتح بعد إكمال الخطوة السابقة"
                  : "Unlocks after the previous step"}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (isCompleted || isPartiallyUnlocked || isStep3FullyUnlocked) return inner;
  if (step.id === 1 && !effectivelyLocked)
    return (
      <button
        type="button"
        onClick={onOpenModal}
        className="block w-full text-start"
      >
        {inner}
      </button>
    );
  if (step.href && !effectivelyLocked)
    return <Link href={step.href}>{inner}</Link>;
  return inner;
}

// ─── Stage label (appears above its first card) ───────────────────────────────
function StageLabel({
  stage,
  revealed,
}: {
  stage: StageType;
  revealed: boolean;
}) {
  const { t } = useLanguage();
  const config = stageConfig[stage];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-4"
    >
      <span
        className={cn(
          "text-5xl font-light italic leading-none select-none",
          config.textColor,
        )}
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {config.numeral}
      </span>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <div className={cn("h-px w-5 bg-gradient-to-r", config.color)} />
          <span
            className={cn(
              "text-[10px] uppercase tracking-[0.25em] font-semibold",
              config.textColor,
            )}
          >
            {t("roadmap.description")}
          </span>
        </div>
        <p className="text-lg font-semibold text-foreground tracking-tight leading-none">
          {t(config.labelKey)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t(`${config.labelKey}.subtitle`)}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Desktop journey (path + cards) ──────────────────────────────────────────
function DesktopJourney({
  submissionDone,
  submission2Done,
  onOpenModal,
  scrollProg,
}: {
  submissionDone: boolean;
  submission2Done: boolean;
  onOpenModal: () => void;
  scrollProg: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
  }, []);

  // Stage boundaries: which t value starts each stage
  const stageFirstT: Record<StageType, number> = {
    before: STEP_CONFIG[0].t,
    during: STEP_CONFIG[3].t,
    after: STEP_CONFIG[4].t,
  };

  return (
    <div className="relative w-full" style={{ height: JOURNEY_HEIGHT }}>
      {/* ── SVG path — centered narrow column ── */}
      <div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-16 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 100 1000"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="jGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="jGradFaint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          {/* Faint dashed base track */}
          <path
            d={PATH_D}
            stroke="url(#jGradFaint)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="3 6"
          />

          {/* Measuring path (invisible) */}
          <path
            ref={pathRef}
            d={PATH_D}
            stroke="transparent"
            strokeWidth="0"
            fill="none"
          />

          {/* Animated drawn line via pathLength motion value */}
          {pathLength > 0 && (
            <motion.path
              d={PATH_D}
              stroke="url(#jGrad)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              style={{ pathLength: scrollProg }}
            />
          )}

          {/* Dots at each step position */}
          {pathLength > 0 &&
            STEP_CONFIG.map(({ t }, i) => {
              const step = roadmapSteps[i];
              const config = stageConfig[step.stage];
              const pt = pathRef.current!.getPointAtLength(t * pathLength);
              const revealed = scrollProg >= t - 0.015;
              return (
                <motion.circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill={config.solidColor}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={
                    revealed
                      ? { scale: 1, opacity: 1 }
                      : { scale: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                />
              );
            })}
        </svg>
      </div>

      {/* ── Stage labels ── */}
      {(Object.entries(stageFirstT) as [StageType, number][]).map(
        ([stage, t]) => {
          // Find which side the first card of this stage is on
          const stageStepIndex = roadmapSteps.findIndex(
            (s) => s.stage === stage,
          );
          const side = STEP_CONFIG[stageStepIndex].side;
          const revealed = scrollProg >= t - 0.04;
          const top = tToY(t) - 190;

          return (
            <div
              key={stage}
              className="absolute"
              style={{
                top,
                zIndex: 2,
                ...(side === "right"
                  ? { left: "calc(50% + 56px)" }
                  : { right: "calc(50% + 56px)" }),
              }}
            >
              <StageLabel stage={stage} revealed={revealed} />
            </div>
          );
        },
      )}

      {/* ── Cards + connectors ── */}
      {roadmapSteps.map((step, i) => {
        const { t, side } = STEP_CONFIG[i];
        const top = tToY(t);
        const revealed = scrollProg >= t - 0.02;

        const isCompleted =
          (step.id === 1 && submissionDone) ||
          (step.id === 2 && submission2Done);
        const isUnlocked = step.id === 2 && submissionDone && !submission2Done;
        const isStep3FirstUnlock = step.id === 3 && submissionDone;
        const isStep3FullyUnlocked = step.id === 3 && submission2Done;
        const config = stageConfig[step.stage];

        return (
          <div
            key={step.id}
            className="absolute"
            style={{
              top: top - 90, // vertically center card on the dot
              zIndex: 3,
              ...(side === "right"
                ? {
                    left: "calc(50% + 56px)",
                    width: "clamp(260px, 38%, 360px)",
                  }
                : {
                    right: "calc(50% + 56px)",
                    width: "clamp(260px, 38%, 360px)",
                  }),
            }}
          >
            {/* Connector line — from card edge to path dot */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={
                revealed ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }
              }
              transition={{
                duration: 0.45,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                originX: side === "right" ? 0 : 1,
                position: "absolute",
                top: "94px", // aligns with card icon center (roughly)
                height: "1px",
                width: "56px",
                background: `linear-gradient(${side === "right" ? "to left" : "to right"}, transparent, ${config.solidColor}60)`,
                ...(side === "right" ? { left: "-56px" } : { right: "-56px" }),
              }}
            />

            <DesktopCard
              step={step}
              isCompleted={isCompleted}
              isUnlocked={isUnlocked}
              isStep3FirstUnlock={isStep3FirstUnlock}
              isStep3FullyUnlocked={isStep3FullyUnlocked}
              onOpenModal={onOpenModal}
              side={side}
              revealed={revealed}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function RoadmapSection() {
  const { t, dir } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true });

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
    if (typeof window !== "undefined")
      sessionStorage.setItem("assessmentUser", JSON.stringify(data));
    router.push("/assessment");
  }

  // Scroll progress driving the path draw + card reveals
  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: ["start 85%", "end 15%"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 20,
    restDelta: 0.001,
  });
  const [scrollProg, setScrollProg] = useState(0);
  useEffect(() => smoothProgress.on("change", setScrollProg), [smoothProgress]);

  const completedCount = (submissionDone ? 1 : 0) + (submission2Done ? 1 : 0);

  const stageSections: { stage: StageType; steps: Step[] }[] = [
    {
      stage: "before",
      steps: roadmapSteps.filter((s) => s.stage === "before"),
    },
    {
      stage: "during",
      steps: roadmapSteps.filter((s) => s.stage === "during"),
    },
    { stage: "after", steps: roadmapSteps.filter((s) => s.stage === "after") },
  ];

  return (
    <section
      id="roadmap"
      ref={containerRef}
      className="relative py-24 md:py-40 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/30 via-background to-background" />
      <GrainOverlay />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={
            isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
          }
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto text-center mb-20 md:mb-32"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-emerald-500/60" />
            <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground font-medium">
              {t("roadmap.description")}
            </span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-emerald-500/60" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-semibold text-foreground mb-6 leading-[1.05] tracking-[-0.02em] text-balance">
            {t("roadmap.title")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
            {t("roadmap.subtitle")}
          </p>
        </motion.div>

        {/* Mobile */}
        <div className="md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card/60 backdrop-blur rounded-2xl ring-1 ring-border/70 p-5 mb-10"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                {dir === "rtl" ? "رحلتك" : "Your journey"}
              </span>
              <span className="font-mono text-xs text-foreground">
                {completedCount}/2
              </span>
            </div>
            <SegmentedProgress completed={completedCount} />
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              {submission2Done
                ? dir === "rtl"
                  ? "خبراؤنا يحضّرون عرضك المخصص"
                  : "Our experts are preparing your custom proposal"
                : submissionDone
                  ? dir === "rtl"
                    ? "أكمل التقييم الثاني للمتابعة"
                    : "Complete the second assessment to continue"
                  : dir === "rtl"
                    ? "ابدأ بالتقييم الأول"
                    : "Begin with the first assessment"}
            </p>
          </motion.div>

          <div className="space-y-12">
            {stageSections.map(({ stage, steps }) => {
              const config = stageConfig[stage];
              return (
                <div key={stage}>
                  <div className="flex items-baseline gap-4 mb-6">
                    <span
                      className={cn(
                        "text-4xl font-light italic leading-none",
                        config.textColor,
                      )}
                      style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                      }}
                    >
                      {config.numeral}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground tracking-tight">
                        {t(config.labelKey)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t(`${config.labelKey}.subtitle`)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    {steps.map((step, index) => {
                      const isCompleted =
                        (step.id === 1 && submissionDone) ||
                        (step.id === 2 && submission2Done);
                      const isUnlocked =
                        step.id === 2 && submissionDone && !submission2Done;
                      const isStep3FirstUnlock =
                        step.id === 3 && submissionDone;
                      const isStep3FullyUnlocked =
                        step.id === 3 && submission2Done;
                      return (
                        <MobileStepRow
                          key={step.id}
                          step={step}
                          isCompleted={isCompleted}
                          isUnlocked={isUnlocked}
                          isStep3FirstUnlock={isStep3FirstUnlock}
                          isStep3FullyUnlocked={isStep3FullyUnlocked}
                          onOpenModal={handleStartAssessment}
                          index={index}
                          isLast={index === steps.length - 1}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop */}
        <div ref={journeyRef} className="hidden md:block">
          <DesktopJourney
            submissionDone={submissionDone}
            submission2Done={submission2Done}
            onOpenModal={handleStartAssessment}
            scrollProg={scrollProg}
          />
        </div>

        {/* Management types */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mt-32 md:mt-48"
        >
          <div className="max-w-2xl mx-auto text-center mb-14 md:mb-20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-8 bg-emerald-500/40" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-medium">
                {t("step4.types")}
              </span>
              <div className="h-px w-8 bg-emerald-500/40" />
            </div>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4 tracking-[-0.02em] text-balance">
              {t("step4.types")}
            </h3>
            <p className="text-base md:text-lg text-muted-foreground text-pretty">
              {t("step4.description")}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {managementTypes.map((type, index) => (
              <motion.div
                key={type.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -6 }}
                className="group relative p-6 md:p-8 rounded-2xl bg-card ring-1 ring-border/70 hover:ring-border transition-all duration-500 overflow-hidden"
              >
                <div
                  className={cn(
                    "absolute top-0 left-0 right-0 h-px bg-gradient-to-r origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700",
                    type.color,
                  )}
                />
                <span className="block font-mono text-[11px] tracking-[0.2em] mb-6 text-muted-foreground group-hover:text-foreground transition-colors">
                  {type.icon}
                </span>
                <h4 className="font-semibold text-base md:text-lg text-foreground leading-snug">
                  {t(type.titleKey)}
                </h4>
                <motion.div
                  className={cn("mt-6 h-px bg-gradient-to-r", type.color)}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 0.3 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 + index * 0.08 }}
                  style={{ originX: dir === "rtl" ? 1 : 0 }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <AssessmentFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </section>
  );
}
