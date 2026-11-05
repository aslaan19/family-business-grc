"use client";
import Link from "next/link";
import { JourneyShell, Notice } from "../components/journey-shell";
import { AssessmentUnlock } from "../components/ui/AssessmentForm";
import { useJourney } from "../lib/journey";
import { useLanguage } from "../lib/language-context";
export default function SecondAssessmentPage() {
  const { user, first, second, loading, error, refresh } = useJourney();
  const { dir } = useLanguage();
  const ar = dir === "rtl";
  return (
    <JourneyShell step={first ? 2 : 1}>
      {loading ? (
        <p className="loading-state" role="status">
          {ar ? "جارٍ التحقق من تقدمك…" : "Checking your progress…"}
        </p>
      ) : error ? (
        <div className="notice-panel">
          <h1>
            {ar ? "تعذر التحقق من تقدمك" : "We could not check your progress"}
          </h1>
          <button className="button-primary" onClick={refresh}>
            {ar ? "إعادة المحاولة" : "Try again"}
          </button>
        </div>
      ) : !user || !first ? (
        <Notice
          title={ar ? "خطوة بخطوة، نبني الصورة" : "One step at a time"}
          href={user ? "/assessment/Qs" : "/assessment"}
          action={ar ? "ابدأ بالتقييم الأول" : "Start with assessment one"}
        >
          {ar
            ? "يفتح التقييم المؤسسي بعد إرسال تقييم الحوكمة. إجاباتك في الخطوة الأولى تساعدنا على فهم منشأتك."
            : "The institutional assessment opens after you submit your governance assessment."}
        </Notice>
      ) : second ? (
        <div className="notice-panel">
          <h1>{ar ? "أكملت التقييمين" : "Both assessments are complete"}</h1>
          <p>
            {ar
              ? "يمكنك الآن طلب العرض المالي."
              : "You can now request your financial proposal."}
          </p>
          <Link className="button-primary" href="/proposal">
            {ar ? "الانتقال للعرض المالي" : "Continue to your proposal"}
          </Link>
        </div>
      ) : (
        <AssessmentUnlock />
      )}
    </JourneyShell>
  );
}
