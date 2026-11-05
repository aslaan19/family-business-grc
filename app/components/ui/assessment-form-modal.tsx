"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, LoaderCircle, X, Building2 } from "lucide-react";
import { useLanguage } from "../../lib/language-context";
import { saveJourney } from "../../lib/journey";

export interface SavedUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
}
export const USER_STORAGE_KEY = "karam_user";
export const SUBMISSION_STORAGE_KEY = "karam_submission_done";
export const SUBMISSION2_STORAGE_KEY = "karam_submission2_done";

export function Registration({
  onSubmit,
}: {
  onSubmit: (user: SavedUser) => void;
}) {
  const { dir } = useLanguage();
  const ar = dir === "rtl";
  const [returning, setReturning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError("");
    try {
      const res = await fetch(returning ? "/api/users/lookup" : "/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error === "phone_taken"
            ? ar
              ? "رقم الهاتف مسجل بالفعل بحساب آخر."
              : "This phone belongs to another account."
            : res.status === 404
              ? ar
                ? "لم نجد هذا البريد. سجّل بياناتك للبدء."
                : "We could not find that email. Register your details to begin."
              : ar
                ? "تعذر حفظ بياناتك. حاول مرة أخرى."
                : "We could not save your details. Please try again.",
        );
      saveJourney(
        data.user,
        !!(data.hasAssessment1 ?? data.hasSubmission),
        !!(data.hasAssessment2 ?? data.hasSubmission2),
      );
      onSubmit(data.user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : ar
            ? "تعذر الاتصال. حاول مرة أخرى."
            : "Connection failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="registration" dir={dir}>
      <div className="registration-heading">
        <span className="eyebrow">
          {ar
            ? "الخطوة الأولى · لنتعرف عليك"
            : "FIRST THINGS FIRST · YOUR DETAILS"}
        </span>
        <h1>
          {returning
            ? ar
              ? "مرحباً بعودتك."
              : "Welcome back."
            : ar
              ? "بداية أوضح لمستقبل أعمالك."
              : "A clearer future starts here."}
        </h1>
        <p>
          {ar
            ? "أخبرنا عنك وعن منشأتك، ثم ابدأ تقييم الحوكمة."
            : "Tell us a little about you and your business, then begin your governance assessment."}
        </p>
      </div>
      <form onSubmit={submit} className="registration-form">
        {!returning && (
          <div className="form-grid">
            <label>
              {ar ? "الاسم الكامل" : "Full name"}
              <input
                name="fullName"
                autoComplete="name"
                required
                maxLength={120}
                placeholder={ar ? "اسمك الكامل" : "Your full name"}
              />
            </label>
            <label>
              {ar ? "اسم المنشأة" : "Company name"}
              <input
                name="companyName"
                autoComplete="organization"
                required
                maxLength={160}
                placeholder={ar ? "اسم منشأتك" : "Your business name"}
              />
            </label>
          </div>
        )}
        <div className="form-grid">
          <label>
            {ar ? "البريد الإلكتروني" : "Email address"}
            <input
              name="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@company.com"
            />
          </label>
          {!returning && (
            <label>
              {ar ? "رقم الهاتف" : "Phone number"}
              <input
                name="phone"
                type="tel"
                dir="ltr"
                autoComplete="tel"
                required
                pattern="[+0-9 \(\)\-]{7,25}"
                placeholder="+966 5X XXX XXXX"
              />
            </label>
          )}
        </div>
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        <button className="button-primary wide" disabled={busy}>
          {busy ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            <ArrowUpRight size={18} />
          )}
          {busy
            ? ar
              ? "جارٍ الحفظ…"
              : "Saving…"
            : returning
              ? ar
                ? "متابعة رحلتي"
                : "Continue my journey"
              : ar
                ? "حفظ البيانات وبدء التقييم"
                : "Save details & begin assessment"}
        </button>
        <p className="form-note">
          {ar
            ? "تُستخدم بياناتك لتقييم منشأتك وإعداد العرض المناسب لها."
            : "Your details help us assess your business and prepare a relevant proposal."}
        </p>
      </form>
      <div className="registration-switch">
        {returning
          ? ar
            ? "هذه زيارتك الأولى؟"
            : "First time here?"
          : ar
            ? "سبق وسجلت؟"
            : "Already registered?"}{" "}
        <button
          className="text-button"
          disabled={busy}
          onClick={() => {
            setReturning(!returning);
            setError("");
          }}
        >
          {returning
            ? ar
              ? "إنشاء ملف"
              : "Create your profile"
            : ar
              ? "متابعة ببريدي الإلكتروني"
              : "Continue with your email"}
        </button>
      </div>
    </div>
  );
}

export function AssessmentFormModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: SavedUser) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { dir } = useLanguage();
  useEffect(() => {
    const dialog = ref.current;
    if (isOpen && !dialog?.open) dialog?.showModal();
    else if (!isOpen && dialog?.open) dialog.close();
    const old = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [isOpen]);
  return (
    <dialog
      ref={ref}
      className="registration-dialog"
      onCancel={onClose}
      aria-label={dir === "rtl" ? "بياناتك" : "Your details"}
    >
      <button
        className="dialog-close button-quiet"
        onClick={onClose}
        aria-label={dir === "rtl" ? "إغلاق" : "Close"}
      >
        <X size={20} />
      </button>
      <div className="registration-symbol">
        <Building2 size={24} />
      </div>
      {isOpen && <Registration onSubmit={onSubmit} />}
    </dialog>
  );
}
