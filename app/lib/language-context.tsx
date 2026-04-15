"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Header
    "nav.home": "الرئيسية",
    "nav.roadmap": "خارطة الطريق",
    "nav.about": "من نحن",
    "nav.contact": "تواصل معنا",
    "nav.startJourney": "ابدأ رحلتك",
    "form.title": "تعريف المنشأة",
    "form.subtitle": "إدخال البيانات الأساسية إلزامي",
    "form.fullName": "الاسم الكامل",
    "form.fullName.placeholder": "مثال: خالد بن عبد العزيز",
    "form.jobTitle": "المسمى الوظيفي",
    "form.jobTitle.placeholder": "مثال: الرئيس التنفيذي",
    "form.email": "البريد الإلكتروني",
    "form.email.placeholder": "ceo@family-office.sa",
    "form.phone": "رقم الجوال",
    "form.phone.placeholder": "05xxxxxxxx",
    "form.companyName": "اسم الشركة",
    "form.companyName.placeholder": "مجموعة ... القابضة",
    "form.companySize": "حجم المنشأة",
    "form.companySize.placeholder": "اختر الحجم...",
    "form.size.small": "صغيرة (أقل من 50 موظف)",
    "form.size.medium": "متوسطة (50-200 موظف)",
    "form.size.large": "كبيرة (200-1000 موظف)",
    "form.size.enterprise": "مجموعة (+1000 موظف)",
    "form.submit": "تفعيل نظام التشخيص",
    "form.submitting": "جارٍ المعالجة...",
    "form.note": "سيتم فتح النموذج فور اكمال الخانات الضغط هنا",
    "form.close": "إغلاق",
    // Hero
    "hero.subtitle": "رحلتك نحو التميز المؤسسي",
    "hero.title1": "حوكمة",
    "hero.title2": "الأعمال",
    "hero.title3": "العائلية",
    "hero.description":
      "نقدم لك منهجية متكاملة وأدوات احترافية لتحويل إدارة أعمالك العائلية من العشوائية إلى الاحترافية والاستدامة",
    "hero.cta": "ابدأ رحلة التحول",
    "hero.learnMore": "اكتشف المزيد",
    "hero.stat1": "عائلة استفادت",
    "hero.stat2": "معدل النجاح",
    "hero.stat3": "سنوات خبرة",

    // Roadmap
    "roadmap.title": "خارطة الطريق",
    "roadmap.subtitle": "رحلة التحول المؤسسي",
    "roadmap.description":
      "ثلاث مراحل أساسية نرافقك فيها من التقييم حتى التميز",

    "stage.before": "مرحلة التقييم",
    "stage.before.subtitle": "اكتشف وضعك الحالي",
    "stage.during": "مرحلة التطبيق",
    "stage.during.subtitle": "برامج تدريبية مخصصة",
    "stage.after": "مرحلة التمكين",
    "stage.after.subtitle": "نقل المعرفة والاستدامة",

    "step1.title": "التقييم الأولي",
    "step1.description":
      "اختبار تشخيصي سريع يقيس مستوى الوعي المؤسسي لعائلتك، ويحدد احتياجاتكم الفعلية. ستحصل على تقرير تحليلي فوري معد من خبراء متخصصين.",
    "step1.cta": "ابدأ التقييم",
    "step1.duration": "15 دقيقة",

    "step2.title": "التقييم المؤسسي الشامل",
    "step2.description":
      "تحليل معمق لجميع جوانب إدارة الأعمال العائلية: الحوكمة، الهيكل التنظيمي، آليات اتخاذ القرار، وخطط التعاقب. يتطلب إكمال التقييم الأولي.",
    "step2.locked": "يتطلب إكمال التقييم الأولي",
    "step2.cta": "بدء التقييم الشامل",
    "step2.duration": "45 دقيقة",

    "step3.title": "العرض الفني والمالي",
    "step3.description":
      "بناءً على نتائج التقييمين، يقوم فريق من الخبراء بإعداد عرض مخصص يتضمن خطة عمل تفصيلية ومقترح مالي يناسب احتياجاتكم وميزانيتكم.",
    "step3.locked": "يتطلب إكمال التقييمين السابقين",
    "step3.output": "مخرج التقييمات",

    "step4.title": "البرنامج التدريبي المتخصص",
    "step4.description":
      "برنامج تدريبي مصمم خصيصاً لنمط إدارتكم، سواء كنتم في مرحلة الإدارة العشوائية، الاستبدادية، التقييم والتفويض، أو التحسين المستمر.",
    "step4.types": "أنماط الإدارة:",
    "step4.type1": "إدارة عشوائية",
    "step4.type2": "إدارة استبدادية",
    "step4.type3": "تقييم وتفويض",
    "step4.type4": "تحسين مستمر",

    "step5.title": "نقل المعرفة والتمكين",
    "step5.description":
      "المرحلة الختامية حيث نضمن استيعاب فريقكم لجميع المفاهيم والأدوات، مع توفير دعم مستمر لضمان الاستدامة والنجاح على المدى الطويل.",
    "step5.features":
      "ورش عمل تطبيقية • أدوات ونماذج جاهزة • دعم استشاري مستمر",

    // Assessment Page
    "assessment.badge": "الخطوة الأولى في رحلتك",
    "assessment.title": "التقييم الأولي للحوكمة العائلية",
    "assessment.subtitle":
      "اكتشف مستوى الوعي المؤسسي لعائلتك واحصل على تقرير تحليلي مخصص",
    "assessment.duration": "المدة المتوقعة",
    "assessment.durationValue": "15 دقيقة",
    "assessment.questions": "عدد الأسئلة",
    "assessment.questionsValue": "25 سؤال",
    "assessment.report": "التقرير",
    "assessment.reportValue": "فوري ومخصص",
    "assessment.feature1.title": "تقييم شامل",
    "assessment.feature1.desc":
      "أسئلة مصممة من خبراء في حوكمة الأعمال العائلية",
    "assessment.feature2.title": "تقرير تحليلي",
    "assessment.feature2.desc": "نتائج فورية مع توصيات مخصصة لوضعكم",
    "assessment.feature3.title": "خصوصية تامة",
    "assessment.feature3.desc": "بياناتكم محمية ولن تُشارك مع أي طرف",
    "assessment.feature4.title": "خارطة طريق",
    "assessment.feature4.desc": "خطة عمل واضحة للخطوات القادمة",
    "assessment.ready": "مستعد للبدء؟",
    "assessment.readyDesc":
      "ابدأ تقييمك الآن واحصل على رؤية واضحة لوضع عائلتك المؤسسي",
    "assessment.price": "ابدأ التقييم",
    "assessment.priceAmount": "$9",
    "assessment.originalPrice": "$29",
    "assessment.discount": "خصم 69%",
    "assessment.secure": "دفع آمن ومشفر",
    "assessment.families": "+500 عائلة",
    "assessment.rating": "4.9/5 تقييم",
    "assessment.badge1": "نتائج فورية",
    "assessment.badge2": "تقرير مفصل",
    "assessment.back": "العودة للرئيسية",
    "hero.badge": "رحلتك نحو التميز المؤسسي",
    "hero.title.line1": "حوكمة الأعمال",
    "hero.title.line2": "العائلية",
    "hero.feature1": "تقييم مؤسسي شامل",
    "hero.feature2": "برامج تدريبية متخصصة",
    "hero.feature3": "دعم استشاري مستمر",
    "hero.cta.primary": "ابدأ رحلة التحول",
    "hero.cta.secondary": "اكتشف المزيد",
    "hero.stat1.label": "عائلة استفادت",
    "hero.stat2.label": "سنوات خبرة",
    "hero.stat3.label": "خبير متخصص",
    "hero.growth": "نمو مؤسسي",
    "hero.chart.period": "آخر 12 شهراً",
    "hero.compliance": "معدل الامتثال",
    "hero.satisfaction": "رضا العملاء",
    "hero.efficiency": "الكفاءة",
    "hero.roi": "العائد على الاستثمار",
    // Footer
    "footer.cta.title": "مستعد لبدء رحلة التحول؟",
    "footer.cta.desc": "انضم لأكثر من 500 عائلة بدأت رحلتها نحو التميز المؤسسي",
    "footer.cta.button": "ابدأ الآن",
    "footer.about": "عن كرام",
    "footer.aboutDesc":
      "نساعد الأعمال العائلية على التحول من الإدارة التقليدية إلى الحوكمة المؤسسية المستدامة",
    "footer.links": "روابط سريعة",
    "footer.contact": "تواصل معنا",
    "footer.stats.families": "عائلة",
    "footer.stats.success": "نجاح",
    "footer.stats.experience": "سنوات خبرة",
    "footer.rights": "جميع الحقوق محفوظة",
    "footer.privacy": "سياسة الخصوصية",
    "footer.terms": "الشروط والأحكام",
  },
  en: {
    // Header
    "nav.home": "Home",
    "nav.roadmap": "Roadmap",
    "nav.about": "About Us",
    "nav.contact": "Contact",
    "nav.startJourney": "Start Your Journey",
    "form.title": "Organization Profile",
    "form.subtitle": "Required basic information",
    "form.fullName": "Full Name",
    "form.fullName.placeholder": "e.g. John Smith",
    "form.jobTitle": "Job Title",
    "form.jobTitle.placeholder": "e.g. Chief Executive Officer",
    "form.email": "Email Address",
    "form.email.placeholder": "ceo@family-office.com",
    "form.phone": "Phone Number",
    "form.phone.placeholder": "+1 xxx xxx xxxx",
    "form.companyName": "Company Name",
    "form.companyName.placeholder": "e.g. Smith Family Holdings",
    "form.companySize": "Organization Size",
    "form.companySize.placeholder": "Select size...",
    "form.size.small": "Small (under 50 employees)",
    "form.size.medium": "Medium (50-200 employees)",
    "form.size.large": "Large (200-1000 employees)",
    "form.size.enterprise": "Enterprise (1000+ employees)",
    "form.submit": "Activate Assessment System",
    "form.submitting": "Processing...",
    "form.note": "The form will open once all fields are completed",
    "form.close": "Close",
    // Hero
    "hero.subtitle": "Your Journey to Institutional Excellence",
    "hero.title1": "Family",
    "hero.title2": "Business",
    "hero.title3": "GRC",
    "hero.description":
      "We provide you with an integrated methodology and professional tools to transform your family business management from chaos to professionalism and sustainability",
    "hero.cta": "Start Your Transformation",
    "hero.learnMore": "Learn More",
    "hero.stat1": "Families Served",
    "hero.stat2": "Success Rate",
    "hero.stat3": "Years Experience",
    "hero.badge": "Your Journey to Institutional Excellence",
    "hero.title.line1": "Family Business",
    "hero.title.line2": "Governance",
    "hero.feature1": "Comprehensive institutional assessment",
    "hero.feature2": "Specialized training programs",
    "hero.feature3": "Ongoing consultancy support",
    "hero.cta.primary": "Start Your Transformation",
    "hero.cta.secondary": "Learn More",
    "hero.stat1.label": "Families Served",
    "hero.stat2.label": "Years Experience",
    "hero.stat3.label": "Expert Specialists",
    "hero.growth": "Institutional Growth",
    "hero.chart.period": "Last 12 months",
    "hero.compliance": "Compliance Rate",
    "hero.satisfaction": "Client Satisfaction",
    "hero.efficiency": "Efficiency",
    "hero.roi": "Return on Investment",
    // Roadmap
    "roadmap.title": "Roadmap",
    "roadmap.subtitle": "Institutional Transformation Journey",
    "roadmap.description":
      "Three essential phases we guide you through from assessment to excellence",

    "stage.before": "Assessment Phase",
    "stage.before.subtitle": "Discover your current state",
    "stage.during": "Implementation Phase",
    "stage.during.subtitle": "Customized training programs",
    "stage.after": "Empowerment Phase",
    "stage.after.subtitle": "Knowledge transfer & sustainability",

    "step1.title": "Initial Assessment",
    "step1.description":
      "A quick diagnostic test that measures your family's institutional awareness level and identifies your actual needs. You'll receive an instant analytical report prepared by specialized experts.",
    "step1.cta": "Start Assessment",
    "step1.duration": "15 minutes",

    "step2.title": "Comprehensive Institutional Assessment",
    "step2.description":
      "In-depth analysis of all aspects of family business management: governance, organizational structure, decision-making mechanisms, and succession plans. Requires completion of the initial assessment.",
    "step2.locked": "Requires completion of initial assessment",
    "step2.cta": "Start Comprehensive Assessment",
    "step2.duration": "45 minutes",

    "step3.title": "Technical & Financial Proposal",
    "step3.description":
      "Based on both assessment results, our expert team prepares a customized proposal including a detailed action plan and financial offer tailored to your needs and budget.",
    "step3.locked": "Requires completion of both assessments",
    "step3.output": "Assessment Output",

    "step4.title": "Specialized Training Program",
    "step4.description":
      "A training program designed specifically for your management style, whether you're in random management, autocratic, evaluation & delegation, or continuous improvement phase.",
    "step4.types": "Management Types:",
    "step4.type1": "Random Management",
    "step4.type2": "Autocratic Management",
    "step4.type3": "Evaluation & Delegation",
    "step4.type4": "Continuous Improvement",

    "step5.title": "Knowledge Transfer & Empowerment",
    "step5.description":
      "The final phase where we ensure your team fully understands all concepts and tools, with ongoing support to guarantee sustainability and long-term success.",
    "step5.features":
      "Practical workshops • Ready-to-use tools • Ongoing consultancy support",

    // Assessment Page
    "assessment.badge": "First Step in Your Journey",
    "assessment.title": "Initial Family Governance Assessment",
    "assessment.subtitle":
      "Discover your family's institutional awareness level and get a customized analytical report",
    "assessment.duration": "Expected Duration",
    "assessment.durationValue": "15 minutes",
    "assessment.questions": "Questions",
    "assessment.questionsValue": "25 questions",
    "assessment.report": "Report",
    "assessment.reportValue": "Instant & Customized",
    "assessment.feature1.title": "Comprehensive Assessment",
    "assessment.feature1.desc":
      "Questions designed by family business governance experts",
    "assessment.feature2.title": "Analytical Report",
    "assessment.feature2.desc":
      "Instant results with customized recommendations",
    "assessment.feature3.title": "Complete Privacy",
    "assessment.feature3.desc": "Your data is protected and never shared",
    "assessment.feature4.title": "Roadmap",
    "assessment.feature4.desc": "Clear action plan for next steps",
    "assessment.ready": "Ready to Start?",
    "assessment.readyDesc":
      "Begin your assessment now and get a clear vision of your family's institutional status",
    "assessment.price": "Start Assessment",
    "assessment.priceAmount": "$9",
    "assessment.originalPrice": "$29",
    "assessment.discount": "69% OFF",
    "assessment.secure": "Secure encrypted payment",
    "assessment.families": "500+ Families",
    "assessment.rating": "4.9/5 Rating",
    "assessment.badge1": "Instant Results",
    "assessment.badge2": "Detailed Report",
    "assessment.back": "Back to Home",

    // Footer
    "footer.cta.title": "Ready to Start Your Transformation?",
    "footer.cta.desc":
      "Join over 500 families who started their journey towards institutional excellence",
    "footer.cta.button": "Start Now",
    "footer.about": "About CRAM",
    "footer.aboutDesc":
      "We help family businesses transform from traditional management to sustainable institutional governance",
    "footer.links": "Quick Links",
    "footer.contact": "Contact Us",
    "footer.stats.families": "Families",
    "footer.stats.success": "Success",
    "footer.stats.experience": "Years Experience",
    "footer.rights": "All Rights Reserved",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms & Conditions",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, []);

  const t = useCallback(
    (key: string) => {
      return translations[language][key] || key;
    },
    [language],
  );

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
