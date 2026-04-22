"use client";

import { useEffect, useState } from "react";
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
import { USER_STORAGE_KEY, SUBMISSION2_STORAGE_KEY } from "./assessment-form-modal";

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

interface SavedUser {
  id: string;
  email: string;
  fullName: string;
}

interface DBQuestion {
  id: string;
  categoryKey: string;
  categoryOrder: number;
  questionOrder: number;
  question: string;
}

// ─── Content ──────────────────────────────────────────────────────────────────
// TODO: Replace these placeholder questions with real ones

const CONTENT: Record<
  "ar" | "en",
  { meta: Record<string, string>; categories: Category[] }
> = {
  ar: {
    meta: {
      step1: "التسجيل",
      step2: "التقييم",
      step3: "النتيجة",
      title: "نموذج كرام لقياس الحوكمة — التقييم الثاني",
      subtitle: "أجب على جميع الأسئلة لاستكمال التقييم الثاني",
      badge: "A | A",
      completed: "مكتمل",
      of: "من",
      questions: "أسئلة",
      next: "التالي",
      prev: "السابق",
      submit: "إرسال التقييم",
      submitting: "جاري الإرسال...",
      fillAll: "يرجى الإجابة على جميع أسئلة هذا القسم",
      successTitle: "تم استلام تقييمك الثاني بنجاح!",
      successSub:
        "شكراً لإكمالك التقييم الثاني. سيعمل فريق خبرائنا على مراجعة إجاباتك وإعداد التقرير النهائي.",
      totalScore: "إجمالي النقاط",
      totalQ: "إجمالي الأسئلة",
      yes: "نعم (10)",
      partial: "جزئي (5)",
      no: "ملاحظات (0)",
      alreadyTitle: "لقد أكملت التقييم الثاني بالفعل!",
      alreadySub:
        "شكراً لك. يعمل فريق الخبراء لدينا على إعداد تقرير الحوكمة النهائي وسيُرسل إليك قريباً.",
      alreadyEmail: "سيصلك التقرير على",
    },
    categories: [
      {
        num: 1,
        title: "التخطيط الاستراتيجي والرؤية",
        questions: [
          {
            q: "هل تمتلك المؤسسة خطة استراتيجية واضحة ومحددة الأهداف؟",
            desc: "وجود خطة استراتيجية مكتوبة تشمل الرؤية والرسالة والأهداف قصيرة وطويلة الأمد.",
          },
          {
            q: "هل يتم مراجعة الخطة الاستراتيجية بشكل دوري؟",
            desc: "آلية المراجعة الدورية للخطة الاستراتيجية للتأكد من ملاءمتها للمتغيرات الداخلية والخارجية.",
          },
          {
            q: "هل تشارك القيادة العليا في وضع الاستراتيجية؟",
            desc: "مدى مشاركة أعضاء مجلس الإدارة والإدارة التنفيذية في صياغة التوجه الاستراتيجي للمؤسسة.",
          },
        ],
      },
      {
        num: 2,
        title: "إدارة الموارد البشرية",
        questions: [
          {
            q: "هل توجد سياسة واضحة لاستقطاب الكفاءات وتطويرها؟",
            desc: "وجود إجراءات رسمية للتوظيف والتدريب والاحتفاظ بالكفاءات.",
          },
          {
            q: "هل يتم تقييم أداء الموظفين بشكل دوري وموضوعي؟",
            desc: "تطبيق نظام تقييم أداء مبني على معايير واضحة وقابلة للقياس.",
          },
          {
            q: "هل توجد برامج لتطوير القيادات الداخلية؟",
            desc: "وجود خطط تطوير وتأهيل للقيادات المستقبلية داخل المؤسسة.",
          },
          {
            q: "هل يتم قياس رضا الموظفين بشكل منتظم؟",
            desc: "إجراء استطلاعات دورية لقياس رضا الموظفين واستخدام نتائجها في التحسين.",
          },
        ],
      },
      {
        num: 3,
        title: "الاستدامة والمسؤولية الاجتماعية",
        questions: [
          {
            q: "هل تمتلك المؤسسة استراتيجية للاستدامة البيئية؟",
            desc: "وجود سياسات وإجراءات للحد من الأثر البيئي السلبي للمؤسسة.",
          },
          {
            q: "هل تنفذ المؤسسة برامج للمسؤولية الاجتماعية؟",
            desc: "تخصيص موارد وتنفيذ مبادرات تخدم المجتمع المحيط بالمؤسسة.",
          },
          {
            q: "هل يتم الإفصاح عن نتائج جهود الاستدامة؟",
            desc: "نشر تقارير دورية تُظهر الأثر الاجتماعي والبيئي لأنشطة المؤسسة.",
          },
        ],
      },
      {
        num: 4,
        title: "الابتكار وإدارة المعرفة",
        questions: [
          {
            q: "هل تشجع المؤسسة على الابتكار وتبني الأفكار الجديدة؟",
            desc: "وجود آليات رسمية لجمع الأفكار الإبداعية من الموظفين وتقييمها وتطبيقها.",
          },
          {
            q: "هل يتم توثيق الممارسات والمعارف المؤسسية؟",
            desc: "وجود نظام لحفظ وتنظيم ونقل المعرفة المؤسسية لضمان الاستمرارية.",
          },
          {
            q: "هل تستثمر المؤسسة في التحول الرقمي؟",
            desc: "تبني التقنيات الحديثة وأتمتة العمليات لتحسين الكفاءة وتقديم الخدمات.",
          },
        ],
      },
      {
        num: 5,
        title: "إدارة الأزمات والاستمرارية",
        questions: [
          {
            q: "هل تمتلك المؤسسة خطة لإدارة الأزمات؟",
            desc: "وجود بروتوكولات موثقة للتعامل مع الأزمات المختلفة والحد من أضرارها.",
          },
          {
            q: "هل يتم اختبار خطط الاستمرارية بشكل دوري؟",
            desc: "إجراء تدريبات ومحاكاة دورية للتحقق من فاعلية خطط الاستمرارية.",
          },
          {
            q: "هل توجد آليات لضمان استمرارية الأعمال في حالات الطوارئ؟",
            desc: "وجود إجراءات احتياطية لضمان استمرار تقديم الخدمات الجوهرية في الأوقات الحرجة.",
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
      title: "KARAM Governance Assessment — Phase 2",
      subtitle: "Answer all questions to complete the second assessment",
      badge: "A | A",
      completed: "completed",
      of: "of",
      questions: "questions",
      next: "Next",
      prev: "Previous",
      submit: "Submit Assessment",
      submitting: "Submitting...",
      fillAll: "Please answer all questions in this section",
      successTitle: "Second assessment submitted successfully!",
      successSub:
        "Thank you for completing the second assessment. Our experts will review your answers and prepare the final governance report.",
      totalScore: "Total Score",
      totalQ: "Total Questions",
      yes: "Yes (10)",
      partial: "Partial (5)",
      no: "Notes (0)",
      alreadyTitle: "You've already completed the second assessment!",
      alreadySub:
        "Our expert team is preparing your final governance report and will send it to you shortly.",
      alreadyEmail: "Your report will be sent to",
    },
    categories: [
      {
        num: 1,
        title: "Strategic Planning & Vision",
        questions: [
          {
            q: "Does the institution have a clear strategic plan with defined goals?",
            desc: "A written strategic plan covering the vision, mission, and short and long-term objectives.",
          },
          {
            q: "Is the strategic plan reviewed periodically?",
            desc: "A mechanism for periodically reviewing the strategic plan to ensure its relevance to internal and external changes.",
          },
          {
            q: "Does senior leadership participate in strategy development?",
            desc: "The extent to which board members and executive management participate in shaping the institution's strategic direction.",
          },
        ],
      },
      {
        num: 2,
        title: "Human Resources Management",
        questions: [
          {
            q: "Is there a clear policy for attracting and developing talent?",
            desc: "Formal procedures for recruitment, training, and retention of talent.",
          },
          {
            q: "Are employees evaluated periodically and objectively?",
            desc: "Applying a performance evaluation system built on clear and measurable criteria.",
          },
          {
            q: "Are there programs for developing internal leadership?",
            desc: "Plans for developing and qualifying future leaders within the institution.",
          },
          {
            q: "Is employee satisfaction measured regularly?",
            desc: "Conducting periodic surveys to measure employee satisfaction and using the results for improvement.",
          },
        ],
      },
      {
        num: 3,
        title: "Sustainability & Social Responsibility",
        questions: [
          {
            q: "Does the institution have an environmental sustainability strategy?",
            desc: "Policies and procedures to reduce the institution's negative environmental impact.",
          },
          {
            q: "Does the institution implement social responsibility programs?",
            desc: "Allocating resources and implementing initiatives that serve the community surrounding the institution.",
          },
          {
            q: "Are sustainability efforts results disclosed?",
            desc: "Publishing periodic reports showing the social and environmental impact of the institution's activities.",
          },
        ],
      },
      {
        num: 4,
        title: "Innovation & Knowledge Management",
        questions: [
          {
            q: "Does the institution encourage innovation and new ideas?",
            desc: "Formal mechanisms for collecting, evaluating, and implementing creative ideas from employees.",
          },
          {
            q: "Are institutional practices and knowledge documented?",
            desc: "A system for storing, organizing, and transferring institutional knowledge to ensure continuity.",
          },
          {
            q: "Does the institution invest in digital transformation?",
            desc: "Adopting modern technologies and automating processes to improve efficiency and service delivery.",
          },
        ],
      },
      {
        num: 5,
        title: "Crisis Management & Business Continuity",
        questions: [
          {
            q: "Does the institution have a crisis management plan?",
            desc: "Documented protocols for dealing with various crises and minimizing their damage.",
          },
          {
            q: "Are continuity plans tested periodically?",
            desc: "Conducting periodic drills and simulations to verify the effectiveness of continuity plans.",
          },
          {
            q: "Are there mechanisms to ensure business continuity in emergencies?",
            desc: "Backup procedures to ensure the continued provision of core services during critical times.",
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
          className="absolute top-4 w-2 h-2 rounded-full bg-[#1a6b3c]"
          style={dir === "rtl" ? { right: "1rem" } : { left: "1rem" }}
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
                ? { ...activeStyle, backgroundColor: activeBg, borderWidth: "1.5px" }
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

// ─── Category Pills ───────────────────────────────────────────────────────────

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

interface AssessmentForm2Props {
  onSubmitComplete?: () => void;
}

export function AssessmentForm2({ onSubmitComplete }: AssessmentForm2Props) {
  const { dir } = useLanguage();
  const lang = dir === "rtl" ? "ar" : "en";
  const { meta, categories } = CONTENT[lang];

  const [catIdx, setCatIdx]         = useState(0);
  const [answers, setAnswers]       = useState<Answers>({});
  const [submitted, setSubmitted]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [dbQuestions, setDbQuestions]   = useState<DBQuestion[]>([]);
  const [alreadyDone, setAlreadyDone]   = useState(false);
  const [currentUser, setCurrentUser]   = useState<SavedUser | null>(null);

  // Load user from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      try { setCurrentUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
    const done = localStorage.getItem(SUBMISSION2_STORAGE_KEY) === "true";
    setAlreadyDone(done);
  }, []);

  // Fetch DB question IDs for assessment2 category keys
  useEffect(() => {
    fetch("/api/questions?type=assessment2")
      .then((r) => r.json())
      .then((d) => setDbQuestions(d.questions ?? []))
      .catch(() => { /* non-fatal */ });
  }, []);

  const totalQ        = categories.reduce((s, c) => s + c.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progress      = Math.round((answeredCount / totalQ) * 100);
  const totalScore    = Object.values(answers).reduce((s: number, v) => s + v, 0);
  const maxScore      = totalQ * 10;

  const catAnswered = (ci: number) =>
    categories[ci].questions.every((_, qi) => answers[`${ci}-${qi}`] !== undefined);
  const allAnswered = categories.every((_, i) => catAnswered(i));
  const isLast      = catIdx === categories.length - 1;
  const cat         = categories[catIdx];

  function handleAnswer(ci: number, qi: number, val: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [`${ci}-${qi}`]: val }));
  }

  function buildAnswerPayload() {
    // Map "categoryOrder-questionOrder" → DB question id
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
        const val      = answers[`${ci}-${qi}`];
        const dbKey    = `${cat.num}-${qi + 1}`;
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

      if (!currentUser?.id) {
        setSubmitError("User session not found. Please refresh and try again.");
        return;
      }

      const answersPayload = buildAnswerPayload();

      // If DB questions aren't loaded yet, submit with rawPayload only
      const res = await fetch("/api/submissions2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:     currentUser.id,
          totalScore,
          maxScore,
          rawPayload: answers,
          answers:    answersPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Failed to submit assessment.");
        return;
      }

      localStorage.setItem(SUBMISSION2_STORAGE_KEY, "true");
      setSubmitted(true);
      onSubmitComplete?.();
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError("Something went wrong while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Already submitted guard ────────────────────────────────────────────────
  if (alreadyDone) {
    return (
      <AlreadySubmittedScreen meta={meta} dir={dir} user={currentUser} />
    );
  }

  // ── Success screen ─────────────────────────────────────────────────────────
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
                  <div className="text-4xl font-bold text-[#1a6b3c]">{totalScore}</div>
                  <div className="text-xs text-muted-foreground mt-1">{meta.totalScore}</div>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#c9a227]">{totalQ}</div>
                  <div className="text-xs text-muted-foreground mt-1">{meta.totalQ}</div>
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
              <div className="text-xs text-muted-foreground mt-2 text-center">{pct}%</div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Assessment screen ──────────────────────────────────────────────────────
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
          className={cn(
            "text-sm text-white/65",
            dir === "rtl" && "text-right",
          )}
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
            <span>{progress}% {meta.completed}</span>
            <span>{meta.of} {totalQ} {meta.questions}</span>
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
                  whileHover={allAnswered && !isSubmitting ? { scale: 1.02 } : {}}
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
                    i < catIdx ? "#1a6b3c" : i === catIdx ? "#c9a227" : "#d1d5db",
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

        {/* Fill all hint */}
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