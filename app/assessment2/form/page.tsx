"use client";
import Link from "next/link";
import { JourneyShell, Notice } from "../../components/journey-shell";
import { AssessmentForm2 } from "../../components/ui/AssessmentForm2";
import { useJourney } from "../../lib/journey";
import { useLanguage } from "../../lib/language-context";
export default function SecondFormPage() {
  const { user, first, second, loading, error, refresh } = useJourney();
  const { dir } = useLanguage();
  const ar = dir === "rtl";
  return (
    <JourneyShell step={2}>
      {loading ? (
        <p className="loading-state" role="status">
          {ar ? "جارٍ تحميل ملفك…" : "Loading your profile…"}
        </p>
      ) : error ? (
        <div className="notice-panel">
          <h1>{ar ? "تعذر تحميل ملفك" : "We could not load your profile"}</h1>
          <button className="button-primary" onClick={refresh}>
            {ar ? "إعادة المحاولة" : "Try again"}
          </button>
        </div>
      ) : !user || !first ? (
        <Notice
          title={
            ar
              ? "التقييم الثاني مقفل حالياً"
              : "Assessment two is currently locked"
          }
          href={user ? "/assessment/Qs" : "/assessment"}
          action={ar ? "متابعة التقييم الأول" : "Continue assessment one"}
        >
          {ar
            ? "أكمل تقييم الحوكمة أولاً لفتح هذه الخطوة."
            : "Complete your governance assessment to unlock this step."}
        </Notice>
      ) : second ? (
        <div className="notice-panel">
          <h1>
            {ar
              ? "تم حفظ تقييمك المؤسسي"
              : "Your institutional assessment is saved"}
          </h1>
          <Link className="button-primary" href="/proposal">
            {ar ? "متابعة للعرض المالي" : "Continue to your proposal"}
          </Link>
        </div>
      ) : (
        <AssessmentForm2 key={user.id} />
      )}
    </JourneyShell>
  );
}
