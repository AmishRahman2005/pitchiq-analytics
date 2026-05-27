import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Target } from "lucide-react";

type Mode = "pace" | "spin" | "yorkers" | "bouncers";

const ZONES: Record<Mode, { x: number; y: number; r: number; intensity: number; type: "wicket" | "danger" }[]> = {
  pace: [
    { x: 50, y: 38, r: 60, intensity: 0.85, type: "wicket" },
    { x: 32, y: 60, r: 40, intensity: 0.55, type: "danger" },
    { x: 70, y: 28, r: 32, intensity: 0.4, type: "danger" },
  ],
  spin: [
    { x: 60, y: 55, r: 48, intensity: 0.7, type: "wicket" },
    { x: 40, y: 70, r: 38, intensity: 0.6, type: "danger" },
  ],
  yorkers: [
    { x: 50, y: 84, r: 36, intensity: 0.95, type: "wicket" },
    { x: 50, y: 92, r: 22, intensity: 0.55, type: "danger" },
  ],
  bouncers: [
    { x: 45, y: 22, r: 50, intensity: 0.8, type: "danger" },
    { x: 55, y: 18, r: 30, intensity: 0.6, type: "wicket" },
  ],
};

export function HeatmapSection() {
  const [mode, setMode] = useState<Mode>("pace");
  const zones = ZONES[mode];

  return (
    <section className="relative mx-auto mt-32 max-w-7xl px-6">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Flame size={14} /> Pitch Heatmap
          </div>
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            Wicket zones, danger zones,
            <br />
            <span className="text-gradient-cyan">surfaced in real-time.</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["pace", "spin", "yorkers", "bouncers"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all ${
                mode === m
                  ? "bg-primary text-primary-foreground shadow-glow-cyan"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl glass-strong p-6 shadow-card">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.40_0.12_155/0.45),transparent_70%)]" />
          {/* The pitch */}
          <div className="relative mx-auto flex h-full max-w-[420px] items-center justify-center">
            <div
              className="relative h-full w-[60%] overflow-hidden rounded-md"
              style={{
                background:
                  "linear-gradient(180deg, oklch(0.62 0.07 70), oklch(0.50 0.08 60))",
                boxShadow: "inset 0 0 80px oklch(0 0 0 / 0.45)",
              }}
            >
              <div className="absolute inset-x-3 top-[8%] h-[2px] bg-white/85" />
              <div className="absolute inset-x-3 bottom-[8%] h-[2px] bg-white/85" />
              <div className="absolute left-1/2 top-[3%] h-2 w-10 -translate-x-1/2 rounded bg-white" />
              <div className="absolute left-1/2 bottom-[3%] h-2 w-10 -translate-x-1/2 rounded bg-white" />

              <AnimatePresence>
                {zones.map((z, i) => (
                  <motion.div
                    key={`${mode}-${i}`}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
                    style={{
                      left: `${z.x}%`,
                      top: `${z.y}%`,
                      width: z.r * 2,
                      height: z.r * 2,
                      background:
                        z.type === "wicket"
                          ? `radial-gradient(circle, oklch(0.82 0.17 195 / ${z.intensity}), transparent 70%)`
                          : `radial-gradient(circle, oklch(0.78 0.18 55 / ${z.intensity}), transparent 70%)`,
                    }}
                  />
                ))}
                {zones.map((z, i) => (
                  <motion.div
                    key={`${mode}-dot-${i}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.4, 1] }}
                    transition={{ duration: 0.8, delay: 0.15 + i * 0.08 }}
                    className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      left: `${z.x}%`,
                      top: `${z.y}%`,
                      background: z.type === "wicket" ? "oklch(0.95 0.08 195)" : "oklch(0.92 0.12 55)",
                      boxShadow:
                        z.type === "wicket"
                          ? "0 0 14px oklch(0.82 0.17 195)"
                          : "0 0 14px oklch(0.78 0.18 55)",
                    }}
                  />
                ))}
              </AnimatePresence>

              {/* bouncing ball */}
              <span
                className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_white]"
                style={{ animation: "ball-bounce 3.5s ease-in-out infinite" }}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-2 py-1">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_oklch(0.82_0.17_195)]" />
              Wicket zone
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-2 py-1">
              <span className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_8px_oklch(0.78_0.18_55)]" />
              Danger zone
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { label: "Avg. wicket length", value: "6.2m", sub: "from stumps" },
            { label: "Top channel", value: "Off · 4th", sub: "+38% LBW" },
            { label: "Boundary risk", value: "Hip · Pad", sub: "61% strike rate" },
          ].map((s) => (
            <motion.div
              whileHover={{ y: -3 }}
              key={s.label}
              className="rounded-2xl glass-strong p-4 shadow-card"
            >
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                <span>{s.label}</span>
                <Target size={12} className="text-primary" />
              </div>
              <div className="mt-1 font-display text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
