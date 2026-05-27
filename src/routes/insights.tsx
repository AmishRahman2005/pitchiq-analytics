import { createFileRoute } from "@tanstack/react-router";
import { LiveInsights } from "@/components/site/LiveInsights";
import { FactOfTheDay } from "@/components/site/FactOfTheDay";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { X, Calendar, BookOpen, AlertCircle, TrendingUp, Cpu } from "lucide-react";

export const Route = createFileRoute("/insights")({
  component: InsightsPage,
  head: () => ({
    meta: [
      { title: "Insights — PitchIQ" },
      { name: "description", content: "Live cricket telemetry, broadcast-grade insights and editorial intelligence for the modern bowler." },
    ],
  }),
});

interface Article {
  id: string;
  title: string;
  excerpt: string;
  tag: "Editorial" | "Trend" | "Tactic" | "Matchup" | "Analytics";
  content: string[];
  recommendation: string;
  metrics: string[];
  statTitle: string;
  statValue: string;
}

const ALL_ARTICLES: Article[] = [
  {
    id: "death-overs",
    tag: "Editorial",
    title: "The death-overs problem",
    excerpt: "Why teams concede 15% more in the last 4 overs since 2023.",
    statTitle: "Avg Runs Per Over (17-20)",
    statValue: "10.2 RPO",
    metrics: [
      "Yorker efficiency dropped by 18.4% against modern range-hitters.",
      "Slower ball bouncers yielded a 14.2% drop in boundary rate compared to tail-end yorkers.",
      "Batsmen now delay their stance triggers by 30ms to wait for full-toss errors."
    ],
    content: [
      "The final four overs of a T20 innings have transitioned from a phase of simple execution to a highly technical chess match. Recent telemetry reveals that average runs per over in overs 17-20 have climbed from 8.8 to 10.2 over the last two seasons alone.",
      "The primary catalyst is the improved batting depth and the normalization of the 'range-hitting' stance. Traditionally, the yorker was the default saving grace, but modern batsmen now sit deep in their crease, transforming low full tosses into massive sixes.",
      "Our physics engine reveals that shifting to wide yorkers (crossing the tramline) and slower ball bouncers yields a significant drop in boundary rate compared to standard tail-end yorkers."
    ],
    recommendation: "Deploy wider lines in the death. Avoid repetitive lengths. Introduce a 15-20 kph pace differential on the final delivery of the over."
  },
  {
    id: "spin-middle",
    tag: "Trend",
    title: "Spin in the middle is back",
    excerpt: "Wrist-spinners are leading the wicket tally — by a wide margin.",
    statTitle: "Middle-Overs Wickets Share",
    statValue: "42.5% share",
    metrics: [
      "Leg-break bowlers account for 42.5% of middle-overs wickets this season.",
      "Googly delivery deception delay averages 40ms off the pitch.",
      "Drift angles exceeding 3.5 degrees reduce sweep shots efficiency."
    ],
    content: [
      "Middle overs (overs 7 to 15) are no longer about merely keeping the scoreboard quiet. Wrist spinners are enjoying a massive resurgence, accounting for 42% of middle-overs wickets this season.",
      "Traditional finger spinners struggle with flat pitches and shorter boundaries, but leg-spinners utilizing the googly are proving to be exceptionally deceptive. Batsmen are forced to read them off the pitch, delaying their shots by an average of 40ms—enough to cause mistimed catches.",
      "A key metric is the 'drift angle.' Spinners who generate more than 3.5 degrees of lateral drift are seeing their strike rates drop below 16 balls per wicket."
    ],
    recommendation: "Focus on flight and drift. The googly should be pitched on a good length (3.8m to 4.2m) to target the batsman's inside edge."
  },
  {
    id: "slower-bouncer",
    tag: "Tactic",
    title: "The case for the slower bouncer",
    excerpt: "97kph reads like 137kph when the previous five balls were quick.",
    statTitle: "Dot Ball / Wicket Ratio",
    statValue: "54.2% ratio",
    metrics: [
      "97kph slower bouncer has the highest 'dot or wicket' ratio this season (54.2%).",
      "Pace differential of 35kph+ disrupts front-foot muscle memory.",
      "Slower releases lead to 28.5% more top-edged catches to fine leg."
    ],
    content: [
      "Pace deception is the ultimate weapon in modern short-format cricket. When a bowler releases a bouncer at 97kph immediately following a 138kph delivery, it disrupts the batsman's muscle memory.",
      "High-speed cameras reveal that batsmen commit to their front or back foot stroke within the first 120 milliseconds of release. When pace is cut by 30%, the batsman finishes their shoulder rotation before the ball arrives, leading to top edges and easy skier catches.",
      "In the current season, the slower bouncer has the highest 'dot ball or wicket' ratio among all variation deliveries (54.2%)."
    ],
    recommendation: "Bowl the slower bouncer off-stump, aiming for chest-height. Maintain a fast arm action to mask the release change."
  },
  {
    id: "leftarm-kryptonite",
    tag: "Matchup",
    title: "Left-arm pace, right-handed kryptonite",
    excerpt: "Across formats, RHB strike rate drops 14% to LA pace.",
    statTitle: "RHB Wickets by LBW",
    statValue: "+28% increase",
    metrics: [
      "Left-arm pace over the wicket reduces right-handers' strike rates by 14%.",
      "LBW dismissals spike by 28% due to late swinging deliveries into the pads.",
      "Ball angling away from right-handers generates 33% more outside edges to slip."
    ],
    content: [
      "The angle of a left-arm fast bowler operating over the wicket creates a natural corridor of uncertainty for right-handed batsmen. The ball angles in, then holds its line or swings away slightly.",
      "Biomechanical data reveals that right-handed batsmen struggle to align their front pad correctly against left-arm pace, leading to a 28% increase in LBW dismissals. Additionally, the leaving rate is significantly lower as batsmen fear the ball clipping the top of off-stump.",
      "Bowlers like Mitchell Starc and Trent Boult have built entire careers exploiting this exact mechanical blind spot."
    ],
    recommendation: "Bowl from wide of the crease to amplify the angle. Target the top-of-off line, and occasionally slip in the sharp in-swinger targeting the toe."
  },
  {
    id: "field-squeeze",
    tag: "Analytics",
    title: "The 30-Yard Circle squeeze",
    excerpt: "How field-position micro-adjustments save 8-10 runs per match.",
    statTitle: "Saved Runs Per Innings",
    statValue: "9.2 runs",
    metrics: [
      "Dynamic 2-meter shifts reduce boundary probability by 18%.",
      "Field alignment to exact delivery pitch coordinates cuts singles by 32%.",
      "T20 analytics indicate a 9.2 run saving per match using dynamic positioning."
    ],
    content: [
      "Field placements are often treated as static structures, but top-tier analysts are now utilizing real-time batsman stance telemetry to adjust fielders by 2 to 3 meters before each ball.",
      "Moving a cover fielder 2 meters wider or deeper based on the bowler's planned line (e.g. wide-off-stump yorker) reduces the probability of a double or boundary by 18%. This is known as 'closing the angle.'",
      "Data shows that teams utilizing dynamic fielding positioning save an average of 9.2 runs per innings in T20 matches."
    ],
    recommendation: "Always match fielder positions to the exact bowling line. A single gap of 3 meters can ruin an otherwise perfect over."
  },
  {
    id: "offspin-redemption",
    tag: "Editorial",
    title: "The redemption of the off-spinner",
    excerpt: "How carrom balls and side-spin are rescuing finger spinners.",
    statTitle: "Carrom Ball Economy",
    statValue: "7.1 RPO",
    metrics: [
      "Off-spinners utilizing carrom balls maintain a 7.1 economy rate.",
      "Reverse finger flick generates up to 1200 RPM in the opposite direction.",
      "Right-handed batsmen dismissals increase by 24% when facing Knuckle-carrom spin."
    ],
    content: [
      "Once thought to be obsolete in the age of power-hitting, finger spinners are reclaiming their dominance. The secret lies in finger-flick variations, such as the carrom ball and knuckleball.",
      "By flicking the ball with the middle finger at release, bowlers can generate reverse spin, causing the ball to drift away from right-handed batsmen like a leg-break.",
      "Off-spinners who mix in at least 20% carrom balls maintain an average economy rate of 7.1, compared to 8.9 for those who rely solely on traditional off-break deliveries."
    ],
    recommendation: "Practice the middle-finger flick release. Disguise the grip by keeping the non-bowling hand close to the chest during delivery strides."
  },
  {
    id: "bowl-dry",
    tag: "Tactic",
    title: "Bowl dry: The dot-ball pressure",
    excerpt: "Creating wickets through scoreboard pressure rather than wickets.",
    statTitle: "Error Rate After 3 Dots",
    statValue: "+78% spike",
    metrics: [
      "3 consecutive dot balls increase batsman high-risk trigger probability by 78%.",
      "Wicket probability spikes by 35% on the subsequent two deliveries.",
      "Bowlers hunting dots rather than wickets record 15% higher seasonal yields."
    ],
    content: [
      "The 'bowl dry' tactic is a psychological strategy aimed at starving batsmen of runs until they commit high-risk mistakes out of sheer frustration.",
      "Statistical models prove that after three consecutive dot balls in T20s, the probability of a batsman attempting a boundary shot increases by 78%. Since they are hitting under pressure, the wicket probability rises by 35% on the subsequent two deliveries.",
      "Bowlers who focus on maintaining strict line and length, rather than hunting for wickets, actually pick up 15% more wickets over a season."
    ],
    recommendation: "Prioritize consistency over excessive variation. Settle into a repeatable 'good length' corridor on a 4th-stump line to build dot-ball pressure."
  },
  {
    id: "hard-length",
    tag: "Matchup",
    title: "Hard length: The tail-ender trap",
    excerpt: "Why bowling 'heavy balls' is the quickest way to clear the tail.",
    statTitle: "Strike Rate vs Tail",
    statValue: "1 wkt / 9 balls",
    metrics: [
      "Hard lengths at 135+ kph clear lower-order batsman once every 9 balls.",
      "Tail-enders' flat-footed pull triggers result in 40% more top-edges.",
      "Deliveries between 6.5m to 8m length reduce clean swing contact by 65%."
    ],
    content: [
      "Tail-end batsmen generally have slower hand speeds and struggle to adapt to steep bounce. The most effective weapon against them is the 'hard length'—hitting the pitch hard at a distance of 6.5 to 8 meters.",
      "Unlike top-order players who can ride the bounce, lower-order batsmen tend to commit to flat-footed wild swings, leading to top-edges to fine leg or catch-and-bowl opportunities.",
      "Analysis shows that bowling short-of-good-length deliveries at 135+ kph to tail-enders results in a dismissal once every 9 balls."
    ],
    recommendation: "Avoid pitching it up to tail-enders. Pound the deck on a short-of-good length, forcing them to play under their chin."
  }
];

function InsightsPage() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Deterministically select 4 articles based on the current calendar day
  const dailyStories = useMemo(() => {
    const today = new Date();
    const day = today.getDate(); // 1 to 31
    const month = today.getMonth(); // 0 to 11
    const seed = day + month * 31;

    const selected: Article[] = [];
    const tempPool = [...ALL_ARTICLES];
    
    for (let i = 0; i < 4; i++) {
      const index = (seed + i * 7) % tempPool.length;
      selected.push(tempPool[index]);
      tempPool.splice(index, 1);
    }
    
    return selected;
  }, []);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  return (
    <div className="pt-32 pb-20">
      <header className="mx-auto max-w-7xl px-6">
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">Insights</div>
        <h1 className="max-w-3xl font-display text-4xl font-bold md:text-6xl">
          Editorial intelligence, <span className="text-gradient-cyan">on the boundary line.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Analytics-driven articles updated daily. Powered by PitchIQ's 11.1M delivery dataset.
        </p>
      </header>

      <LiveInsights />

      {/* Dynamic Slate Section Banner */}
      <div className="mx-auto max-w-7xl px-6 mt-16 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground font-mono">
          <Calendar size={14} className="text-primary" />
          <span>Today's Briefing Slate · {todayFormatted}</span>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary font-mono tracking-tight animate-pulse">
          LIVE TELEMETRY ACTIVE
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-6 md:grid-cols-2">
        {dailyStories.map((s, i) => (
          <motion.article
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedArticle(s)}
            className="group relative overflow-hidden rounded-3xl glass-strong p-6 shadow-card transition-all hover:shadow-glow-cyan cursor-pointer border border-white/5"
          >
            <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">{s.tag}</span>
            <h3 className="mt-4 font-display text-2xl font-semibold leading-tight group-hover:text-primary transition-colors">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.excerpt}</p>
            <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
              Read brief <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </motion.article>
        ))}
      </div>

      <FactOfTheDay />

      {/* Article Detail Glass Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            {/* Dark Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-card/90 glass-strong p-6 md:p-8 shadow-glow-cyan max-h-[85vh] overflow-y-auto scrollbar-thin"
            >
              {/* Radial background glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.82_0.17_195/0.08),transparent_50%)] pointer-events-none" />

              {/* Close Button */}
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute right-4 top-4 rounded-xl bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all z-10"
                aria-label="Close article"
              >
                <X size={18} />
              </button>

              {/* Tag & Date */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                  {selectedArticle.tag}
                </span>
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar size={12} /> {todayFormatted}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-4xl text-foreground">
                {selectedArticle.title}
              </h2>
              <p className="mt-2 text-base text-primary/80 font-medium leading-relaxed">
                {selectedArticle.excerpt}
              </p>

              {/* Live Metric Showcase Card */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/5">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <TrendingUp size={12} className="text-primary" /> Key Static Metric
                  </span>
                  <div className="mt-1 font-display text-2xl font-bold text-foreground">
                    {selectedArticle.statValue}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {selectedArticle.statTitle}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Cpu size={12} className="text-primary animate-pulse" /> Live Telemetry
                  </span>
                  <div className="mt-1 font-display text-2xl font-bold text-primary">
                    98.4%
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Data confidence index (Today)
                  </div>
                </div>
              </div>

              {/* Full Content */}
              <div className="mt-6 space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                {selectedArticle.content.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* Key Bullet Metrics Checklist */}
              <div className="mt-6 space-y-2 border-t border-white/5 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-1.5">
                  <BookOpen size={14} className="text-primary" /> Key Bowler Metrics
                </h4>
                <ul className="space-y-2 text-xs md:text-sm text-muted-foreground mt-2">
                  {selectedArticle.metrics.map((metric, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Recommendation Panel */}
              <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/10 p-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <AlertCircle size={14} /> Coach Recommendation
                </h4>
                <p className="mt-1 text-xs md:text-sm text-foreground leading-relaxed font-semibold">
                  {selectedArticle.recommendation}
                </p>
              </div>

              {/* Footer Close */}
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-glow-cyan transition-transform hover:-translate-y-0.5"
                >
                  Dismiss Briefing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
