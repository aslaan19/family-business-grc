"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
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
} from "lucide-react";
import { useLanguage } from "../lib/language-context";
import {
  SUBMISSION_STORAGE_KEY,
  SUBMISSION2_STORAGE_KEY,
} from "../components/ui/assessment-form-modal";
import { cn } from "../lib/utils";

// ─── Professional SVG Hero Image ─────────────────────────────────────────────

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 560 420"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        {/* Background gradient */}
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a1628" />
          <stop offset="100%" stopColor="#0f2410" />
        </linearGradient>

        {/* Green accent gradient */}
        <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a6b3c" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        {/* Gold gradient */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#f0c94a" />
        </linearGradient>

        {/* Card gradient */}
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a2a3a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0f1e2e" stopOpacity="0.98" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="softGlow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <clipPath id="roundedCard">
          <rect x="30" y="20" width="500" height="380" rx="20" />
        </clipPath>
      </defs>

      {/* Background */}
      <rect width="560" height="420" fill="url(#bgGrad)" rx="16" />

      {/* Subtle grid pattern */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1="0"
          y1={i * 36}
          x2="560"
          y2={i * 36}
          stroke="#ffffff"
          strokeOpacity="0.025"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={i * 37}
          y1="0"
          x2={i * 37}
          y2="420"
          stroke="#ffffff"
          strokeOpacity="0.025"
          strokeWidth="1"
        />
      ))}

      {/* Large background glow blobs */}
      <circle cx="140" cy="100" r="120" fill="#1a6b3c" opacity="0.08" />
      <circle cx="420" cy="320" r="100" fill="#c9a227" opacity="0.06" />
      <circle cx="480" cy="80" r="80" fill="#10b981" opacity="0.06" />

      {/* ── Main central building/org chart ── */}

      {/* Central institution icon */}
      <rect
        x="230"
        y="60"
        width="100"
        height="90"
        rx="8"
        fill="url(#greenGrad)"
        opacity="0.15"
      />
      <rect
        x="232"
        y="62"
        width="96"
        height="86"
        rx="7"
        fill="none"
        stroke="#1a6b3c"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />

      {/* Building columns */}
      {[248, 263, 278, 293, 308].map((x, i) => (
        <rect
          key={i}
          x={x}
          y="88"
          width="9"
          height="46"
          rx="2"
          fill="#10b981"
          opacity="0.5"
        />
      ))}
      <rect
        x="242"
        y="84"
        width="76"
        height="6"
        rx="2"
        fill="#10b981"
        opacity="0.7"
      />
      <rect
        x="238"
        y="134"
        width="84"
        height="6"
        rx="2"
        fill="#10b981"
        opacity="0.7"
      />
      {/* Flag / crown */}
      <rect x="277" y="62" width="6" height="20" fill="#c9a227" opacity="0.8" />
      <polygon points="283,62 283,72 295,67" fill="#c9a227" opacity="0.9" />

      {/* ── Org chart lines from center ── */}
      <line
        x1="280"
        y1="150"
        x2="280"
        y2="175"
        stroke="#1a6b3c"
        strokeWidth="1.5"
        strokeOpacity="0.5"
        strokeDasharray="4,3"
      />

      {/* Level 2 horizontal bar */}
      <line
        x1="140"
        y1="175"
        x2="420"
        y2="175"
        stroke="#1a6b3c"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />

      {/* Level 2 nodes — 4 departments */}
      {[
        { x: 100, label: "Board", icon: "B" },
        { x: 200, label: "Strategy", icon: "S" },
        { x: 310, label: "Finance", icon: "F" },
        { x: 410, label: "Risk", icon: "R" },
      ].map((node) => (
        <g key={node.label}>
          <line
            x1={node.x + 30}
            y1="175"
            x2={node.x + 30}
            y2="188"
            stroke="#1a6b3c"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          <rect
            x={node.x}
            y="188"
            width="60"
            height="36"
            rx="8"
            fill="url(#cardGrad)"
            stroke="#1a6b3c"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          <text
            x={node.x + 30}
            y="201"
            textAnchor="middle"
            fill="#10b981"
            fontSize="8"
            fontWeight="700"
            opacity="0.9"
          >
            {node.icon}
          </text>
          <text
            x={node.x + 30}
            y="215"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="7"
            opacity="0.8"
          >
            {node.label}
          </text>
        </g>
      ))}

      {/* Level 3 lines */}
      {[130, 230, 340, 440].map((x) => (
        <line
          key={x}
          x1={x}
          y1="224"
          x2={x}
          y2="240"
          stroke="#1a6b3c"
          strokeWidth="1"
          strokeOpacity="0.25"
          strokeDasharray="3,3"
        />
      ))}

      {/* ── Floating data cards ── */}

      {/* Card 1 — top left: Governance Score */}
      <g filter="url(#softGlow)">
        <rect
          x="22"
          y="22"
          width="140"
          height="80"
          rx="12"
          fill="url(#cardGrad)"
          stroke="#1a6b3c"
          strokeWidth="1"
          strokeOpacity="0.6"
        />
      </g>
      <text
        x="38"
        y="45"
        fill="#94a3b8"
        fontSize="8"
        fontWeight="600"
        letterSpacing="1"
      >
        GOVERNANCE SCORE
      </text>
      <text
        x="38"
        y="68"
        fill="#10b981"
        fontSize="26"
        fontWeight="800"
        filter="url(#glow)"
      >
        87%
      </text>
      {/* Progress bar */}
      <rect x="38" y="75" width="104" height="4" rx="2" fill="#1e3a2a" />
      <rect x="38" y="75" width="90" height="4" rx="2" fill="url(#greenGrad)" />
      <text x="38" y="93" fill="#64748b" fontSize="7">
        +12% from last assessment
      </text>

      {/* Card 2 — top right: Risk Level */}
      <g filter="url(#softGlow)">
        <rect
          x="398"
          y="22"
          width="140"
          height="80"
          rx="12"
          fill="url(#cardGrad)"
          stroke="#c9a227"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
      </g>
      <text
        x="414"
        y="45"
        fill="#94a3b8"
        fontSize="8"
        fontWeight="600"
        letterSpacing="1"
      >
        RISK ASSESSMENT
      </text>
      {/* Risk gauge arcs */}
      <path
        d="M 468 80 m -28 0 a 28 28 0 0 1 56 0"
        fill="none"
        stroke="#1e3a2a"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 468 80 m -28 0 a 28 28 0 0 1 42 -18"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <text
        x="468"
        y="84"
        textAnchor="middle"
        fill="#c9a227"
        fontSize="10"
        fontWeight="800"
      >
        MED
      </text>
      <text x="440" y="96" fill="#64748b" fontSize="7">
        Low risk exposure
      </text>
      <text x="496" y="96" fill="#64748b" fontSize="7">
        detected
      </text>

      {/* Card 3 — bottom left: Board composition */}
      <g filter="url(#softGlow)">
        <rect
          x="22"
          y="300"
          width="150"
          height="100"
          rx="12"
          fill="url(#cardGrad)"
          stroke="#1a6b3c"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
      </g>
      <text
        x="38"
        y="320"
        fill="#94a3b8"
        fontSize="8"
        fontWeight="600"
        letterSpacing="1"
      >
        BOARD COMPOSITION
      </text>
      {/* Mini avatar circles */}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          cx={38 + i * 22}
          cy="345"
          r="10"
          fill={["#1a6b3c", "#10b981", "#c9a227", "#3b82f6", "#8b5cf6"][i]}
          opacity="0.8"
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={`b${i}`}
          cx={38 + i * 22}
          cy="345"
          r="10"
          fill="none"
          stroke="#0a1628"
          strokeWidth="2"
        />
      ))}
      <text x="38" y="368" fill="#e2e8f0" fontSize="9" fontWeight="700">
        7 Members
      </text>
      <text x="38" y="381" fill="#64748b" fontSize="7.5">
        3 Independent · 4 Executive
      </text>
      {/* Small bar */}
      <rect x="38" y="386" width="120" height="3" rx="1.5" fill="#1e3a2a" />
      <rect x="38" y="386" width="51" height="3" rx="1.5" fill="#10b981" />
      <rect x="89" y="386" width="69" height="3" rx="1.5" fill="#c9a227" />

      {/* Card 4 — bottom right: Compliance */}
      <g filter="url(#softGlow)">
        <rect
          x="388"
          y="290"
          width="150"
          height="110"
          rx="12"
          fill="url(#cardGrad)"
          stroke="#10b981"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
      </g>
      <text
        x="404"
        y="310"
        fill="#94a3b8"
        fontSize="8"
        fontWeight="600"
        letterSpacing="1"
      >
        COMPLIANCE STATUS
      </text>
      {/* Checklist items */}
      {[
        { label: "Governance Charter", done: true },
        { label: "Board Charter", done: true },
        { label: "Risk Framework", done: true },
        { label: "Conflict Policy", done: false },
      ].map((item, i) => (
        <g key={i}>
          <circle
            cx="410"
            cy={330 + i * 18}
            r="5"
            fill={item.done ? "#1a6b3c" : "#1e293b"}
            stroke={item.done ? "#10b981" : "#334155"}
            strokeWidth="1"
          />
          {item.done && (
            <text
              x="410"
              y={333 + i * 18}
              textAnchor="middle"
              fill="#10b981"
              fontSize="6"
              fontWeight="900"
            >
              ✓
            </text>
          )}
          <text
            x="420"
            y={333 + i * 18}
            fill={item.done ? "#cbd5e1" : "#475569"}
            fontSize="8"
          >
            {item.label}
          </text>
        </g>
      ))}

      {/* ── Center floating badge ── */}
      <g filter="url(#softGlow)">
        <circle
          cx="280"
          cy="260"
          r="32"
          fill="#0a1628"
          stroke="#c9a227"
          strokeWidth="2"
          strokeOpacity="0.8"
        />
      </g>
      <circle
        cx="280"
        cy="260"
        r="26"
        fill="none"
        stroke="#c9a227"
        strokeWidth="1"
        strokeOpacity="0.3"
        strokeDasharray="3,4"
      />
      <text
        x="280"
        y="255"
        textAnchor="middle"
        fill="#c9a227"
        fontSize="9"
        fontWeight="700"
        filter="url(#glow)"
      >
        CRAM
      </text>
      <text
        x="280"
        y="268"
        textAnchor="middle"
        fill="#94a3b8"
        fontSize="6.5"
        letterSpacing="1.5"
      >
        CERTIFIED
      </text>

      {/* ── Decorative connecting dots ── */}
      {[
        { cx: 162, cy: 62 },
        { cx: 190, cy: 90 },
        { cx: 370, cy: 62 },
        { cx: 400, cy: 85 },
      ].map((dot, i) => (
        <circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r="2.5"
          fill="#1a6b3c"
          opacity="0.5"
        />
      ))}

      {/* ── Corner accent lines ── */}
      <line
        x1="0"
        y1="0"
        x2="60"
        y2="0"
        stroke="url(#greenGrad)"
        strokeWidth="3"
        strokeOpacity="0.6"
      />
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="60"
        stroke="url(#greenGrad)"
        strokeWidth="3"
        strokeOpacity="0.6"
      />
      <line
        x1="560"
        y1="420"
        x2="500"
        y2="420"
        stroke="url(#goldGrad)"
        strokeWidth="3"
        strokeOpacity="0.6"
      />
      <line
        x1="560"
        y1="420"
        x2="560"
        y2="360"
        stroke="url(#goldGrad)"
        strokeWidth="3"
        strokeOpacity="0.6"
      />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Assessment2LandingPage() {
  const { dir } = useLanguage();
  const router = useRouter();
  const isRtl = dir === "rtl";

  // Guard: must have completed assessment 1
  const sub1Done =
    typeof window !== "undefined" &&
    localStorage.getItem(SUBMISSION_STORAGE_KEY) === "true";

  useEffect(() => {
    if (!sub1Done) router.replace("/");
  }, [sub1Done, router]);

  if (!sub1Done) return null;

  const SECTIONS = [
    {
      icon: Building2,
      titleEn: "Company Profile",
      titleAr: "ملف الشركة",
      descEn: "Legal info, employees, revenue, branches and key clients",
      descAr: "المعلومات القانونية، الموظفون، الإيرادات، الفروع والعملاء",
    },
    {
      icon: Target,
      titleEn: "Strategy & Vision",
      titleAr: "الاستراتيجية والرؤية",
      descEn: "Vision, mission, strategic objectives and KPIs",
      descAr: "الرؤية، الرسالة، الأهداف الاستراتيجية ومؤشرات الأداء",
    },
    {
      icon: Shield,
      titleEn: "Board & Governance",
      titleAr: "مجلس الإدارة والحوكمة",
      descEn: "Board structure, committees, charters and independence",
      descAr: "هيكل المجلس، اللجان، المواثيق والاستقلالية",
    },
    {
      icon: BarChart3,
      titleEn: "Financial Overview",
      titleAr: "النظرة المالية",
      descEn: "Revenue streams, capital, profitability and key clients",
      descAr: "مصادر الإيرادات، رأس المال، الربحية والعملاء",
    },
    {
      icon: Briefcase,
      titleEn: "Operations & Risk",
      titleAr: "العمليات والمخاطر",
      descEn: "Core processes, automation levels and risk management",
      descAr: "العمليات الأساسية، مستوى الأتمتة وإدارة المخاطر",
    },
    {
      icon: FileCheck2,
      titleEn: "Governance Docs",
      titleAr: "وثائق الحوكمة",
      descEn: "Policies, delegation of authority and compliance framework",
      descAr: "السياسات، جدول الصلاحيات وإطار الامتثال",
    },
  ];

  const ALREADY_DONE = localStorage.getItem(SUBMISSION2_STORAGE_KEY) === "true";

  return (
    <main className="min-h-screen bg-background" dir={dir}>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/30 via-background to-background" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-amber-500/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-6 py-20 lg:py-28">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft
                className={cn(
                  "w-4 h-4 transition-transform",
                  isRtl
                    ? "rotate-180 group-hover:translate-x-1"
                    : "group-hover:-translate-x-1",
                )}
              />
              <span className="text-sm font-medium">
                {isRtl ? "العودة للرئيسية" : "Back to home"}
              </span>
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className={isRtl ? "lg:order-2" : "lg:order-1"}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 mb-8"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {isRtl
                    ? "التقييم المؤسسي الشامل"
                    : "Comprehensive Institutional Assessment"}
                </span>
                <span className="text-xs bg-amber-200 dark:bg-amber-800 px-2 py-0.5 rounded-full font-bold">
                  {isRtl ? "الخطوة 2" : "Step 2"}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className={cn(
                  "text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight",
                  isRtl && "text-right",
                )}
              >
                {isRtl ? (
                  <>
                    التقييم المؤسسي
                    <span className="block text-emerald-600 mt-2 text-3xl md:text-4xl">
                      الشامل لشركتكم
                    </span>
                  </>
                ) : (
                  <>
                    Institutional
                    <span className="block text-emerald-600 mt-2 text-3xl md:text-4xl">
                      Deep-Dive Assessment
                    </span>
                  </>
                )}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={cn(
                  "text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg",
                  isRtl && "text-right",
                )}
              >
                {isRtl
                  ? "استناداً إلى نتائج التقييم الأولي، هذا النموذج الشامل يتيح لفريق خبرائنا فهم مؤسستكم بعمق لإعداد العرض التقني والمالي المخصص لكم."
                  : "Building on your initial assessment results, this comprehensive form enables our expert team to deeply understand your institution and prepare a fully customised technical and financial proposal."}
              </motion.p>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={cn(
                  "flex flex-wrap gap-6 mb-10",
                  isRtl && "flex-row-reverse",
                )}
              >
                {[
                  { value: "8", labelEn: "Sections", labelAr: "أقسام" },
                  {
                    value: "40+",
                    labelEn: "Data Points",
                    labelAr: "نقطة بيانات",
                  },
                  {
                    value: "15",
                    labelEn: "Minutes to Fill",
                    labelAr: "دقيقة للإكمال",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={cn("flex flex-col", isRtl && "items-end")}
                  >
                    <span className="text-3xl font-black text-foreground">
                      {stat.value}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {isRtl ? stat.labelAr : stat.labelEn}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* A1 completed badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 mb-8",
                  isRtl && "flex-row-reverse",
                )}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className={isRtl ? "text-right" : ""}>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {isRtl
                      ? "أنجزت التقييم الأولي بنجاح!"
                      : "Initial assessment completed!"}
                  </p>
                  <p className="text-xs text-emerald-600/70">
                    {isRtl
                      ? "الآن أكمل بياناتك المؤسسية للحصول على عرضك المخصص"
                      : "Now complete your institutional profile to receive your customised proposal"}
                  </p>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {ALREADY_DONE ? (
                  <div
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl bg-muted border border-border",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    <FileCheck2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <p className="text-sm font-semibold text-foreground">
                      {isRtl
                        ? "لقد أكملت هذا التقييم بالفعل. فريقنا يعمل على عرضك."
                        : "You've already completed this assessment. Our team is preparing your proposal."}
                    </p>
                  </div>
                ) : (
                  <Link href="/assessment2/form">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-l from-emerald-600 to-emerald-500 text-white font-bold text-lg shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/35 transition-all duration-300"
                    >
                      <Sparkles className="w-5 h-5" />
                      {isRtl
                        ? "ابدأ التقييم الشامل"
                        : "Start Comprehensive Assessment"}
                      <ChevronRight
                        className={cn(
                          "w-5 h-5 transition-transform group-hover:translate-x-1",
                          isRtl && "rotate-180 group-hover:-translate-x-1",
                        )}
                      />
                    </motion.button>
                  </Link>
                )}
              </motion.div>
            </motion.div>

            {/* Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className={cn("relative", isRtl ? "lg:order-1" : "lg:order-2")}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/30 border border-emerald-900/20">
                <HeroIllustration />
              </div>

              {/* Floating badge 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className={cn(
                  "absolute -top-5 px-4 py-2.5 rounded-full bg-card border border-border shadow-xl flex items-center gap-2",
                  isRtl ? "-left-4" : "-right-4",
                )}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-foreground">
                  {isRtl ? "تحليل مؤسسي متعمق" : "Deep Institutional Analysis"}
                </span>
              </motion.div>

              {/* Floating badge 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className={cn(
                  "absolute -bottom-5 px-4 py-2.5 rounded-full bg-card border border-border shadow-xl flex items-center gap-2",
                  isRtl ? "-right-4" : "-left-4",
                )}
              >
                <Lock className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-foreground">
                  {isRtl
                    ? "بياناتك محمية وسرية"
                    : "Your data is secure & confidential"}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── What you'll fill ── */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "text-center mb-14",
              isRtl && "text-right sm:text-center",
            )}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {isRtl
                ? "ماذا يشمل هذا التقييم؟"
                : "What Does This Assessment Cover?"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isRtl
                ? "ثمانية أقسام شاملة تغطي كل جانب من جوانب مؤسستكم"
                : "Eight comprehensive sections covering every aspect of your institution"}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {SECTIONS.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={cn(
                  "group p-6 rounded-2xl bg-card border border-border hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300",
                  isRtl && "text-right",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 mb-3",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                    <section.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[11px] font-black text-muted-foreground">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1.5">
                  {isRtl ? section.titleAr : section.titleEn}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isRtl ? section.descAr : section.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 mb-8">
              <Users className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {isRtl ? "فريق خبرائنا جاهز" : "Our expert team is ready"}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {isRtl
                ? "احصل على عرضك المخصص اليوم"
                : "Get Your Customised Proposal Today"}
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              {isRtl
                ? "ستصلك نتائجك التحليلية وعرضك التقني والمالي المخصص خلال أيام عمل معدودة"
                : "Your analytical findings and customised technical & financial proposal will be delivered within a few working days"}
            </p>
            {!ALREADY_DONE && (
              <Link href="/assessment2/form">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-l from-emerald-600 to-emerald-500 text-white font-bold text-lg shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/35 transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5" />
                  {isRtl ? "ابدأ الآن — مجاناً" : "Start Now — Free"}
                  <ChevronRight
                    className={cn("w-5 h-5", isRtl && "rotate-180")}
                  />
                </motion.button>
              </Link>
            )}
            <p className="text-sm text-muted-foreground mt-6">
              {isRtl
                ? "آمن وسري تماماً · لا يستغرق أكثر من 15 دقيقة"
                : "Fully secure & confidential · Takes less than 15 minutes"}
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
