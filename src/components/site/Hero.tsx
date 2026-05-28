import { motion } from "framer-motion";
import { Link, ClientOnly } from "@tanstack/react-router";
import { ArrowRight, Activity, ChevronDown } from "lucide-react";
import { lazy, Suspense } from "react";
import { Particles } from "./Particles";
import { HomeNav } from "./HomeNav";

const PitchScene = lazy(() =>
  import("./PitchScene").then((m) => ({ default: m.PitchScene })),
);

function FloatingStat({
  className,
  delay = 0,
  label,
  value,
  hint,
  accent = "cyan",
}: {
  className?: string;
  delay?: number;
  label: string;
  value: string;
  hint: string;
  accent?: "cyan" | "amber" | "pitch";
}) {
  const accentMap = {
    cyan: "text-primary",
    amber: "text-destructive",
    pitch: "text-accent-foreground",
  } as const;
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.7, ease: "easeOut" }}
      className={`absolute glass-strong rounded-2xl p-4 shadow-card ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Activity size={12} className={accentMap[accent]} /> {label}
      </div>
      <div className={`mt-1 font-display text-2xl font-bold ${accentMap[accent]}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{hint}</div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden">
      {/* Floodlight wash */}
      <div className="absolute inset-0 bg-hero" />
      <div className="pointer-events-none absolute left-1/2 top-[-10%] h-[700px] w-[1200px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl animate-flood" />
      <div className="absolute inset-0 grid-lines opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <Particles />

      {/* Home navigation overlay */}
      <HomeNav />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 items-center px-6 pt-24 pb-20 lg:grid lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-muted-foreground">Live · Hawk-grade telemetry online</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl"
          >
            Decode <span className="text-gradient-cyan">Every</span>
            <br />
            Delivery.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-5 max-w-xl text-lg text-muted-foreground"
          >
            AI-powered bowling intelligence using ball-by-ball cricket analytics. Build matchup
            plans, surface weakness maps, and simulate strategies the way modern coaches do.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/matchups"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow-cyan transition-transform hover:-translate-y-0.5"
            >
              Analyze a Batsman
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/strategy"
              className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/5"
            >
              View Bowling Plans
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-10 grid max-w-lg grid-cols-3 gap-3"
          >
            {[
              { k: "11.1M", v: "balls indexed" },
              { k: "12,183", v: "batsmen profiled" },
              { k: "742K+", v: "matchups indexed" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl glass p-3">
                <div className="font-display text-xl font-bold text-foreground">{s.k}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Pitch visual */}
        <div className="relative mt-12 h-[420px] w-full lg:mt-0 lg:h-[520px]">
          <PitchVisual />

          <FloatingStat
            className="left-1 top-[40px] md:left-[-20px] md:top-[40px]"
            delay={0.4}
            label="Wicket Probability"
            value="34.7%"
            hint="off-stump · good length"
            accent="cyan"
          />
          <FloatingStat
            className="right-1 top-[170px] md:right-[-10px] md:top-[170px]"
            delay={0.6}
            label="Danger Zone"
            value="Hip · 142kph"
            hint="boundary risk +28%"
            accent="amber"
          />
          <FloatingStat
            className="left-3 bottom-[20px] md:left-[10px] md:bottom-[20px]"
            delay={0.8}
            label="Plan Confidence"
            value="A+"
            hint="3-over plan ready"
            accent="cyan"
          />
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Scroll
          </span>
          <ChevronDown size={16} className="text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function PitchVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative mx-auto h-full w-full overflow-hidden rounded-3xl glass-strong"
    >
      {/* Floodlight gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,oklch(0.30_0.10_195/0.55),transparent_60%),radial-gradient(ellipse_at_80%_100%,oklch(0.45_0.13_155/0.35),transparent_55%)]" />
      <ClientOnly fallback={<div className="absolute inset-0 animate-pulse bg-card/30" />}>
        <Suspense fallback={<div className="absolute inset-0 animate-pulse bg-card/30" />}>
          <PitchScene />
        </Suspense>
      </ClientOnly>
      {/* Scanline / vignette */}
      <div className="pointer-events-none absolute inset-0 [background:repeating-linear-gradient(0deg,transparent_0_3px,oklch(0_0_0/0.06)_3px_4px)] mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />
    </motion.div>
  );
}
