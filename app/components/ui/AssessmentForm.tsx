"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Loader2,
  Mail,
  Shield,
} from "lucide-react";
import { useLanguage } from "../../lib/language-context";
import { cn } from "../../lib/utils";
import {
  SavedUser,
  USER_STORAGE_KEY,
  SUBMISSION_STORAGE_KEY,
} from "./assessment-form-modal";

// ─── Types ────────────────────────────────────────────────────────────────────

type AnswerValue = 10 | 5 | 0;
interface Question {
  q: string;
  desc: string;
}
interface Category {
  num: number;
  title: string;
  questions: Question[];
}
interface Answers {
  [key: string]: AnswerValue;
}
interface DBQuestion {
  id: string;
  categoryKey: string;
  categoryOrder: number;
  questionOrder: number;
  question: string;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const G = {
  900: "#0a2e1a",
  800: "#0f3d22",
  700: "#14522e",
  600: "#1a6b3c",
  500: "#22874d",
  400: "#2ea360",
  100: "#d4edd9",
  50: "#f3f8ed",
} as const;

const GOLD = {
  700: "#7a5a0a",
  600: "#a07810",
  500: "#c9a227",
  400: "#d4b347",
  300: "#e8cc80",
  100: "#faf3dc",
  50: "#fdfaf0",
} as const;

// ─── Content ──────────────────────────────────────────────────────────────────

const CONTENT: Record<
  "ar" | "en",
  { meta: Record<string, string>; categories: Category[] }
> = {
  ar: {
    meta: {
      step1: "التسجيل",
      step2: "التقييم",
      step3: "النتيجة",
      title: "نموذج كرام لقياس الحوكمة",
      subtitle: "أجب على جميع الأسئلة لاستكمال التقييم",
      badge: "A | A",
      completed: "مكتمل",
      of: "من",
      questions: "أسئلة",
      next: "التالي",
      prev: "السابق",
      submit: "إرسال التقييم",
      submitting: "جاري الإرسال...",
      fillAll: "يرجى الإجابة على جميع أسئلة هذا القسم",
      yes: "نعم",
      partial: "جزئي",
      no: "ملاحظات",
      alreadyTitle: "لقد أكملت التقييم بالفعل!",
      alreadySub:
        "شكراً لك. يعمل فريق الخبراء لدينا على مراجعة إجاباتك وإعداد تقرير حوكمة مخصّص سيُرسل إليك قريباً.",
      alreadyEmail: "سيصلك التقرير على",
      totalScore: "إجمالي النقاط",
      totalQ: "إجمالي الأسئلة",
    },
    categories: [
      {
        num: 1,
        title: "الهيكل والحوكمة المؤسسية",
        questions: [
          {
            q: "هل يوجد هيكل تنظيمي واضح ومحدد للمؤسسة؟",
            desc: "وضوح الهيكل التنظيمي والصلاحيات يشير إلى وجود هيكل رسمي يوضح العلاقات بين الجهات الإدارية، وتسلسل السلطة، وتوزيع الأدوار بما يضمن عدم تعارض المصالح.",
          },
          {
            q: "هل مجلس الإدارة مستقل وفعال؟",
            desc: "استقلالية وفعالية مجلس الإدارة أو الجهة الإشرافية يتعلق بوجود مجلس يتمتع بالاستقلالية في اتخاذ القرار، مع تنوع في الخلفيات والاختصاصات.",
          },
          {
            q: "هل توجد لجان متخصصة للحوكمة (مراجعة، مخاطر، ترشيحات)؟",
            desc: "وجود لجان حوكمة فعالة يضمن أن اللجان الداعمة لمجلس الإدارة تقوم بدورها في مراجعة التقارير، تقييم المخاطر، والمساهمة في تعيين القيادات.",
          },
          {
            q: "هل تم تحديد واضح للصلاحيات والمسؤوليات بين القيادة والإدارة؟",
            desc: "تحديد المهام والمسؤوليات بين الإدارة التنفيذية والإشرافية يضمن وضوح الحدود بين من يضع السياسات ومن ينفذها.",
          },
        ],
      },
      {
        num: 2,
        title: "الشفافية والإفصاح",
        questions: [
          {
            q: "هل يتم نشر التقارير المالية وغير المالية بانتظام؟",
            desc: "نشر التقارير المالية وغير المالية بانتظام تعكس ضرورة الإفصاح عن البيانات المالية وأداء المؤسسة الاجتماعي والبيئي لدعم ثقة أصحاب المصلحة.",
          },
          {
            q: "هل توجد سياسة معلنة للإفصاح؟",
            desc: "توفر سياسات إفصاح واضحة ومعلنة يشمل وجود آليات واضحة تحدد ما يجب الإفصاح عنه، وكيفية الإفصاح وتوقيته.",
          },
          {
            q: "هل يمكن لأصحاب المصلحة الوصول للمعلومات الجوهرية؟",
            desc: "تمكين أصحاب المصلحة من الوصول إلى المعلومات الجوهرية يضمن الحق في الوصول إلى المعلومات التي تؤثر على حقوقهم أو قراراتهم.",
          },
        ],
      },
      {
        num: 3,
        title: "الرقابة الداخلية وإدارة المخاطر",
        questions: [
          {
            q: "هل يوجد نظام رقابة داخلية فعال؟",
            desc: "وجود نظام فعال للرقابة الداخلية يعني تطبيق آليات الرصد والانحرافات ومراجعة العمليات لضمان النزاهة والكفاءة.",
          },
          {
            q: "هل يتم تطبيق إدارة مخاطر مؤسسية شاملة؟",
            desc: "تطبيق إدارة المخاطر المؤسسية (ERM) تبني نهج شامل لتحديد، تحليل، تقييم، ومتابعة المخاطر.",
          },
          {
            q: "هل توجد سياسة فعالة لمكافحة الفساد والاحتيال؟",
            desc: "وجود نظام لمكافحة الفساد والاحتيال يشمل سياسات وقنوات للإبلاغ عن الممارسات غير القانونية، وحماية المبلغين.",
          },
          {
            q: "هل يوجد نظام تدقيق داخلي وخارجي فعال؟",
            desc: "وجود سياسة واضحة للتدقيق الداخلي والخارجي تأكيد على استقلال المراجعين الداخليين وتكامل عملهم مع المراجعين الخارجيين.",
          },
        ],
      },
      {
        num: 4,
        title: "الامتثال والمساءلة",
        questions: [
          {
            q: "هل تلتزم المؤسسة بجميع القوانين واللوائح المعمول بها؟",
            desc: "التقيد بالقوانين واللوائح المحلية والدولية يشمل الالتزام بكافة الأنظمة القانونية ذات الصلة بنشاط المؤسسة.",
          },
          {
            q: "هل توجد سياسة واضحة للمساءلة وصنع القرار؟",
            desc: "وجود سياسات للمساءلة واتخاذ القرار تحديد من هو المسؤول عن ماذا، وتمكين الجهات الرقابية من محاسبة المسؤولين.",
          },
          {
            q: "هل توجد آلية فعالة للتعامل مع الشكاوى والتظلمات؟",
            desc: "إنشاء آليات قنوات واضحة شفافة للتعامل مع الشكاوى والتظلمات والاعتراضات بطريقة عادلة وفعالة.",
          },
        ],
      },
      {
        num: 5,
        title: "حقوق أصحاب المصلحة",
        questions: [
          {
            q: "هل يتم إشراك أصحاب المصلحة في صنع القرار؟",
            desc: "مشاركة أصحاب المصلحة في صنع القرار مثل إشراك الموظفين أو العملاء في الاستطلاعات أو اللجان الاستشارية أو جلسات الاستماع.",
          },
          {
            q: "هل تتم حماية حقوق الموظفين والعملاء والمجتمع؟",
            desc: "حماية حقوق الموظفين والعملاء والمجتمع يشمل الالتزام بحقوق العمل، جودة الخدمة، والمساهمة المجتمعية.",
          },
          {
            q: "هل توجد قنوات تواصل فعالة مع أصحاب المصلحة؟",
            desc: "قنوات تواصل وتغذية راجعة توفير وسائل فعالة ومستدامة لتلقي الملاحظات والاستفادة منها في التطوير المؤسسي.",
          },
        ],
      },
      {
        num: 6,
        title: "الأخلاقيات والسلوك المؤسسي",
        questions: [
          {
            q: "هل توجد مدونة سلوك مهني معتمدة ومعلنة؟",
            desc: "وجود مدونة سلوك مهني معتمدة ومطبقة، وثيقة تنظم القيم والسلوكيات المتوقعة من الموظفين مع آلية متابعة الالتزام بها.",
          },
          {
            q: "هل يتم تعزيز ثقافة النزاهة والشفافية؟",
            desc: "تعزيز ثقافة النزاهة والشفافية برامج توعية، مكافآت السلوك الأخلاقي، والتصدي للانتهاكات بثبات وعدالة.",
          },
          {
            q: "هل يتم تقديم تدريب دوري على السلوك الأخلاقي؟",
            desc: "برامج توعية وتدريب على السلوك الأخلاقي دورات تدريبية دورية لكل الفئات مع أمثلة واقعية وسياسات تطبيقية.",
          },
        ],
      },
      {
        num: 7,
        title: "الأداء والتحسين المستمر",
        questions: [
          {
            q: "هل يتم تقييم أداء مجلس الإدارة والإدارة العليا دوريًا؟",
            desc: "تقييم قائم على مؤشرات أداء ومعايير مهنية محددة، ويستخدم في التطوير والتحسين.",
          },
          {
            q: "هل تتم مراجعة سياسات الحوكمة بشكل دوري؟",
            desc: "مراجعة سياسات الحوكمة وتطويرها بشكل دوري يضمن بقاء السياسات متماشية مع التغيرات الداخلية والخارجية.",
          },
          {
            q: "هل يتم ربط الحوكمة بالأداء المؤسسي فعليًا؟",
            desc: "من خلال تقارير دورية تبين كيف تسهم الحوكمة في تحسين الكفاءة وتحقيق الأهداف.",
          },
        ],
      },
    ],
  },
  en: {
    meta: {
      step1: "Register",
      step2: "Assessment",
      step3: "Results",
      title: "KARAM Governance Assessment",
      subtitle: "Answer all questions to complete the assessment",
      badge: "A | A",
      completed: "completed",
      of: "of",
      questions: "questions",
      next: "Next",
      prev: "Previous",
      submit: "Submit Assessment",
      submitting: "Submitting...",
      fillAll: "Please answer all questions in this section",
      yes: "Yes",
      partial: "Partial",
      no: "Notes",
      alreadyTitle: "You've already completed the assessment!",
      alreadySub:
        "Our expert team is reviewing your answers and preparing a customised governance report that will be sent to you shortly.",
      alreadyEmail: "Your report will be sent to",
      totalScore: "Total Score",
      totalQ: "Total Questions",
    },
    categories: [
      {
        num: 1,
        title: "Organizational Structure & Governance",
        questions: [
          {
            q: "Is there a clear and defined organizational structure?",
            desc: "Clarity of organizational structure and authority refers to having a formal structure that clarifies relationships between administrative bodies, chain of command, and role distribution.",
          },
          {
            q: "Is the Board of Directors independent and effective?",
            desc: "Independence and effectiveness of the Board relates to having a board that exercises independence in decision-making, with diversity in backgrounds and competencies.",
          },
          {
            q: "Are there specialized governance committees (audit, risk, nominations)?",
            desc: "Having effective governance committees ensures that supporting committees review reports, assess risks, and contribute to appointing leadership.",
          },
          {
            q: "Are roles and responsibilities clearly defined between leadership and management?",
            desc: "Clear delineation between executive and supervisory roles ensures clarity on who sets policy and who implements it.",
          },
        ],
      },
      {
        num: 2,
        title: "Transparency & Disclosure",
        questions: [
          {
            q: "Are financial and non-financial reports published regularly?",
            desc: "Regular publication reflects the necessity of disclosing financial data and institutional social and environmental performance to build stakeholder trust.",
          },
          {
            q: "Is there a publicly announced disclosure policy?",
            desc: "Having clear and announced disclosure policies includes mechanisms that specify what must be disclosed, how to disclose it, and the timing.",
          },
          {
            q: "Can stakeholders access material information?",
            desc: "Enabling stakeholders to access material information ensures the right to access information that affects their rights or decisions.",
          },
        ],
      },
      {
        num: 3,
        title: "Internal Controls & Risk Management",
        questions: [
          {
            q: "Is there an effective internal control system?",
            desc: "An effective internal control system means applying monitoring mechanisms, deviation detection, and process reviews to ensure integrity and efficiency.",
          },
          {
            q: "Is comprehensive Enterprise Risk Management (ERM) applied?",
            desc: "Implementing ERM involves adopting a comprehensive approach to identify, analyze, assess, and monitor risks.",
          },
          {
            q: "Is there an effective anti-corruption and fraud policy?",
            desc: "An anti-corruption system includes policies and channels for reporting illegal practices, whistleblower protection, and handling violations.",
          },
          {
            q: "Is there an effective internal and external audit system?",
            desc: "A clear audit policy emphasizes the independence of internal auditors and integration with external auditors to ensure transparency.",
          },
        ],
      },
      {
        num: 4,
        title: "Compliance & Accountability",
        questions: [
          {
            q: "Does the institution comply with all applicable laws and regulations?",
            desc: "Adherence to local and international laws includes compliance with all legal systems relevant to institutional activities.",
          },
          {
            q: "Is there a clear accountability and decision-making policy?",
            desc: "Having accountability policies defines who is responsible for what, enabling regulatory bodies to hold officials accountable.",
          },
          {
            q: "Is there an effective grievance and complaint mechanism?",
            desc: "Establishing clear, transparent channels to handle complaints, grievances, and objections in a fair and effective manner.",
          },
        ],
      },
      {
        num: 5,
        title: "Stakeholder Rights",
        questions: [
          {
            q: "Are stakeholders engaged in decision-making?",
            desc: "Stakeholder participation such as involving employees or customers in surveys, advisory committees, or listening sessions.",
          },
          {
            q: "Are the rights of employees, customers, and community protected?",
            desc: "Protecting rights includes commitment to labor rights, service quality, and community contribution.",
          },
          {
            q: "Are there effective communication channels with stakeholders?",
            desc: "Communication channels provide effective and sustainable means to receive feedback and use it in institutional development.",
          },
        ],
      },
      {
        num: 6,
        title: "Ethics & Institutional Conduct",
        questions: [
          {
            q: "Is there an approved and announced professional code of conduct?",
            desc: "An approved code of conduct regulates the values and behaviors expected of employees, with a mechanism to monitor compliance.",
          },
          {
            q: "Is a culture of integrity and transparency promoted?",
            desc: "Promoting a culture through awareness programs, ethical behavior rewards, and steadfast response to violations.",
          },
          {
            q: "Is periodic training on ethical conduct provided?",
            desc: "Awareness and training programs are periodic training courses for all categories with real-life examples and application policies.",
          },
        ],
      },
      {
        num: 7,
        title: "Performance & Continuous Improvement",
        questions: [
          {
            q: "Is the performance of the Board and senior management evaluated periodically?",
            desc: "Periodic evaluation based on KPIs and professional standards, used for development and improvement.",
          },
          {
            q: "Are governance policies reviewed periodically?",
            desc: "Periodic review of governance policies ensures they remain aligned with internal and external changes.",
          },
          {
            q: "Is governance effectively linked to institutional performance?",
            desc: "Linking governance to institutional performance through periodic reports showing how governance improves efficiency.",
          },
        ],
      },
    ],
  },
};

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({
  step1,
  step2,
  step3,
  currentStep,
  dir,
}: {
  step1: string;
  step2: string;
  step3: string;
  currentStep: 1 | 2 | 3;
  dir: "rtl" | "ltr";
}) {
  const steps = [step1, step2, step3];
  const displaySteps = dir === "rtl" ? [...steps].reverse() : steps;
  const displayCurrentStep = dir === "rtl" ? 4 - currentStep : currentStep;

  return (
    <div className="flex items-center justify-center gap-0 py-6 px-4">
      {displaySteps.map((label, i) => {
        const n = i + 1;
        const isDone = n < displayCurrentStep;
        const isActive = n === displayCurrentStep;
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{ scale: isActive ? 1.05 : 1 }}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{
                  backgroundColor: isDone
                    ? G[600]
                    : isActive
                      ? G[900]
                      : "transparent",
                  border: isDone
                    ? `2px solid ${G[600]}`
                    : isActive
                      ? `2px solid ${GOLD[500]}`
                      : "2px solid #d1d5db",
                  color: isDone ? "#fff" : isActive ? GOLD[500] : "#9ca3af",
                  boxShadow: isActive
                    ? `0 0 0 4px ${GOLD[100]}, 0 0 0 6px ${GOLD[300]}40`
                    : "none",
                }}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="text-[13px] font-bold">{n}</span>
                )}
              </motion.div>
              <span
                className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-wide"
                style={{
                  color: isActive ? GOLD[600] : isDone ? G[600] : "#9ca3af",
                }}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <motion.div
                className="mx-2 sm:mx-3 mb-5"
                style={{ height: "1px", width: "32px" }}
                animate={{ backgroundColor: isDone ? G[400] : "#e5e7eb" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  index,
  selected,
  onAnswer,
  labels,
  dir,
}: {
  question: Question;
  index: number;
  selected: AnswerValue | undefined;
  onAnswer: (val: AnswerValue) => void;
  labels: { yes: string; partial: string; no: string };
  dir: "rtl" | "ltr";
}) {
  const opts = [
    {
      label: labels.yes,
      sublabel: "10 pts",
      val: 10 as AnswerValue,
      activeBg: G[50],
      activeBorder: G[500],
      activeColor: G[700],
    },
    {
      label: labels.partial,
      sublabel: "5 pts",
      val: 5 as AnswerValue,
      activeBg: GOLD[50],
      activeBorder: GOLD[500],
      activeColor: GOLD[700],
    },
    {
      label: labels.no,
      sublabel: "0 pts",
      val: 0 as AnswerValue,
      activeBg: "#f9fafb",
      activeBorder: "#9ca3af",
      activeColor: "#374151",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1],
      }}
      className="relative mb-3 rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: selected !== undefined ? G[50] : "#ffffff",
        border: `1px solid ${selected !== undefined ? G[100] : "#e5e7eb"}`,
        padding: "16px",
      }}
    >
      {/* Accent bar */}
      {selected !== undefined && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          className="absolute top-0 bottom-0"
          style={{
            [dir === "rtl" ? "right" : "left"]: 0,
            width: "3px",
            background: G[500],
            borderRadius: dir === "rtl" ? "0 4px 4px 0" : "4px 0 0 4px",
            transformOrigin: "top",
          }}
        />
      )}

      <div
        className={cn(
          "flex gap-3",
          dir === "rtl" ? "flex-row-reverse" : "flex-row",
        )}
      >
        {/* Number bubble */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-all"
          style={{
            background: selected !== undefined ? G[600] : "#f3f4f6",
            color: selected !== undefined ? "#fff" : "#9ca3af",
          }}
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "font-semibold text-gray-900 leading-relaxed mb-1.5 text-sm sm:text-[15px]",
              dir === "rtl" && "text-right",
            )}
          >
            {question.q}
          </p>
          <p
            className={cn(
              "text-xs sm:text-[12.5px] text-gray-500 leading-relaxed mb-4",
              dir === "rtl" && "text-right",
            )}
          >
            {question.desc}
          </p>

          {/* Answer buttons — stacked on mobile, row on sm+ */}
          <div
            className={cn(
              "flex flex-col sm:flex-row gap-2 sm:flex-wrap",
              dir === "rtl" ? "sm:justify-end" : "sm:justify-start",
            )}
          >
            {opts.map(
              ({
                label,
                sublabel,
                val,
                activeBg,
                activeBorder,
                activeColor,
              }) => (
                <motion.button
                  key={val}
                  onClick={() => onAnswer(val)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center sm:flex-col gap-2 sm:gap-1 px-4 py-2.5 sm:py-2 rounded-lg transition-all"
                  style={{
                    border: `1.5px solid ${selected === val ? activeBorder : "#e5e7eb"}`,
                    background: selected === val ? activeBg : "#ffffff",
                    minWidth: "0",
                    flex: "1 1 0",
                  }}
                >
                  {selected === val && (
                    <CheckCircle2
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: activeBorder }}
                    />
                  )}
                  <span
                    className="text-xs sm:text-[11px] font-bold tracking-wide"
                    style={{
                      color: selected === val ? activeColor : "#6b7280",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[10px] font-medium"
                    style={{
                      color: selected === val ? activeBorder : "#9ca3af",
                    }}
                  >
                    {sublabel}
                  </span>
                </motion.button>
              ),
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Category Pills (mobile) ──────────────────────────────────────────────────

function CategoryPills({
  categories,
  catIdx,
  catAnswered,
  dir,
  onSelect,
}: {
  categories: Category[];
  catIdx: number;
  catAnswered: (i: number) => boolean;
  dir: "rtl" | "ltr";
  onSelect: (i: number) => void;
}) {
  return (
    <div
      className={cn(
        "flex gap-1.5 flex-wrap pb-4 border-b mb-4",
        dir === "rtl" && "flex-row-reverse",
      )}
    >
      {categories.map((cat, i) => {
        const done = catAnswered(i);
        const active = i === catIdx;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all"
            style={{
              background: active ? G[600] : done ? G[50] : "#f9fafb",
              border: `1px solid ${active ? G[600] : done ? G[100] : "#e5e7eb"}`,
              color: active ? "#fff" : done ? G[600] : "#9ca3af",
            }}
          >
            {done && !active && <CheckCircle2 className="w-2.5 h-2.5" />}
            {cat.num}
          </button>
        );
      })}
    </div>
  );
}

// ─── Category Sidebar (desktop) ───────────────────────────────────────────────

function CategorySidebar({
  categories,
  catIdx,
  catAnswered,
  dir,
  onSelect,
}: {
  categories: Category[];
  catIdx: number;
  catAnswered: (i: number) => boolean;
  dir: "rtl" | "ltr";
  onSelect: (i: number) => void;
}) {
  return (
    <div
      className="w-48 xl:w-56 shrink-0 rounded-2xl p-4 flex flex-col gap-1"
      style={{ background: G[900] }}
    >
      <div
        className="flex items-center gap-2 pb-3 mb-2 border-b"
        style={{ borderColor: G[700] }}
      >
        <Shield className="w-3.5 h-3.5" style={{ color: GOLD[400] }} />
        <span
          className="text-[9px] font-bold uppercase tracking-widest"
          style={{ color: GOLD[400] }}
        >
          Sections
        </span>
      </div>
      {categories.map((cat, i) => {
        const done = catAnswered(i);
        const active = i === catIdx;
        return (
          <motion.button
            key={i}
            onClick={() => onSelect(i)}
            whileHover={{ x: dir === "rtl" ? -2 : 2 }}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all"
            style={{
              background: active ? G[600] : "transparent",
              flexDirection: dir === "rtl" ? "row-reverse" : "row",
            }}
          >
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{
                background: active ? GOLD[500] : done ? G[500] : G[700],
                color: active ? G[900] : done ? "#fff" : G[400],
              }}
            >
              {done && !active ? <CheckCircle2 className="w-3 h-3" /> : cat.num}
            </div>
            <span
              className="text-[11px] leading-snug"
              style={{
                fontWeight: active ? 600 : 400,
                color: active ? "#fff" : done ? G[100] : `${G[400]}99`,
                textAlign: dir === "rtl" ? "right" : "left",
              }}
            >
              {cat.title}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Already Submitted Screen ─────────────────────────────────────────────────

function AlreadySubmittedScreen({
  meta,
  dir,
  user,
}: {
  meta: Record<string, string>;
  dir: "rtl" | "ltr";
  user: SavedUser | null;
}) {
  return (
    <div dir={dir} className="max-w-xl mx-auto px-4">
      <StepIndicator
        step1={meta.step1}
        step2={meta.step2}
        step3={meta.step3}
        currentStep={3}
        dir={dir}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden shadow-xl border"
        style={{ borderColor: G[100] }}
      >
        <div className="px-6 py-10 text-center" style={{ background: G[900] }}>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6"
            style={{
              background: `${GOLD[500]}18`,
              color: GOLD[400],
              borderColor: `${GOLD[500]}35`,
            }}
          >
            <Shield className="w-3 h-3" /> {meta.badge}
          </div>
          <h2 className="text-2xl font-bold text-white">{meta.title}</h2>
        </div>
        <div className="bg-white px-6 py-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
            className="w-18 h-18 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{
              width: 72,
              height: 72,
              background: G[50],
              border: `3px solid ${G[500]}`,
            }}
          >
            <FileCheck2 className="w-9 h-9" style={{ color: G[600] }} />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {meta.alreadyTitle}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto mb-6">
            {meta.alreadySub}
          </p>
          {user?.email && (
            <div
              className="inline-flex items-center gap-3 rounded-xl px-5 py-3"
              style={{ background: G[50], border: `1px solid ${G[100]}` }}
            >
              <Mail className="w-4 h-4" style={{ color: G[600] }} />
              <div className={dir === "rtl" ? "text-right" : "text-left"}>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: G[600] }}
                >
                  {meta.alreadyEmail}
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: G[700] }}
                  dir="ltr"
                >
                  {user.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({
  meta,
  dir,
  lang,
  totalScore,
  maxScore,
  totalQ,
  categories,
  userEmail,
  onDone,
}: {
  meta: Record<string, string>;
  dir: "rtl" | "ltr";
  lang: "ar" | "en";
  totalScore: number;
  maxScore: number;
  totalQ: number;
  categories: Category[];
  userEmail: string;
  onDone: () => void;
}) {
  const [countdown, setCountdown] = useState(7);
  const pct = Math.round((totalScore / maxScore) * 100);

  useEffect(() => {
    if (countdown === 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, onDone]);

  const processSteps =
    lang === "ar"
      ? [
          { label: "اكتمل التقييم", sub: "تم تسجيل جميع إجاباتك بشكل آمن" },
          {
            label: "بدء المراجعة التخصصية",
            sub: "تم تعيين فريق من كبار المستشارين",
          },
          { label: "تقرير مخصص لمؤسستك", sub: "سيتم إعداد تقرير حوكمة متكامل" },
          { label: "التسليم إلى بريدكم", sub: "خلال ٣–٥ أيام عمل" },
        ]
      : [
          {
            label: "Assessment Complete",
            sub: "All responses securely recorded",
          },
          { label: "Expert Review", sub: "Senior consultants assigned" },
          {
            label: "Personalised Report",
            sub: "Bespoke governance report prepared",
          },
          {
            label: "Delivered to Inbox",
            sub: "Expect within 3–5 business days",
          },
        ];

  const circumference = 2 * Math.PI * 26;

  return (
    <div dir={dir} className="max-w-2xl mx-auto px-4">
      <StepIndicator
        step1={meta.step1}
        step2={meta.step2}
        step3={meta.step3}
        currentStep={3}
        dir={dir}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-2xl overflow-hidden shadow-xl"
        style={{ background: "#fff", border: `1px solid ${G[100]}` }}
      >
        {/* Hero banner */}
        <div
          className="relative px-6 py-10 text-center overflow-hidden"
          style={{ background: G[900] }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(ellipse at 15% 60%, ${G[700]}90 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, ${GOLD[500]}18 0%, transparent 48%)`,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${GOLD[500]}06 0, ${GOLD[500]}06 1px, transparent 1px, transparent 14px)`,
            }}
          />

          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest mb-6"
              style={{
                background: `${GOLD[500]}18`,
                color: GOLD[400],
                borderColor: `${GOLD[500]}35`,
              }}
            >
              <Shield className="w-3 h-3" />
              {meta.badge} ·{" "}
              {lang === "ar" ? "تقييم الحوكمة" : "Governance Assessment"}
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 180 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{
                background: `linear-gradient(135deg, ${G[600]}, ${G[800]})`,
                border: `3px solid ${GOLD[500]}60`,
                boxShadow: `0 0 0 8px ${GOLD[500]}12`,
              }}
            >
              <CheckCircle2
                className="w-10 h-10"
                style={{ color: GOLD[400] }}
              />
            </motion.div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              {lang === "ar"
                ? "تهانينا — لقد أتممتم التقييم"
                : "Assessment Complete"}
            </h2>
            <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed">
              {lang === "ar"
                ? "فريق من كبار المستشارين المتخصصين سيراجع نتائجكم ويُعدّ لكم تقريراً حوكمياً مخصصاً"
                : "A team of senior governance experts will review your responses and prepare a bespoke report tailored to your organisation."}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-8 py-7">
          {/* Score strip */}
          <div
            className="grid grid-cols-3 gap-px rounded-xl overflow-hidden mb-7"
            style={{ background: G[100] }}
          >
            {[
              {
                value: totalScore,
                sub: meta.totalScore,
                superscript: `/${maxScore}`,
                color: G[700],
              },
              {
                value: totalQ,
                sub: meta.totalQ,
                superscript: "",
                color: GOLD[600],
              },
              {
                value: categories.length,
                sub: lang === "ar" ? "المحاور" : "Domains",
                superscript: "",
                color: G[600],
              },
            ].map((s, i) => (
              <div
                key={i}
                className="text-center py-4"
                style={{ background: G[50] }}
              >
                <div
                  className="text-3xl sm:text-4xl font-bold leading-none mb-1"
                  style={{ color: s.color, fontFamily: "'Georgia', serif" }}
                >
                  {s.value}
                  {s.superscript && (
                    <span
                      className="text-base font-normal"
                      style={{ color: `${s.color}70` }}
                    >
                      {s.superscript}
                    </span>
                  )}
                </div>
                <div
                  className="text-[9px] font-bold uppercase tracking-widest"
                  style={{ color: s.color }}
                >
                  {s.sub}
                </div>
                {i === 0 && (
                  <div
                    className="mx-auto mt-2 h-1 rounded-full overflow-hidden"
                    style={{ width: 60, background: G[100] }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${G[600]}, ${GOLD[500]})`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 1.2,
                        delay: 0.4,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* What happens next */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex-1 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${G[100]})`,
              }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: GOLD[600] }}
            >
              {lang === "ar" ? "ما سيحدث بعد ذلك" : "What Happens Next"}
            </span>
            <div
              className="flex-1 h-px"
              style={{
                background: `linear-gradient(90deg, ${G[100]}, transparent)`,
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
            {processSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.12 }}
                className="flex gap-3 rounded-xl p-4"
                style={{
                  background: i === 0 ? G[900] : "#f9fafb",
                  border: `1px solid ${i === 0 ? G[700] : "#f0f0f0"}`,
                  flexDirection: dir === "rtl" ? "row-reverse" : "row",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background:
                      i === 0
                        ? `linear-gradient(135deg, ${GOLD[500]}, ${GOLD[300]})`
                        : G[50],
                    border: `1px solid ${i === 0 ? GOLD[400] : G[100]}`,
                    color: i === 0 ? G[900] : G[600],
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
                  <p
                    className="text-sm font-bold mb-0.5"
                    style={{ color: i === 0 ? "#fff" : "#111827" }}
                  >
                    {step.label}
                  </p>
                  <p
                    className="text-xs leading-snug"
                    style={{ color: i === 0 ? `${G[100]}80` : "#9ca3af" }}
                  >
                    {step.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Email */}
          {userEmail && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-4 rounded-xl p-4 mb-7 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${G[900]}, ${G[800]})`,
                flexDirection: dir === "rtl" ? "row-reverse" : "row",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, ${GOLD[500]}05 0, ${GOLD[500]}05 1px, transparent 1px, transparent 14px)`,
                }}
              />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative z-10"
                style={{
                  background: `${GOLD[500]}18`,
                  border: `1px solid ${GOLD[500]}35`,
                }}
              >
                <Mail className="w-5 h-5" style={{ color: GOLD[400] }} />
              </div>
              <div
                className="relative z-10 min-w-0"
                style={{ textAlign: dir === "rtl" ? "right" : "left" }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: GOLD[400] }}
                >
                  {lang === "ar"
                    ? "سيُرسل تقريركم إلى"
                    : "Your report will be delivered to"}
                </p>
                <p
                  className="text-base font-bold text-white truncate"
                  dir="ltr"
                >
                  {userEmail}
                </p>
                <p className="text-xs mt-0.5" style={{ color: `${G[100]}65` }}>
                  {lang === "ar"
                    ? "خلال ٣–٥ أيام عمل · سري وخاص"
                    : "Within 3–5 business days · Strictly confidential"}
                </p>
              </div>
            </motion.div>
          )}

          {/* Countdown + CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              {/* Countdown ring */}
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
                  <circle
                    cx="30"
                    cy="30"
                    r="26"
                    fill="none"
                    stroke={G[100]}
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="30"
                    cy="30"
                    r="26"
                    fill="none"
                    stroke={G[600]}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{
                      strokeDashoffset: circumference * (countdown / 7),
                    }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-lg font-black"
                    style={{ color: G[600] }}
                  >
                    {countdown}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 max-w-[160px] leading-snug">
                {lang === "ar"
                  ? `سيتم تحويلك للصفحة الرئيسية خلال ${countdown} ثوانٍ`
                  : `Redirecting to home in ${countdown}s`}
              </p>
            </div>

            <motion.button
              onClick={onDone}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all"
              style={{
                background: `linear-gradient(135deg, ${G[600]}, ${G[800]})`,
                boxShadow: `0 4px 14px ${G[600]}40`,
              }}
            >
              {lang === "ar" ? "← الصفحة الرئيسية" : "Go to Home →"}
            </motion.button>
          </div>
        </div>

        <div
          className="px-6 py-4 text-center border-t"
          style={{ borderColor: G[50] }}
        >
          <p className="text-[11px] text-gray-300 tracking-wide">
            {lang === "ar"
              ? "شكراً على ثقتكم — فريق كرام للاستشارات"
              : "Thank you for your trust — The KARAM Advisory Team"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AssessmentFormProps {
  currentUser?: SavedUser | null;
  onSubmitComplete?: (answers: Answers, totalScore: number) => void;
}

export function AssessmentForm({
  currentUser,
  onSubmitComplete,
}: AssessmentFormProps) {
  const { dir } = useLanguage();
  const lang = dir === "rtl" ? "ar" : "en";
  const { meta, categories } = CONTENT[lang];

  const [catIdx, setCatIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dbQuestions, setDbQuestions] = useState<DBQuestion[]>([]);
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(SUBMISSION_STORAGE_KEY) === "true";
    setAlreadyDone(done);
    if (done) window.location.href = "/";
  }, []);

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((d) => setDbQuestions(d.questions ?? []))
      .catch(() => {});
  }, []);

  const totalQ = categories.reduce((s, c) => s + c.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / totalQ) * 100);
  const totalScore = Object.values(answers).reduce((s: number, v) => s + v, 0);
  const maxScore = totalQ * 10;

  const catAnswered = (ci: number) =>
    categories[ci].questions.every(
      (_, qi) => answers[`${ci}-${qi}`] !== undefined,
    );
  const allAnswered = categories.every((_, i) => catAnswered(i));
  const isLast = catIdx === categories.length - 1;
  const cat = categories[catIdx];

  function handleAnswer(ci: number, qi: number, val: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [`${ci}-${qi}`]: val }));
  }

  function buildAnswerPayload() {
    const keyToId: Record<string, string> = {};
    dbQuestions.forEach((q) => {
      keyToId[`${q.categoryOrder}-${q.questionOrder}`] = q.id;
    });
    const result: {
      questionId: string;
      selectedLabel: string;
      selectedValue: number;
    }[] = [];
    categories.forEach((cat, ci) => {
      cat.questions.forEach((_, qi) => {
        const val = answers[`${ci}-${qi}`];
        const questionId = keyToId[`${cat.num}-${qi + 1}`];
        if (val !== undefined && questionId) {
          result.push({
            questionId,
            selectedLabel: val === 10 ? "yes" : val === 5 ? "partial" : "no",
            selectedValue: val,
          });
        }
      });
    });
    return result;
  }

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      if (!currentUser?.id) {
        setSubmitError("User session not found. Please refresh.");
        return;
      }
      const answersPayload = buildAnswerPayload();
      if (answersPayload.length !== totalQ) {
        setSubmitError("Questions mapping failed. Please refresh.");
        return;
      }
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          totalScore,
          maxScore: totalQ * 10,
          rawPayload: answers,
          answers: answersPayload,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Failed to submit.");
        return;
      }
      localStorage.setItem("karam_submission_done", "true");
      setSubmitted(true);
      // NOTE: onSubmitComplete is called AFTER the 7-second success screen
    } catch {
      setSubmitError("Something went wrong while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDone = useCallback(() => {
    onSubmitComplete?.(answers, totalScore);
  }, [answers, totalScore, onSubmitComplete]);

  // ── Guards ──────────────────────────────────────────────────────────────────

  if (alreadyDone) {
    return (
      <AlreadySubmittedScreen
        meta={meta}
        dir={dir}
        user={currentUser ?? null}
      />
    );
  }

  if (submitted) {
    return (
      <SuccessScreen
        meta={meta}
        dir={dir}
        lang={lang}
        totalScore={totalScore}
        maxScore={maxScore}
        totalQ={totalQ}
        categories={categories}
        userEmail={currentUser?.email ?? ""}
        onDone={handleDone}
      />
    );
  }

  // ── Assessment ──────────────────────────────────────────────────────────────

  return (
    <div dir={dir} className="w-full">
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <StepIndicator
        step1={meta.step1}
        step2={meta.step2}
        step3={meta.step3}
        currentStep={2}
        dir={dir}
      />

      {/* Main card */}
      <div
        className="rounded-2xl overflow-hidden shadow-lg border"
        style={{ borderColor: "#e5e7eb" }}
      >
        {/* Header */}
        <div
          className="relative overflow-hidden px-4 sm:px-7 pt-6 pb-5"
          style={{ background: G[900] }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(ellipse at 5% 50%, ${G[700]}80 0%, transparent 55%)`,
            }}
          />
          <div className="relative z-10">
            <div
              className={cn(
                "flex items-start justify-between",
                dir === "rtl" && "flex-row-reverse",
              )}
            >
              <div>
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest mb-2"
                  style={{
                    background: `${GOLD[500]}18`,
                    color: GOLD[400],
                    borderColor: `${GOLD[500]}35`,
                  }}
                >
                  <Shield className="w-2.5 h-2.5" />
                  {meta.badge}
                </div>
                <h2
                  className={cn(
                    "text-lg sm:text-xl font-bold text-white mb-0.5",
                    dir === "rtl" && "text-right",
                  )}
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  {meta.title}
                </h2>
                <p
                  className={cn(
                    "text-xs text-white/60",
                    dir === "rtl" && "text-right",
                  )}
                >
                  {meta.subtitle}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div
                  className="text-2xl font-bold leading-none"
                  style={{ color: GOLD[400], fontFamily: "'Georgia', serif" }}
                >
                  {answeredCount}
                  <span
                    className="text-sm font-normal"
                    style={{ color: `${GOLD[400]}70` }}
                  >
                    /{totalQ}
                  </span>
                </div>
                <div
                  className="text-[9px] font-bold uppercase tracking-widest mt-1"
                  style={{ color: `${GOLD[300]}70` }}
                >
                  {meta.questions}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div
                className={cn(
                  "flex justify-between text-[10px] text-white/50 mb-1.5",
                  dir === "rtl" && "flex-row-reverse",
                )}
              >
                <span>
                  {progress}% {meta.completed}
                </span>
                <span>
                  {categories.filter((_, i) => catAnswered(i)).length} /{" "}
                  {categories.length} sections
                </span>
              </div>
              <div className="h-1 rounded-full" style={{ background: G[700] }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${GOLD[500]}, ${GOLD[300]})`,
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white">
          {/* Desktop: sidebar + questions side by side */}
          <div
            className={cn(
              "hidden md:flex",
              dir === "rtl" ? "flex-row-reverse" : "flex-row",
            )}
          >
            <div className="p-4 shrink-0">
              <CategorySidebar
                categories={categories}
                catIdx={catIdx}
                catAnswered={catAnswered}
                dir={dir}
                onSelect={(i) => {
                  if (i <= catIdx || catAnswered(catIdx)) setCatIdx(i);
                }}
              />
            </div>
            <div className="flex-1 min-w-0 p-5">
              <CategoryHeader cat={cat} meta={meta} dir={dir} />
              <QuestionsPanel
                catIdx={catIdx}
                cat={cat}
                answers={answers}
                meta={meta}
                dir={dir}
                onAnswer={handleAnswer}
              />
              <NavBar
                catIdx={catIdx}
                categories={categories}
                isLast={isLast}
                catAnswered={catAnswered}
                allAnswered={allAnswered}
                isSubmitting={isSubmitting}
                submitError={submitError}
                meta={meta}
                dir={dir}
                onPrev={() => setCatIdx((i) => i - 1)}
                onNext={() => catAnswered(catIdx) && setCatIdx((i) => i + 1)}
                onSubmit={handleSubmit}
              />
            </div>
          </div>

          {/* Mobile: pills + questions stacked */}
          <div className="md:hidden p-4">
            <CategoryPills
              categories={categories}
              catIdx={catIdx}
              catAnswered={catAnswered}
              dir={dir}
              onSelect={(i) => {
                if (i <= catIdx || catAnswered(catIdx)) setCatIdx(i);
              }}
            />
            <CategoryHeader cat={cat} meta={meta} dir={dir} />
            <QuestionsPanel
              catIdx={catIdx}
              cat={cat}
              answers={answers}
              meta={meta}
              dir={dir}
              onAnswer={handleAnswer}
            />
            <NavBar
              catIdx={catIdx}
              categories={categories}
              isLast={isLast}
              catAnswered={catAnswered}
              allAnswered={allAnswered}
              isSubmitting={isSubmitting}
              submitError={submitError}
              meta={meta}
              dir={dir}
              onPrev={() => setCatIdx((i) => i - 1)}
              onNext={() => catAnswered(catIdx) && setCatIdx((i) => i + 1)}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components (extracted to reduce nesting) ─────────────────────────────

function CategoryHeader({
  cat,
  meta,
  dir,
}: {
  cat: Category;
  meta: Record<string, string>;
  dir: "rtl" | "ltr";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 mb-5 pb-4 border-b",
        dir === "rtl" && "flex-row-reverse",
      )}
      style={{ borderColor: G[50] }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
        style={{
          background: G[900],
          color: GOLD[400],
          fontFamily: "'Georgia', serif",
        }}
      >
        {cat.num}
      </div>
      <div>
        <h3
          className={cn(
            "text-base sm:text-lg font-bold text-gray-900 leading-tight",
            dir === "rtl" && "text-right",
          )}
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {cat.title}
        </h3>
        <p
          className={cn("text-xs text-gray-400", dir === "rtl" && "text-right")}
        >
          {cat.questions.length} {meta.questions}
        </p>
      </div>
    </div>
  );
}

function QuestionsPanel({
  catIdx,
  cat,
  answers,
  meta,
  dir,
  onAnswer,
}: {
  catIdx: number;
  cat: Category;
  answers: Answers;
  meta: Record<string, string>;
  dir: "rtl" | "ltr";
  onAnswer: (ci: number, qi: number, val: AnswerValue) => void;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={catIdx}
        initial={{ opacity: 0, x: dir === "rtl" ? -16 : 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: dir === "rtl" ? 16 : -16 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      >
        {cat.questions.map((q, qi) => (
          <QuestionCard
            key={qi}
            question={q}
            index={qi}
            selected={answers[`${catIdx}-${qi}`] as AnswerValue | undefined}
            onAnswer={(val) => onAnswer(catIdx, qi, val)}
            labels={{ yes: meta.yes, partial: meta.partial, no: meta.no }}
            dir={dir}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

function NavBar({
  catIdx,
  categories,
  isLast,
  catAnswered,
  allAnswered,
  isSubmitting,
  submitError,
  meta,
  dir,
  onPrev,
  onNext,
  onSubmit,
}: {
  catIdx: number;
  categories: Category[];
  isLast: boolean;
  catAnswered: (i: number) => boolean;
  allAnswered: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  meta: Record<string, string>;
  dir: "rtl" | "ltr";
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-5 pt-4 border-t" style={{ borderColor: "#f3f4f6" }}>
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-3 rounded-xl px-4 py-3 text-sm text-center"
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
            }}
          >
            {submitError}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!catAnswered(catIdx) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 mb-3"
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: GOLD[500] }}
            />
            <p className="text-xs text-gray-400">{meta.fillAll}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between" dir="ltr">
        {/* Prev */}
        <button
          onClick={onPrev}
          disabled={catIdx === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all"
          style={{
            border: `1.5px solid ${catIdx === 0 ? "#f3f4f6" : "#e5e7eb"}`,
            color: catIdx === 0 ? "#d1d5db" : "#374151",
            cursor: catIdx === 0 ? "not-allowed" : "pointer",
            background: "transparent",
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          {meta.prev}
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1">
          {categories.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === catIdx ? 20 : 8,
                backgroundColor:
                  i < catIdx ? G[500] : i === catIdx ? GOLD[500] : "#e5e7eb",
              }}
              className="h-1.5 rounded-full"
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Next / Submit */}
        {isLast ? (
          <motion.button
            onClick={onSubmit}
            disabled={!allAnswered || isSubmitting}
            whileHover={allAnswered && !isSubmitting ? { scale: 1.02 } : {}}
            whileTap={allAnswered && !isSubmitting ? { scale: 0.98 } : {}}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
            style={{
              background:
                allAnswered && !isSubmitting
                  ? `linear-gradient(135deg, ${G[600]}, ${G[800]})`
                  : "#f3f4f6",
              color: allAnswered && !isSubmitting ? "#fff" : "#9ca3af",
              cursor: allAnswered && !isSubmitting ? "pointer" : "not-allowed",
              boxShadow:
                allAnswered && !isSubmitting
                  ? `0 4px 12px ${G[600]}40`
                  : "none",
              border: "none",
            }}
          >
            {isSubmitting && (
              <Loader2
                className="w-4 h-4"
                style={{ animation: "spin 1s linear infinite" }}
              />
            )}
            {isSubmitting ? meta.submitting : meta.submit}
            {!isSubmitting && <ChevronRight className="w-4 h-4" />}
          </motion.button>
        ) : (
          <motion.button
            onClick={onNext}
            disabled={!catAnswered(catIdx)}
            whileHover={catAnswered(catIdx) ? { scale: 1.02 } : {}}
            whileTap={catAnswered(catIdx) ? { scale: 0.98 } : {}}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
            style={{
              background: catAnswered(catIdx)
                ? `linear-gradient(135deg, ${G[600]}, ${G[800]})`
                : "#f3f4f6",
              color: catAnswered(catIdx) ? "#fff" : "#9ca3af",
              cursor: catAnswered(catIdx) ? "pointer" : "not-allowed",
              boxShadow: catAnswered(catIdx)
                ? `0 4px 12px ${G[600]}40`
                : "none",
              border: "none",
            }}
          >
            {meta.next}
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
