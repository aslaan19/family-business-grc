"use client";

import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  FileText,
  Users,
  Shield,
  ArrowLeft,
  ArrowRight,
  Star,
  ChevronRight,
  Lock,
  Sparkles,
  Brain,
  BarChart3,
  Target,
  FileCheck2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../lib/language-context";
import { cn } from "../lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

const WHAT_YOU_GET = [
  {
    icon: Brain,
    titleEn: "Diagnostic Analysis",
    titleAr: "تحليل تشخيصي",
    descEn:
      "A clear picture of your family business's current governance maturity",
    descAr: "صورة واضحة عن مستوى نضج حوكمة عائلتكم التجارية الحالي",
    num: "01",
  },
  {
    icon: BarChart3,
    titleEn: "Needs Identification",
    titleAr: "تحديد الاحتياجات",
    descEn: "Pinpoint the exact areas requiring governance improvement",
    descAr: "تحديد المجالات التي تحتاج إلى تحسين في الحوكمة بدقة",
    num: "02",
  },
  {
    icon: Target,
    titleEn: "Priority Roadmap",
    titleAr: "خارطة طريق الأولويات",
    descEn: "A ranked list of immediate actions for your family enterprise",
    descAr: "قائمة مرتبة بالإجراءات الفورية لمؤسستكم العائلية",
    num: "03",
  },
  {
    icon: FileText,
    titleEn: "Expert Report",
    titleAr: "تقرير الخبراء",
    descEn:
      "A professional analytical report prepared by our senior consultants",
    descAr: "تقرير تحليلي احترافي يُعدّه كبار مستشارينا",
    num: "04",
  },
  {
    icon: Users,
    titleEn: "Specialist Matching",
    titleAr: "مطابقة المتخصصين",
    descEn: "Matched to the right governance expert for your specific context",
    descAr: "مطابقتكم مع خبير الحوكمة المناسب لسياقكم الخاص",
    num: "05",
  },
  {
    icon: ChevronRight,
    titleEn: "Phase Two Access",
    titleAr: "الوصول للمرحلة الثانية",
    descEn:
      "Unlock the comprehensive institutional assessment for a full proposal",
    descAr: "فتح التقييم المؤسسي الشامل للحصول على عرض كامل",
    num: "06",
  },
];

const PROCESS_STEPS = [
  {
    numEn: "01",
    numAr: "١",
    titleEn: "Answer Questions",
    titleAr: "أجب على الأسئلة",
    descEn: "Complete the quick diagnostic in under 10 minutes",
    descAr: "أكمل التشخيص السريع في أقل من ١٠ دقائق",
  },
  {
    numEn: "02",
    numAr: "٢",
    titleEn: "Instant Analysis",
    titleAr: "تحليل فوري",
    descEn: "Our system scores your responses across all governance dimensions",
    descAr: "يُقيّم نظامنا إجاباتك عبر جميع أبعاد الحوكمة",
  },
  {
    numEn: "03",
    numAr: "٣",
    titleEn: "Your Report",
    titleAr: "تقريرك",
    descEn: "Receive a tailored analytical report from our expert team",
    descAr: "استلم تقريراً تحليلياً مخصصاً من فريق خبرائنا",
  },
];

const STATS = [
  { value: "10", labelEn: "Minutes", labelAr: "دقائق" },
  { value: "5+", labelEn: "Dimensions", labelAr: "محاور" },
  { value: "100+", labelEn: "Families Served", labelAr: "عائلة استفادت" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Assessment1LandingPage() {
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const Arrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <main className="min-h-screen bg-background overflow-x-hidden" dir={dir}>
      {/* ═══════════════════════════════════════════════════════════════
          HERO — full-bleed image, same structure as assessment2
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col">
        {/* Full-bleed background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/assessment1.png"
            alt="Family Business Assessment"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/65 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/45 via-transparent to-transparent" />
        </div>

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
                  {t("assessment.back")}
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Hero copy */}
          <div className="container mx-auto px-6 lg:px-12 flex-1 flex items-center py-20">
            <div className={cn("max-w-2xl", isRtl && "mr-auto ml-0")}>
              {/* Phase badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/8 backdrop-blur-sm">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.35, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-widest">
                    {isRtl ? "المرحلة الأولى" : "Phase One"}
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
                      الأولي للعائلة
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block">Family Business</span>
                    <span className="block text-emerald-400">
                      Initial Assessment
                    </span>
                  </>
                )}
              </motion.h1>

              {/* Subtitle */}
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
                  ? "اختبار تشخيصي سريع يقيس مستوى الوعي المؤسسي لعائلتك، ويحدد احتياجاتكم الفعلية. ستحصل على تقرير تحليلي فوري معدّ من خبراء متخصصين."
                  : t("assessment.subtitle")}
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

              {/* Rating row */}
             

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.62 }}
                className={cn(
                  "flex flex-col sm:flex-row items-start gap-4",
                  isRtl && "sm:flex-row-reverse",
                )}
              >
                <Link href="/assessment/Qs">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative flex items-center gap-3 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-400/40 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Sparkles className="relative w-5 h-5" />
                    <span className="relative">
                      {isRtl ? "ابدأ التقييم الآن" : "Start Assessment Now"}
                    </span>
                    <ChevronRight
                      className={cn(
                        "relative w-5 h-5 transition-transform group-hover:translate-x-1",
                        isRtl && "rotate-180",
                      )}
                    />
                  </motion.button>
                </Link>

                {/* Price pill */}
                <div
                  className={cn(
                    "flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/8 border border-white/15 backdrop-blur-sm",
                  )}
                >
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white font-bold text-lg">
                        {t("assessment.priceAmount")}
                      </span>
                      <span className="text-white/40 text-sm line-through">
                        {t("assessment.originalPrice")}
                      </span>
                    </div>
                    <span className="text-emerald-400 text-xs font-semibold">
                      {t("assessment.discount")}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Security note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.78 }}
                className={cn(
                  "flex items-center gap-2 text-white/35 text-xs mt-5",
                  isRtl && "flex-row-reverse",
                )}
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                {isRtl
                  ? "بياناتكم سرية وآمنة تماماً · ضمان استرداد الأموال ٧ أيام"
                  : "Fully confidential & secure · 7-day money-back guarantee"}
              </motion.p>
            </div>
          </div>

          {/* Scroll hint */}
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
          WHAT YOU GET — same grid structure as assessment2 sections
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
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
                {isRtl ? "ماذا ستحصل عليه" : "What You Receive"}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight mb-5">
              {isRtl ? (
                <>
                  ستة مخرجات تُحوّل
                  <br />
                  <span className="text-emerald-600">
                    فهمك لمؤسستك العائلية
                  </span>
                </>
              ) : (
                <>
                  Six deliverables that transform
                  <br />
                  <span className="text-emerald-600">
                    your family enterprise clarity
                  </span>
                </>
              )}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {isRtl
                ? "كل مخرج مصمم بعناية لإعطائك رؤية قابلة للتطبيق حول وضع الحوكمة في مؤسستكم العائلية."
                : "Each deliverable is carefully designed to give you actionable insight into your family business governance standing."}
            </p>
          </motion.div>

          {/* Same gap-px grid as assessment2 */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {WHAT_YOU_GET.map((item, i) => (
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
                <div
                  className={cn(
                    "flex items-center justify-between mb-6",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  <span className="text-4xl font-black text-border group-hover:text-emerald-200 dark:group-hover:text-emerald-900/60 transition-colors duration-300 select-none">
                    {item.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 flex items-center justify-center transition-colors">
                    <item.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  {isRtl ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isRtl ? item.descAr : item.descEn}
                </p>
                {/* Hover accent */}
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
          PROCESS — identical layout to assessment2
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
              {isRtl ? "كيف تسير العملية" : "How it works"}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-foreground">
              {isRtl ? "ثلاث خطوات إلى الوضوح" : "Three steps to clarity"}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
            {/* Connector */}
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
          FINAL CTA — dark section, identical to assessment2
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
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
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-10">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">
                {isRtl
                  ? "التقرير جاهز خلال ٢٤ ساعة"
                  : "Report ready within 24 hours"}
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
              {isRtl ? (
                <>
                  احصل على تقريرك
                  <br />
                  <span className="text-emerald-400">التشخيصي اليوم</span>
                </>
              ) : (
                <>
                  Get your diagnostic
                  <br />
                  <span className="text-emerald-400">report today</span>
                </>
              )}
            </h2>

            <p className="text-lg text-white/60 leading-relaxed mb-12 max-w-xl mx-auto">
              {isRtl
                ? "ابدأ رحلة الحوكمة بخطوة واحدة. تقييمك الأولي هو الأساس الذي تُبنى عليه كل قراراتك المستقبلية."
                : "Start your governance journey with a single step. Your initial assessment is the foundation every future decision is built on."}
            </p>

            <div className="flex flex-col items-center gap-5">
              <Link href="/assessment/Qs">
                <motion.button
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative flex items-center gap-3 px-10 py-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-400/40 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Sparkles className="relative w-5 h-5" />
                  <span className="relative">
                    {isRtl
                      ? `${t("assessment.price")} — ${t("assessment.priceAmount")}`
                      : `${t("assessment.price")} — ${t("assessment.priceAmount")}`}
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
                  ? "بياناتكم محمية تماماً · ضمان استرداد الأموال ٧ أيام"
                  : "Your data is fully protected · 7-day money-back guarantee"}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
