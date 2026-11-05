"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Building2,
  FileText,
  Globe2,
  Sparkles,
  Network,
  Compass,
  Pause,
  Play,
  ChevronDown,
  Leaf,
  Layers3,
} from "lucide-react";
import { useJourney } from "./lib/journey";
import { useLanguage } from "./lib/language-context";
import "./home.css";

type Chapter = {
  title: string;
  short: string;
  subtitle: string;
  description: string;
  outcome: string;
  tags: string[];
  href: string;
  locked: boolean;
  done: boolean;
  icon: typeof ShieldCheck;
  image?: string;
};

function Entrance({
  children,
  className,
  delay = 0,
  still = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  still?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={still ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function LegacyTree() {
  return (
    <svg
      className="legacy-tree"
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M100 167V77M100 122L62 89M100 111L139 77M100 92L80 62M100 139L143 111M100 147L63 119M82 182L100 167L120 182M100 167V187"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {[
        [100, 48],
        [74, 57],
        [51, 78],
        [40, 104],
        [57, 118],
        [78, 100],
        [121, 57],
        [146, 71],
        [157, 95],
        [145, 117],
        [120, 101],
        [101, 75],
      ].map(([x, y], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx={i % 2 ? 10 : 8}
          ry={i % 2 ? 16 : 12}
          transform={`rotate(${i % 2 ? -35 : 35} ${x} ${y})`}
          fill="currentColor"
          opacity={0.55 + (i % 3) * 0.15}
        />
      ))}
      <path
        d="M62 188Q100 180 139 188"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function JourneyMap({
  chapters,
  current,
  ar,
  still,
}: {
  chapters: Chapter[];
  current: number;
  ar: boolean;
  still: boolean;
}) {
  const [preview, setPreview] = useState<number | null>(null);
  const selected = preview ?? current;
  const chapter = chapters[selected];
  const Icon = chapter.icon;
  return (
    <div
      className="legacy-map"
      aria-label={ar ? "خريطة رحلة التقييم" : "Your assessment journey map"}
    >
      <div className="map-heading">
        <span>
          <i />
          {ar ? "رحلتك نحو إرث مستدام" : "YOUR PATH TO A LASTING LEGACY"}
        </span>
        <span dir="ltr">CRAM / 01—03</span>
      </div>
      <div className="map-world">
        <div className="map-orbit orbit-one" />
        <div className="map-orbit orbit-two" />
        <div className="map-grid" />
        <div className="map-tree">
          <LegacyTree />
          <span>
            {ar ? "إرثك، ننمّيه معاً" : "YOUR LEGACY. OUR SHARED PURPOSE."}
          </span>
        </div>
        <svg
          className="map-route"
          viewBox="0 0 600 450"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="route-base"
            d="M120 340C120 250 460 310 460 200S180 200 180 75"
          />
          <motion.path
            className="route-drawn"
            d="M120 340C120 250 460 310 460 200S180 200 180 75"
            initial={still ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.4 }}
          />
          <path
            className="route-traveller"
            d="M120 340C120 250 460 310 460 200S180 200 180 75"
          />
        </svg>
        {chapters.map((c, i) => (
          <button
            key={c.title}
            type="button"
            className={`map-stop stop-${i} ${selected === i ? "selected" : ""} ${c.done ? "done" : ""} ${c.locked ? "locked" : ""}`}
            onClick={() => setPreview(i)}
            aria-pressed={selected === i}
            aria-label={`${ar ? "استكشف" : "Explore"} ${c.title}${c.locked ? (ar ? "، مقفل" : ", locked") : ""}`}
          >
            <span className="stop-symbol">
              {c.done ? (
                <Check size={19} />
              ) : c.locked ? (
                <LockKeyhole size={17} />
              ) : (
                <c.icon size={21} />
              )}
              <small dir="ltr">0{i + 1}</small>
            </span>
            <span className="stop-label">
              {c.short}
              <small>
                {c.done
                  ? ar
                    ? "مكتمل"
                    : "COMPLETED"
                  : i === current
                    ? ar
                      ? "أنت هنا"
                      : "YOU ARE HERE"
                    : ar
                      ? "محطتك القادمة"
                      : "COMING UP"}
              </small>
            </span>
          </button>
        ))}
        <span className="map-coordinate coordinate-one" dir="ltr">
          24° N · 46° E
        </span>
        <Compass className="map-compass" size={34} strokeWidth={1} />
        <span className="map-spark spark-one" />
        <span className="map-spark spark-two" />
        <span className="map-spark spark-three" />
      </div>
      <div className="map-preview" aria-live="polite">
        <span className="map-preview-icon">
          <Icon size={22} />
        </span>
        <div>
          <span className="mini-label">
            {ar ? `المحطة ${selected + 1}` : `CHAPTER 0${selected + 1}`}
          </span>
          <h3>{chapter.title}</h3>
          <p>
            {chapter.locked
              ? selected === 1
                ? ar
                  ? "أكمل تقييم الحوكمة لتفتح هذه المحطة."
                  : "Complete governance to unlock this chapter."
                : ar
                  ? "أكمل التقييمين لتصل إلى عرضك المالي."
                  : "Complete both assessments to reach your proposal."
              : chapter.outcome}
          </p>
        </div>
        <span className="map-preview-state">
          {chapter.done ? (
            <CheckCircle2 size={18} />
          ) : chapter.locked ? (
            <LockKeyhole size={17} />
          ) : (
            <ArrowUpRight size={19} />
          )}
        </span>
      </div>
      <div className="map-footnote">
        <span>
          {ar ? "اختر محطة لاستكشافها" : "SELECT A CHAPTER TO EXPLORE"}
        </span>
        <span>
          <i />
          {ar ? "كل خطوة تفتح التالية" : "CONNECTED. SEQUENTIAL. YOURS."}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, first, second, loading, error, refresh } = useJourney();
  const { dir, t, toggleLanguage } = useLanguage();
  const ar = dir === "rtl";
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const still = paused || !!reduced;
  const current = !first ? 0 : !second ? 1 : 2;
  const next = !user
    ? "/assessment"
    : !first
      ? "/assessment/Qs"
      : !second
        ? "/assessment2/form"
        : "/proposal";
  const chapters: Chapter[] = [
    {
      title: ar ? "تقييم الحوكمة" : "Governance assessment",
      short: ar ? "نفهم واقعك" : "Discover",
      subtitle: ar
        ? "البداية · اكتشف أساسك"
        : "THE FOUNDATION · DISCOVER WHERE YOU STAND",
      description: ar
        ? "كل رحلة مؤثرة تبدأ بفهم واضح. اكتشف مستوى الحوكمة في منشأتك، وحدد نقاط القوة وفرص التطوير عبر سبعة محاور مترابطة."
        : "Every meaningful journey starts with a clear picture. Explore your business’s governance, uncover its strengths, and find opportunities across seven connected domains.",
      outcome: ar
        ? "تفتح لك الخطوة التالية: التقييم المؤسسي."
        : "Your next chapter unlocks: the institutional assessment.",
      tags: ar
        ? ["7 محاور", "خيارات واضحة", "تقدم محفوظ"]
        : ["7 governance domains", "Guided questions", "Saved progress"],
      href: user ? "/assessment/Qs" : "/assessment",
      locked: false,
      done: first,
      icon: ShieldCheck,
      image: "/images/assessment1.png",
    },
    {
      title: ar ? "التقييم المؤسسي" : "Institutional assessment",
      short: ar ? "نكمل الصورة" : "Connect",
      subtitle: ar
        ? "العمق · نربط كل التفاصيل"
        : "THE BIGGER PICTURE · CONNECT THE DETAILS",
      description: ar
        ? "حوكمتك هي البداية. الآن نربطها باستراتيجيتك وفرقك وعملياتك ومخاطرك، لنبني صورة متكاملة تعبّر عن منشأتك واحتياجاتها الحقيقية."
        : "Governance is the beginning. Connect it to your strategy, people, operations, and risks to build a complete picture of your business and what it needs next.",
      outcome: ar
        ? "بإكماله، تصبح جاهزاً لطلب العرض المالي."
        : "Complete this chapter to unlock your financial proposal.",
      tags: ar
        ? ["8 أقسام مترابطة", "ملف منشأتك", "أولوياتك القادمة"]
        : [
            "8 connected sections",
            "Your business profile",
            "Your next priorities",
          ],
      href: "/assessment2/form",
      locked: !first,
      done: second,
      icon: Building2,
      image: "/images/assessment2.png",
    },
    {
      title: ar ? "عرضك المالي المخصص" : "Your tailored proposal",
      short: ar ? "نرسم خطوتك" : "Move forward",
      subtitle: ar
        ? "الانطلاق · من التقييم إلى الأثر"
        : "THE NEXT CHAPTER · FROM INSIGHT TO ACTION",
      description: ar
        ? "هنا تتحول إجاباتك إلى خطوة عملية. يراجع فريق كرام التقييمين ليصمّم نطاق عمل وأتعاباً تتناسب مع أولوياتك وطموح منشأتك."
        : "This is where your answers become a practical next step. The CRAM team reviews both assessments to shape a scope of work and fees around your business’s priorities and ambitions.",
      outcome: ar
        ? "عرض واضح. خطة تناسبك. وشريك للخطوة القادمة."
        : "A clear proposal. A relevant plan. A partner for what comes next.",
      tags: ar
        ? ["نطاق عمل مخصص", "أتعاب واضحة", "نسخة PDF"]
        : ["Tailored scope", "Clear professional fees", "Downloadable PDF"],
      href: "/proposal",
      locked: !first || !second,
      done: false,
      icon: FileText,
    },
  ];
  return (
    <MotionConfig reducedMotion={still ? "always" : "user"}>
      <div
        className="cram-home"
        dir={dir}
        data-motion={still ? "paused" : "running"}
      >
        <header className="exp-header">
          <div className="exp-header-inner">
            <Link href="/" className="exp-brand">
              <Image
                src="/images/logo.png"
                alt="CRAM"
                width={48}
                height={48}
                priority
              />
              <span>
                <strong>
                  CRAM<span>.</span>
                </strong>
                <small>
                  {ar ? "كرام للاستشارات" : "FAMILY BUSINESS ADVISORY"}
                </small>
              </span>
            </Link>
            <nav aria-label={ar ? "التنقل الرئيسي" : "Main navigation"}>
              <a href="#roadmap">{ar ? "رحلتك" : "Your journey"}</a>
              <a href="#services">{ar ? "خبراتنا" : "Our expertise"}</a>
              <a href="#contact">{ar ? "تواصل معنا" : "Get in touch"}</a>
            </nav>
            <div className="exp-header-actions">
              <button className="home-language" onClick={toggleLanguage}>
                <Globe2 size={16} />
                {ar ? "English" : "العربية"}
              </button>
              <Link className="exp-header-cta" href={next}>
                {user
                  ? ar
                    ? "متابعة رحلتي"
                    : "Resume journey"
                  : ar
                    ? "ابدأ رحلتك"
                    : "Begin your journey"}
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </header>
        <main id="main-content">
          <section className="exp-hero">
            <div className="hero-aurora aurora-one" />
            <div className="hero-aurora aurora-two" />
            <div className="hero-contours" aria-hidden="true" />
            <div className="exp-hero-inner">
              <Entrance className="exp-hero-copy" still={still}>
                <div className="exp-kicker">
                  <span />
                  <span>
                    {ar
                      ? "جذور راسخة. آفاق بلا حدود."
                      : "STRONG ROOTS. LIMITLESS HORIZONS."}
                  </span>
                </div>
                <h1>
                  {ar ? (
                    <>
                      حوكمة الأعمال
                      <br />
                      <span>
                        العائلية<span className="title-star">✦</span>
                      </span>
                    </>
                  ) : (
                    <>
                      Family business.
                      <br />
                      <span>
                        Governance for
                        <br />
                        generations<span className="title-star">✦</span>
                      </span>
                    </>
                  )}
                </h1>
                <p className="exp-hero-description">
                  {ar
                    ? "إرثك يستحق أكثر من خطوة عابرة. انطلق في رحلة متكاملة، من فهم واقع منشأتك إلى بناء مستقبلها. كل تقييم يكمل الآخر، وكل خطوة تقرّبك من هدفك."
                    : "Your legacy deserves a clear path forward. Begin a connected journey from understanding your business to shaping its future. Each assessment builds on the last."}
                </p>
                <div className="exp-hero-cta">
                  <Link href={next} className="exp-button-gold">
                    {user
                      ? ar
                        ? "لنُكمل رحلتك"
                        : "Continue your journey"
                      : ar
                        ? "ابدأ رحلتك الآن"
                        : "Start your journey"}
                    <ArrowRight size={19} className="exp-arrow" />
                  </Link>
                  <a href="#roadmap" className="exp-button-outline">
                    {ar ? "استكشف المسار" : "Explore the path"}
                    <ArrowDown size={17} />
                  </a>
                </div>
                <div className="exp-hero-proof">
                  <div className="proof-symbols">
                    <ShieldCheck />
                    <Network />
                    <Leaf />
                  </div>
                  <p>
                    {ar
                      ? "تقييمان متكاملان. رؤية واحدة. مستقبل مستدام."
                      : "Two connected assessments. One vision. A lasting future."}
                  </p>
                </div>
              </Entrance>
              <Entrance className="exp-hero-visual" delay={0.15} still={still}>
                <JourneyMap
                  chapters={chapters}
                  current={current}
                  ar={ar}
                  still={still}
                />
              </Entrance>
            </div>
            <div className="hero-bottom">
              <a href="#roadmap">
                <span className="scroll-capsule">
                  <ChevronDown size={17} />
                </span>
                {ar ? "رحلتك تبدأ من هنا" : "YOUR JOURNEY STARTS HERE"}
              </a>
              <span className="hero-bottom-line" />
              <button
                onClick={() => setPaused((v) => !v)}
                aria-pressed={still}
                disabled={!!reduced}
                className="motion-toggle"
              >
                {still ? <Play size={12} /> : <Pause size={12} />}{" "}
                {reduced
                  ? ar
                    ? "حركة مخففة"
                    : "Reduced motion"
                  : paused
                    ? ar
                      ? "تشغيل الحركة"
                      : "Play motion"
                    : ar
                      ? "إيقاف الحركة"
                      : "Pause motion"}
              </button>
            </div>
          </section>
          <div className="exp-values">
            {[
              {
                icon: ShieldCheck,
                title: ar ? "حوكمة أوضح" : "Clearer governance",
              },
              {
                icon: Network,
                title: ar ? "منظومة مترابطة" : "A connected business",
              },
              {
                icon: Leaf,
                title: ar ? "إرث أكثر استدامة" : "A lasting legacy",
              },
            ].map(({ icon: Icon, title }) => (
              <div key={title}>
                <Icon size={21} strokeWidth={1.4} />
                <span>{title}</span>
                <i>✦</i>
              </div>
            ))}
          </div>
          <section className="exp-roadmap" id="roadmap">
            <span id="journey" className="anchor-alias" />
            <Entrance className="exp-section-heading" still={still}>
              <span className="exp-overline">
                <span />
                {ar
                  ? "مسار واحد، كل مراحله متصلة"
                  : "ONE PATH. EVERY CHAPTER CONNECTED."}
                <span />
              </span>
              <h2>
                {ar ? (
                  <>
                    رحلة تبني <em>مستقبلك.</em>
                  </>
                ) : (
                  <>
                    A journey built around <em>your future.</em>
                  </>
                )}
              </h2>
              <p>
                {ar
                  ? "لا قفزات، ولا خطوات مبهمة. نرافقك من أول إجابة حتى عرضك المخصص."
                  : "No missing steps. A clear connection from your first answer to your tailored proposal."}
              </p>
            </Entrance>
            <div className="exp-progress-panel">
              <div>
                <span className="progress-emblem">
                  <Compass size={24} />
                </span>
                <div>
                  <strong>
                    {user
                      ? ar
                        ? `أهلاً ${user.fullName.split(" ")[0]}، هذا مسارك`
                        : `${user.fullName.split(" ")[0]}, this is your path`
                      : ar
                        ? "كل رحلة عظيمة تبدأ بخطوة"
                        : "Every great journey starts with a first step"}
                  </strong>
                  <p>
                    {loading
                      ? ar
                        ? "جارٍ تحميل تقدمك…"
                        : "Loading your progress…"
                      : second
                        ? ar
                          ? "اكتمل التقييمان. حان وقت خطوتك القادمة."
                          : "Both assessments complete. Your next chapter awaits."
                        : first
                          ? ar
                            ? "أكملت الحوكمة! التقييم المؤسسي متاح الآن."
                            : "Governance complete! Your institutional assessment is unlocked."
                          : ar
                            ? "ابدأ بتقييم الحوكمة، ثم افتح المحطة التالية."
                            : "Start with governance, then unlock your next chapter."}
                  </p>
                </div>
              </div>
              <div className="exp-progress-numbers">
                <span dir="ltr">
                  <strong>{Number(first) + Number(second)}</strong> / 2
                </span>
                <small>{ar ? "تقييمات مكتملة" : "ASSESSMENTS COMPLETE"}</small>
              </div>
              <div className="exp-overall-track">
                <span
                  style={{ width: `${(Number(first) + Number(second)) * 50}%` }}
                />
              </div>
            </div>
            {error && (
              <div role="alert" className="exp-load-error">
                {ar
                  ? "تعذر تحديث تقدمك."
                  : "We could not refresh your progress."}
                <button onClick={refresh}>
                  {ar ? "إعادة المحاولة" : "Try again"}
                </button>
              </div>
            )}
            <div className="exp-chapters">
              {chapters.map((c, i) => (
                <div
                  className={`chapter-wrap ${c.locked ? "locked" : ""} ${c.done ? "completed" : ""} ${i === current ? "current" : ""}`}
                  key={c.title}
                >
                  <div className="chapter-milestone">
                    <span>
                      {c.done ? (
                        <Check size={24} />
                      ) : c.locked ? (
                        <LockKeyhole size={22} />
                      ) : (
                        <c.icon size={25} />
                      )}
                    </span>
                    <small dir="ltr">0{i + 1}</small>
                  </div>
                  <Entrance
                    className={`chapter ${c.locked ? "locked" : ""} ${c.done ? "complete" : ""}`}
                    still={still}
                  >
                    <div className="chapter-content">
                      <div className="chapter-state">
                        {c.done ? (
                          <>
                            <CheckCircle2 size={15} />
                            {ar ? "تم إنجاز هذه المحطة" : "CHAPTER COMPLETE"}
                          </>
                        ) : c.locked ? (
                          <>
                            <LockKeyhole size={14} />
                            {ar
                              ? "بانتظار المحطة السابقة"
                              : "UNLOCKS AFTER PREVIOUS CHAPTER"}
                          </>
                        ) : (
                          <>
                            <span className="active-dot" />
                            {ar
                              ? "محطتك الحالية · ابدأ من هنا"
                              : "YOUR CURRENT CHAPTER · START HERE"}
                          </>
                        )}
                      </div>
                      <span className="chapter-eyebrow">{c.subtitle}</span>
                      <h3>{c.title}</h3>
                      <p>{c.description}</p>
                      <div className="chapter-tags">
                        {c.tags.map((tag) => (
                          <span key={tag}>
                            <Check size={12} />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="chapter-action">
                        {c.locked ? (
                          <div className="chapter-locked-message">
                            <LockKeyhole size={17} />
                            <span>
                              {i === 1
                                ? ar
                                  ? "أكمل تقييم الحوكمة لفتح هذه المحطة"
                                  : "Complete governance to unlock this chapter"
                                : ar
                                  ? "أكمل التقييمين لفتح عرضك المالي"
                                  : "Complete both assessments to unlock your proposal"}
                            </span>
                          </div>
                        ) : (
                          <Link
                            className={
                              c.done
                                ? "exp-button-complete"
                                : "exp-button-green"
                            }
                            href={
                              c.done
                                ? i === 0
                                  ? "/assessment2"
                                  : "/proposal"
                                : c.href
                            }
                          >
                            {c.done
                              ? ar
                                ? "إلى المحطة التالية"
                                : "Continue to next chapter"
                              : i === 0
                                ? ar
                                  ? "ابدأ تقييم الحوكمة"
                                  : "Begin governance assessment"
                                : i === 1
                                  ? ar
                                    ? "ابدأ التقييم المؤسسي"
                                    : "Begin institutional assessment"
                                  : ar
                                    ? "افتح عرضك المالي"
                                    : "Open your financial proposal"}
                            <ArrowRight size={18} className="exp-arrow" />
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className={`chapter-visual visual-${i}`}>
                      {c.image ? (
                        <>
                          <Image
                            src={c.image}
                            alt={
                              ar
                                ? i === 0
                                  ? "أدوات حوكمة الأعمال العائلية"
                                  : "التخطيط المؤسسي وإدارة المخاطر"
                                : i === 0
                                  ? "Family business governance resources"
                                  : "Institutional strategy and risk management"
                            }
                            fill
                            sizes="(max-width: 760px) 90vw, 40vw"
                            className="chapter-photo"
                          />
                          <div className="chapter-image-shade" />
                          <span className="visual-caption">
                            <c.icon size={16} />
                            {ar
                              ? i === 0
                                ? "أساس قوي، لقرارات أفضل"
                                : "كل التفاصيل تصنع الفرق"
                              : i === 0
                                ? "STRONGER FOUNDATIONS. BETTER DECISIONS."
                                : "EVERY DETAIL CONNECTS."}
                          </span>
                        </>
                      ) : (
                        <div className="proposal-art" aria-hidden="true">
                          <div className="proposal-art-halo" />
                          <div className="proposal-paper">
                            <div className="paper-brand">
                              CRAM<span>✦</span>
                            </div>
                            <span className="paper-label">
                              {ar
                                ? "عرضك المالي المخصص"
                                : "YOUR FINANCIAL PROPOSAL"}
                            </span>
                            <div className="paper-rule" />
                            <div className="paper-lines">
                              <i />
                              <i />
                              <i />
                            </div>
                            <div className="paper-service">
                              <span />
                              <i />
                            </div>
                            <div className="paper-service">
                              <span />
                              <i />
                            </div>
                            <div className="paper-service">
                              <span />
                              <i />
                            </div>
                            <div className="paper-seal">
                              <LegacyTree />
                            </div>
                          </div>
                          <div className="proposal-art-badge">
                            <Sparkles size={19} />
                            <span>
                              {ar ? "مصمم لمنشأتك" : "MADE FOR YOUR BUSINESS"}
                            </span>
                          </div>
                        </div>
                      )}
                      {c.locked && (
                        <span className="visual-lock">
                          <LockKeyhole size={15} />
                          {ar ? "محطتك القادمة" : "YOUR NEXT CHAPTER"}
                        </span>
                      )}
                    </div>
                  </Entrance>
                  {i < 2 && (
                    <div className="chapter-connection">
                      <span>
                        {c.done ? <Check size={13} /> : <ArrowDown size={14} />}
                      </span>
                      <p>
                        {c.done
                          ? ar
                            ? "تم فتح المحطة التالية"
                            : "NEXT CHAPTER UNLOCKED"
                          : ar
                            ? "إنجاز هذه الخطوة يفتح التالية"
                            : "COMPLETE THIS CHAPTER TO UNLOCK THE NEXT"}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Entrance className="roadmap-destination" still={still}>
              <span>
                <Leaf size={23} />
              </span>
              <div>
                <h3>
                  {ar
                    ? "الهدف ليس إكمال تقييم. بل بناء إرث يستمر."
                    : "More than an assessment. A legacy that lasts."}
                </h3>
                <p>
                  {ar
                    ? "رحلتك معنا تبدأ بفهم أعمالك، وتستمر بتحويل الرؤية إلى أثر."
                    : "Our work starts with understanding your business, and continues by turning perspective into progress."}
                </p>
              </div>
            </Entrance>
          </section>
          <section className="exp-expertise" id="services">
            <div className="expertise-heading">
              <span className="exp-overline">
                {ar
                  ? "خبراتنا، في خدمة رحلتك"
                  : "OUR EXPERTISE. YOUR NEXT CHAPTER."}
              </span>
              <h2>
                {ar ? (
                  <>
                    نرى الصورة كاملة.
                    <br />
                    <em>ونبنيها معك.</em>
                  </>
                ) : (
                  <>
                    We see the bigger picture.
                    <br />
                    <em>And build it with you.</em>
                  </>
                )}
              </h2>
              <p>
                {ar
                  ? "من تأسيس الحوكمة إلى استدامة الأجيال، منظومة متكاملة تتشكل حول احتياجات منشأتك."
                  : "From governance foundations to continuity across generations, a connected advisory offering shaped around your business."}
              </p>
              <Link href={next} className="exp-text-link">
                {ar
                  ? "لنكتشف ما تحتاجه منشأتك"
                  : "Discover what your business needs"}
                <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="expertise-grid">
              {[ShieldCheck, Layers3, Network, Leaf].map((Icon, i) => (
                <Entrance
                  className="expertise-card"
                  key={i}
                  delay={i * 0.05}
                  still={still}
                >
                  <div>
                    <Icon size={27} strokeWidth={1.3} />
                    <span dir="ltr">0{i + 1}</span>
                  </div>
                  <h3>{t(`products.cat${i + 1}.title`)}</h3>
                  <ul>
                    {Array.from({ length: 5 }, (_, j) => (
                      <li key={j}>{t(`products.p${i * 5 + j + 1}.title`)}</li>
                    ))}
                  </ul>
                </Entrance>
              ))}
            </div>
          </section>
          <section className="exp-final" id="contact">
            <div className="final-ring" aria-hidden="true" />
            <Entrance still={still}>
              <span className="exp-overline">
                {ar ? "فصلك القادم يبدأ الآن" : "YOUR NEXT CHAPTER STARTS HERE"}
              </span>
              <h2>
                {ar ? (
                  <>
                    إرثك يستحق
                    <br />
                    <em>رحلة استثنائية.</em>
                  </>
                ) : (
                  <>
                    An extraordinary legacy.
                    <br />
                    <em>A journey to match.</em>
                  </>
                )}
              </h2>
              <Link href={next} className="exp-button-gold">
                {user
                  ? ar
                    ? "متابعة رحلتي"
                    : "Continue my journey"
                  : ar
                    ? "ابدأ رحلتك مع كرام"
                    : "Begin your journey with CRAM"}
                <ArrowRight size={19} className="exp-arrow" />
              </Link>
              <a className="exp-contact-link" href="mailto:gm@cram.sa">
                gm@cram.sa
                <ArrowUpRight size={15} />
              </a>
            </Entrance>
          </section>
        </main>
        <footer className="exp-footer">
          <Link href="/" className="exp-footer-brand">
            CRAM<span>.</span>
          </Link>
          <p>
            {ar
              ? "حوكمة الأعمال العائلية. إرث يمتد لأجيال."
              : "Family business governance. A legacy across generations."}
          </p>
          <span>© {new Date().getFullYear()} CRAM Consulting</span>
          <Link href="/assessment">
            {ar ? "ملفي" : "My profile"}
            <ArrowUpRight size={13} />
          </Link>
        </footer>
      </div>
    </MotionConfig>
  );
}
