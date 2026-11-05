"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  UnlockKeyhole,
} from "lucide-react";
import { useLanguage } from "../../lib/language-context";
import { useDraft, saveJourney } from "../../lib/journey";
import { Reveal, SectionNav } from "../journey-shell";
import type { SavedUser } from "./assessment-form-modal";

type Question = {
  id: string;
  categoryOrder: number;
  questionOrder: number;
  title: string;
  question: string;
  description: string;
};
type Answers = Record<string, number>;
export function AssessmentUnlock() {
  const { dir } = useLanguage();
  const ar = dir === "rtl";
  return (
    <Reveal className="completion-layout">
      <div className="completion-art">
        <div className="unlock-orbit">
          <span />
          <span />
          <div className="unlock-symbol">
            <UnlockKeyhole size={42} strokeWidth={1.4} />
          </div>
        </div>
        <span className="eyebrow">
          {ar
            ? "خطوة أنجزتها. وأخرى تنتظرك."
            : "ONE MILESTONE DOWN. ONE TO GO."}
        </span>
      </div>
      <div className="completion-copy">
        <span className="status-pill">
          <CheckCircle2 size={15} />
          {ar ? "تم حفظ تقييم الحوكمة" : "Governance assessment saved"}
        </span>
        <h1>
          {ar
            ? "أحسنت. التقييم الثاني متاح الآن."
            : "Well done. Your next assessment is unlocked."}
        </h1>
        <p>
          {ar
            ? "أصبح لدينا تصور عن حوكمة منشأتك. الخطوة التالية تكمل الصورة بمعلومات عن أعمالك واحتياجاتك، لنعدّ عرضاً مالياً مناسباً لك."
            : "We now have a picture of your governance. Next, tell us about your business and its needs so we can prepare a relevant financial proposal."}
        </p>
        <div className="next-assessment">
          <span className="eyebrow">
            02 / {ar ? "الخطوة التالية" : "UP NEXT"}
          </span>
          <h2>{ar ? "التقييم المؤسسي الشامل" : "Institutional assessment"}</h2>
          <p>
            {ar
              ? "ملف منشأتك، هيكلها، وأولوياتها."
              : "Your business profile, structure, and priorities."}
          </p>
          <Link href="/assessment2/form" className="button-primary">
            {ar ? "ابدأ التقييم الثاني" : "Begin assessment two"}
            <ArrowRight size={18} className="direction-arrow" />
          </Link>
        </div>
        <p className="form-note">
          <LockKeyhole size={14} />
          {ar
            ? "يُتاح طلب العرض المالي بعد إكمال التقييم الثاني."
            : "Your financial proposal request opens after assessment two."}
        </p>
      </div>
    </Reveal>
  );
}

export function AssessmentForm({
  currentUser,
  onSubmitComplete,
}: {
  currentUser?: SavedUser | null;
  onSubmitComplete?: (answers: Answers, score: number) => void;
}) {
  const { dir } = useLanguage();
  const ar = dir === "rtl";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [index, setIndex] = useState(0);
  const [review, setReview] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const draftKey = `karam:a1:${currentUser?.id}`;
  const {
    value: answers,
    setValue: setAnswers,
    ready,
    saved,
  } = useDraft<Answers>(draftKey, {});
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/questions?lang=${ar ? "ar" : "en"}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const d = await r.json();
        if (!d.questions?.length) throw new Error();
        setQuestions(d.questions);
        setLoadError(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setLoadError(true);
      });
    return () => controller.abort();
  }, [ar, retry]);
  const orders = [...new Set(questions.map((q) => q.categoryOrder))];
  const groups = orders.map((order) =>
    questions.filter((q) => q.categoryOrder === order),
  );
  const complete = (i: number) =>
    groups[i].every((q) => [0, 5, 10].includes(answers[q.id]));
  const count = questions.filter((q) =>
    [0, 5, 10].includes(answers[q.id]),
  ).length;
  const total = questions.length;
  const current = groups[index] ?? [];
  const labels = ar
    ? ["نعم، مطبّق", "مطبّق جزئياً", "لا، غير مطبّق"]
    : ["Yes, in place", "Partially in place", "No, not in place"];
  function navigate(i: number, toReview = false) {
    setIndex(i);
    setReview(toReview);
    setError("");
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  async function submit() {
    if (busy || count !== total || !currentUser) return;
    setBusy(true);
    setError("");
    try {
      const score = questions.reduce((sum, q) => sum + answers[q.id], 0);
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          answers: questions.map((q) => ({
            questionId: q.id,
            selectedValue: answers[q.id],
            selectedLabel:
              answers[q.id] === 10
                ? "yes"
                : answers[q.id] === 5
                  ? "partial"
                  : "no",
          })),
          totalScore: score,
          maxScore: total * 10,
        }),
      });
      if (!res.ok && res.status !== 409) throw new Error();
      saveJourney(currentUser, true, false);
      localStorage.removeItem(draftKey);
      setDone(true);
      onSubmitComplete?.(answers, score);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(
        ar
          ? "لم يتم إرسال إجاباتك. احتفظنا بها هنا؛ يرجى المحاولة مرة أخرى."
          : "Your answers were not submitted. They are still here; please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (
    done ||
    (typeof window !== "undefined" &&
      localStorage.getItem("karam_submission_done") === "true")
  )
    return <AssessmentUnlock />;
  if (loadError)
    return (
      <div className="notice-panel">
        <h1>{ar ? "تعذر تحميل الأسئلة" : "We could not load the questions"}</h1>
        <p>
          {ar
            ? "تحقق من اتصالك وأعد المحاولة. إجاباتك المحفوظة باقية."
            : "Check your connection and try again. Your saved answers are preserved."}
        </p>
        <button
          className="button-primary"
          onClick={() => {
            setLoadError(false);
            setRetry((v) => v + 1);
          }}
        >
          {ar ? "إعادة المحاولة" : "Try again"}
        </button>
      </div>
    );
  if (!total || !ready)
    return (
      <p className="loading-state" role="status">
        <LoaderCircle className="spin" size={20} />
        {ar ? "جارٍ تجهيز التقييم…" : "Preparing your assessment…"}
      </p>
    );
  return (
    <>
      <div className="assessment-heading">
        <div>
          <span className="eyebrow">
            01 / {ar ? "تقييم الحوكمة" : "GOVERNANCE ASSESSMENT"}
          </span>
          <h1>
            {ar
              ? "أساس أقوى لأعمالك."
              : "A stronger foundation for your business."}
          </h1>
          <p>
            {ar
              ? "اختر الإجابة الأقرب لواقع منشأتك اليوم. لا توجد إجابة مثالية متوقعة."
              : "Choose what best reflects your business today. An honest picture makes the assessment useful."}
          </p>
        </div>
        <div className="save-status">
          <ShieldCheck size={16} />
          {saved
            ? ar
              ? "يُحفظ تقدمك على هذا الجهاز"
              : "Progress saved on this device"
            : ar
              ? "تعذر الحفظ على هذا الجهاز"
              : "Device storage unavailable"}
        </div>
      </div>
      <div className="assessment-progress">
        <div>
          <span>{ar ? "إجاباتك" : "YOUR PROGRESS"}</span>
          <strong dir="ltr">
            {count}
            <small> / {total}</small>
          </strong>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label={ar ? "تقدم التقييم" : "Assessment progress"}
          aria-valuenow={count}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          <span style={{ width: `${(count / total) * 100}%` }} />
        </div>
        <b>{Math.round((count / total) * 100)}%</b>
      </div>
      <div className="assessment-layout">
        <SectionNav
          titles={groups.map((g) => g[0].title)}
          active={index}
          complete={complete}
          onSelect={(i) => navigate(i)}
          review={review}
        />
        <section className="question-panel">
          <div className="panel-heading">
            <span className="eyebrow" dir={review ? undefined : "ltr"}>
              {review
                ? ar
                  ? "الخطوة الأخيرة"
                  : "FINAL CHECK"
                : `${String(index + 1).padStart(2, "0")} / ${String(groups.length).padStart(2, "0")}`}
            </span>
            <h2 ref={heading} tabIndex={-1}>
              {review
                ? ar
                  ? "راجع إجاباتك قبل الإرسال"
                  : "Review before you submit"
                : current[0]?.title}
            </h2>
            <p>
              {review
                ? ar
                  ? "يمكنك تعديل أي إجابة بالعودة لقسمها."
                  : "You can edit any answer by returning to its section."
                : ar
                  ? `${current.length} أسئلة في هذا القسم`
                  : `${current.length} questions in this section`}
            </p>
          </div>
          <Reveal key={review ? "review" : index} className="question-body">
            {review
              ? groups.map((group, i) => (
                  <div className="review-section" key={i}>
                    <div>
                      <h3>{group[0].title}</h3>
                      <button
                        className="text-button"
                        onClick={() => navigate(i)}
                      >
                        {ar ? "تعديل" : "Edit"}
                      </button>
                    </div>
                    {group.map((q) => (
                      <div className="review-answer" key={q.id}>
                        <p>{q.question}</p>
                        <span className="status-pill">
                          {labels[[10, 5, 0].indexOf(answers[q.id])] ??
                            (ar ? "لم تتم الإجابة" : "Unanswered")}
                        </span>
                      </div>
                    ))}
                  </div>
                ))
              : current.map((q, qi) => (
                  <fieldset key={q.id} className="question-card">
                    <legend>
                      <span className="question-index">
                        {questions.indexOf(q) + 1}
                      </span>
                      {q.question}
                    </legend>
                    {q.description && (
                      <p className="question-description">{q.description}</p>
                    )}
                    <div className="answer-options">
                      {[10, 5, 0].map((value, i) => (
                        <label
                          key={value}
                          className={`answer-option ${answers[q.id] === value ? "selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={value}
                            checked={answers[q.id] === value}
                            onChange={() => {
                              setAnswers((prev) => ({
                                ...prev,
                                [q.id]: value,
                              }));
                              setError("");
                            }}
                          />
                          <span className="answer-radio">
                            {answers[q.id] === value ? (
                              <Check size={14} />
                            ) : (
                              <Circle size={16} />
                            )}
                          </span>
                          <span>{labels[i]}</span>
                        </label>
                      ))}
                    </div>
                    <span className="sr-only">{qi + 1}</span>
                  </fieldset>
                ))}
          </Reveal>
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          <div className="assessment-controls">
            <button
              className="button-secondary"
              disabled={busy || (!index && !review)}
              onClick={() => navigate(review ? groups.length - 1 : index - 1)}
            >
              <ArrowLeft size={16} className="direction-arrow" />
              {ar ? "السابق" : "Previous"}
            </button>
            <span>
              {review
                ? ar
                  ? "لن يمكنك تعديل الإجابات بعد الإرسال"
                  : "Answers are final after submission"
                : ar
                  ? `القسم ${index + 1} من ${groups.length}`
                  : `Section ${index + 1} of ${groups.length}`}
            </span>
            <button
              className="button-primary"
              disabled={busy}
              onClick={() => {
                if (review) {
                  void submit();
                  return;
                }
                if (!complete(index)) {
                  setError(
                    ar
                      ? "أجب عن جميع أسئلة هذا القسم للمتابعة."
                      : "Answer every question in this section to continue.",
                  );
                  document
                    .querySelector<HTMLInputElement>(
                      `input[name="${current.find((q) => answers[q.id] === undefined)?.id}"]`,
                    )
                    ?.focus();
                  return;
                }
                if (index === groups.length - 1) {
                  const missing = groups.findIndex((_, i) => !complete(i));
                  if (missing >= 0) {
                    navigate(missing);
                    return;
                  }
                  navigate(index, true);
                } else navigate(index + 1);
              }}
            >
              {busy ? (
                <LoaderCircle size={17} className="spin" />
              ) : (
                <ArrowRight size={17} className="direction-arrow" />
              )}
              {review
                ? ar
                  ? "إرسال التقييم"
                  : "Submit assessment"
                : index === groups.length - 1
                  ? ar
                    ? "مراجعة الإجابات"
                    : "Review answers"
                  : ar
                    ? "حفظ ومتابعة"
                    : "Save & continue"}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
