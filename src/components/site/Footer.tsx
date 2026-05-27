

export function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-border/60">
      {/* Stadium silhouette */}
      <svg
        aria-hidden
        viewBox="0 0 1440 220"
        className="absolute inset-x-0 bottom-0 h-[220px] w-full text-primary/10"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="stad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path
          d="M0,220 L0,150 C120,120 240,90 360,110 C480,130 540,170 660,150 C780,130 840,80 960,90 C1080,100 1200,150 1320,140 L1440,135 L1440,220 Z"
          fill="url(#stad)"
        />
        {/* Floodlight poles */}
        {[120, 360, 720, 1080, 1320].map((x) => (
          <g key={x}>
            <line x1={x} y1="40" x2={x} y2="160" stroke="currentColor" strokeOpacity="0.4" />
            <rect x={x - 18} y="32" width="36" height="14" rx="3" fill="currentColor" fillOpacity="0.6" />
            <circle cx={x} cy="40" r="40" fill="oklch(0.82 0.17 195)" fillOpacity="0.05" />
          </g>
        ))}
      </svg>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-20 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-glow-cyan">
              <span className="font-display text-sm font-bold text-background">P</span>
            </span>
            <span className="font-display text-xl font-bold">
              Pitch<span className="text-primary">IQ</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Tactical intelligence for the modern bowler. Decode every delivery with ball-by-ball
            cricket analytics, AI matchup models, and strategy simulation.
          </p>
        </div>
        <div className="md:text-right">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            A personal project
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground md:ml-auto">
            Built for the love of cricket analytics — exploring how data can sharpen bowling
            strategy, one delivery at a time.
          </p>
        </div>
      </div>

      <div className="relative border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} PitchIQ Analytics. All deliveries reserved.</p>
          <p className="font-mono">v1.0 · Hawk-Eye-grade telemetry</p>
        </div>
      </div>
    </footer>
  );
}
