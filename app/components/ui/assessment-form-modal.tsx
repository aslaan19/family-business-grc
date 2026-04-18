// components/AssessmentFormModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Briefcase,
  Mail,
  Phone,
  Building2,
  BarChart2,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import { useLanguage } from "../../lib/language-context";
import { cn } from "../../lib/utils";

interface FormData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  companyName: string;
  companySize: string;
}

// What we store in localStorage after a successful user creation
export interface SavedUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
}

export const USER_STORAGE_KEY = "karam_user";
export const SUBMISSION_STORAGE_KEY = "karam_submission_done";

interface AssessmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the saved user after the API responds successfully */
  onSubmit: (user: SavedUser) => void;
}

const FIELDS: (keyof FormData)[] = [
  "fullName",
  "jobTitle",
  "email",
  "phone",
  "companyName",
  "companySize",
];

export function AssessmentFormModal({
  isOpen,
  onClose,
  onSubmit,
}: AssessmentFormModalProps) {
  const { t, dir } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    companyName: "",
    companySize: "",
  });
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  const filledCount = FIELDS.filter((k) => form[k].trim() !== "").length;
  const progress = Math.round((filledCount / FIELDS.length) * 100);
  const isValid = filledCount === FIELDS.length;

  // Reset state when modal opens
  if (isOpen && !prevIsOpen) {
    setIsSuccess(false);
    setIsSubmitting(false);
    setError(null);
    setForm({
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      companyName: "",
      companySize: "",
    });
    setPrevIsOpen(true);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      // Persist user info so the modal never shows again
      const savedUser: SavedUser = {
        id: data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
        phone: data.user.phone,
        companyName: data.user.companyName,
      };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(savedUser));

      // If user already completed the assessment, mark that too
      if (data.hasSubmission) {
        localStorage.setItem(SUBMISSION_STORAGE_KEY, "true");
      }

      setIsSuccess(true);
      await new Promise((r) => setTimeout(r, 700));
      onSubmit(savedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Shared class helpers ---
  const inputBase = cn(
    "w-full h-11 px-3.5 rounded-xl border bg-white",
    "text-sm text-gray-900 placeholder:text-gray-400",
    "transition-all duration-200 outline-none",
    "border-green-200 hover:border-green-300",
    "focus:border-green-500 focus:ring-2 focus:ring-green-500/15",
    dir === "rtl" ? "text-right" : "text-left",
  );

  const labelBase = cn(
    "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-1.5",
    "text-green-700",
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* ── Modal wrapper ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 28 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="relative w-full max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
              style={{ pointerEvents: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Header ── */}
              <div className="relative px-7 pt-7 pb-6 border-b border-gray-100 bg-gradient-to-br from-green-50 to-emerald-50/60">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-green-100/50 pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-emerald-100/40 pointer-events-none" />

                <div className={cn("relative flex items-center justify-between gap-4", dir === "rtl" && "flex-row-reverse")}>
                  <div className={cn("flex items-center gap-4", dir === "rtl" && "flex-row-reverse")}>
                    <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/25 flex-shrink-0">
                      <User className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <div className={dir === "rtl" ? "text-right" : "text-left"}>
                      <h2 className="text-lg font-bold text-gray-900 leading-tight">
                        {t("form.title")}
                      </h2>
                      <p className="text-sm text-green-700/80 mt-0.5">
                        {t("form.subtitle")}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex-shrink-0"
                    aria-label={t("form.close")}
                  >
                    <X className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="relative mt-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-green-700 font-medium">
                      {filledCount} / {FIELDS.length}{" "}
                      {t("form.fieldsCompleted") ?? "fields completed"}
                    </span>
                    <span className="text-[11px] text-green-700 font-semibold">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-green-600 rounded-full"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Form body ── */}
              <div className="px-7 py-6 space-y-5" dir={dir}>
                {/* Row 1: Full Name + Job Title */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>
                      <User className="w-3 h-3" />
                      {t("form.fullName")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("form.fullName.placeholder")}
                      value={form.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>
                      <Briefcase className="w-3 h-3" />
                      {t("form.jobTitle")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("form.jobTitle.placeholder")}
                      value={form.jobTitle}
                      onChange={(e) => handleChange("jobTitle", e.target.value)}
                      className={inputBase}
                    />
                  </div>
                </div>

                {/* Row 2: Email + Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>
                      <Mail className="w-3 h-3" />
                      {t("form.email")}
                    </label>
                    <input
                      type="email"
                      placeholder={t("form.email.placeholder")}
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={inputBase}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className={labelBase}>
                      <Phone className="w-3 h-3" />
                      {t("form.phone")}
                    </label>
                    <input
                      type="tel"
                      placeholder={t("form.phone.placeholder")}
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={inputBase}
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Row 3: Company Name + Size */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>
                      <Building2 className="w-3 h-3" />
                      {t("form.companyName")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("form.companyName.placeholder")}
                      value={form.companyName}
                      onChange={(e) => handleChange("companyName", e.target.value)}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>
                      <BarChart2 className="w-3 h-3" />
                      {t("form.companySize")}
                    </label>
                    <select
                      value={form.companySize}
                      onChange={(e) => handleChange("companySize", e.target.value)}
                      className={cn(inputBase, "cursor-pointer")}
                    >
                      <option value="" disabled>
                        {t("form.companySize.placeholder")}
                      </option>
                      <option value="small">{t("form.size.small")}</option>
                      <option value="medium">{t("form.size.medium")}</option>
                      <option value="large">{t("form.size.large")}</option>
                      <option value="enterprise">{t("form.size.enterprise")}</option>
                    </select>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <div className="pt-1">
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!isValid || isSubmitting}
                    whileHover={isValid && !isSubmitting ? { scale: 1.01, y: -1 } : {}}
                    whileTap={isValid && !isSubmitting ? { scale: 0.99, y: 0 } : {}}
                    className={cn(
                      "w-full h-13 py-3.5 px-6 rounded-xl font-semibold text-base",
                      "flex items-center justify-center gap-2.5 transition-all duration-300",
                      isValid && !isSubmitting && !isSuccess
                        ? "bg-green-600 text-white shadow-lg shadow-green-600/25 hover:bg-green-700 hover:shadow-xl hover:shadow-green-600/30"
                        : isSuccess
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed",
                    )}
                  >
                    {isSuccess ? (
                      <>
                        <Check className="w-5 h-5" strokeWidth={2.5} />
                        {t("form.success") ?? "Let's go!"}
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("form.submitting")}
                      </>
                    ) : (
                      <>
                        {t("form.submit")}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {!isValid && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs text-gray-400 text-center mt-3"
                      >
                        {t("form.note")}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}