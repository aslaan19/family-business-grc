"use client";
import { JourneyShell, Notice } from "../../components/journey-shell";
import { AssessmentForm } from "../../components/ui/AssessmentForm";
import { useJourney } from "../../lib/journey";
import { useLanguage } from "../../lib/language-context";
export default function QuestionsPage() {
  const { user, loading, error, refresh } = useJourney();
  const { dir } = useLanguage();
  const ar = dir === "rtl";
  return (
    <JourneyShell step={1}>
      {loading ? (
        <p className="loading-state" role="status">
          {ar ? "جارٍ تحميل تقييمك…" : "Loading your assessment…"}
        </p>
      ) : error ? (
        <div className="notice-panel">
          <h1>{ar ? "تعذر تحميل ملفك" : "We could not load your profile"}</h1>
          <button className="button-primary" onClick={refresh}>
            {ar ? "إعادة المحاولة" : "Try again"}
          </button>
        </div>
      ) : !user ? (
        <Notice
          title={ar ? "لنبدأ ببياناتك" : "Let’s start with your details"}
          href="/assessment"
          action={ar ? "إدخال بياناتي" : "Create my profile"}
        >
          {ar
            ? "أكمل ملفك أولاً، ثم ابدأ التقييم."
            : "Create your profile before starting the assessment."}
        </Notice>
      ) : (
        <AssessmentForm key={user.id} currentUser={user} />
      )}
    </JourneyShell>
  );
}
