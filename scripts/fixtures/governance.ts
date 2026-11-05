export type AnswerValue = 10 | 5 | 0;
interface Question {
  q: string;
  desc: string;
}
interface Category {
  num: number;
  title: string;
  questions: Question[];
}
export const CONTENT: Record<
  "ar" | "en",
  { meta: Record<string, string>; categories: Category[] }
> = {
  ar: {
    meta: {
      step1: "التسجيل",
      step2: "التقييم",
      step3: "النتيجة",
      title: "نموذج كرام لقياس الحوكمة",
      subtitle: "أجب على جميع الأسئلة لاستكمال التقييم",
      badge: "A | A",
      completed: "مكتمل",
      of: "من",
      questions: "أسئلة",
      next: "التالي",
      prev: "السابق",
      submit: "إرسال التقييم",
      submitting: "جاري الإرسال...",
      fillAll: "يرجى الإجابة على جميع أسئلة هذا القسم",
      yes: "نعم",
      partial: "جزئي",
      no: "لا",
      alreadyTitle: "لقد أكملت التقييم بالفعل!",
      alreadySub:
        "شكراً لك. يعمل فريق الخبراء لدينا على مراجعة إجاباتك وإعداد تقرير حوكمة مخصّص سيُرسل إليك قريباً.",
      alreadyEmail: "سيصلك التقرير على",
      totalScore: "إجمالي النقاط",
      totalQ: "إجمالي الأسئلة",
    },
    categories: [
      {
        num: 1,
        title: "الهيكل والحوكمة المؤسسية",
        questions: [
          {
            q: "هل يوجد هيكل تنظيمي واضح ومحدد للمؤسسة؟",
            desc: "وضوح الهيكل التنظيمي والصلاحيات يشير إلى وجود هيكل رسمي يوضح العلاقات بين الجهات الإدارية، وتسلسل السلطة، وتوزيع الأدوار بما يضمن عدم تعارض المصالح.",
          },
          {
            q: "هل مجلس الإدارة مستقل وفعال؟",
            desc: "استقلالية وفعالية مجلس الإدارة أو الجهة الإشرافية يتعلق بوجود مجلس يتمتع بالاستقلالية في اتخاذ القرار، مع تنوع في الخلفيات والاختصاصات.",
          },
          {
            q: "هل توجد لجان متخصصة للحوكمة (مراجعة، مخاطر، ترشيحات)؟",
            desc: "وجود لجان حوكمة فعالة يضمن أن اللجان الداعمة لمجلس الإدارة تقوم بدورها في مراجعة التقارير، تقييم المخاطر، والمساهمة في تعيين القيادات.",
          },
          {
            q: "هل تم تحديد واضح للصلاحيات والمسؤوليات بين القيادة والإدارة؟",
            desc: "تحديد المهام والمسؤوليات بين الإدارة التنفيذية والإشرافية يضمن وضوح الحدود بين من يضع السياسات ومن ينفذها.",
          },
        ],
      },
      {
        num: 2,
        title: "الشفافية والإفصاح",
        questions: [
          {
            q: "هل يتم نشر التقارير المالية وغير المالية بانتظام؟",
            desc: "نشر التقارير المالية وغير المالية بانتظام تعكس ضرورة الإفصاح عن البيانات المالية وأداء المؤسسة الاجتماعي والبيئي لدعم ثقة أصحاب المصلحة.",
          },
          {
            q: "هل توجد سياسة معلنة للإفصاح؟",
            desc: "توفر سياسات إفصاح واضحة ومعلنة يشمل وجود آليات واضحة تحدد ما يجب الإفصاح عنه، وكيفية الإفصاح وتوقيته.",
          },
          {
            q: "هل يمكن لأصحاب المصلحة الوصول للمعلومات الجوهرية؟",
            desc: "تمكين أصحاب المصلحة من الوصول إلى المعلومات الجوهرية يضمن الحق في الوصول إلى المعلومات التي تؤثر على حقوقهم أو قراراتهم.",
          },
        ],
      },
      {
        num: 3,
        title: "الرقابة الداخلية وإدارة المخاطر",
        questions: [
          {
            q: "هل يوجد نظام رقابة داخلية فعال؟",
            desc: "وجود نظام فعال للرقابة الداخلية يعني تطبيق آليات الرصد والانحرافات ومراجعة العمليات لضمان النزاهة والكفاءة.",
          },
          {
            q: "هل يتم تطبيق إدارة مخاطر مؤسسية شاملة؟",
            desc: "تطبيق إدارة المخاطر المؤسسية (ERM) تبني نهج شامل لتحديد، تحليل، تقييم، ومتابعة المخاطر.",
          },
          {
            q: "هل توجد سياسة فعالة لمكافحة الفساد والاحتيال؟",
            desc: "وجود نظام لمكافحة الفساد والاحتيال يشمل سياسات وقنوات للإبلاغ عن الممارسات غير القانونية، وحماية المبلغين.",
          },
          {
            q: "هل يوجد نظام تدقيق داخلي وخارجي فعال؟",
            desc: "وجود سياسة واضحة للتدقيق الداخلي والخارجي تأكيد على استقلال المراجعين الداخليين وتكامل عملهم مع المراجعين الخارجيين.",
          },
        ],
      },
      {
        num: 4,
        title: "الامتثال والمساءلة",
        questions: [
          {
            q: "هل تلتزم المؤسسة بجميع القوانين واللوائح المعمول بها؟",
            desc: "التقيد بالقوانين واللوائح المحلية والدولية يشمل الالتزام بكافة الأنظمة القانونية ذات الصلة بنشاط المؤسسة.",
          },
          {
            q: "هل توجد سياسة واضحة للمساءلة وصنع القرار؟",
            desc: "وجود سياسات للمساءلة واتخاذ القرار تحديد من هو المسؤول عن ماذا، وتمكين الجهات الرقابية من محاسبة المسؤولين.",
          },
          {
            q: "هل توجد آلية فعالة للتعامل مع الشكاوى والتظلمات؟",
            desc: "إنشاء آليات قنوات واضحة شفافة للتعامل مع الشكاوى والتظلمات والاعتراضات بطريقة عادلة وفعالة.",
          },
        ],
      },
      {
        num: 5,
        title: "حقوق أصحاب المصلحة",
        questions: [
          {
            q: "هل يتم إشراك أصحاب المصلحة في صنع القرار؟",
            desc: "مشاركة أصحاب المصلحة في صنع القرار مثل إشراك الموظفين أو العملاء في الاستطلاعات أو اللجان الاستشارية أو جلسات الاستماع.",
          },
          {
            q: "هل تتم حماية حقوق الموظفين والعملاء والمجتمع؟",
            desc: "حماية حقوق الموظفين والعملاء والمجتمع يشمل الالتزام بحقوق العمل، جودة الخدمة، والمساهمة المجتمعية.",
          },
          {
            q: "هل توجد قنوات تواصل فعالة مع أصحاب المصلحة؟",
            desc: "قنوات تواصل وتغذية راجعة توفير وسائل فعالة ومستدامة لتلقي الملاحظات والاستفادة منها في التطوير المؤسسي.",
          },
        ],
      },
      {
        num: 6,
        title: "الأخلاقيات والسلوك المؤسسي",
        questions: [
          {
            q: "هل توجد مدونة سلوك مهني معتمدة ومعلنة؟",
            desc: "وجود مدونة سلوك مهني معتمدة ومطبقة، وثيقة تنظم القيم والسلوكيات المتوقعة من الموظفين مع آلية متابعة الالتزام بها.",
          },
          {
            q: "هل يتم تعزيز ثقافة النزاهة والشفافية؟",
            desc: "تعزيز ثقافة النزاهة والشفافية برامج توعية، مكافآت السلوك الأخلاقي، والتصدي للانتهاكات بثبات وعدالة.",
          },
          {
            q: "هل يتم تقديم تدريب دوري على السلوك الأخلاقي؟",
            desc: "برامج توعية وتدريب على السلوك الأخلاقي دورات تدريبية دورية لكل الفئات مع أمثلة واقعية وسياسات تطبيقية.",
          },
        ],
      },
      {
        num: 7,
        title: "الأداء والتحسين المستمر",
        questions: [
          {
            q: "هل يتم تقييم أداء مجلس الإدارة والإدارة العليا دوريًا؟",
            desc: "تقييم قائم على مؤشرات أداء ومعايير مهنية محددة، ويستخدم في التطوير والتحسين.",
          },
          {
            q: "هل تتم مراجعة سياسات الحوكمة بشكل دوري؟",
            desc: "مراجعة سياسات الحوكمة وتطويرها بشكل دوري يضمن بقاء السياسات متماشية مع التغيرات الداخلية والخارجية.",
          },
          {
            q: "هل يتم ربط الحوكمة بالأداء المؤسسي فعليًا؟",
            desc: "من خلال تقارير دورية تبين كيف تسهم الحوكمة في تحسين الكفاءة وتحقيق الأهداف.",
          },
        ],
      },
    ],
  },
  en: {
    meta: {
      step1: "Register",
      step2: "Assessment",
      step3: "Results",
      title: "KARAM Governance Assessment",
      subtitle: "Answer all questions to complete the assessment",
      badge: "A | A",
      completed: "completed",
      of: "of",
      questions: "questions",
      next: "Next",
      prev: "Previous",
      submit: "Submit Assessment",
      submitting: "Submitting...",
      fillAll: "Please answer all questions in this section",
      yes: "Yes",
      partial: "Partial",
      no: "No",
      alreadyTitle: "You've already completed the assessment!",
      alreadySub:
        "Our expert team is reviewing your answers and preparing a customised governance report that will be sent to you shortly.",
      alreadyEmail: "Your report will be sent to",
      totalScore: "Total Score",
      totalQ: "Total Questions",
    },
    categories: [
      {
        num: 1,
        title: "Organizational Structure & Governance",
        questions: [
          {
            q: "Is there a clear and defined organizational structure?",
            desc: "Clarity of organizational structure and authority refers to having a formal structure that clarifies relationships between administrative bodies, chain of command, and role distribution.",
          },
          {
            q: "Is the Board of Directors independent and effective?",
            desc: "Independence and effectiveness of the Board relates to having a board that exercises independence in decision-making, with diversity in backgrounds and competencies.",
          },
          {
            q: "Are there specialized governance committees (audit, risk, nominations)?",
            desc: "Having effective governance committees ensures that supporting committees review reports, assess risks, and contribute to appointing leadership.",
          },
          {
            q: "Are roles and responsibilities clearly defined between leadership and management?",
            desc: "Clear delineation between executive and supervisory roles ensures clarity on who sets policy and who implements it.",
          },
        ],
      },
      {
        num: 2,
        title: "Transparency & Disclosure",
        questions: [
          {
            q: "Are financial and non-financial reports published regularly?",
            desc: "Regular publication reflects the necessity of disclosing financial data and institutional social and environmental performance to build stakeholder trust.",
          },
          {
            q: "Is there a publicly announced disclosure policy?",
            desc: "Having clear and announced disclosure policies includes mechanisms that specify what must be disclosed, how to disclose it, and the timing.",
          },
          {
            q: "Can stakeholders access material information?",
            desc: "Enabling stakeholders to access material information ensures the right to access information that affects their rights or decisions.",
          },
        ],
      },
      {
        num: 3,
        title: "Internal Controls & Risk Management",
        questions: [
          {
            q: "Is there an effective internal control system?",
            desc: "An effective internal control system means applying monitoring mechanisms, deviation detection, and process reviews to ensure integrity and efficiency.",
          },
          {
            q: "Is comprehensive Enterprise Risk Management (ERM) applied?",
            desc: "Implementing ERM involves adopting a comprehensive approach to identify, analyze, assess, and monitor risks.",
          },
          {
            q: "Is there an effective anti-corruption and fraud policy?",
            desc: "An anti-corruption system includes policies and channels for reporting illegal practices, whistleblower protection, and handling violations.",
          },
          {
            q: "Is there an effective internal and external audit system?",
            desc: "A clear audit policy emphasizes the independence of internal auditors and integration with external auditors to ensure transparency.",
          },
        ],
      },
      {
        num: 4,
        title: "Compliance & Accountability",
        questions: [
          {
            q: "Does the institution comply with all applicable laws and regulations?",
            desc: "Adherence to local and international laws includes compliance with all legal systems relevant to institutional activities.",
          },
          {
            q: "Is there a clear accountability and decision-making policy?",
            desc: "Having accountability policies defines who is responsible for what, enabling regulatory bodies to hold officials accountable.",
          },
          {
            q: "Is there an effective grievance and complaint mechanism?",
            desc: "Establishing clear, transparent channels to handle complaints, grievances, and objections in a fair and effective manner.",
          },
        ],
      },
      {
        num: 5,
        title: "Stakeholder Rights",
        questions: [
          {
            q: "Are stakeholders engaged in decision-making?",
            desc: "Stakeholder participation such as involving employees or customers in surveys, advisory committees, or listening sessions.",
          },
          {
            q: "Are the rights of employees, customers, and community protected?",
            desc: "Protecting rights includes commitment to labor rights, service quality, and community contribution.",
          },
          {
            q: "Are there effective communication channels with stakeholders?",
            desc: "Communication channels provide effective and sustainable means to receive feedback and use it in institutional development.",
          },
        ],
      },
      {
        num: 6,
        title: "Ethics & Institutional Conduct",
        questions: [
          {
            q: "Is there an approved and announced professional code of conduct?",
            desc: "An approved code of conduct regulates the values and behaviors expected of employees, with a mechanism to monitor compliance.",
          },
          {
            q: "Is a culture of integrity and transparency promoted?",
            desc: "Promoting a culture through awareness programs, ethical behavior rewards, and steadfast response to violations.",
          },
          {
            q: "Is periodic training on ethical conduct provided?",
            desc: "Awareness and training programs are periodic training courses for all categories with real-life examples and application policies.",
          },
        ],
      },
      {
        num: 7,
        title: "Performance & Continuous Improvement",
        questions: [
          {
            q: "Is the performance of the Board and senior management evaluated periodically?",
            desc: "Periodic evaluation based on KPIs and professional standards, used for development and improvement.",
          },
          {
            q: "Are governance policies reviewed periodically?",
            desc: "Periodic review of governance policies ensures they remain aligned with internal and external changes.",
          },
          {
            q: "Is governance effectively linked to institutional performance?",
            desc: "Linking governance to institutional performance through periodic reports showing how governance improves efficiency.",
          },
        ],
      },
    ],
  },
};
