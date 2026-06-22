"use client";

import { motion } from "framer-motion";
import {
  Target,
  Compass,
  Scale,
  Layers,
  Building2,
  Network,
  ShieldCheck,
  AlertTriangle,
  Eye,
  FileCheck,
  Cpu,
  Lock,
  BarChart3,
  Users,
  Heart,
  GraduationCap,
  BookOpen,
  Rocket,
  UserCheck,
  Infinity as InfinityIcon,
  Sparkles,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useLanguage } from "../../lib/language-context";
import type { ElementType } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  num: string;
  titleKey: string;
  descKey: string;
  icon: ElementType;
}

interface Category {
  id: string;
  numeral: string;
  titleKey: string;
  subtitleKey: string;
  color: string;
  ringColor: string;
  bgColor: string;
  textColor: string;
  badgeBg: string;
  products: Product[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const categories: Category[] = [
  {
    id: "foundation",
    numeral: "I",
    titleKey: "products.cat1.title",
    subtitleKey: "products.cat1.subtitle",
    color: "from-emerald-500 to-teal-500",
    ringColor: "ring-emerald-200 dark:ring-emerald-800",
    bgColor: "bg-emerald-50/50 dark:bg-emerald-950/20",
    textColor: "text-emerald-700 dark:text-emerald-400",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/40",
    products: [
      {
        num: "01",
        titleKey: "products.p1.title",
        descKey: "products.p1.desc",
        icon: Target,
      },
      {
        num: "02",
        titleKey: "products.p2.title",
        descKey: "products.p2.desc",
        icon: Compass,
      },
      {
        num: "03",
        titleKey: "products.p3.title",
        descKey: "products.p3.desc",
        icon: Scale,
      },
      {
        num: "04",
        titleKey: "products.p4.title",
        descKey: "products.p4.desc",
        icon: Layers,
      },
      {
        num: "05",
        titleKey: "products.p5.title",
        descKey: "products.p5.desc",
        icon: Building2,
      },
    ],
  },
  {
    id: "control",
    numeral: "II",
    titleKey: "products.cat2.title",
    subtitleKey: "products.cat2.subtitle",
    color: "from-amber-500 to-orange-500",
    ringColor: "ring-amber-200 dark:ring-amber-800",
    bgColor: "bg-amber-50/50 dark:bg-amber-950/20",
    textColor: "text-amber-700 dark:text-amber-400",
    badgeBg: "bg-amber-100 dark:bg-amber-900/40",
    products: [
      {
        num: "06",
        titleKey: "products.p6.title",
        descKey: "products.p6.desc",
        icon: Network,
      },
      {
        num: "07",
        titleKey: "products.p7.title",
        descKey: "products.p7.desc",
        icon: ShieldCheck,
      },
      {
        num: "08",
        titleKey: "products.p8.title",
        descKey: "products.p8.desc",
        icon: AlertTriangle,
      },
      {
        num: "09",
        titleKey: "products.p9.title",
        descKey: "products.p9.desc",
        icon: Eye,
      },
      {
        num: "10",
        titleKey: "products.p10.title",
        descKey: "products.p10.desc",
        icon: FileCheck,
      },
    ],
  },
  {
    id: "digital",
    numeral: "III",
    titleKey: "products.cat3.title",
    subtitleKey: "products.cat3.subtitle",
    color: "from-cyan-500 to-blue-500",
    ringColor: "ring-cyan-200 dark:ring-cyan-800",
    bgColor: "bg-cyan-50/50 dark:bg-cyan-950/20",
    textColor: "text-cyan-700 dark:text-cyan-400",
    badgeBg: "bg-cyan-100 dark:bg-cyan-900/40",
    products: [
      {
        num: "11",
        titleKey: "products.p11.title",
        descKey: "products.p11.desc",
        icon: Cpu,
      },
      {
        num: "12",
        titleKey: "products.p12.title",
        descKey: "products.p12.desc",
        icon: Lock,
      },
      {
        num: "13",
        titleKey: "products.p13.title",
        descKey: "products.p13.desc",
        icon: BarChart3,
      },
      {
        num: "14",
        titleKey: "products.p14.title",
        descKey: "products.p14.desc",
        icon: Users,
      },
      {
        num: "15",
        titleKey: "products.p15.title",
        descKey: "products.p15.desc",
        icon: Heart,
      },
    ],
  },
  {
    id: "sustainability",
    numeral: "IV",
    titleKey: "products.cat4.title",
    subtitleKey: "products.cat4.subtitle",
    color: "from-purple-500 to-fuchsia-500",
    ringColor: "ring-purple-200 dark:ring-purple-800",
    bgColor: "bg-purple-50/50 dark:bg-purple-950/20",
    textColor: "text-purple-700 dark:text-purple-400",
    badgeBg: "bg-purple-100 dark:bg-purple-900/40",
    products: [
      {
        num: "16",
        titleKey: "products.p16.title",
        descKey: "products.p16.desc",
        icon: GraduationCap,
      },
      {
        num: "17",
        titleKey: "products.p17.title",
        descKey: "products.p17.desc",
        icon: BookOpen,
      },
      {
        num: "18",
        titleKey: "products.p18.title",
        descKey: "products.p18.desc",
        icon: Rocket,
      },
      {
        num: "19",
        titleKey: "products.p19.title",
        descKey: "products.p19.desc",
        icon: UserCheck,
      },
      {
        num: "20",
        titleKey: "products.p20.title",
        descKey: "products.p20.desc",
        icon: InfinityIcon,
      },
    ],
  },
];

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  category,
  index,
}: {
  product: Product;
  category: Category;
  index: number;
}) {
  const { t } = useLanguage();
  const Icon = product.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative h-full"
    >
      {/* Glow on hover */}
      <div
        className={cn(
          "absolute -inset-0.5 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-40 bg-gradient-to-r",
          category.color,
        )}
      />

      <div
        className={cn(
          "relative h-full p-5 md:p-6 rounded-2xl border bg-card transition-all duration-300",
          "border-border/60 group-hover:border-transparent",
          "shadow-sm group-hover:shadow-xl",
        )}
      >
        {/* Top row: number + icon */}
        <div className="flex items-start justify-between mb-4">
          <span
            className={cn(
              "text-3xl md:text-4xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-br opacity-60",
              category.color,
            )}
          >
            {product.num}
          </span>
          <div
            className={cn(
              "w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 bg-gradient-to-br",
              category.color,
            )}
          >
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base md:text-lg font-bold text-foreground mb-2 leading-snug">
          {t(product.titleKey)}
        </h4>

        {/* Description */}
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {t(product.descKey)}
        </p>

        {/* Bottom accent line */}
        <div
          className={cn(
            "mt-4 h-1 w-10 rounded-full bg-gradient-to-r opacity-50 group-hover:w-full group-hover:opacity-100 transition-all duration-500",
            category.color,
          )}
        />
      </div>
    </motion.div>
  );
}

// ─── Category Block ───────────────────────────────────────────────────────────

function CategoryBlock({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  const { t, dir } = useLanguage();

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className={cn(
        "relative rounded-3xl border border-border/60 p-6 md:p-10 overflow-hidden",
        category.bgColor,
      )}
    >
      {/* Decorative blur */}
      <div
        className={cn(
          "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 bg-gradient-to-br",
          category.color,
        )}
      />

      {/* Header */}
      <div className="relative flex items-center gap-4 mb-8">
        <div
          className={cn(
            "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-xl shrink-0 bg-gradient-to-br",
            category.color,
          )}
        >
          <span className="text-xl md:text-2xl font-black text-white">
            {category.numeral}
          </span>
        </div>
        <div className="min-w-0">
          <span
            className={cn(
              "inline-block px-3 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase mb-1.5",
              category.badgeBg,
              category.textColor,
            )}
          >
            {dir === "rtl"
              ? `الفئة ${category.numeral}`
              : `Category ${category.numeral}`}
          </span>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
            {t(category.titleKey)}
          </h3>
          <p
            className={cn("text-xs md:text-sm font-medium mt-1", category.textColor)}
          >
            {t(category.subtitleKey)}
          </p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
        {category.products.map((p, i) => (
          <ProductCard key={p.num} product={p} category={category} index={i} />
        ))}
      </div>
    </motion.section>
  );
}

// ─── ProductsSection ─────────────────────────────────────────────────────────

export function ProductsSection() {
  const { t, dir } = useLanguage();

  return (
    <section
      id="products"
      className="relative py-20 md:py-28 overflow-hidden"
      dir={dir}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-14 md:mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border shadow-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-foreground">
              {t("products.badge")}
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
            {t("products.title")}
          </h2>
          <p className="text-base md:text-xl text-muted-foreground leading-relaxed px-2">
            {t("products.subtitle")}
          </p>

          {/* Stats strip */}
          <div className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-6">
            {[
              { value: "20", labelKey: "products.stat1" },
              { value: "04", labelKey: "products.stat2" },
              { value: "∞", labelKey: "products.stat3" },
            ].map((s) => (
              <div
                key={s.labelKey}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-sm"
              >
                <span className="text-lg md:text-xl font-black bg-clip-text text-transparent bg-gradient-to-br from-emerald-500 to-teal-500">
                  {s.value}
                </span>
                <span className="text-xs md:text-sm font-medium text-muted-foreground">
                  {t(s.labelKey)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Category blocks ── */}
        <div className="space-y-10 md:space-y-14">
          {categories.map((cat, i) => (
            <CategoryBlock key={cat.id} category={cat} index={i} />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-16 md:mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 md:p-14 text-center text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="relative">
            <h3 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 leading-tight">
              {t("products.cta.title")}
            </h3>
            <p className="text-sm md:text-lg text-white/90 max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed">
              {t("products.cta.subtitle")}
            </p>
            <a
              href="#roadmap"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-full bg-white text-emerald-700 font-bold text-sm md:text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              {t("products.cta.button")}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
