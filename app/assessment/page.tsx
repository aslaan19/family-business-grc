"use client";

import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  FileText,
  Users,
  Shield,
  ArrowLeft,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../lib/language-context";

export default function AssessmentPage() {
  const { t, dir } = useLanguage();

  const features = [
    {
      icon: Clock,
      title: t("assessment.durationValue"),
      description: t("assessment.feature1.desc"),
    },
    {
      icon: FileText,
      title: t("assessment.badge2"),
      description: t("assessment.feature2.desc"),
    },
    {
      icon: Users,
      title: t("assessment.feature1.title"),
      description: t("assessment.feature1.desc"),
    },
    {
      icon: Shield,
      title: t("assessment.feature3.title"),
      description: t("assessment.feature3.desc"),
    },
  ];

  const ctaButton = (label: string, large = false) => (
    <Link href="/assessment/Qs">
      <button
        className={`group w-full relative py-4 px-6 rounded-2xl bg-linear-to-l from-emerald-500 to-emerald-600 text-white font-bold ${large ? "text-lg" : ""} overflow-hidden shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02]`}
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          {label}
          <ArrowLeft
            className={`w-5 h-5 ${dir === "ltr" ? "rotate-180" : ""} group-hover:-translate-x-1 transition-transform`}
          />
        </span>
        <div className="absolute inset-0 bg-linear-to-l from-emerald-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    </Link>
  );

  return (
    <main className="min-h-screen bg-background" dir={dir}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-emerald-50 via-background to-background" />
        {/* ... keep your existing orbs ... */}

        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft
                className={`w-4 h-4 ${dir === "ltr" ? "" : "rotate-180"} group-hover:-translate-x-1 transition-transform`}
              />
              <span className="text-sm font-medium">
                {t("assessment.back")}
              </span>
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 mb-8">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {t("assessment.badge")}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                {t("assessment.title")}
                <span className="block text-emerald-600 mt-2 text-3xl md:text-4xl">
                  {t("hero.title.line2")}
                </span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg">
                {t("assessment.subtitle")}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2 space-x-reverse">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <span>{t("assessment.families")}</span>
              </div>
            </motion.div>

            {/* Image & CTA Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/10 ">
                <div className="aspect-4/3 relative">
                  <Image
                    src="/images/assessment1.png"
                    alt="Family Business Assessment"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-foreground/90 via-foreground/20 to-transparent" />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-8">
                  <div className="bg-card/95 backdrop-blur-xl rounded-2xl p-6 border border-border shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className="w-4 h-4 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {t("assessment.rating")}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3 mb-6">
                      <span className="text-4xl font-bold text-foreground">
                        {t("assessment.priceAmount")}
                      </span>
                      <span className="text-muted-foreground line-through">
                        {t("assessment.originalPrice")}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                        {t("assessment.discount")}
                      </span>
                    </div>
                    {ctaButton(
                      `${t("assessment.price")} - ${t("assessment.priceAmount")}`,
                      false,
                    )}
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span>{t("assessment.secure")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-card border border-border shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-semibold text-foreground">
                    {t("assessment.badge1")}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-4 -left-4 px-4 py-2 rounded-full bg-card border border-border shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-semibold text-foreground">
                    {t("assessment.durationValue")}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      {/* ... keep your existing section, just replace hardcoded text with t() calls ... */}

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {t("footer.cta.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              {t("footer.cta.desc")}
            </p>
            <div className="max-w-xs mx-auto">
              {ctaButton(
                `${t("assessment.price")} - ${t("assessment.priceAmount")}`,
                true,
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              {dir === "rtl"
                ? "ضمان استرداد الأموال خلال 7 أيام"
                : "7-day money-back guarantee"}
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
