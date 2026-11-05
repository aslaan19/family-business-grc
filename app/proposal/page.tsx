"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  FileText,
  ArrowRight,
  LoaderCircle,
  Check,
} from "lucide-react";
import { JourneyShell, Notice, Reveal } from "../components/journey-shell";
import { useJourney } from "../lib/journey";
import { useLanguage } from "../lib/language-context";
import { PublishedProposal } from "../components/published-proposal";
import { validProposal, type FinancialProposal } from "../lib/proposal-data";
export default function ProposalPage() {
  const [proposal, setProposal] = useState<FinancialProposal | null>(null);
  const {
    user,
    first,
    second,
    loading,
    error: journeyError,
    refresh,
  } = useJourney();
  const { dir } = useLanguage();
  const ar = dir === "rtl";
  const [requested, setRequested] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user || !first || !second) return;
    const controller = new AbortController();
    fetch(`/api/proposal?userId=${encodeURIComponent(user.id)}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const data = await r.json();
        setRequested(data.requestedAt);
        setProposal(validProposal(data.proposal) ? data.proposal : null);
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError(
            ar
              ? "تعذر تحميل حالة الطلب. أعد المحاولة."
              : "Could not load your request status. Please try again.",
          );
      })
      .finally(() => setChecking(false));
    return () => controller.abort();
  }, [user, first, second, ar]);
  async function request() {
    if (busy || !user) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRequested(data.requestedAt);
    } catch {
      setError(
        ar
          ? "لم يتم حفظ طلبك. حاول مرة أخرى."
          : "Your request was not saved. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!loading && !journeyError && user && first && second && proposal)
    return (
      <JourneyShell step={3}>
        <PublishedProposal
          proposal={proposal}
          userId={user.id}
          company={user.companyName || user.fullName}
        />
      </JourneyShell>
    );
  return (
    <JourneyShell step={3}>
      {loading ? (
        <p role="status" className="loading-state">
          {ar ? "جارٍ التحقق…" : "Checking your assessments…"}
        </p>
      ) : journeyError ? (
        <div className="notice-panel">
          <h1>
            {ar
              ? "تعذر التحقق من تقييماتك"
              : "We could not verify your assessments"}
          </h1>
          <button className="button-primary" onClick={refresh}>
            {ar ? "إعادة المحاولة" : "Try again"}
          </button>
        </div>
      ) : !user || !first || !second ? (
        <Notice
          title={
            ar
              ? "عرض مصمم بعد فهم احتياجاتك"
              : "A proposal shaped by your business"
          }
          href={
            !user
              ? "/assessment"
              : !first
                ? "/assessment/Qs"
                : "/assessment2/form"
          }
          action={ar ? "متابعة التقييم" : "Continue your assessment"}
        >
          {ar
            ? "أكمل التقييمين أولاً، ثم اطلب عرضك المالي المخصص."
            : "Complete both assessments to request your tailored financial proposal."}
        </Notice>
      ) : (
        <Reveal className="proposal-layout">
          <div className="proposal-intro">
            <span className="status-pill">
              <CheckCircle2 size={15} />
              {ar ? "اكتملت رحلة التقييم" : "ASSESSMENTS COMPLETE"}
            </span>
            <h1>
              {requested
                ? ar
                  ? "وصل طلبك. خطوتك القادمة معنا."
                  : "Request received. Your next step is with us."
                : ar
                  ? "من الرؤية، إلى خطة العمل."
                  : "From perspective to a plan of action."}
            </h1>
            <p>
              {ar
                ? "يجمع فريقنا نتائج الحوكمة وبيانات منشأتك لإعداد نطاق عمل وعرض مالي يناسب أولوياتك."
                : "Our team brings your governance results and business profile together to prepare a scope of work and financial proposal around your priorities."}
            </p>
            <div className="proposal-checklist">
              {(ar
                ? [
                    "تقييم الحوكمة محفوظ",
                    "الملف المؤسسي مكتمل",
                    requested
                      ? "طلب العرض المالي محفوظ"
                      : "جاهز لطلب العرض المالي",
                  ]
                : [
                    "Governance assessment submitted",
                    "Institutional profile completed",
                    requested
                      ? "Financial proposal request saved"
                      : "Ready to request a financial proposal",
                  ]
              ).map((t) => (
                <p key={t}>
                  <Check size={18} />
                  {t}
                </p>
              ))}
            </div>
          </div>
          <section className="proposal-card">
            <div className="status-icon">
              <FileText size={26} />
            </div>
            <span className="eyebrow">
              {ar ? "عرضك المالي المخصص" : "YOUR FINANCIAL PROPOSAL"}
            </span>
            <h2>{user.companyName || user.fullName}</h2>
            <dl>
              <div>
                <dt>{ar ? "جهة التواصل" : "Prepared for"}</dt>
                <dd>{user.fullName}</dd>
              </div>
              <div>
                <dt>{ar ? "البريد الإلكتروني" : "Contact email"}</dt>
                <dd dir="ltr">{user.email}</dd>
              </div>
              <div>
                <dt>{ar ? "الحالة" : "Status"}</dt>
                <dd>
                  <span className="status-pill">
                    {requested
                      ? ar
                        ? "تم استلام الطلب"
                        : "Request received"
                      : ar
                        ? "جاهز للطلب"
                        : "Ready to request"}
                  </span>
                </dd>
              </div>
            </dl>
            {requested ? (
              <div className="request-confirmation" role="status">
                <CheckCircle2 size={22} />
                <p>
                  {ar ? "سُجّل طلبك بتاريخ " : "Your request was saved on "}
                  {new Date(requested).toLocaleDateString(
                    ar ? "ar-SA" : "en-GB",
                  )}
                  .{" "}
                  {ar
                    ? "سيتواصل معك فريق كرام على بريدك المسجل بشأن العرض."
                    : "The CRAM team will contact you at your registered email about your proposal."}
                </p>
              </div>
            ) : (
              <button
                className="button-primary wide"
                onClick={request}
                disabled={busy || checking}
              >
                {busy || checking ? (
                  <LoaderCircle size={18} className="spin" />
                ) : (
                  <ArrowRight size={18} className="direction-arrow" />
                )}
                {ar ? "طلب العرض المالي" : "Request financial proposal"}
              </button>
            )}
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <p className="form-note">
              {ar
                ? "يعدّ فريقنا العرض بعد مراجعة التقييمين. هذه الخطوة لا تتطلب دفعاً."
                : "Our team prepares your proposal after reviewing both assessments. No payment is required at this step."}
            </p>
          </section>
        </Reveal>
      )}
    </JourneyShell>
  );
}
