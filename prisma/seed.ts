// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is not set");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type SeedQuestion = {
  categoryKey: string;
  categoryOrder: number;
  questionOrder: number;
  titleAr: string;
  titleEn: string;
  questionAr: string;
  questionEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
};

const questions: SeedQuestion[] = [
  // 1) الهيكل والحوكمة المؤسسية
  {
    categoryKey: "organizational-governance-structure",
    categoryOrder: 1,
    questionOrder: 1,
    titleAr: "الهيكل والحوكمة المؤسسية",
    titleEn: "Organizational Structure & Governance",
    questionAr: "هل يوجد هيكل تنظيمي واضح ومحدد للمؤسسة؟",
    questionEn: "Is there a clear and well-defined organizational structure for the institution?",
    descriptionAr:
      "وضوح الهيكل التنظيمي والصلاحيات يشير إلى وجود هيكل رسمي يوضح العلاقات بين الجهات الإدارية، وتسلسل السلطة، وتوزيع الأدوار بما يضمن عدم تعارض المصالح.",
    descriptionEn:
      "Clarity in organizational structure and authority means having a formal structure that defines relationships between administrative bodies, the chain of command, and role distribution in a way that helps avoid conflicts of interest.",
  },
  {
    categoryKey: "organizational-governance-structure",
    categoryOrder: 1,
    questionOrder: 2,
    titleAr: "الهيكل والحوكمة المؤسسية",
    titleEn: "Organizational Structure & Governance",
    questionAr: "هل مجلس الإدارة مستقل وفعال؟",
    questionEn: "Is the board of directors independent and effective?",
    descriptionAr:
      "استقلالية وفعالية مجلس الإدارة أو الجهة الإشرافية يتعلق بوجود مجلس يتمتع بالاستقلالية في اتخاذ القرار، مع تنوع في الخلفيات والاختصاصات، وقدرته على توجيه ومراقبة الأداء.",
    descriptionEn:
      "The independence and effectiveness of the board of directors or supervisory body relates to having a board that is independent in decision-making, diverse in backgrounds and expertise, and capable of guiding and overseeing performance.",
  },
  {
    categoryKey: "organizational-governance-structure",
    categoryOrder: 1,
    questionOrder: 3,
    titleAr: "الهيكل والحوكمة المؤسسية",
    titleEn: "Organizational Structure & Governance",
    questionAr: "هل توجد لجان متخصصة للحوكمة (مراجعة، مخاطر، ترشيحات)؟",
    questionEn: "Are there specialized governance committees (audit, risk, nominations)?",
    descriptionAr:
      "وجود لجان حوكمة فعالة (مراجعة، مخاطر، ترشيحات) يضمن أن اللجان الداعمة لمجلس الإدارة تقوم بدورها في مراجعة التقارير، تقييم المخاطر، والمساهمة في تعيين القيادات.",
    descriptionEn:
      "The presence of effective governance committees (audit, risk, nominations) ensures that board-supporting committees perform their role in reviewing reports, assessing risks, and contributing to leadership appointments.",
  },
  {
    categoryKey: "organizational-governance-structure",
    categoryOrder: 1,
    questionOrder: 4,
    titleAr: "الهيكل والحوكمة المؤسسية",
    titleEn: "Organizational Structure & Governance",
    questionAr: "هل تم تحديد واضح للصلاحيات والمسؤوليات بين القيادة والإدارة؟",
    questionEn: "Are authority and responsibilities clearly defined between leadership and management?",
    descriptionAr:
      "تحديد المهام والمسؤوليات بين الإدارة التنفيذية والإشرافية يضمن وضوح الحدود بين من يضع السياسات (القيادة) ومن ينفذها (الإدارة) لضمان المساءلة والفعالية.",
    descriptionEn:
      "Clearly defining responsibilities between executive management and oversight ensures a clear distinction between those who set policies (leadership) and those who implement them (management), supporting accountability and effectiveness.",
  },

  // 2) الشفافية والإفصاح
  {
    categoryKey: "transparency-disclosure",
    categoryOrder: 2,
    questionOrder: 1,
    titleAr: "الشفافية والإفصاح",
    titleEn: "Transparency & Disclosure",
    questionAr: "هل يتم نشر التقارير المالية وغير المالية بانتظام؟",
    questionEn: "Are financial and non-financial reports published regularly?",
    descriptionAr:
      "نشر التقارير المالية وغير المالية بانتظام تعكس ضرورة الإفصاح عن البيانات المالية وأداء المؤسسة الاجتماعي والبيئي لدعم ثقة أصحاب المصلحة.",
    descriptionEn:
      "Regular publication of financial and non-financial reports reflects the importance of disclosing financial data and the institution’s social and environmental performance in order to strengthen stakeholder trust.",
  },
  {
    categoryKey: "transparency-disclosure",
    categoryOrder: 2,
    questionOrder: 2,
    titleAr: "الشفافية والإفصاح",
    titleEn: "Transparency & Disclosure",
    questionAr: "هل توجد سياسة معلنة للإفصاح؟",
    questionEn: "Is there a published disclosure policy?",
    descriptionAr:
      "توفر سياسات إفصاح واضحة ومعلنة يشمل وجود آليات واضحة تحدد ما يجب الإفصاح عنه، وكيفية الإفصاح وتوقيته.",
    descriptionEn:
      "Having clear and publicly available disclosure policies includes clear mechanisms that specify what should be disclosed, how it should be disclosed, and when.",
  },
  {
    categoryKey: "transparency-disclosure",
    categoryOrder: 2,
    questionOrder: 3,
    titleAr: "الشفافية والإفصاح",
    titleEn: "Transparency & Disclosure",
    questionAr: "هل يمكن لأصحاب المصلحة الوصول للمعلومات الجوهرية؟",
    questionEn: "Can stakeholders access material information?",
    descriptionAr:
      "تمكين أصحاب المصلحة من الوصول إلى المعلومات الجوهرية يضمن الحق في الوصول إلى المعلومات التي تؤثر على حقوقهم أو قراراتهم مثل التغييرات التنظيمية أو المخاطر الكبرى.",
    descriptionEn:
      "Enabling stakeholders to access material information ensures their right to obtain information that may affect their rights or decisions, such as structural changes or major risks.",
  },

  // 3) الرقابة الداخلية وإدارة المخاطر
  {
    categoryKey: "internal-control-risk-management",
    categoryOrder: 3,
    questionOrder: 1,
    titleAr: "الرقابة الداخلية وإدارة المخاطر",
    titleEn: "Internal Control & Risk Management",
    questionAr: "هل يوجد نظام رقابة داخلية فعال؟",
    questionEn: "Is there an effective internal control system?",
    descriptionAr:
      "وجود نظام فعال للرقابة الداخلية يعني تطبيق آليات الرصد والانحرافات ومراجعة العمليات لضمان النزاهة والكفاءة.",
    descriptionEn:
      "Having an effective internal control system means applying monitoring mechanisms, tracking deviations, and reviewing processes to ensure integrity and efficiency.",
  },
  {
    categoryKey: "internal-control-risk-management",
    categoryOrder: 3,
    questionOrder: 2,
    titleAr: "الرقابة الداخلية وإدارة المخاطر",
    titleEn: "Internal Control & Risk Management",
    questionAr: "هل يتم تطبيق إدارة مخاطر مؤسسية شاملة؟",
    questionEn: "Is enterprise-wide risk management comprehensively implemented?",
    descriptionAr:
      "تطبيق إدارة المخاطر المؤسسية (ERM) تبني نهج شامل لتحديد، تحليل، تقييم، ومتابعة المخاطر التي قد تؤثر على تحقيق أهداف المؤسسة.",
    descriptionEn:
      "Implementing enterprise risk management (ERM) means adopting a comprehensive approach to identifying, analyzing, assessing, and monitoring risks that may affect the institution’s objectives.",
  },
  {
    categoryKey: "internal-control-risk-management",
    categoryOrder: 3,
    questionOrder: 3,
    titleAr: "الرقابة الداخلية وإدارة المخاطر",
    titleEn: "Internal Control & Risk Management",
    questionAr: "هل توجد سياسة فعالة لمكافحة الفساد والاحتيال؟",
    questionEn: "Is there an effective anti-corruption and anti-fraud policy?",
    descriptionAr:
      "وجود نظام لمكافحة الفساد والاحتيال يشمل سياسات وقنوات للإبلاغ عن الممارسات غير القانونية، وحماية المبلغين، والتعامل مع الانتهاكات.",
    descriptionEn:
      "An anti-corruption and anti-fraud framework includes policies and reporting channels for unlawful practices, protection for whistleblowers, and procedures for handling violations.",
  },
  {
    categoryKey: "internal-control-risk-management",
    categoryOrder: 3,
    questionOrder: 4,
    titleAr: "الرقابة الداخلية وإدارة المخاطر",
    titleEn: "Internal Control & Risk Management",
    questionAr: "هل يوجد نظام تدقيق داخلي وخارجي فعال؟",
    questionEn: "Is there an effective internal and external audit system?",
    descriptionAr:
      "وجود سياسة واضحة للتدقيق الداخلي والخارجي تأكيد على استقلال المراجعين الداخليين وتكامل عملهم مع المراجعين الخارجيين لضمان الشفافية.",
    descriptionEn:
      "A clear internal and external audit framework emphasizes the independence of internal auditors and the integration of their work with external auditors to ensure transparency.",
  },

  // 4) الامتثال والمساءلة
  {
    categoryKey: "compliance-accountability",
    categoryOrder: 4,
    questionOrder: 1,
    titleAr: "الامتثال والمساءلة",
    titleEn: "Compliance & Accountability",
    questionAr: "هل تلتزم المؤسسة بجميع القوانين واللوائح المعمول بها؟",
    questionEn: "Does the institution comply with all applicable laws and regulations?",
    descriptionAr:
      "التقيد بالقوانين واللوائح المحلية والدولية يشمل الالتزام بكافة الأنظمة القانونية ذات الصلة بنشاط المؤسسة، ومراقبة التغييرات التشريعية.",
    descriptionEn:
      "Compliance with local and international laws and regulations includes adherence to all legal requirements relevant to the institution’s activity and monitoring legislative changes.",
  },
  {
    categoryKey: "compliance-accountability",
    categoryOrder: 4,
    questionOrder: 2,
    titleAr: "الامتثال والمساءلة",
    titleEn: "Compliance & Accountability",
    questionAr: "هل توجد سياسة واضحة للمساءلة وصنع القرار؟",
    questionEn: "Is there a clear policy for accountability and decision-making?",
    descriptionAr:
      "وجود سياسات للمساءلة واتخاذ القرار تحديد من هو المسؤول عن ماذا، وتمكين الجهات الرقابية من محاسبة المسؤولين على أفعالهم وقراراتهم.",
    descriptionEn:
      "Policies for accountability and decision-making define who is responsible for what and enable oversight bodies to hold decision-makers accountable for their actions and decisions.",
  },
  {
    categoryKey: "compliance-accountability",
    categoryOrder: 4,
    questionOrder: 3,
    titleAr: "الامتثال والمساءلة",
    titleEn: "Compliance & Accountability",
    questionAr: "هل توجد آلية فعالة للتعامل مع الشكاوى والتظلمات؟",
    questionEn: "Is there an effective mechanism for handling complaints and grievances?",
    descriptionAr:
      "إنشاء آليات قنوات واضحة شفافة للتعامل مع الشكاوى والتظلمات والاعتراضات بطريقة عادلة وفعالة.",
    descriptionEn:
      "Establishing clear and transparent channels for handling complaints, grievances, and objections ensures they are addressed fairly and effectively.",
  },

  // 5) حقوق أصحاب المصلحة
  {
    categoryKey: "stakeholder-rights",
    categoryOrder: 5,
    questionOrder: 1,
    titleAr: "حقوق أصحاب المصلحة",
    titleEn: "Stakeholder Rights",
    questionAr: "هل يتم إشراك أصحاب المصلحة في صنع القرار؟",
    questionEn: "Are stakeholders involved in decision-making?",
    descriptionAr:
      "مشاركة أصحاب المصلحة في صنع القرار مثل إشراك الموظفين أو العملاء في الاستطلاعات أو اللجان الاستشارية أو جلسات الاستماع.",
    descriptionEn:
      "Stakeholder participation in decision-making may include involving employees or customers through surveys, advisory committees, or listening sessions.",
  },
  {
    categoryKey: "stakeholder-rights",
    categoryOrder: 5,
    questionOrder: 2,
    titleAr: "حقوق أصحاب المصلحة",
    titleEn: "Stakeholder Rights",
    questionAr: "هل تتم حماية حقوق الموظفين والعملاء والمجتمع؟",
    questionEn: "Are the rights of employees, customers, and the community protected?",
    descriptionAr:
      "حماية حقوق الموظفين والعملاء والمجتمع يشمل الالتزام بحقوق العمل، جودة الخدمة، والمساهمة المجتمعية.",
    descriptionEn:
      "Protecting the rights of employees, customers, and the community includes adherence to labor rights, service quality, and social contribution responsibilities.",
  },
  {
    categoryKey: "stakeholder-rights",
    categoryOrder: 5,
    questionOrder: 3,
    titleAr: "حقوق أصحاب المصلحة",
    titleEn: "Stakeholder Rights",
    questionAr: "هل توجد قنوات تواصل فعالة مع أصحاب المصلحة؟",
    questionEn: "Are there effective communication channels with stakeholders?",
    descriptionAr:
      "قنوات تواصل وتغذية راجعة توفير وسائل فعالة ومستدامة لتلقي الملاحظات والاستفادة منها في التطوير المؤسسي.",
    descriptionEn:
      "Communication and feedback channels provide effective and sustainable means of receiving stakeholder input and benefiting from it in institutional development.",
  },

  // 6) الأخلاقيات والسلوك المؤسسي
  {
    categoryKey: "ethics-institutional-conduct",
    categoryOrder: 6,
    questionOrder: 1,
    titleAr: "الأخلاقيات والسلوك المؤسسي",
    titleEn: "Ethics & Institutional Conduct",
    questionAr: "هل توجد مدونة سلوك مهني معتمدة ومعلنة؟",
    questionEn: "Is there an approved and published code of professional conduct?",
    descriptionAr:
      "وجود مدونة سلوك مهني معتمدة ومطبقة. وثيقة تنظم القيم والسلوكيات المتوقعة من الموظفين، مع آلية متابعة الالتزام بها.",
    descriptionEn:
      "An approved and implemented code of professional conduct is a document that regulates the values and expected behaviors of employees, along with a mechanism to monitor compliance.",
  },
  {
    categoryKey: "ethics-institutional-conduct",
    categoryOrder: 6,
    questionOrder: 2,
    titleAr: "الأخلاقيات والسلوك المؤسسي",
    titleEn: "Ethics & Institutional Conduct",
    questionAr: "هل يتم تعزيز ثقافة النزاهة والشفافية؟",
    questionEn: "Is a culture of integrity and transparency actively promoted?",
    descriptionAr:
      "تعزيز ثقافة النزاهة والشفافية برامج توعية، مكافآت السلوك الأخلاقي، والتصدي للانتهاكات بثبات وعدالة.",
    descriptionEn:
      "Promoting a culture of integrity and transparency involves awareness programs, rewarding ethical behavior, and addressing violations consistently and fairly.",
  },
  {
    categoryKey: "ethics-institutional-conduct",
    categoryOrder: 6,
    questionOrder: 3,
    titleAr: "الأخلاقيات والسلوك المؤسسي",
    titleEn: "Ethics & Institutional Conduct",
    questionAr: "هل يتم تقديم تدريب دوري على السلوك الأخلاقي؟",
    questionEn: "Is periodic training on ethical conduct provided?",
    descriptionAr:
      "برامج توعية وتدريب على السلوك الأخلاقي دورات تدريبية دورية لكل الفئات مع أمثلة واقعية وسياسات تطبيقية.",
    descriptionEn:
      "Awareness and training programs on ethical conduct include periodic sessions for all groups, supported by real examples and practical policies.",
  },

  // 7) الأداء والتحسين المستمر
  {
    categoryKey: "performance-continuous-improvement",
    categoryOrder: 7,
    questionOrder: 1,
    titleAr: "الأداء والتحسين المستمر",
    titleEn: "Performance & Continuous Improvement",
    questionAr: "هل يتم تقييم أداء مجلس الإدارة والإدارة العليا دوريًا؟",
    questionEn: "Is the performance of the board and senior management evaluated periodically?",
    descriptionAr:
      "تقييم قائم على مؤشرات أداء ومعايير مهنية محددة، ويستخدم في التطوير والتحسين.",
    descriptionEn:
      "Evaluation is based on performance indicators and defined professional criteria and is used to support development and improvement.",
  },
  {
    categoryKey: "performance-continuous-improvement",
    categoryOrder: 7,
    questionOrder: 2,
    titleAr: "الأداء والتحسين المستمر",
    titleEn: "Performance & Continuous Improvement",
    questionAr: "هل تتم مراجعة سياسات الحوكمة بشكل دوري؟",
    questionEn: "Are governance policies reviewed periodically?",
    descriptionAr:
      "مراجعة سياسات الحوكمة وتطويرها بشكل دوري يضمن بقاء السياسات متماشية مع التغيرات الداخلية والخارجية.",
    descriptionEn:
      "Periodic review and development of governance policies ensures that policies remain aligned with internal and external changes.",
  },
  {
    categoryKey: "performance-continuous-improvement",
    categoryOrder: 7,
    questionOrder: 3,
    titleAr: "الأداء والتحسين المستمر",
    titleEn: "Performance & Continuous Improvement",
    questionAr: "هل يتم ربط الحوكمة بالأداء المؤسسي فعليًا؟",
    questionEn: "Is governance effectively linked to institutional performance?",
    descriptionAr:
      "من خلال تقارير دورية تبين كيف تسهم الحوكمة في تحسين الكفاءة وتحقيق الأهداف.",
    descriptionEn:
      "This is demonstrated through periodic reports showing how governance contributes to improving efficiency and achieving objectives.",
  },
];

async function main() {
  for (const q of questions) {
    await prisma.assessmentQuestion.upsert({
      where: {
        categoryKey_questionOrder: {
          categoryKey: q.categoryKey,
          questionOrder: q.questionOrder,
        },
      },
      update: {
        categoryOrder: q.categoryOrder,
        titleAr: q.titleAr,
        titleEn: q.titleEn,
        questionAr: q.questionAr,
        questionEn: q.questionEn,
        descriptionAr: q.descriptionAr ?? null,
        descriptionEn: q.descriptionEn ?? null,
      },
      create: {
        categoryKey: q.categoryKey,
        categoryOrder: q.categoryOrder,
        questionOrder: q.questionOrder,
        titleAr: q.titleAr,
        titleEn: q.titleEn,
        questionAr: q.questionAr,
        questionEn: q.questionEn,
        descriptionAr: q.descriptionAr ?? null,
        descriptionEn: q.descriptionEn ?? null,
      },
    });
  }

  console.log(`✅ Seeded ${questions.length} assessment questions successfully.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });