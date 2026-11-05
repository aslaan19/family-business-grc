type FieldType = "text" | "number" | "select" | "yesno" | "textarea" | "table";

interface TableColumn {
  keyEn: string;
  keyAr: string;
  type?: "text" | "select";
  options?: string[];
}
export interface Field {
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
export type FormValues = Record<string, unknown>;

const arabicOptions: Record<string, string> = {
  Technology: "التقنية",
  "Finance & Banking": "التمويل والخدمات المصرفية",
  Healthcare: "الرعاية الصحية",
  "Real Estate": "العقارات",
  "Retail & FMCG": "التجزئة والسلع الاستهلاكية",
  Manufacturing: "الصناعة",
  Construction: "المقاولات",
  Energy: "الطاقة",
  Education: "التعليم",
  Consulting: "الاستشارات",
  Other: "أخرى",
  "< 50M SAR": "أقل من 50 مليون ريال",
  "50M – 200M SAR": "من 50 إلى 200 مليون ريال",
  "200M – 1B SAR": "من 200 مليون إلى مليار ريال",
  "> 1B SAR": "أكثر من مليار ريال",
  Yes: "نعم",
  No: "لا",
  Manual: "يدوي",
  "Semi-Digital": "رقمي جزئياً",
  "Fully Digital": "رقمي بالكامل",
};
export function optionLabel(value: string, ar: boolean) {
  return ar ? (arabicOptions[value] ?? value) : value;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

export const SECTIONS: Section[] = [
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
