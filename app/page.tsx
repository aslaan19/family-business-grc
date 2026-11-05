"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  LockKeyhole,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
} from "lucide-react";
import { JourneyShell, Reveal } from "./components/journey-shell";
import { useJourney } from "./lib/journey";
import { useLanguage } from "./lib/language-context";
export default function Home() {
  const { user, first, second, loading, error, refresh } = useJourney();
  const { dir, t } = useLanguage();
  const ar = dir === "rtl";
  const next = !user
    ? "/assessment"
    : !first
      ? "/assessment/Qs"
      : !second
        ? "/assessment2/form"
        : "/proposal";
  return (
    <JourneyShell step={!user ? 0 : !first ? 1 : !second ? 2 : 3}>
      <Reveal className="home-hero">
        <div className="home-intro">
          <span className="eyebrow">
            {ar
              ? "كرام للاستشارات / الأعمال العائلية"
              : "CRAM ADVISORY / FAMILY BUSINESSES"}
          </span>
          <h1>
            {ar ? (
              <>
                أعمال راسخة.
                <br />
                <em>مستقبل أوضح.</em>
              </>
            ) : (
              <>
                Built to last.
                <br />
                <em>Ready for what’s next.</em>
              </>
            )}
          </h1>
          <p>
            {ar
              ? "حوّل واقع منشأتك إلى رؤية واضحة للحوكمة والنمو. ابدأ بتقييمين مترابطين، وانطلق نحو خطة تناسب طموحاتك."
              : "Turn a clear view of your business into a better path forward. Two connected assessments. One proposal shaped around your ambitions."}
          </p>
          <div className="home-actions">
            <Link className="button-primary" href={next}>
              {user
                ? ar
                  ? "متابعة رحلتي"
                  : "Continue my journey"
                : ar
                  ? "ابدأ رحلة التقييم"
                  : "Start your assessment"}
              <ArrowUpRight size={18} />
            </Link>
            <a className="text-button" href="#journey">
              {ar ? "كيف تعمل الرحلة؟" : "How it works"}
              <ArrowRight size={16} className="direction-arrow" />
            </a>
          </div>
          <div className="hero-footnote">
            <ShieldCheck size={17} />
            <span>
              {ar
                ? "تقييم منظم · تقدم محفوظ · عرض مخصص"
                : "A guided assessment · Saved progress · A tailored proposal"}
            </span>
          </div>
        </div>
        <div className="home-feature">
          <span className="eyebrow">
            {ar ? "الاستدامة تبدأ من الداخل" : "CONTINUITY STARTS WITHIN"}
          </span>
          <div className="editorial-mark" aria-hidden="true">
            <div />
            <div />
            <div />
          </div>
          <h2>
            {ar
              ? "إرث يستمر. ومنشأة تتطور."
              : "Preserve the legacy. Build the business."}
          </h2>
          <p>
            {ar
              ? "نربط الحوكمة بواقع أعمالك، لتتخذ خطوتك القادمة بثقة."
              : "Governance grounded in the reality of your business. So your next decision moves you forward."}
          </p>
          <div className="feature-bottom">
            <span>01 — 03</span>
            <span>
              {ar ? "من التقييم إلى التنفيذ" : "FROM INSIGHT TO ACTION"}
            </span>
          </div>
        </div>
      </Reveal>
      <section id="journey" className="home-journey">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {ar ? "مسار واضح، من البداية" : "A CLEAR PATH, FROM THE START"}
            </span>
            <h2>
              {user
                ? ar
                  ? `رحلتك، ${user.fullName.split(" ")[0]}`
                  : `Your journey, ${user.fullName.split(" ")[0]}`
                : ar
                  ? "ثلاث خطوات. صورة متكاملة."
                  : "Three steps. The complete picture."}
            </h2>
          </div>
          <p>
            {ar
              ? "كل خطوة تفتح الباب لما بعدها."
              : "Each step opens the door to the next."}
          </p>
        </div>
        {loading && (
          <p role="status" className="form-note">
            {ar ? "جارٍ تحميل تقدمك…" : "Loading your progress…"}
          </p>
        )}
        {error && (
          <div className="error-message" role="alert">
            {ar ? "تعذر تحديث تقدمك." : "Your progress could not be refreshed."}
            <button className="text-button" onClick={refresh}>
              {ar ? "إعادة المحاولة" : "Try again"}
            </button>
          </div>
        )}
        <div className="journey-cards">
          {[
            {
              n: "01",
              icon: ShieldCheck,
              title: ar ? "تقييم الحوكمة" : "Governance assessment",
              desc: ar
                ? "اكتشف واقع الحوكمة عبر الهيكل، والشفافية، والمخاطر، والمساءلة."
                : "Understand your governance across structure, transparency, risk, and accountability.",
              done: first,
              locked: false,
              href: user ? "/assessment/Qs" : "/assessment",
              detail: ar
                ? "7 محاور · إجابات متعددة الخيارات"
                : "7 domains · Multiple choice",
            },
            {
              n: "02",
              icon: Building2,
              title: ar ? "التقييم المؤسسي" : "Institutional assessment",
              desc: ar
                ? "أكمل ملف منشأتك: أعمالها، فرقها، استراتيجيتها وأولوياتها."
                : "Complete the picture: your business, people, strategy, operations, and priorities.",
              done: second,
              locked: !first,
              href: "/assessment2/form",
              detail: ar
                ? "8 أقسام · ملف شامل للمنشأة"
                : "8 sections · Your business profile",
            },
            {
              n: "03",
              icon: FileText,
              title: ar ? "العرض المالي" : "Financial proposal",
              desc: ar
                ? "اطلب نطاق عمل وعرضاً مالياً مبنيين على نتائجك واحتياجاتك الفعلية."
                : "Request a scope of work and financial proposal informed by your results and needs.",
              done: false,
              locked: !first || !second,
              href: "/proposal",
              detail: ar ? "مخصص لأعمالك وأهدافك" : "Tailored to your business",
            },
          ].map((s) => (
            <article
              className={`journey-card ${s.locked ? "locked" : ""} ${s.done ? "complete" : ""}`}
              key={s.n}
            >
              <div className="journey-card-top">
                <s.icon size={24} strokeWidth={1.5} />
                <span>{s.n}</span>
              </div>
              <div className="card-status">
                {s.done ? (
                  <>
                    <Check size={13} />
                    {ar ? "مكتمل" : "COMPLETED"}
                  </>
                ) : s.locked ? (
                  <>
                    <LockKeyhole size={12} />
                    {ar
                      ? "يفتح بعد الخطوة السابقة"
                      : "UNLOCKS AFTER PREVIOUS STEP"}
                  </>
                ) : (
                  <>{ar ? "متاح الآن" : "READY WHEN YOU ARE"}</>
                )}
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <small>{s.detail}</small>
              <div className="journey-card-action">
                {s.locked ? (
                  <span>
                    <LockKeyhole size={15} />
                    {ar ? "مقفل حالياً" : "Currently locked"}
                  </span>
                ) : (
                  <Link href={s.href}>
                    {s.done
                      ? ar
                        ? "عرض الخطوة التالية"
                        : "View next step"
                      : ar
                        ? "ابدأ هذه الخطوة"
                        : "Start this step"}
                    <ArrowUpRight size={18} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="advisory-services" id="services">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {ar ? "خبرات تبني منظومتك" : "EXPERTISE FOR WHAT COMES NEXT"}
            </span>
            <h2>
              {ar
                ? "من التقييم، إلى الأثر."
                : "From assessment to lasting impact."}
            </h2>
          </div>
          <p>
            {ar
              ? "منظومة متكاملة من خدمات كرام."
              : "A connected set of CRAM advisory services."}
          </p>
        </div>
        <div className="service-columns">
          {[1, 2, 3, 4].map((category, index) => (
            <div key={category}>
              <span className="eyebrow">0{category}</span>
              <h3>{t(`products.cat${category}.title`)}</h3>
              <ul>
                {Array.from({ length: 5 }, (_, i) => (
                  <li key={i}>{t(`products.p${index * 5 + i + 1}.title`)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="home-closing" id="contact">
        <span className="eyebrow">CRAM CONSULTING</span>
        <h2>
          {ar ? "قرارات أفضل. أثر يدوم." : "Better decisions. Lasting impact."}
        </h2>
        <p>
          {ar
            ? "شريكك في بناء الحوكمة وإدارة المخاطر والامتثال للأعمال العائلية."
            : "Your partner in governance, risk management, and compliance for family businesses."}
        </p>
        <a className="text-button" href="mailto:gm@cram.sa">
          gm@cram.sa
          <ArrowUpRight size={16} />
        </a>
      </section>
    </JourneyShell>
  );
}
