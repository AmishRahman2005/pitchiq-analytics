import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export function HomeFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden border-t border-white/5"
    >
      {/* Stadium silhouette */}
      <svg
        aria-hidden
        viewBox="0 0 1440 220"
        className="absolute inset-x-0 bottom-0 h-[220px] w-full text-primary/10"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="stad-home" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path
          d="M0,220 L0,150 C120,120 240,90 360,110 C480,130 540,170 660,150 C780,130 840,80 960,90 C1080,100 1200,150 1320,140 L1440,135 L1440,220 Z"
          fill="url(#stad-home)"
        />
        {[120, 360, 720, 1080, 1320].map((x) => (
          <g key={x}>
            <line x1={x} y1="40" x2={x} y2="160" stroke="currentColor" strokeOpacity="0.4" />
            <rect x={x - 18} y="32" width="36" height="14" rx="3" fill="currentColor" fillOpacity="0.6" />
            <circle cx={x} cy="40" r="40" fill="oklch(0.82 0.17 195)" fillOpacity="0.05" />
          </g>
        ))}
      </svg>

      <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-16">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-glow-cyan">
              <span className="font-display text-xs font-bold text-background">P</span>
            </span>
            <span className="font-display text-lg font-bold">
              Pitch<span className="text-primary">IQ</span>
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/matchups" className="hover:text-foreground transition-colors">Matchups</Link>
            <Link to="/strategy" className="hover:text-foreground transition-colors">Strategy</Link>
            <Link to="/insights" className="hover:text-foreground transition-colors">Insights</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          </nav>

          <p className="text-xs text-muted-foreground font-mono">
            © {new Date().getFullYear()} · A personal project
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
