"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Loader2,
  Mail,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "../../lib/language-context";
import { cn } from "../../lib/utils";
import {
  USER_STORAGE_KEY,
  SUBMISSION2_STORAGE_KEY,
} from "../ui/assessment-form-modal";

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldType = "text" | "number" | "select" | "yesno" | "textarea" | "table";

interface TableColumn {
  keyEn: string;
  keyAr: string;
  type?: "text" | "select";
  options?: string[];
}
interface Field {
  key: string;
  labelEn: string;
  labelAr: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // for select
  columns?: TableColumn[]; // for table
  placeholder?: string;
}
interface Section {
  id: string;
  titleEn: string;
  titleAr: string;
  icon: string;
  fields: Field[];
}
type FormValues = Record<string, unknown>;

interface SavedUser {
  id: string;
  email: string;
  fullName: string;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: "basic_info",
    icon: "🏢",
    titleEn: "Basic Company Information",
    titleAr: "المعلومات الأساسية للشركة",
    fields: [
      {
        key: "legalName",
        labelEn: "Legal Company Name",
        labelAr: "الاسم القانوني للشركة",
        type: "text",
        required: true,
      },
      {
        key: "yearEstablished",
        labelEn: "Year Established",
        labelAr: "سنة التأسيس",
        type: "number",
        required: true,
      },
      {
        key: "numEmployees",
        labelEn: "Number of Employees",
        labelAr: "عدد الموظفين",
        type: "number",
        required: true,
      },
      {
        key: "numBranches",
        labelEn: "Number of Branches",
        labelAr: "عدد الفروع",
        type: "number",
      },
      {
        key: "citiesOperation",
        labelEn: "Cities / Countries of Operation",
        labelAr: "مدن / دول التشغيل",
        type: "text",
      },
      {
        key: "industrySector",
        labelEn: "Industry Sector",
        labelAr: "القطاع",
        type: "select",
        required: true,
        options: [
          "Technology",
          "Finance & Banking",
          "Healthcare",
          "Real Estate",
          "Retail & FMCG",
          "Manufacturing",
          "Construction",
          "Energy",
          "Education",
          "Consulting",
          "Other",
        ],
      },
      {
        key: "mainProducts",
        labelEn: "Main Products or Services",
        labelAr: "المنتجات أو الخدمات الرئيسية",
        type: "textarea",
      },
      {
        key: "annualRevenue",
        labelEn: "Annual Revenue Range",
        labelAr: "نطاق الإيرادات السنوية",
        type: "select",
        required: true,
        options: ["< 50M SAR", "50M – 200M SAR", "200M – 1B SAR", "> 1B SAR"],
      },
      {
        key: "approxCapital",
        labelEn: "Approximate Capital (SAR)",
        labelAr: "رأس المال التقريبي (ريال)",
        type: "text",
      },
      {
        key: "projectsPerYear",
        labelEn: "Number of Projects per Year",
        labelAr: "عدد المشاريع سنوياً",
        type: "number",
      },
      {
        key: "avgProjectSize",
        labelEn: "Average Project Size (SAR)",
        labelAr: "متوسط حجم المشروع (ريال)",
        type: "text",
      },
      {
        key: "keyClients",
        labelEn: "Key Clients",
        labelAr: "العملاء الرئيسيون",
        type: "textarea",
        placeholder: "List your top clients…",
      },
    ],
  },
  {
    id: "organization",
    icon: "🏗️",
    titleEn: "Organizational Structure",
    titleAr: "الهيكل التنظيمي",
    fields: [
      {
        key: "departments",
        labelEn: "Departments",
        labelAr: "الأقسام",
        type: "table",
        required: true,
        columns: [
          { keyEn: "Department Name", keyAr: "اسم القسم" },
          { keyEn: "No. of Employees", keyAr: "عدد الموظفين" },
          { keyEn: "Department Head", keyAr: "رئيس القسم" },
          { keyEn: "Reports To", keyAr: "يتبع لـ" },
          { keyEn: "Key Responsibilities", keyAr: "المسؤوليات الرئيسية" },
        ],
      },
    ],
  },
  {
    id: "board_governance",
    icon: "⚖️",
    titleEn: "Board & Governance Structure",
    titleAr: "مجلس الإدارة والهيكل الحوكمي",
    fields: [
      {
        key: "boardExists",
        labelEn: "Board of Directors Exists",
        labelAr: "يوجد مجلس إدارة",
        type: "yesno",
        required: true,
      },
      {
        key: "advisoryBoard",
        labelEn: "Advisory Board Exists",
        labelAr: "يوجد مجلس استشاري",
        type: "yesno",
      },
      {
        key: "auditCommittee",
        labelEn: "Audit Committee Exists",
        labelAr: "يوجد لجنة مراجعة",
        type: "yesno",
      },
      {
        key: "riskCommittee",
        labelEn: "Risk Committee Exists",
        labelAr: "يوجد لجنة مخاطر",
        type: "yesno",
      },
      {
        key: "nominationCommittee",
        labelEn: "Nomination / Remuneration Committee",
        labelAr: "لجنة الترشيحات والمكافآت",
        type: "yesno",
      },
      {
        key: "numBoardMembers",
        labelEn: "Number of Board Members",
        labelAr: "عدد أعضاء مجلس الإدارة",
        type: "number",
      },
      {
        key: "independentDirectors",
        labelEn: "Independent Directors Present",
        labelAr: "يوجد مديرون مستقلون",
        type: "yesno",
      },
    ],
  },
  {
    id: "strategy",
    icon: "🎯",
    titleEn: "Strategy & Planning",
    titleAr: "الاستراتيجية والتخطيط",
    fields: [
      {
        key: "vision",
        labelEn: "Company Vision",
        labelAr: "رؤية الشركة",
        type: "textarea",
        required: true,
      },
      {
        key: "mission",
        labelEn: "Company Mission",
        labelAr: "رسالة الشركة",
        type: "textarea",
        required: true,
      },
      {
        key: "strategicObjectives",
        labelEn: "Strategic Objectives",
        labelAr: "الأهداف الاستراتيجية",
        type: "textarea",
      },
      {
        key: "writtenStrategy",
        labelEn: "Written Strategy Document Exists",
        labelAr: "يوجد وثيقة استراتيجية مكتوبة",
        type: "yesno",
      },
      {
        key: "annualOperatingPlan",
        labelEn: "Annual Operating Plan Exists",
        labelAr: "يوجد خطة تشغيل سنوية",
        type: "yesno",
      },
      {
        key: "strategicKPIs",
        labelEn: "Key Strategic KPIs",
        labelAr: "المؤشرات الاستراتيجية الرئيسية",
        type: "textarea",
      },
    ],
  },
  {
    id: "financial",
    icon: "💰",
    titleEn: "Financial Overview",
    titleAr: "النظرة المالية",
    fields: [
      {
        key: "revenueRange",
        labelEn: "Revenue Range",
        labelAr: "نطاق الإيرادات",
        type: "select",
        options: ["< 50M SAR", "50M – 200M SAR", "200M – 1B SAR", "> 1B SAR"],
      },
      {
        key: "capital",
        labelEn: "Capital (SAR)",
        labelAr: "رأس المال (ريال)",
        type: "text",
      },
      {
        key: "profitabilityPct",
        labelEn: "Profitability (Approx %)",
        labelAr: "الربحية التقريبية %",
        type: "number",
      },
      {
        key: "majorRevenueStreams",
        labelEn: "Major Revenue Streams",
        labelAr: "مصادر الإيرادات الرئيسية",
        type: "textarea",
      },
      {
        key: "top5Clients",
        labelEn: "Top 5 Clients",
        labelAr: "أبرز 5 عملاء",
        type: "textarea",
      },
      {
        key: "keyCostDrivers",
        labelEn: "Key Cost Drivers",
        labelAr: "المحركات الرئيسية للتكاليف",
        type: "textarea",
      },
    ],
  },
  {
    id: "operations",
    icon: "⚙️",
    titleEn: "Core Operations",
    titleAr: "العمليات الأساسية",
    fields: [
      {
        key: "coreProcesses",
        labelEn: "Core Business Processes",
        labelAr: "العمليات التجارية الأساسية",
        type: "table",
        columns: [
          { keyEn: "Core Business Process", keyAr: "العملية الأساسية" },
          { keyEn: "Process Owner", keyAr: "مسؤول العملية" },
          {
            keyEn: "Documented (Y/N)",
            keyAr: "موثقة (نعم/لا)",
            type: "select",
            options: ["Yes", "No"],
          },
          {
            keyEn: "SOP Available (Y/N)",
            keyAr: "دليل إجراءات (نعم/لا)",
            type: "select",
            options: ["Yes", "No"],
          },
          {
            keyEn: "Automation Level",
            keyAr: "مستوى الأتمتة",
            type: "select",
            options: ["Manual", "Semi-Digital", "Fully Digital"],
          },
        ],
      },
    ],
  },
  {
    id: "governance_docs",
    icon: "📋",
    titleEn: "Governance Documentation",
    titleAr: "وثائق الحوكمة",
    fields: [
      {
        key: "govCharter",
        labelEn: "Governance Charter Exists",
        labelAr: "يوجد ميثاق حوكمة",
        type: "yesno",
      },
      {
        key: "boardCharter",
        labelEn: "Board Charter Exists",
        labelAr: "يوجد ميثاق مجلس الإدارة",
        type: "yesno",
      },
      {
        key: "committeeCharters",
        labelEn: "Board Committee Charters Exist",
        labelAr: "توجد مواثيق للجان",
        type: "yesno",
      },
      {
        key: "conflictPolicy",
        labelEn: "Conflict of Interest Policy Exists",
        labelAr: "توجد سياسة تضارب مصالح",
        type: "yesno",
      },
      {
        key: "delegationAuth",
        labelEn: "Delegation of Authority Document",
        labelAr: "توجد جدول صلاحيات",
        type: "yesno",
      },
      {
        key: "policiesRepo",
        labelEn: "Corporate Policies Repository Exists",
        labelAr: "يوجد مستودع للسياسات المؤسسية",
        type: "yesno",
      },
    ],
  },
  {
    id: "risks",
    icon: "🛡️",
    titleEn: "Risk Management",
    titleAr: "إدارة المخاطر",
    fields: [
      {
        key: "riskFramework",
        labelEn: "Risk Management Framework Exists",
        labelAr: "يوجد إطار لإدارة المخاطر",
        type: "yesno",
      },
      {
        key: "riskRegister",
        labelEn: "Risk Register Exists",
        labelAr: "يوجد سجل مخاطر",
        type: "yesno",
      },
      {
        key: "annualRiskAssess",
        labelEn: "Annual Risk Assessment Conducted",
        labelAr: "يتم إجراء تقييم مخاطر سنوي",
        type: "yesno",
      },
      {
        key: "riskCommitteeExists",
        labelEn: "Risk Committee Exists",
        labelAr: "يوجد لجنة مخاطر",
        type: "yesno",
      },
      {
        key: "top5Risks",
        labelEn: "Top 5 Business Risks",
        labelAr: "أبرز 5 مخاطر تجارية",
        type: "textarea",
        placeholder: "Describe your top 5 business risks…",
      },
    ],
  },
];

// ─── Field Components ─────────────────────────────────────────────────────────

function YesNo({
  value,
  onChange,
  dir,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  dir: "rtl" | "ltr";
}) {
  return (
    <div
      className={cn(
        "flex gap-2",
        dir === "rtl" ? "flex-row-reverse justify-end" : "",
      )}
    >
      {["Yes", "No"].map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "px-5 py-2 rounded-full border text-sm font-semibold transition-all",
            value === opt
              ? opt === "Yes"
                ? "bg-[#e8f5ee] border-[#1a6b3c] text-[#1a6b3c]"
                : "bg-red-50 border-red-400 text-red-600"
              : "border-border text-muted-foreground hover:border-[#1a6b3c]/30",
          )}
        >
          {dir === "rtl" ? (opt === "Yes" ? "نعم" : "لا") : opt}
        </button>
      ))}
    </div>
  );
}

function TableField({
  columns,
  value,
  onChange,
  dir,
}: {
  columns: TableColumn[];
  value: Record<string, string>[];
  onChange: (v: Record<string, string>[]) => void;
  dir: "rtl" | "ltr";
}) {
  function addRow() {
    onChange([...value, Object.fromEntries(columns.map((c) => [c.keyEn, ""]))]);
  }
  function removeRow(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }
  function updateCell(rowIdx: number, colKey: string, val: string) {
    const updated = value.map((row, i) =>
      i === rowIdx ? { ...row, [colKey]: val } : row,
    );
    onChange(updated);
  }

  const inputCls =
    "w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#1a6b3c] transition-colors";

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.keyEn}
                  className={cn(
                    "px-3 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide",
                    dir === "rtl" ? "text-right" : "text-left",
                  )}
                >
                  {dir === "rtl" ? col.keyAr : col.keyEn}
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {value.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-6 text-center text-xs text-muted-foreground"
                >
                  {dir === "rtl"
                    ? "لا توجد بيانات — أضف صفاً جديداً"
                    : "No rows yet — add one below"}
                </td>
              </tr>
            ) : (
              value.map((row, ri) => (
                <tr key={ri} className="hover:bg-muted/20 transition-colors">
                  {columns.map((col) => (
                    <td key={col.keyEn} className="px-3 py-2">
                      {col.type === "select" ? (
                        <select
                          value={row[col.keyEn] ?? ""}
                          onChange={(e) =>
                            updateCell(ri, col.keyEn, e.target.value)
                          }
                          className={inputCls}
                        >
                          <option value="">—</option>
                          {col.options?.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={row[col.keyEn] ?? ""}
                          onChange={(e) =>
                            updateCell(ri, col.keyEn, e.target.value)
                          }
                          className={inputCls}
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(ri)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-[#1a6b3c]/40 text-[#1a6b3c] text-xs font-semibold hover:bg-[#1a6b3c]/5 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        {dir === "rtl" ? "إضافة صف" : "Add Row"}
      </button>
    </div>
  );
}

function RenderField({
  field,
  value,
  onChange,
  dir,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  dir: "rtl" | "ltr";
}) {
  const inputCls = cn(
    "w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm text-foreground",
    "border-border hover:border-[#1a6b3c]/30 focus:border-[#1a6b3c] focus:ring-2 focus:ring-[#1a6b3c]/10",
    "outline-none transition-all placeholder:text-muted-foreground/50",
    dir === "rtl" ? "text-right" : "text-left",
  );

  if (field.type === "yesno")
    return <YesNo value={value as string} onChange={onChange} dir={dir} />;

  if (field.type === "table")
    return (
      <TableField
        columns={field.columns ?? []}
        value={(value as Record<string, string>[]) ?? []}
        onChange={onChange}
        dir={dir}
      />
    );

  if (field.type === "select")
    return (
      <select
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputCls, "cursor-pointer")}
      >
        <option value="">{dir === "rtl" ? "اختر..." : "Select..."}</option>
        {field.options?.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );

  if (field.type === "textarea")
    return (
      <textarea
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={field.placeholder ?? ""}
        className={cn(inputCls, "resize-none")}
      />
    );

  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder ?? ""}
      className={inputCls}
    />
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({
  current,
  total,
  dir,
}: {
  current: number;
  total: number;
  dir: "rtl" | "ltr";
}) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="mb-8">
      <div
        className={cn(
          "flex justify-between text-xs text-muted-foreground mb-2 font-medium",
          dir === "rtl" ? "flex-row-reverse" : "",
        )}
      >
        <span>
          {dir === "rtl"
            ? `القسم ${current + 1} من ${total}`
            : `Section ${current + 1} of ${total}`}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#1a6b3c] to-[#c9a227]"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      {/* Section pills */}
      <div
        className={cn(
          "flex gap-1 mt-3 flex-wrap",
          dir === "rtl" ? "flex-row-reverse" : "",
        )}
      >
        {SECTIONS.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i < current
                ? "bg-[#1a6b3c] flex-1"
                : i === current
                  ? "bg-[#c9a227] flex-1"
                  : "bg-border flex-1",
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AssessmentForm2Props {
  onSubmitComplete?: () => void;
}

export function AssessmentForm2({ onSubmitComplete }: AssessmentForm2Props) {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";

  const [sectionIdx, setSectionIdx] = useState(0);
  const [values, setValues] = useState<FormValues>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [currentUser, setCurrentUser] = useState<SavedUser | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      try {
        setCurrentUser(JSON.parse(raw));
      } catch {}
    }
    setAlreadyDone(localStorage.getItem(SUBMISSION2_STORAGE_KEY) === "true");
  }, []);

  const section = SECTIONS[sectionIdx];
  const isLast = sectionIdx === SECTIONS.length - 1;

  function setField(key: string, val: unknown) {
    setValues((prev) => ({ ...prev, [key]: val }));
    setValidationErrors((prev) => prev.filter((e) => e !== key));
  }

  function validateSection(): boolean {
    const errors: string[] = [];
    section.fields.forEach((f) => {
      if (!f.required) return;
      const val = values[f.key];
      if (
        !val ||
        (typeof val === "string" && !val.trim()) ||
        (Array.isArray(val) && val.length === 0)
      )
        errors.push(f.key);
    });
    setValidationErrors(errors);
    return errors.length === 0;
  }

  function handleNext() {
    if (!validateSection()) return;
    setSectionIdx((i) => i + 1);
    setValidationErrors([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function handlePrev() {
    setSectionIdx((i) => i - 1);
    setValidationErrors([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!validateSection()) return;
    if (!currentUser?.id) {
      setSubmitError("User session not found. Please refresh.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/submissions2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          formData: values,
          totalScore: 0,
          maxScore: 0,
          rawPayload: values,
          answers: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Submission failed.");
        return;
      }
      localStorage.setItem(SUBMISSION2_STORAGE_KEY, "true");
      setSubmitted(true);
      onSubmitComplete?.();
    } catch {
      setSubmitError("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Already done ────────────────────────────────────────────────────────────
  if (alreadyDone) {
    return (
      <div dir={dir} className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-[#e8f5ee] border-4 border-[#1a6b3c] flex items-center justify-center mx-auto mb-6">
          <FileCheck2 className="w-10 h-10 text-[#1a6b3c]" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          {isRtl
            ? "لقد أكملت التقييم الثاني بالفعل!"
            : "You've already completed Assessment 2!"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {isRtl
            ? "يعمل فريق الخبراء على إعداد عرضكم المخصص."
            : "Our experts are preparing your customized proposal."}
        </p>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div dir={dir} className="max-w-2xl mx-auto py-16 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-[#e8f5ee] border-4 border-[#1a6b3c] flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-[#1a6b3c]" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          {isRtl ? "تم إرسال بياناتكم بنجاح!" : "Data submitted successfully!"}
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {isRtl
            ? "شكراً لك. يعمل فريق خبرائنا الآن على إعداد عرض مخصص ومتكامل يناسب حالتكم تماماً!"
            : "Thank you! Our experts are now preparing a fully customized proposal perfectly suited to your case."}
        </p>
        {currentUser?.email && (
          <div className="mt-8 inline-flex items-center gap-2.5 bg-[#1a6b3c]/8 border border-[#1a6b3c]/20 rounded-2xl px-5 py-3">
            <Mail className="w-4 h-4 text-[#1a6b3c]" />
            <p className="text-sm font-semibold text-[#1a6b3c]" dir="ltr">
              {currentUser.email}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div dir={dir} className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a6b3c] to-[#0f4a29] rounded-t-2xl px-8 pt-7 pb-6">
        <div
          className={cn(
            "flex justify-between items-center mb-2",
            isRtl && "flex-row-reverse",
          )}
        >
          <span className="text-[11px] font-semibold px-4 py-1.5 rounded-full bg-white/10 text-white/85 border border-white/20 tracking-wider">
            A | A
          </span>
          <span className="text-xs text-white/60 font-medium">
            {isRtl ? "التقييم الثاني الشامل" : "Comprehensive Assessment 2"}
          </span>
        </div>
        <h2
          className={cn(
            "text-xl font-bold text-white mb-1",
            isRtl && "text-right",
          )}
        >
          {isRtl
            ? "نموذج كرام — التقييم المؤسسي الشامل"
            : "KARAM — Institutional Assessment Form"}
        </h2>
        <p className={cn("text-sm text-white/65 mb-5", isRtl && "text-right")}>
          {isRtl
            ? "يرجى تعبئة جميع الأقسام بدقة لمساعدة فريق الخبراء في إعداد العرض المناسب"
            : "Please fill all sections carefully to help our experts prepare the right proposal"}
        </p>
        <StepIndicator current={sectionIdx} total={SECTIONS.length} dir={dir} />
      </div>

      {/* Body */}
      <div className="bg-card border border-border border-t-0 rounded-b-2xl shadow-lg">
        {/* Section header */}
        <div
          className={cn(
            "flex items-center gap-3 px-8 pt-7 pb-5 border-b border-border",
            isRtl && "flex-row-reverse",
          )}
        >
          <span className="text-3xl">{section.icon}</span>
          <div>
            <h3
              className={cn(
                "text-lg font-bold text-foreground",
                isRtl && "text-right",
              )}
            >
              {isRtl ? section.titleAr : section.titleEn}
            </h3>
            <p
              className={cn(
                "text-xs text-muted-foreground mt-0.5",
                isRtl && "text-right",
              )}
            >
              {section.fields.length} {isRtl ? "حقل" : "fields"}
              {section.fields.some((f) => f.required) && (
                <span className="text-red-500 ms-1">
                  • {isRtl ? "الحقول المميزة بـ * مطلوبة" : "* required fields"}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Fields */}
        <AnimatePresence mode="wait">
          <motion.div
            key={sectionIdx}
            initial={{ opacity: 0, x: isRtl ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? 24 : -24 }}
            transition={{ duration: 0.25 }}
            className="px-8 py-6 space-y-6"
          >
            {section.fields.map((field) => {
              const hasError = validationErrors.includes(field.key);
              return (
                <div key={field.key}>
                  <label
                    className={cn(
                      "block text-sm font-semibold text-foreground mb-2",
                      isRtl && "text-right",
                    )}
                  >
                    {isRtl ? field.labelAr : field.labelEn}
                    {field.required && (
                      <span className="text-red-500 ms-1">*</span>
                    )}
                  </label>
                  <RenderField
                    field={field}
                    value={values[field.key]}
                    onChange={(v) => setField(field.key, v)}
                    dir={dir}
                  />
                  <AnimatePresence>
                    {hasError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          "flex items-center gap-1.5 mt-1.5 text-xs text-red-500",
                          isRtl && "flex-row-reverse",
                        )}
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {isRtl ? "هذا الحقل مطلوب" : "This field is required"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Error banner */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-8 mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center"
            >
              {submitError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div
          className="px-8 pb-7 grid grid-cols-[1fr_auto_1fr] items-center gap-4"
          dir="ltr"
        >
          {/* Left */}
          <div className="justify-self-start">
            {isRtl ? (
              isLast ? (
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                    !isSubmitting
                      ? "bg-[#1a6b3c] text-white shadow-lg shadow-[#1a6b3c]/25 hover:bg-[#155731]"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                  {isSubmitting
                    ? isRtl
                      ? "جاري الإرسال..."
                      : "Submitting..."
                    : isRtl
                      ? "إرسال التقييم"
                      : "Submit"}
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#1a6b3c] text-white shadow-lg shadow-[#1a6b3c]/25 hover:bg-[#155731]"
                >
                  <ChevronLeft className="w-4 h-4" />{" "}
                  {isRtl ? "التالي" : "Next"}
                </motion.button>
              )
            ) : (
              <button
                onClick={handlePrev}
                disabled={sectionIdx === 0}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                  sectionIdx === 0
                    ? "border-border text-muted-foreground/40 cursor-not-allowed"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                <ChevronLeft className="w-4 h-4" />{" "}
                {isRtl ? "السابق" : "Previous"}
              </button>
            )}
          </div>

          {/* Center dots */}
          <div className="justify-self-center flex items-center gap-1.5">
            {SECTIONS.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === sectionIdx ? 20 : 8,
                  backgroundColor:
                    i < sectionIdx
                      ? "#1a6b3c"
                      : i === sectionIdx
                        ? "#c9a227"
                        : "#d1d5db",
                }}
                className="h-2 rounded-full"
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* Right */}
          <div className="justify-self-end">
            {isRtl ? (
              <button
                onClick={handlePrev}
                disabled={sectionIdx === 0}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                  sectionIdx === 0
                    ? "border-border text-muted-foreground/40 cursor-not-allowed"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {isRtl ? "السابق" : "Previous"}{" "}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : isLast ? (
              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  !isSubmitting
                    ? "bg-[#1a6b3c] text-white shadow-lg shadow-[#1a6b3c]/25 hover:bg-[#155731]"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                {isSubmitting
                  ? isRtl
                    ? "جاري الإرسال..."
                    : "Submitting..."
                  : isRtl
                    ? "إرسال التقييم"
                    : "Submit Assessment"}
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </motion.button>
            ) : (
              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#1a6b3c] text-white shadow-lg shadow-[#1a6b3c]/25 hover:bg-[#155731]"
              >
                {isRtl ? "التالي" : "Next"} <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
