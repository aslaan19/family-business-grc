"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useInView } from "framer-motion";
import {
  ClipboardCheck,
  Building2,
  FileText,
  GraduationCap,
  Lightbulb,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { cn } from "../../lib/utils";
import Link from "next/link";
import { useLanguage } from "../../lib/language-context";
import { AssessmentFormModal } from "../ui/assessment-form-modal";

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
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    dotColor: "bg-emerald-500",
    glowColor: "shadow-emerald-500/20",
    numeral: "1",
  },
  during: {
    labelKey: "stage.during",
    color: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    textColor: "text-teal-600 dark:text-teal-400",
    borderColor: "border-teal-200 dark:border-teal-800",
    dotColor: "bg-teal-500",
    glowColor: "shadow-teal-500/20",
    numeral: "2",
  },
  after: {
    labelKey: "stage.after",
    color: "from-green-600 to-green-700",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    textColor: "text-green-700 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800",
    dotColor: "bg-green-600",
    glowColor: "shadow-green-600/20",
    numeral: "3",
  },
};

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
  },
  {
    id: 3,
    icon: FileText,
    titleKey: "step3.title",
    descriptionKey: "step3.description",
    status: "output",
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
    descKey: "step4.type1.desc",
    icon: "1",
    color: "from-red-400 to-orange-400",
  },
  {
    titleKey: "step4.type2",
    descKey: "step4.type2.desc",
    icon: "2",
    color: "from-amber-400 to-yellow-400",
  },
  {
    titleKey: "step4.type3",
    descKey: "step4.type3.desc",
    icon: "3",
    color: "from-emerald-400 to-teal-400",
  },
  {
    titleKey: "step4.type4",
    descKey: "step4.type4.desc",
    icon: "4",
    color: "from-blue-400 to-indigo-400",
  },
];

function StepCard({
  step,
  isInView,
  onOpenModal,
}: {
  step: Step;
  isInView: boolean;
  onOpenModal?: () => void;
}) {
  const { t, dir } = useLanguage();
  const config = stageConfig[step.stage];
  const isLocked = step.status === "locked";
  const isOutput = step.status === "output";
  const Icon = step.icon;
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 20 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className={cn("relative group", !isLocked && "cursor-pointer")}
    >
      {/* Glow */}
      <div
        className={cn(
          "absolute -inset-1 rounded-3xl opacity-0 blur-xl transition-opacity duration-500",
          !isLocked && "group-hover:opacity-100",
          `bg-linear-to-r ${config.color}`,
        )}
      />

      <div
        className={cn(
          "relative p-8 md:p-10 rounded-3xl border-2 transition-all duration-500 backdrop-blur-sm",
          isLocked
            ? "bg-muted/30 border-border/50"
            : isOutput
              ? `${config.bgColor} ${config.borderColor} shadow-2xl ${config.glowColor}`
              : `bg-card ${config.borderColor} hover:shadow-2xl hover:scale-[1.02]`,
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                isLocked
                  ? "bg-muted text-muted-foreground"
                  : `bg-linear-to-br ${config.color} text-white shadow-lg`,
              )}
            >
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <span
                className={cn(
                  "inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide",
                  isLocked
                    ? "bg-muted text-muted-foreground"
                    : `${config.bgColor} ${config.textColor}`,
                )}
              >
                {t(config.labelKey)}
              </span>
              <div className="text-xs text-muted-foreground mt-1">
                {dir === "rtl"
                  ? `الخطوة ${step.id} من 5`
                  : `Step ${step.id} of 5`}
              </div>
            </div>
          </div>

          <div>
            {isLocked ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {dir === "rtl" ? "مقفل" : "Locked"}
                </span>
              </div>
            ) : isOutput ? (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full",
                  config.bgColor,
                )}
              >
                <Sparkles className={cn("w-4 h-4", config.textColor)} />
                <span className={cn("text-xs font-medium", config.textColor)}>
                  {t("step3.output")}
                </span>
              </div>
            ) : (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full",
                  config.bgColor,
                )}
              >
                <CheckCircle2 className={cn("w-4 h-4", config.textColor)} />
                <span className={cn("text-xs font-medium", config.textColor)}>
                  {dir === "rtl" ? "متاح" : "Available"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h3
            className={cn(
              "text-2xl md:text-3xl font-bold mb-4",
              isLocked ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {t(step.titleKey)}
          </h3>
          <p
            className={cn(
              "text-base leading-relaxed",
              isLocked ? "text-muted-foreground/60" : "text-muted-foreground",
            )}
          >
            {t(step.descriptionKey)}
          </p>
        </div>

        {/* Action */}
        {!isLocked ? (
          <div
            className={cn(
              "flex items-center justify-between p-4 rounded-2xl transition-all",
              `${config.bgColor} group-hover:bg-linear-to-r group-hover:${config.color}`,
            )}
          >
            <span
              className={cn(
                "font-semibold transition-colors",
                `${config.textColor} group-hover:text-white`,
              )}
            >
              {isOutput ? t("step3.output") : t("step1.cta")}
            </span>
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                `bg-linear-to-r ${config.color} text-white group-hover:scale-110`,
              )}
            >
              <ArrowLeft
                className={cn("w-5 h-5", dir === "ltr" && "rotate-180")}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-muted/50">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {dir === "rtl"
                ? "أكمل الخطوة السابقة لفتح هذه المرحلة"
                : "Complete the previous step to unlock this phase"}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (step.href && !isLocked) {
    if (step.id === 1) {
      return (
        <button
          type="button"
          onClick={onOpenModal}
          className="block w-full text-start"
        >
          {content}
        </button>
      );
    }

    return <Link href={step.href}>{content}</Link>;
  }

  return content;
}

function StageSection({
  stage,
  steps,
  onOpenModal,
}: {
  stage: StageType;
  steps: Step[];
  onOpenModal: () => void;
}) {
  const { t, dir } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-20% 0px -20% 0px" });
  const config = stageConfig[stage];

  return (
    <motion.div
      ref={ref}
      className="relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, margin: "-10%" }}
      transition={{ duration: 0.6 }}
    >
      {/* Stage Header */}
      <motion.div
        initial={{ opacity: 0, x: dir === "rtl" ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-6 mb-12"
      >
        <div
          className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl shrink-0",
            `bg-linear-to-br ${config.color}`,
          )}
        >
          <span className="text-3xl font-bold text-white">
            {config.numeral}
          </span>
        </div>
        <div>
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">
            {t(config.labelKey)}
          </h3>
          <p className="text-lg text-muted-foreground mt-1">
            {t(`${config.labelKey}.subtitle`)}
          </p>
        </div>
      </motion.div>

      {/* Steps — border flips based on dir */}
      <div
        className={cn(
          "space-y-8 border-dashed border-border",
          dir === "rtl" ? "pr-10 border-r-4 mr-10" : "pl-10 border-l-4 ml-10",
        )}
      >
        {steps.map((step) => (
          <div key={step.id} className="relative">
            <div
              className={cn(
                "absolute top-12 w-5 h-5 rounded-full border-4 border-background",
                dir === "rtl" ? "-right-[1.35rem]" : "-left-[1.35rem]",
                step.status === "locked" ? "bg-muted" : config.dotColor,
              )}
            />
            <StepCard
              step={step}
              isInView={isInView}
              onOpenModal={onOpenModal}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function RoadmapSection() {
  const { t, dir } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  useScroll({ target: containerRef, offset: ["start end", "end start"] });

  const beforeSteps = roadmapSteps.filter((s) => s.stage === "before");
  const duringSteps = roadmapSteps.filter((s) => s.stage === "during");
  const afterSteps = roadmapSteps.filter((s) => s.stage === "after");

  function handleFormSubmit(data: object) {
    setModalOpen(false);
    // Store so assessment page can read it
    if (typeof window !== "undefined") {
      sessionStorage.setItem("assessmentUser", JSON.stringify(data));
    }
    router.push("/assessment");
  }

  return (
    <section
      id="roadmap"
      ref={containerRef}
      className="relative py-32 overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-b from-background via-muted/30 to-background" />

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border shadow-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-foreground">
              {t("roadmap.description")}
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            {t("roadmap.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("roadmap.subtitle")}
          </p>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-12 flex flex-col items-center text-muted-foreground"
          >
            <span className="text-sm mb-2">
              {dir === "rtl" ? "اكتشف المراحل" : "Explore the phases"}
            </span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>

        {/* Stages */}
        <div className="max-w-4xl mx-auto space-y-32">
          <StageSection
            stage="before"
            steps={beforeSteps}
            onOpenModal={() => setModalOpen(true)}
          />
          <StageSection
            stage="during"
            steps={duringSteps}
            onOpenModal={() => setModalOpen(true)}
          />
          <StageSection
            stage="after"
            steps={afterSteps}
            onOpenModal={() => setModalOpen(true)}
          />
        </div>

        {/* Management Types */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="mt-40 text-center"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("step4.types")}
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16">
            {t("step4.description")}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {managementTypes.map((type, index) => (
              <motion.div
                key={type.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -8 }}
                className="group relative p-8 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-br",
                    type.color,
                  )}
                />
                <div
                  className={cn(
                    "relative w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-linear-to-br shadow-lg",
                    type.color,
                  )}
                >
                  <span className="text-xl font-bold text-white">
                    {type.icon}
                  </span>
                </div>
                <h4 className="font-bold text-lg text-foreground mb-2">
                  {t(type.titleKey)}
                </h4>
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
