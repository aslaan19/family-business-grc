"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  TrendingUp,
  Users,
  Building2,
  CheckCircle2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../../lib/language-context";
import { cn } from "../../lib/utils";

// Interactive 3D-like floating card
function FloatingCard({
  children,
  className,
  delay = 0,
  intensity = 15,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(y, [-0.5, 0.5], [intensity, -intensity]),
    { stiffness: 300, damping: 30 },
  );
  const rotateY = useSpring(
    useTransform(x, [-0.5, 0.5], [-intensity, intensity]),
    { stiffness: 300, damping: 30 },
  );

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={cn("relative", className)}
    >
      {children}
    </motion.div>
  );
}

// Animated counter with spring physics
function AnimatedCounter({
  value,
  suffix = "",
  delay = 0,
}: {
  value: number;
  suffix?: string;
  delay?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 2000;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(eased * value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

// Dynamic particle system
function ParticleField() {
  const particlesRef = useRef<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    offsetX: number;
  }> | null>(null);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    offsetX: number;
  }> | null>(null);

  useEffect(() => {
    if (!particlesRef.current) {
      particlesRef.current = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
        offsetX: Math.random() * 20 - 10,
      }));
      setParticles(particlesRef.current);
    }
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles?.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, p.offsetX, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Animated mesh gradient background
function MeshGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-primary/8 via-transparent to-transparent blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-tr from-accent/8 via-transparent to-transparent blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [0, -90, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Live stock-like ticker
function LiveTicker({ dir }: { dir: "rtl" | "ltr" }) {
  const items = [
    {
      label: dir === "rtl" ? "مؤشر الحوكمة" : "Governance Index",
      value: "+12.4%",
      positive: true,
    },
    {
      label: dir === "rtl" ? "إدارة المخاطر" : "Risk Management",
      value: "+8.7%",
      positive: true,
    },
    {
      label: dir === "rtl" ? "الامتثال" : "Compliance",
      value: "98.2%",
      positive: true,
    },
    {
      label: dir === "rtl" ? "رضا العملاء" : "Client Satisfaction",
      value: "+15.3%",
      positive: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="flex items-center gap-6 overflow-hidden py-4"
    >
      <motion.div
        className="flex gap-8"
        animate={{ x: dir === "rtl" ? [0, 200] : [0, -200] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-3 whitespace-nowrap">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span
              className={cn(
                "text-sm font-bold",
                item.positive ? "text-primary" : "text-destructive",
              )}
            >
              {item.value}
            </span>
            <div className="w-px h-4 bg-border" />
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// Animated line graph with glow
function GlowingLineChart() {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  return (
    <svg viewBox="0 0 300 150" className="w-full h-full">
      <defs>
        <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.55 0.18 155)" stopOpacity="0" />
          <stop offset="50%" stopColor="oklch(0.55 0.18 155)" stopOpacity="1" />
          <stop
            offset="100%"
            stopColor="oklch(0.45 0.15 155)"
            stopOpacity="0"
          />
        </linearGradient>
        <linearGradient id="areaFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            stopColor="oklch(0.55 0.18 155)"
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            stopColor="oklch(0.55 0.18 155)"
            stopOpacity="0"
          />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid */}
      {[...Array(5)].map((_, i) => (
        <motion.line
          key={i}
          x1="30"
          y1={25 + i * 25}
          x2="280"
          y2={25 + i * 25}
          stroke="currentColor"
          className="text-border"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: i * 0.1 }}
        />
      ))}

      {/* Area */}
      <motion.path
        d="M 30 120 Q 60 110 90 100 T 150 70 T 210 50 T 270 25 L 270 130 L 30 130 Z"
        fill="url(#areaFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      />

      {/* Main line */}
      <motion.path
        ref={pathRef}
        d="M 30 120 Q 60 110 90 100 T 150 70 T 210 50 T 270 25"
        fill="none"
        stroke="url(#lineGlow)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#glow)"
        initial={{ strokeDasharray: pathLength, strokeDashoffset: pathLength }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
      />

      {/* Animated dot */}
      <motion.circle
        cx="270"
        cy="25"
        r="6"
        className="fill-primary"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ delay: 2.5, duration: 0.5 }}
      />
      <motion.circle
        cx="270"
        cy="25"
        r="12"
        className="fill-primary/30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ delay: 2.5, duration: 2, repeat: Infinity }}
      />
    </svg>
  );
}

// Circular progress with animation
function AnimatedCircularProgress({
  value,
  label,
  delay,
  size = 100,
}: {
  value: number;
  label: string;
  delay: number;
  size?: number;
}) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-secondary"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-primary"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset: circumference - (value / 100) * circumference,
            }}
            transition={{ delay: delay + 0.3, duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-foreground">
            <AnimatedCounter value={value} suffix="%" delay={delay + 0.5} />
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-2 text-center">
        {label}
      </span>
    </motion.div>
  );
}

// Animated icon with pulse
function PulsingIcon({
  icon: Icon,
  delay,
}: {
  icon: React.ElementType;
  delay: number;
}) {
  return (
    <motion.div
      className="relative"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
    >
      <motion.div
        className="absolute inset-0 rounded-xl bg-primary/20"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: delay + 0.5 }}
      />
      <div className="relative w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </motion.div>
  );
}

// Language toggle button


export function HeroSection() {
  const { t, dir } = useLanguage();
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      <MeshGradient />
      <ParticleField />

      {/* Cursor follower light */}
      <motion.div
        className="fixed w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none z-0"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Top ticker */}
        <div className="pt-20 border-b border-border/50">
          <LiveTicker dir={dir} />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-120px)] py-12">
          {/* Content Side */}
          <motion.div
            className={cn(
              "relative z-10",
              dir === "rtl" ? "text-right lg:order-2" : "text-left lg:order-1",
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-3 bg-card border border-border rounded-full px-5 py-2.5 mb-8 shadow-lg"
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm font-medium text-foreground">
                {t("hero.badge")}
              </span>
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>

            {/* Heading */}
            <motion.h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] mb-8">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                {t("hero.title.line1")}
              </motion.span>
              <motion.span
                className="block text-primary mt-2"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.7 }}
              >
                {t("hero.title.line2")}
              </motion.span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-muted-foreground text-lg lg:text-xl leading-relaxed max-w-xl mb-10"
            >
              {t("hero.description")}
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col gap-4 mb-10"
            >
              {[t("hero.feature1"), t("hero.feature2"), t("hero.feature3")].map(
                (feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: dir === "rtl" ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                    className={cn(
                      "flex items-center gap-3",
                      dir === "ltr" && "flex-row-reverse justify-end",
                    )}
                  >
                    <span className="text-foreground/80 font-medium">
                      {feature}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                  </motion.div>
                ),
              )}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className={cn(
                "flex flex-wrap gap-4",
                dir === "ltr" && "flex-row-reverse justify-end",
              )}
            >
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold shadow-xl shadow-primary/20 transition-shadow hover:shadow-2xl hover:shadow-primary/30"
              >
                {t("hero.cta.primary")}
                <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </motion.a>
              <motion.a
                href="#services"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 bg-card border-2 border-border text-foreground px-8 py-4 rounded-full font-semibold hover:bg-secondary/50 transition-colors"
              >
                {t("hero.cta.secondary")}
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className={cn(
                "grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border",
                dir === "ltr" && "text-left",
              )}
            >
              {[
                {
                  value: 100,
                  suffix: "+",
                  label: t("hero.stat1.label"),
                  icon: Building2,
                },
                {
                  value: 15,
                  suffix: "+",
                  label: t("hero.stat2.label"),
                  icon: TrendingUp,
                },
                {
                  value: 50,
                  suffix: "+",
                  label: t("hero.stat3.label"),
                  icon: Users,
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="group"
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 mb-1",
                      dir === "rtl" ? "justify-start" : "justify-start",
                    )}
                  >
                    <stat.icon className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span className="text-3xl lg:text-4xl font-bold text-foreground">
                      <AnimatedCounter
                        value={stat.value}
                        suffix={stat.suffix}
                        delay={1.4 + index * 0.1}
                      />
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Graphics Side */}
          <div
            className={cn(
              "relative",
              dir === "rtl" ? "lg:order-1" : "lg:order-2",
            )}
          >
            {/* Main Chart Card */}
            <FloatingCard delay={0.4} className="relative z-10">
              <div className="bg-card rounded-3xl p-6 lg:p-8 shadow-2xl border border-border">
                <div
                  className={cn(
                    "flex items-center justify-between mb-6",
                    dir === "ltr" && "flex-row-reverse",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3",
                      dir === "ltr" && "flex-row-reverse",
                    )}
                  >
                    <PulsingIcon icon={TrendingUp} delay={0.6} />
                    <div className={dir === "ltr" ? "text-left" : "text-right"}>
                      <p className="font-semibold text-foreground">
                        {t("hero.growth")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("hero.chart.period")}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.5, type: "spring" }}
                    className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold"
                  >
                    +150%
                  </motion.div>
                </div>
                <div className="h-40 lg:h-48">
                  <GlowingLineChart />
                </div>
              </div>
            </FloatingCard>

            {/* Floating metrics */}
            <FloatingCard
              delay={0.8}
              intensity={20}
              className={cn(
                "absolute -top-4 z-20",
                dir === "rtl" ? "-left-4 lg:-left-12" : "-right-4 lg:-right-12",
              )}
            >
              <div className="bg-card rounded-2xl p-5 shadow-xl border border-border">
                <div
                  className={cn(
                    "flex items-center gap-4",
                    dir === "ltr" && "flex-row-reverse",
                  )}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div className={dir === "ltr" ? "text-left" : "text-right"}>
                    <p className="text-3xl font-bold text-foreground">
                      <AnimatedCounter value={98} suffix="%" delay={1} />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("hero.compliance")}
                    </p>
                  </div>
                </div>
              </div>
            </FloatingCard>

            {/* Circular progress cards */}
            <FloatingCard
              delay={1}
              intensity={25}
              className={cn(
                "absolute -bottom-8 z-20",
                dir === "rtl" ? "right-4 lg:right-8" : "left-4 lg:left-8",
              )}
            >
              <div className="bg-card rounded-2xl p-6 shadow-xl border border-border">
                <div className="flex gap-6">
                  <AnimatedCircularProgress
                    value={92}
                    label={t("hero.satisfaction")}
                    delay={1.2}
                    size={90}
                  />
                  <AnimatedCircularProgress
                    value={87}
                    label={t("hero.efficiency")}
                    delay={1.4}
                    size={90}
                  />
                </div>
              </div>
            </FloatingCard>

            {/* ROI indicator */}
            <FloatingCard
              delay={1.2}
              intensity={15}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 z-20",
                dir === "rtl" ? "-right-4 lg:-right-16" : "-left-4 lg:-left-16",
              )}
            >
              <div className="bg-card rounded-xl p-4 shadow-lg border border-border">
                <div
                  className={cn(
                    "flex items-center gap-3",
                    dir === "ltr" && "flex-row-reverse",
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <div className={dir === "ltr" ? "text-left" : "text-right"}>
                    <p className="text-lg font-bold text-foreground">
                      <AnimatedCounter value={24} suffix="%" delay={1.5} />
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t("hero.roi")}
                    </p>
                  </div>
                </div>
              </div>
            </FloatingCard>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-muted-foreground"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
