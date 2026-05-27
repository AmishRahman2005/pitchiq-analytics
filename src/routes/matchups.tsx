import { createFileRoute } from "@tanstack/react-router";
import { MatchupSection } from "@/components/site/MatchupSection";
import { PlayerExplorer } from "@/components/site/PlayerExplorer";

export const Route = createFileRoute("/matchups")({
  component: MatchupsPage,
  head: () => ({
    meta: [
      { title: "Matchups — PitchIQ" },
      { name: "description", content: "Compare any bowler against any batsman. Strike rate, dismissal probability, scoring zones, weakness maps." },
    ],
  }),
});

function MatchupsPage() {
  return (
    <div className="pt-32">
      <header className="mx-auto max-w-7xl px-6">
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">Matchups</div>
        <h1 className="max-w-3xl font-display text-4xl font-bold md:text-6xl">
          One-on-one, <span className="text-gradient-cyan">surgical.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Pull any bowler-batsman pair and see how the model rates the duel — strike rate,
          dismissal probability, scoring zones, and the channels that wreck them.
        </p>
      </header>
      <PlayerExplorer />
      <MatchupSection />
    </div>
  );
}
