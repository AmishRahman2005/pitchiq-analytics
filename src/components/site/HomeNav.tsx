import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function HomeNav() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="absolute inset-x-0 top-0 z-50"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-glow-cyan">
            <span className="absolute inset-1 rounded-md bg-background/60" />
            <span className="relative font-display text-[13px] font-bold text-primary">P</span>
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Pitch<span className="text-primary">IQ</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { to: "/matchups", label: "Matchups" },
            { to: "/strategy", label: "Strategy" },
            { to: "/insights", label: "Insights" },
            { to: "/about", label: "About" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group relative rounded-lg px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-white"
              activeProps={{ className: "text-white" }}
            >
              {l.label}
              <span className="absolute inset-x-3 -bottom-0.5 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary to-transparent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <Link
          to="/matchups"
          className="group hidden items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow-cyan transition-transform hover:-translate-y-0.5 md:inline-flex"
        >
          Analyze
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}
