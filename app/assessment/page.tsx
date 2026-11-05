"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { JourneyShell, Reveal } from "../components/journey-shell";
import { Registration } from "../components/ui/assessment-form-modal";
import { useJourney } from "../lib/journey";
import { useLanguage } from "../lib/language-context";
export default function AssessmentPage() {
  const router = useRouter();
  const { user, loading, first, refresh } = useJourney();
  const { dir } = useLanguage();
  const ar = dir === "rtl";
  return (
    <JourneyShell step={0}>
      <Reveal className="registration-layout">
        <aside className="registration-aside">
          <span className="eyebrow">
            CRAM / {ar ? "رحلة التقييم" : "YOUR ASSESSMENT JOURNEY"}
          </span>
          <h2>
            {ar
              ? "نفهم واقعك. ونرسم خطوتك القادمة."
              : "Understand today. Plan what comes next."}
          </h2>
          <p>
            {ar
              ? "تقييمان متكاملان يساعداننا على فهم حوكمة منشأتك واحتياجاتها المؤسسية."
              : "Two connected assessments help us understand your governance and your business needs."}
          </p>
          <ol>
            {(ar
              ? [
                  "سجّل بياناتك وبيانات المنشأة",
                  "أكمل تقييم الحوكمة",
                  "أكمل الملف المؤسسي",
                  "اطلب عرضك المالي المخصص",
                ]
              : [
                  "Create your business profile",
                  "Complete the governance assessment",
                  "Complete your institutional profile",
                  "Request your tailored financial proposal",
                ]
            ).map((s, i) => (
              <li key={s}>
                <span>0{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </aside>
        <div className="registration-card">
          {loading ? (
            <p role="status">
              {ar ? "جارٍ تحميل ملفك…" : "Loading your profile…"}
            </p>
          ) : user ? (
            <div className="registration">
              <span className="eyebrow">
                {ar ? "ملفك جاهز" : "YOUR PROFILE IS READY"}
              </span>
              <h1>
                {ar ? `مرحباً، ${user.fullName}` : `Welcome, ${user.fullName}`}
              </h1>
              <p>{user.companyName}</p>
              <p dir="ltr">{user.email}</p>
              <Link
                className="button-primary"
                href={first ? "/assessment2" : "/assessment/Qs"}
              >
                {ar ? "متابعة رحلتي" : "Continue my journey"}
              </Link>
              <div className="registration-switch">
                <button
                  className="text-button"
                  onClick={() => {
                    localStorage.removeItem("karam_user");
                    localStorage.removeItem("karam_submission_done");
                    localStorage.removeItem("karam_submission2_done");
                    void refresh();
                  }}
                >
                  {ar ? "استخدام ملف آخر" : "Use a different profile"}
                </button>
                <p className="form-note">
                  {ar
                    ? "تبقى مسوداتك محفوظة لهذا الملف على الجهاز."
                    : "Your drafts stay saved for this profile on this device."}
                </p>
              </div>
            </div>
          ) : (
            <Registration onSubmit={() => router.push("/assessment/Qs")} />
          )}
        </div>
      </Reveal>
    </JourneyShell>
  );
}
