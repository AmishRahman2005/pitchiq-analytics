import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { HomeFooter } from "@/components/site/HomeFooter";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "PitchIQ — Decode Every Delivery" },
      { name: "description", content: "AI-powered bowling intelligence: matchup plans, pitch heatmaps, and over simulation built on ball-by-ball cricket analytics." },
    ],
  }),
});

function Index() {
  return (
    <>
      <Hero />
      <HomeFooter />
    </>
  );
}
