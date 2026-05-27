import { Radio } from "lucide-react";

const insights = [
  "Bumrah's yorker accuracy this season: 84%",
  "Smith averages 9.3 in first 10 balls vs left-arm pace",
  "Powerplay wickets up 18% on day-night surfaces",
  "Rashid's googly strike rate vs RHB: a wicket every 14 balls",
  "Boundary % on 4th stump line dropped to 27% in T20Is",
  "Pat Cummins bowled 47% of his deliveries above 142kph",
  "Shaheen Afridi: 9 LBWs in last 50 PowerPlay overs",
  "Spin in middle overs averages 24.1 since 2023",
];

export function LiveInsights() {
  const stream = [...insights, ...insights];
  return (
    <section className="relative mt-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-destructive opacity-70" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-destructive" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-destructive">Live</span>
          <h3 className="font-display text-lg font-semibold">Insights ticker</h3>
          <Radio size={14} className="ml-auto text-muted-foreground" />
        </div>
      </div>

      <div className="relative overflow-hidden border-y border-border/60 bg-gradient-to-r from-card/40 via-background to-card/40 py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max animate-ticker gap-10 whitespace-nowrap font-mono text-sm">
          {stream.map((t, i) => (
            <span key={i} className="inline-flex items-center gap-3 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.82_0.17_195)]" />
              <span className="text-foreground">{t}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
