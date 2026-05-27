import { createFileRoute } from "@tanstack/react-router";
import { StrategyLab } from "@/components/site/StrategyLab";

export const Route = createFileRoute("/strategy")({
  component: StrategyPage,
  head: () => ({
    meta: [
      { title: "Strategy Lab — PitchIQ" },
      { name: "description", content: "Simulate line, length, pace and field. Get expected wicket probability and economy in milliseconds." },
    ],
  }),
});

function StrategyPage() {
  return (
    <div className="pt-32">
      <header className="mx-auto max-w-7xl px-6">
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">Strategy Lab</div>
        <h1 className="max-w-3xl font-display text-4xl font-bold md:text-6xl">
          Build the over <span className="text-gradient-cyan">before you bowl it.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          A live simulator for plans. Tune line, length, pace, and field, and watch the predicted
          outcome adjust in real-time.
        </p>
      </header>
      <StrategyLab />
    </div>
  );
}
