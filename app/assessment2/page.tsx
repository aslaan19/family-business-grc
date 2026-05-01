"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Building2,
  Shield,
  FileCheck2,
  Users,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  BarChart3,
  Briefcase,
  Target,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "../lib/language-context";
import {
  SUBMISSION_STORAGE_KEY,
  SUBMISSION2_STORAGE_KEY,
} from "../components/ui/assessment-form-modal";
import { cn } from "../lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    icon: Building2,
    titleEn: "Company Profile",
    titleAr: "ملف الشركة",
    descEn: "Legal info, employees, revenue, branches and key clients",
    descAr: "المعلومات القانونية، الموظفون، الإيرادات، الفروع والعملاء",
    num: "01",
  },
  {
    icon: Target,
    titleEn: "Strategy & Vision",
    titleAr: "الاستراتيجية والرؤية",
    descEn: "Vision, mission, strategic objectives and KPIs",
    descAr: "الرؤية، الرسالة، الأهداف الاستراتيجية ومؤشرات الأداء",
    num: "02",
  },
  {
    icon: Shield,
    titleEn: "Board & Governance",
    titleAr: "مجلس الإدارة والحوكمة",
    descEn: "Board structure, committees, charters and independence",
    descAr: "هيكل المجلس، اللجان، المواثيق والاستقلالية",
    num: "03",
  },
  {
    icon: BarChart3,
    titleEn: "Financial Overview",
    titleAr: "النظرة المالية",
    descEn: "Revenue streams, capital, profitability and cost drivers",
    descAr: "مصادر الإيرادات، رأس المال، الربحية ومحركات التكلفة",
    num: "04",
  },
  {
    icon: Briefcase,
    titleEn: "Operations & Risk",
    titleAr: "العمليات والمخاطر",
    descEn: "Core processes, automation levels and risk management",
    descAr: "العمليات الأساسية، مستوى الأتمتة وإدارة المخاطر",
    num: "05",
  },
  {
    icon: FileCheck2,
    titleEn: "Governance Documentation",
    titleAr: "وثائق الحوكمة",
    descEn: "Policies, delegation of authority and compliance framework",
    descAr: "السياسات، جدول الصلاحيات وإطار الامتثال",
    num: "06",
  },
];

const STATS = [
  { value: "8", labelEn: "Sections", labelAr: "أقسام" },
  { value: "40+", labelEn: "Data Points", labelAr: "نقطة بيانات" },
  { value: "15", labelEn: "Minutes to Fill", labelAr: "دقيقة للإكمال" },
];

const PROCESS_STEPS = [
  {
    numEn: "01",
    numAr: "١",
    titleEn: "Fill the Form",
    titleAr: "أكمل النموذج",
    descEn: "Complete all 8 sections with your institutional data",
    descAr: "أكمل الأقسام الثمانية ببيانات مؤسستكم",
  },
  {
    numEn: "02",
    numAr: "٢",
    titleEn: "Expert Analysis",
    titleAr: "تحليل الخبراء",
    descEn: "Our senior consultants review every detail of your submission",
    descAr: "يراجع كبار مستشارينا كل تفاصيل بياناتكم",
  },
  {
    numEn: "03",
    numAr: "٣",
    titleEn: "Tailored Proposal",
    titleAr: "العرض المخصص",
    descEn: "Receive a bespoke technical & financial governance proposal",
    descAr: "تستلمون عرضاً تقنياً ومالياً مخصصاً لوضعكم",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Assessment2LandingPage() {
  const { dir } = useLanguage();
  const router = useRouter();
  const isRtl = dir === "rtl";

  const sub1Done =
    typeof window !== "undefined" &&
    localStorage.getItem(SUBMISSION_STORAGE_KEY) === "true";

  const alreadyDone =
    typeof window !== "undefined" &&
    localStorage.getItem(SUBMISSION2_STORAGE_KEY) === "true";

  useEffect(() => {
    if (!sub1Done) router.replace("/");
  }, [sub1Done, router]);

  if (!sub1Done) return null;

  const Arrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <main className="min-h-screen bg-background overflow-x-hidden" dir={dir}>
      {/* ═══════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col">
        {/* Full-bleed background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/assessment2.png"
            alt="CRAM Institutional Assessment"
            fill
            className="object-cover"
            priority
          />
          {/* Multi-layer overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          {/* Emerald tint */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Back nav */}
          <div className="container mx-auto px-6 lg:px-12 pt-8">
            <motion.div
              initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
              >
                <Arrow
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isRtl
                      ? "group-hover:translate-x-1"
                      : "group-hover:-translate-x-1",
                  )}
                />
                <span className="text-sm font-medium tracking-wide">
                  {isRtl ? "العودة للرئيسية" : "Back to home"}
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Hero copy */}
          <div className="container mx-auto px-6 lg:px-12 flex-1 flex items-center py-20">
            <div className={cn("max-w-2xl", isRtl && "mr-auto ml-0")}>
              {/* Step badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/8 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-widest">
                    {isRtl ? "المرحلة الثانية" : "Phase Two"}
                  </span>
                </div>
                <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-white/30 to-transparent" />
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className={cn(
                  "text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight",
                  isRtl && "text-right",
                )}
              >
                {isRtl ? (
                  <>
                    <span className="block">التقييم</span>
                    <span className="block text-emerald-400">
                      المؤسسي الشامل
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block">Institutional</span>
                    <span className="block text-emerald-400">Deep-Dive</span>
                  </>
                )}
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className={cn(
                  "text-lg text-white/70 leading-relaxed mb-10 max-w-xl",
                  isRtl && "text-right",
                )}
              >
                {isRtl
                  ? "استناداً إلى نتائج تقييمكم الأولي، يتيح هذا النموذج الشامل لفريق خبرائنا فهم مؤسستكم بعمق لإعداد العرض التقني والمالي المخصص لكم."
                  : "Building on your initial assessment, this comprehensive form enables our senior consultants to deeply understand your institution and craft a fully bespoke technical and financial governance proposal."}
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className={cn("flex gap-8 mb-10", isRtl && "flex-row-reverse")}
              >
                {STATS.map((s, i) => (
                  <div
                    key={i}
                    className={cn("flex flex-col", isRtl && "items-end")}
                  >
                    <span className="text-4xl font-black text-white leading-none">
                      {s.value}
                    </span>
                    <span className="text-xs text-white/50 font-medium mt-1 uppercase tracking-wide">
                      {isRtl ? s.labelAr : s.labelEn}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* A1 done notification */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-sm mb-8",
                  isRtl && "flex-row-reverse",
                )}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p
                  className={cn(
                    "text-sm text-emerald-300 font-medium",
                    isRtl && "text-right",
                  )}
                >
                  {isRtl
                    ? "أنجزت التقييم الأولي — أنت مؤهل للمرحلة الثانية"
                    : "Initial assessment complete — you're eligible for Phase Two"}
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className={cn(
                  "flex flex-col sm:flex-row items-start gap-4",
                  isRtl && "sm:flex-row-reverse",
                )}
              >
                {alreadyDone ? (
                  <div
                    className={cn(
                      "flex items-center gap-3 px-6 py-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    <FileCheck2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p className="text-sm text-white/80 font-medium">
                      {isRtl
                        ? "أكملت هذا التقييم. فريقنا يعمل على عرضك."
                        : "Assessment submitted. Our team is preparing your proposal."}
                    </p>
                  </div>
                ) : (
                  <>
                    <Link href="/assessment2/form">
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-400/40 transition-all duration-300"
                      >
                        <Sparkles className="w-5 h-5" />
                        {isRtl
                          ? "ابدأ التقييم الشامل"
                          : "Start Comprehensive Assessment"}
                        <ChevronRight
                          className={cn(
                            "w-5 h-5 transition-transform group-hover:translate-x-1",
                            isRtl && "rotate-180 group-hover:-translate-x-0",
                          )}
                        />
                      </motion.button>
                    </Link>
                    <div
                      className={cn(
                        "flex items-center gap-2 text-white/50 text-xs",
                        isRtl && "flex-row-reverse",
                      )}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>
                        {isRtl
                          ? "سري وآمن تماماً"
                          : "Fully confidential & secure"}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </div>

          {/* Bottom scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="relative z-10 container mx-auto px-6 lg:px-12 pb-10 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-white/40"
            >
              <span className="text-[11px] uppercase tracking-widest font-medium">
                {isRtl ? "اكتشف أكثر" : "Discover more"}
              </span>
              <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTIONS COVERAGE
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "max-w-2xl mb-16",
              isRtl ? "mr-0 ml-auto text-right" : "",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3 mb-5",
                isRtl && "flex-row-reverse",
              )}
            >
              <div className="h-px flex-1 max-w-12 bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                {isRtl ? "ما يشمله التقييم" : "Assessment Coverage"}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight mb-5">
              {isRtl ? (
                <>
                  ثمانية أقسام تُغطّي
                  <br />
                  <span className="text-emerald-600">كل جانب من مؤسستكم</span>
                </>
              ) : (
                <>
                  Eight sections covering
                  <br />
                  <span className="text-emerald-600">
                    every institutional dimension
                  </span>
                </>
              )}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {isRtl
                ? "تم تصميم كل قسم بعناية لاستخراج البيانات الأكثر أهمية لبناء عرض الحوكمة المخصص لمؤسستكم."
                : "Each section is carefully designed to extract the data most critical to building a governance proposal tailored to your institution."}
            </p>
          </motion.div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {SECTIONS.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={cn(
                  "group relative bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/20 p-8 transition-all duration-300",
                  isRtl && "text-right",
                )}
              >
                {/* Number */}
                <div
                  className={cn(
                    "flex items-center justify-between mb-6",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  <span className="text-4xl font-black text-border group-hover:text-emerald-200 dark:group-hover:text-emerald-900/60 transition-colors duration-300 select-none">
                    {section.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 flex items-center justify-center transition-colors">
                    <section.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  {isRtl ? section.titleAr : section.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isRtl ? section.descAr : section.descEn}
                </p>
                {/* Hover accent line */}
                <div
                  className={cn(
                    "absolute bottom-0 w-0 group-hover:w-full h-0.5 bg-emerald-500 transition-all duration-500",
                    isRtl ? "right-0" : "left-0",
                  )}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PROCESS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-muted/20 border-y border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-4">
              {isRtl
                ? "ماذا يحدث بعد التقديم"
                : "What happens after you submit"}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-foreground">
              {isRtl ? "مسار واضح نحو النتائج" : "A clear path to results"}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
            {/* Connector line */}
            <div
              className={cn(
                "hidden md:block absolute top-12 h-px bg-gradient-to-r from-emerald-500/20 via-emerald-500/60 to-emerald-500/20",
                isRtl
                  ? "right-[16.666%] left-[16.666%]"
                  : "left-[16.666%] right-[16.666%]",
              )}
            />

            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {/* Circle */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div
                    className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping"
                    style={{
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: "3s",
                    }}
                  />
                  <div className="relative w-full h-full rounded-full bg-card border-2 border-emerald-500/40 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/10">
                    <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">
                      {isRtl ? "خطوة" : "Step"}
                    </span>
                    <span className="text-2xl font-black text-emerald-600">
                      {isRtl ? step.numAr : step.numEn}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">
                  {isRtl ? step.titleAr : step.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {isRtl ? step.descAr : step.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-[#0a1f14] to-[#080f0a]" />
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-emerald-500/10 blur-3xl"
              style={{
                width: `${200 + i * 80}px`,
                height: `${200 + i * 80}px`,
                top: `${Math.sin(i) * 40 + 20}%`,
                left: `${(i * 18) % 90}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-10">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">
                {isRtl
                  ? "فريق خبرائنا جاهز لخدمتكم"
                  : "Our senior expert team is ready"}
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
              {isRtl ? (
                <>
                  احصل على عرضك
                  <br />
                  <span className="text-emerald-400">المخصص اليوم</span>
                </>
              ) : (
                <>
                  Receive your
                  <br />
                  <span className="text-emerald-400">
                    bespoke proposal today
                  </span>
                </>
              )}
            </h2>

            <p className="text-lg text-white/60 leading-relaxed mb-12 max-w-xl mx-auto">
              {isRtl
                ? "ستستلمون نتائجكم التحليلية والعرض التقني والمالي المخصص خلال أيام عمل قليلة فقط."
                : "Your analytical findings and a fully customised technical & financial proposal will be delivered within just a few business days."}
            </p>

            {alreadyDone ? (
              <div className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white/8 border border-white/15">
                <FileCheck2 className="w-6 h-6 text-emerald-400" />
                <p className="text-white/80 font-medium">
                  {isRtl
                    ? "تم إرسال تقييمكم. فريقنا يعمل على عرضكم المخصص."
                    : "Your assessment is submitted. Our team is crafting your proposal."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <Link href="/assessment2/form">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative flex items-center gap-3 px-10 py-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-400/40 transition-all duration-300 overflow-hidden"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Sparkles className="relative w-5 h-5" />
                    <span className="relative">
                      {isRtl
                        ? "ابدأ التقييم الشامل"
                        : "Start Comprehensive Assessment"}
                    </span>
                    <ChevronRight
                      className={cn(
                        "relative w-5 h-5 transition-transform group-hover:translate-x-1",
                        isRtl && "rotate-180",
                      )}
                    />
                  </motion.button>
                </Link>
                <p className="text-white/30 text-sm flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  {isRtl
                    ? "بياناتكم محمية تماماً · لا يستغرق أكثر من ١٥ دقيقة"
                    : "Your data is fully protected · Takes less than 15 minutes"}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
