"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Building2 } from "lucide-react";
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

interface AssessmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export function AssessmentFormModal({ isOpen, onClose, onSubmit }: AssessmentFormModalProps) {
  const { t, dir } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    fullName: "", jobTitle: "", email: "",
    phone: "", companyName: "", companySize: "",
  });

  const isValid = Object.values(form).every(v => v.trim() !== "");

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
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!isValid) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000)); // simulate async
    setIsSubmitting(false);
    onSubmit(form);
  }

  const inputClass = cn(
    "w-full px-4 py-3 rounded-xl border border-border bg-background",
    "text-foreground placeholder:text-muted-foreground/60",
    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
    "transition-all duration-200 text-sm",
    dir === "rtl" ? "text-right" : "text-left"
  );

  const labelClass = "flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="relative w-full max-w-2xl bg-card rounded-3xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{ pointerEvents: "auto" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className={cn(
                "flex items-center justify-between p-6 pb-4 border-b border-border",
                dir === "rtl" ? "flex-row" : "flex-row-reverse"
              )}>
                <div className={cn("flex items-center gap-4", dir === "ltr" && "flex-row-reverse")}>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className={dir === "rtl" ? "text-right" : "text-left"}>
                    <h2 className="text-xl font-bold text-foreground">{t("form.title")}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{t("form.subtitle")}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label={t("form.close")}
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-5" dir={dir}>
                {/* Row 1: Full Name + Job Title */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      <User className="w-4 h-4" />
                      {t("form.fullName")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("form.fullName.placeholder")}
                      value={form.fullName}
                      onChange={e => handleChange("fullName", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <Building2 className="w-4 h-4" />
                      {t("form.jobTitle")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("form.jobTitle.placeholder")}
                      value={form.jobTitle}
                      onChange={e => handleChange("jobTitle", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Row 2: Email + Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      <span className="text-base">✉</span>
                      {t("form.email")}
                    </label>
                    <input
                      type="email"
                      placeholder={t("form.email.placeholder")}
                      value={form.email}
                      onChange={e => handleChange("email", e.target.value)}
                      className={inputClass}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <span className="text-base">📞</span>
                      {t("form.phone")}
                    </label>
                    <input
                      type="tel"
                      placeholder={t("form.phone.placeholder")}
                      value={form.phone}
                      onChange={e => handleChange("phone", e.target.value)}
                      className={inputClass}
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Row 3: Company Name + Size */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      <span className="text-base">🏢</span>
                      {t("form.companyName")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("form.companyName.placeholder")}
                      value={form.companyName}
                      onChange={e => handleChange("companyName", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <span className="text-base">📊</span>
                      {t("form.companySize")}
                    </label>
                    <select
                      value={form.companySize}
                      onChange={e => handleChange("companySize", e.target.value)}
                      className={cn(inputClass, "cursor-pointer")}
                    >
                      <option value="" disabled>{t("form.companySize.placeholder")}</option>
                      <option value="small">{t("form.size.small")}</option>
                      <option value="medium">{t("form.size.medium")}</option>
                      <option value="large">{t("form.size.large")}</option>
                      <option value="enterprise">{t("form.size.enterprise")}</option>
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!isValid || isSubmitting}
                    whileHover={isValid ? { scale: 1.01 } : {}}
                    whileTap={isValid ? { scale: 0.99 } : {}}
                    className={cn(
                      "w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300",
                      "flex items-center justify-center gap-3",
                      isValid
                        ? "bg-gradient-to-l from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                        />
                        {t("form.submitting")}
                      </>
                    ) : (
                      <>
                        {t("form.submit")}
                        <span className="text-xl">←</span>
                      </>
                    )}
                  </motion.button>

                  {!isValid && (
                    <p className={cn(
                      "text-xs text-muted-foreground mt-3",
                      dir === "rtl" ? "text-center" : "text-center"
                    )}>
                      {t("form.note")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}