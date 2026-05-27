import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar } from "lucide-react";
import { useMemo } from "react";

const FACTS = [
  { fact: "MS Dhoni has the highest ODI stumpings by a wicketkeeper.", tag: "Wicketkeeping" },
  { fact: "Lasith Malinga once took 4 wickets in 4 balls — twice internationally.", tag: "Bowling" },
  { fact: "AB de Villiers scored the fastest ODI century in just 31 balls.", tag: "Batting" },
  { fact: "Muttiah Muralitharan holds the record for most Test wickets — 800.", tag: "Spin" },
  { fact: "Jasprit Bumrah's average yorker speed is over 145 kph.", tag: "Pace" },
  { fact: "Kumar Sangakkara scored 4 consecutive Test double-hundreds in 2014.", tag: "Batting" },
  { fact: "Rashid Khan became the youngest #1 ODI bowler at age 19.", tag: "Spin" },
];

export function FactOfTheDay() {
  const today = useMemo(() => {
    const start = new Date(new Date().getFullYear(), 0, 0).getTime();
    const diff = Date.now() - start;
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    return day;
  }, []);
  const fact = FACTS[today % FACTS.length];
  const d = new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dateLabel = `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

  return (
    <section className="relative mx-auto mt-12 max-w-7xl px-6">
      <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Sparkles size={14} /> Cricket Fact of the Day
          </div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            A new piece of cricket history,{" "}
            <span className="text-gradient-cyan">every sunrise.</span>
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            We pull moments from a century of cricket archives — record-breaking spells,
            unforgettable knocks, and tactical anomalies — and render them as a daily card.
          </p>
        </div>

        <div className="relative h-[260px] [perspective:1200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={fact.fact}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative h-full w-full rounded-3xl glass-strong shadow-card overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.82_0.17_195/0.18),transparent_60%)]" />
              <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
              <div className="seam absolute bottom-0 left-0 right-0 h-[3px] opacity-60" />

              <div className="relative flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
                    {fact.tag}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar size={12} /> {dateLabel}
                  </span>
                </div>
                <p className="mt-auto font-display text-2xl font-semibold leading-tight text-foreground md:text-[1.6rem]">
                  “{fact.fact}”
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">FACT #{(today % FACTS.length) + 1}</span>
                  <span>Auto-rotates daily</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
