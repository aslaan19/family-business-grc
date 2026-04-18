// components/AssessmentForm.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Loader2,
  Mail,
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

// A question row returned from GET /api/questions
interface DBQuestion {
  id: string;
  categoryKey: string;
  categoryOrder: number;
  questionOrder: number;
  question: string;
}

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
      successTitle: "تم استلام تقييمك بنجاح!",
      successSub:
        "شكراً لإكمالك نموذج تقييم الحوكمة. سيعمل فريق خبرائنا على مراجعة إجاباتك وإعداد تقرير مفصّل يُرسل إليك قريباً.",
      totalScore: "إجمالي النقاط",
      totalQ: "إجمالي الأسئلة",
      yes: "نعم (10)",
      partial: "جزئي (5)",
      no: "ملاحظات (0)",
      // Already submitted screen
      alreadyTitle: "لقد أكملت التقييم بالفعل!",
      alreadySub:
        "شكراً لك. يعمل فريق الخبراء لدينا على مراجعة إجاباتك وإعداد تقرير حوكمة مخصّص سيُرسل إليك قريباً على بريدك الإلكتروني.",
      alreadyEmail: "سيصلك التقرير على",
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
            desc: "استقلالية وفعالية مجلس الإدارة أو الجهة الإشرافية يتعلق بوجود مجلس يتمتع بالاستقلالية في اتخاذ القرار، مع تنوع في الخلفيات والاختصاصات، وقدرته على توجيه ومراقبة الأداء.",
          },
          {
            q: "هل توجد لجان متخصصة للحوكمة (مراجعة، مخاطر، ترشيحات)؟",
            desc: "وجود لجان حوكمة فعالة (مراجعة، مخاطر، ترشيحات) يضمن أن اللجان الداعمة لمجلس الإدارة تقوم بدورها في مراجعة التقارير، تقييم المخاطر، والمساهمة في تعيين القيادات.",
          },
          {
            q: "هل تم تحديد واضح للصلاحيات والمسؤوليات بين القيادة والإدارة؟",
            desc: "تحديد المهام والمسؤوليات بين الإدارة التنفيذية والإشرافية يضمن وضوح الحدود بين من يضع السياسات (القيادة) ومن ينفذها (الإدارة) لضمان المساءلة والفعالية.",
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
            desc: "تمكين أصحاب المصلحة من الوصول إلى المعلومات الجوهرية يضمن الحق في الوصول إلى المعلومات التي تؤثر على حقوقهم أو قراراتهم مثل التغييرات التنظيمية أو المخاطر الكبرى.",
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
            desc: "تطبيق إدارة المخاطر المؤسسية (ERM) تبني نهج شامل لتحديد، تحليل، تقييم، ومتابعة المخاطر التي قد تؤثر على تحقيق أهداف المؤسسة.",
          },
          {
            q: "هل توجد سياسة فعالة لمكافحة الفساد والاحتيال؟",
            desc: "وجود نظام لمكافحة الفساد والاحتيال يشمل سياسات وقنوات للإبلاغ عن الممارسات غير القانونية، وحماية المبلغين، والتعامل مع الانتهاكات.",
          },
          {
            q: "هل يوجد نظام تدقيق داخلي وخارجي فعال؟",
            desc: "وجود سياسة واضحة للتدقيق الداخلي والخارجي تأكيد على استقلال المراجعين الداخليين وتكامل عملهم مع المراجعين الخارجيين لضمان الشفافية.",
          },
        ],
      },
      {
        num: 4,
        title: "الامتثال والمساءلة",
        questions: [
          {
            q: "هل تلتزم المؤسسة بجميع القوانين واللوائح المعمول بها؟",
            desc: "التقيد بالقوانين واللوائح المحلية والدولية يشمل الالتزام بكافة الأنظمة القانونية ذات الصلة بنشاط المؤسسة، ومراقبة التغييرات التشريعية.",
          },
          {
            q: "هل توجد سياسة واضحة للمساءلة وصنع القرار؟",
            desc: "وجود سياسات للمساءلة واتخاذ القرار تحديد من هو المسؤول عن ماذا، وتمكين الجهات الرقابية من محاسبة المسؤولين على أفعالهم وقراراتهم.",
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
            desc: "وجود مدونة سلوك مهني معتمدة ومطبقة. وثيقة تنظم القيم والسلوكيات المتوقعة من الموظفين، مع آلية متابعة الالتزام بها.",
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
      successTitle: "Assessment submitted successfully!",
      successSub:
        "Thank you for completing the KARAM governance assessment. Our experts will review your answers and prepare a detailed report sent to you shortly.",
      totalScore: "Total Score",
      totalQ: "Total Questions",
      yes: "Yes (10)",
      partial: "Partial (5)",
      no: "Notes (0)",
      alreadyTitle: "You've already completed the assessment!",
      alreadySub:
        "Our expert team is reviewing your answers and preparing a customised governance report that will be sent to you shortly at your email address.",
      alreadyEmail: "Your report will be sent to",
    },
    categories: [
      {
        num: 1,
        title: "Organizational Structure & Governance",
        questions: [
          {
            q: "Is there a clear and defined organizational structure?",
            desc: "Clarity of organizational structure and authority refers to having a formal structure that clarifies relationships between administrative bodies, chain of command, and role distribution to avoid conflicts of interest.",
          },
          {
            q: "Is the Board of Directors independent and effective?",
            desc: "Independence and effectiveness of the Board relates to having a board that exercises independence in decision-making, with diversity in backgrounds and competencies, and the ability to guide and monitor performance.",
          },
          {
            q: "Are there specialized governance committees (audit, risk, nominations)?",
            desc: "Having effective governance committees ensures that supporting committees review reports, assess risks, and contribute to appointing leadership.",
          },
          {
            q: "Are roles and responsibilities clearly defined between leadership and management?",
            desc: "Clear delineation between executive and supervisory roles ensures clarity on who sets policy (leadership) and who implements it (management) to ensure accountability and effectiveness.",
          },
        ],
      },
      {
        num: 2,
        title: "Transparency & Disclosure",
        questions: [
          {
            q: "Are financial and non-financial reports published regularly?",
            desc: "Regular publication of financial and non-financial reports reflects the necessity of disclosing financial data and institutional social and environmental performance to build stakeholder trust.",
          },
          {
            q: "Is there a publicly announced disclosure policy?",
            desc: "Having clear and announced disclosure policies includes mechanisms that specify what must be disclosed, how to disclose it, and the timing.",
          },
          {
            q: "Can stakeholders access material information?",
            desc: "Enabling stakeholders to access material information ensures the right to access information that affects their rights or decisions, such as regulatory changes or major risks.",
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
            desc: "Implementing ERM involves adopting a comprehensive approach to identify, analyze, assess, and monitor risks that may affect achievement of institutional objectives.",
          },
          {
            q: "Is there an effective anti-corruption and fraud policy?",
            desc: "An anti-corruption and fraud system includes policies and channels for reporting illegal practices, whistleblower protection, and handling violations.",
          },
          {
            q: "Is there an effective internal and external audit system?",
            desc: "A clear internal and external audit policy emphasizes the independence of internal auditors and integration of their work with external auditors to ensure transparency.",
          },
        ],
      },
      {
        num: 4,
        title: "Compliance & Accountability",
        questions: [
          {
            q: "Does the institution comply with all applicable laws and regulations?",
            desc: "Adherence to local and international laws and regulations includes compliance with all legal systems relevant to institutional activities and monitoring legislative changes.",
          },
          {
            q: "Is there a clear accountability and decision-making policy?",
            desc: "Having accountability and decision-making policies defines who is responsible for what, enabling regulatory bodies to hold officials accountable for their actions and decisions.",
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
            desc: "Stakeholder participation in decision-making, such as involving employees or customers in surveys, advisory committees, or listening sessions.",
          },
          {
            q: "Are the rights of employees, customers, and community protected?",
            desc: "Protecting employee, customer, and community rights includes commitment to labor rights, service quality, and community contribution.",
          },
          {
            q: "Are there effective communication channels with stakeholders?",
            desc: "Communication and feedback channels provide effective and sustainable means to receive feedback and use it in institutional development.",
          },
        ],
      },
      {
        num: 6,
        title: "Ethics & Institutional Conduct",
        questions: [
          {
            q: "Is there an approved and announced professional code of conduct?",
            desc: "An approved and implemented code of conduct is a document that regulates the values and behaviors expected of employees, with a mechanism to monitor compliance.",
          },
          {
            q: "Is a culture of integrity and transparency promoted?",
            desc: "Promoting a culture of integrity and transparency through awareness programs, ethical behavior rewards, and steadfast and fair response to violations.",
          },
          {
            q: "Is periodic training on ethical conduct provided?",
            desc: "Awareness and training programs on ethical conduct are periodic training courses for all categories with real-life examples and application policies.",
          },
        ],
      },
      {
        num: 7,
        title: "Performance & Continuous Improvement",
        questions: [
          {
            q: "Is the performance of the Board and senior management evaluated periodically?",
            desc: "Periodic evaluation of Board and senior management performance based on KPIs and professional standards, used for development and improvement.",
          },
          {
            q: "Are governance policies reviewed periodically?",
            desc: "Periodic review and development of governance policies ensures policies remain aligned with internal and external changes.",
          },
          {
            q: "Is governance effectively linked to institutional performance?",
            desc: "Linking governance to institutional performance through periodic reports showing how governance contributes to improving efficiency and achieving goals.",
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
    <div className="flex items-center justify-center gap-0 py-6">
      {displaySteps.map((label, i) => {
        const n = i + 1;
        const isDone = n < displayCurrentStep;
        const isActive = n === displayCurrentStep;
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isDone
                    ? "#1a6b3c"
                    : isActive
                      ? "#ffffff"
                      : "#f5f5f5",
                  borderColor: isDone
                    ? "#1a6b3c"
                    : isActive
                      ? "#c9a227"
                      : "#d1d5db",
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-shadow"
                style={{
                  boxShadow: isActive
                    ? "0 0 0 4px rgba(201,162,39,0.15)"
                    : "none",
                  color: isDone ? "#fff" : isActive ? "#c9a227" : "#9ca3af",
                }}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : n}
              </motion.div>
              <span
                className={cn(
                  "text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-[#c9a227]"
                    : isDone
                      ? "text-[#1a6b3c]"
                      : "text-muted-foreground/50",
                )}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <motion.div
                className="w-16 h-px mx-2 mb-5"
                animate={{ backgroundColor: isDone ? "#1a6b3c" : "#e5e7eb" }}
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
  const opts: {
    label: string;
    val: AnswerValue;
    activeStyle: React.CSSProperties;
    activeBg: string;
  }[] = [
    {
      label: labels.yes,
      val: 10,
      activeStyle: { borderColor: "#1a6b3c", color: "#1a6b3c" },
      activeBg: "#f0faf4",
    },
    {
      label: labels.partial,
      val: 5,
      activeStyle: { borderColor: "#c9a227", color: "#8a6c0e" },
      activeBg: "#fdf6e3",
    },
    {
      label: labels.no,
      val: 0,
      activeStyle: { borderColor: "#6b7280", color: "#4b5563" },
      activeBg: "#f3f4f6",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1],
      }}
      className={cn(
        "relative bg-card rounded-2xl p-5 mb-4 border transition-all duration-300",
        selected !== undefined
          ? "border-[#1a6b3c]/30 shadow-sm shadow-[#1a6b3c]/5"
          : "border-border hover:border-[#1a6b3c]/20",
      )}
    >
      {selected !== undefined && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 left-4 w-2 h-2 rounded-full bg-[#1a6b3c]"
          style={dir === "rtl" ? { left: "auto", right: "1rem" } : {}}
        />
      )}
      <p
        className={cn(
          "text-sm font-semibold text-foreground leading-relaxed mb-2",
          dir === "rtl" ? "text-right pr-4" : "text-left pl-4",
        )}
      >
        {question.q}
      </p>
      <p
        className={cn(
          "text-xs text-muted-foreground leading-relaxed mb-4",
          dir === "rtl" ? "text-right" : "text-left",
        )}
      >
        {question.desc}
      </p>
      <div
        className={cn(
          "flex gap-2 flex-wrap",
          dir === "rtl" ? "justify-end" : "justify-start",
        )}
      >
        {opts.map(({ label, val, activeStyle, activeBg }) => (
          <motion.button
            key={val}
            onClick={() => onAnswer(val)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer"
            style={
              selected === val
                ? {
                    ...activeStyle,
                    backgroundColor: activeBg,
                    borderWidth: "1.5px",
                  }
                : {
                    borderColor: "var(--border)",
                    color: "var(--muted-foreground)",
                    backgroundColor: "transparent",
                  }
            }
          >
            {label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Category Tab Pills ───────────────────────────────────────────────────────

function CategoryPills({
  categories,
  catIdx,
  catAnswered,
  dir,
}: {
  categories: Category[];
  catIdx: number;
  catAnswered: (i: number) => boolean;
  dir: "rtl" | "ltr";
}) {
  return (
    <div
      className={cn(
        "flex gap-1.5 flex-wrap mb-6",
        dir === "rtl" ? "flex-row-reverse justify-end" : "justify-start",
      )}
    >
      {categories.map((cat, i) => {
        const done = catAnswered(i);
        const active = i === catIdx;
        return (
          <div
            key={i}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all",
              active
                ? "bg-[#1a6b3c] text-white border-[#1a6b3c]"
                : done
                  ? "bg-[#e8f5ee] text-[#1a6b3c] border-[#1a6b3c]/30"
                  : "bg-muted/50 text-muted-foreground border-border",
            )}
          >
            {done && !active && <CheckCircle2 className="w-2.5 h-2.5" />}
            {cat.num}
          </div>
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
    <div dir={dir} className="max-w-2xl mx-auto">
      <StepIndicator
        step1={meta.step1}
        step2={meta.step2}
        step3={meta.step3}
        currentStep={3}
        dir={dir}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="bg-gradient-to-br from-[#1a6b3c] to-[#0f4a29] px-8 py-8 text-center">
          <span className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full bg-white/10 text-white/90 border border-white/20 mb-4 tracking-wide">
            {meta.badge}
          </span>
          <h2 className="text-2xl font-bold text-white">{meta.title}</h2>
        </div>

        <div className="p-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-[#e8f5ee] border-4 border-[#1a6b3c] flex items-center justify-center mx-auto mb-6"
          >
            <FileCheck2 className="w-10 h-10 text-[#1a6b3c]" />
          </motion.div>

          <h3 className="text-2xl font-bold text-foreground mb-3">
            {meta.alreadyTitle}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto mb-8">
            {meta.alreadySub}
          </p>

          {user?.email && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2.5 bg-[#1a6b3c]/8 border border-[#1a6b3c]/20 rounded-2xl px-5 py-3"
            >
              <Mail className="w-4 h-4 text-[#1a6b3c]" />
              <div className={dir === "rtl" ? "text-right" : "text-left"}>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                  {meta.alreadyEmail}
                </p>
                <p className="text-sm font-semibold text-[#1a6b3c]" dir="ltr">
                  {user.email}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AssessmentFormProps {
  /** Pre-loaded user from localStorage / parent component */
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

  // Check localStorage for already-submitted flag
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(SUBMISSION_STORAGE_KEY) === "true";
    setAlreadyDone(done);
    if (done) {
      window.location.href = "/";
    }
  }, []);

  // Fetch DB question IDs so we can map answers correctly on submit
  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((d) => setDbQuestions(d.questions ?? []))
      .catch(() => {
        /* non-fatal: submit will fall back to rawPayload only */
      });
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

  /**
   * Map the frontend answers ({ "0-0": 10, "1-2": 5, … }) to DB question IDs.
   * Questions are seeded with order = 1..N following the same category/question order
   * as the CONTENT arrays, so we can derive the global index from (catIdx, qIdx).
   */
  function buildAnswerPayload() {
    // Build a map: "categoryOrder-questionOrder" → DB question id
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
        const answerKey = `${ci}-${qi}`;
        const val = answers[answerKey];
        // categoryOrder is 1-based (cat.num), questionOrder is 1-based
        const dbKey = `${cat.num}-${qi + 1}`;
        const questionId = keyToId[dbKey];

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

      console.log("1) handleSubmit started");

      if (!currentUser?.id) {
        setSubmitError("User session not found. Please refresh and try again.");
        return;
      }

      const answersPayload = buildAnswerPayload();

      console.log("answersPayload:", answersPayload);

      if (answersPayload.length !== totalQ) {
        setSubmitError(
          "Questions mapping failed. Please refresh and try again.",
        );
        return;
      }

      console.log("9) About to POST /api/submissions");

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          totalScore,
          maxScore: totalQ * 10,
          rawPayload: answers,
          answers: answersPayload,
        }),
      });

      console.log("10) fetch returned, status =", res.status);

      const data = await res.json();
      console.log("11) response json:", data);

      if (!res.ok) {
        setSubmitError(data.error || "Failed to submit assessment.");
        return;
      }

      localStorage.setItem("karam_submission_done", "true");
      window.location.href = "/";

      onSubmitComplete?.(answers, totalScore);
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError("Something went wrong while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  }
  // ── Already submitted guard ─────────────────────────────────────────────────
  if (alreadyDone) {
    return (
      <AlreadySubmittedScreen
        meta={meta}
        dir={dir}
        user={currentUser ?? null}
      />
    );
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    const pct = Math.round((totalScore / maxScore) * 100);
    return (
      <div dir={dir} className="max-w-2xl mx-auto">
        <StepIndicator
          step1={meta.step1}
          step2={meta.step2}
          step3={meta.step3}
          currentStep={3}
          dir={dir}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="bg-gradient-to-br from-[#1a6b3c] to-[#0f4a29] px-8 py-8 text-center">
            <span className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full bg-white/10 text-white/90 border border-white/20 mb-4 tracking-wide">
              {meta.badge}
            </span>
            <h2 className="text-2xl font-bold text-white">{meta.title}</h2>
          </div>
          <div className="p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-[#e8f5ee] border-4 border-[#1a6b3c] flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-[#1a6b3c]" />
            </motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {meta.successTitle}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto mb-8">
              {meta.successSub}
            </p>
            <div className="bg-muted/30 rounded-2xl p-6 max-w-sm mx-auto">
              <div className="flex gap-8 justify-center mb-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#1a6b3c]">
                    {totalScore}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {meta.totalScore}
                  </div>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#c9a227]">
                    {totalQ}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {meta.totalQ}
                  </div>
                </div>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#1a6b3c] to-[#c9a227]"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                {pct}%
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Assessment screen ───────────────────────────────────────────────────────
  return (
    <div dir={dir} className="w-full max-w-7xl mx-auto">
      <StepIndicator
        step1={meta.step1}
        step2={meta.step2}
        step3={meta.step3}
        currentStep={2}
        dir={dir}
      />

      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a6b3c] to-[#0f4a29] rounded-t-2xl px-8 pt-7 pb-6">
        <div
          className={cn(
            "flex justify-between items-center mb-3",
            dir === "rtl" && "flex-row-reverse",
          )}
        >
          <span className="text-[11px] font-semibold px-4 py-1.5 rounded-full bg-white/10 text-white/85 border border-white/20 tracking-wider">
            {meta.badge}
          </span>
          <span className="text-xs text-white/60 font-medium">
            {answeredCount}/{totalQ} {meta.questions}
          </span>
        </div>
        <h2
          className={cn(
            "text-xl font-bold text-white mb-1",
            dir === "rtl" && "text-right",
          )}
        >
          {meta.title}
        </h2>
        <p
          className={cn("text-sm text-white/65", dir === "rtl" && "text-right")}
        >
          {meta.subtitle}
        </p>
        <div className="mt-5">
          <div
            className={cn(
              "flex justify-between text-[11px] text-white/70 mb-2 font-medium",
              dir === "rtl" && "flex-row-reverse",
            )}
          >
            <span>
              {progress}% {meta.completed}
            </span>
            <span>
              {meta.of} {totalQ} {meta.questions}
            </span>
          </div>
          <div className="h-2 bg-white/15 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #c9a227, #e8c547)" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-card border border-border border-t-0 rounded-b-2xl px-8 py-7 shadow-lg">
        <CategoryPills
          categories={categories}
          catIdx={catIdx}
          catAnswered={catAnswered}
          dir={dir}
        />

        <div
          className={cn(
            "flex items-center gap-3 mb-6",
            dir === "rtl" && "flex-row-reverse",
          )}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a6b3c] to-[#0f4a29] text-white flex items-center justify-center text-sm font-bold shadow-md flex-shrink-0">
            {cat.num}
          </div>
          <div>
            <h3
              className={cn(
                "text-base font-bold text-foreground",
                dir === "rtl" && "text-right",
              )}
            >
              {cat.title}
            </h3>
            <p
              className={cn(
                "text-xs text-muted-foreground",
                dir === "rtl" && "text-right",
              )}
            >
              {cat.questions.length} {meta.questions}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={catIdx}
            initial={{ opacity: 0, x: dir === "rtl" ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir === "rtl" ? 30 : -30 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            {cat.questions.map((q, qi) => (
              <QuestionCard
                key={qi}
                question={q}
                index={qi}
                selected={answers[`${catIdx}-${qi}`] as AnswerValue | undefined}
                onAnswer={(val) => handleAnswer(catIdx, qi, val)}
                labels={{ yes: meta.yes, partial: meta.partial, no: meta.no }}
                dir={dir}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Error banner */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center"
            >
              {submitError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div
          className="grid grid-cols-[1fr_auto_1fr] items-center mt-8 gap-4"
          dir="ltr"
        >
          {/* LEFT slot */}
          <div className="justify-self-start">
            {dir === "rtl" ? (
              isLast ? (
                <motion.button
                  onClick={handleSubmit}
                  disabled={!allAnswered || isSubmitting}
                  whileHover={
                    allAnswered && !isSubmitting ? { scale: 1.02 } : {}
                  }
                  whileTap={allAnswered && !isSubmitting ? { scale: 0.98 } : {}}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                    allAnswered && !isSubmitting
                      ? "bg-[#1a6b3c] text-white shadow-lg shadow-[#1a6b3c]/25 hover:bg-[#155731]"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                  {isSubmitting ? meta.submitting : meta.submit}
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => catAnswered(catIdx) && setCatIdx((i) => i + 1)}
                  disabled={!catAnswered(catIdx)}
                  whileHover={catAnswered(catIdx) ? { scale: 1.02 } : {}}
                  whileTap={catAnswered(catIdx) ? { scale: 0.98 } : {}}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                    catAnswered(catIdx)
                      ? "bg-[#1a6b3c] text-white shadow-lg shadow-[#1a6b3c]/25 hover:bg-[#155731]"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {meta.next}
                </motion.button>
              )
            ) : (
              <button
                onClick={() => setCatIdx((i) => i - 1)}
                disabled={catIdx === 0}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                  catIdx === 0
                    ? "border-border text-muted-foreground/40 cursor-not-allowed"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                {meta.prev}
              </button>
            )}
          </div>

          {/* CENTER dots */}
          <div className="justify-self-center flex items-center gap-1.5">
            {categories.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === catIdx ? 20 : 8,
                  backgroundColor:
                    i < catIdx
                      ? "#1a6b3c"
                      : i === catIdx
                        ? "#c9a227"
                        : "#d1d5db",
                }}
                className="h-2 rounded-full"
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* RIGHT slot */}
          <div className="justify-self-end">
            {dir === "rtl" ? (
              <button
                onClick={() => setCatIdx((i) => i - 1)}
                disabled={catIdx === 0}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                  catIdx === 0
                    ? "border-border text-muted-foreground/40 cursor-not-allowed"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {meta.prev}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : isLast ? (
              <motion.button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                whileHover={allAnswered && !isSubmitting ? { scale: 1.02 } : {}}
                whileTap={allAnswered && !isSubmitting ? { scale: 0.98 } : {}}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  allAnswered && !isSubmitting
                    ? "bg-[#1a6b3c] text-white shadow-lg shadow-[#1a6b3c]/25 hover:bg-[#155731]"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                {isSubmitting ? meta.submitting : meta.submit}
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </motion.button>
            ) : (
              <motion.button
                onClick={() => catAnswered(catIdx) && setCatIdx((i) => i + 1)}
                disabled={!catAnswered(catIdx)}
                whileHover={catAnswered(catIdx) ? { scale: 1.02 } : {}}
                whileTap={catAnswered(catIdx) ? { scale: 0.98 } : {}}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  catAnswered(catIdx)
                    ? "bg-[#1a6b3c] text-white shadow-lg shadow-[#1a6b3c]/25 hover:bg-[#155731]"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                {meta.next}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {!catAnswered(catIdx) && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center justify-center gap-2 mt-4"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#c9a227] animate-pulse" />
              <p className="text-xs text-muted-foreground">{meta.fillAll}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
