import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, TrendingUp, AlertTriangle, Crosshair, Search, Database, ShieldAlert, Sparkles } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { getPlayerCountry } from "@/lib/utils";

type Matchup = {
  batsman: string;
  bowler: string;
  format?: string;
  runs?: number;
  balls?: number;
  wickets?: number;
  sr: number;
  dismissalProb: number;
  weakness: string;
  strength?: string;
  zones: number[];
  isCustom?: boolean;
  statsByCountry?: Record<string, {
    runs: number;
    balls: number;
    wickets: number;
    sr: number;
    dismissalProb: number;
    weakness: string;
    strength?: string;
    zones: number[];
  }>;
};

const defaultMatchups: Matchup[] = [
  {
    batsman: "V. Kohli",
    bowler: "P. Cummins",
    format: "Tests",
    sr: 71.2,
    dismissalProb: 18.4,
    weakness: "4th stump · 138kph",
    strength: "Elegant straight drive past the bowler",
    zones: [62, 41, 22, 84, 55, 30, 47, 71],
  },
  {
    batsman: "B. Stokes",
    bowler: "R. Khan",
    format: "ODIs",
    sr: 84.5,
    dismissalProb: 24.1,
    weakness: "Googly · middle stump",
    strength: "Powerful sweep shot through square leg",
    zones: [38, 70, 45, 22, 60, 81, 33, 50],
  },
  {
    batsman: "B. Azam",
    bowler: "J. Bumrah",
    format: "T20s",
    sr: 69.3,
    dismissalProb: 27.8,
    weakness: "Yorker · off stump",
    strength: "Crisp cover drive to overpitched balls",
    zones: [55, 30, 70, 18, 64, 42, 80, 36],
  },
];


type PlayerSuggestion = {
  name: string;
  role: "BAT" | "BOWL";
  details: string;
};

export function MatchupSection() {
  const [batQuery, setBatQuery] = useState("");
  const [bowlQuery, setBowlQuery] = useState("");
  const [batSuggestions, setBatSuggestions] = useState<PlayerSuggestion[]>([]);
  const [bowlSuggestions, setBowlSuggestions] = useState<PlayerSuggestion[]>([]);
  
  const [selectedBat, setSelectedBat] = useState("");
  const [selectedBowl, setSelectedBowl] = useState("");
  
  const [customMatchups, setCustomMatchups] = useState<Matchup[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simError, setSimError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");

  const countries = [
    "All",
    "India",
    "Australia",
    "England",
    "Pakistan",
    "South Africa",
    "New Zealand",
    "West Indies",
    "Sri Lanka",
    "Bangladesh",
    "Afghanistan",
    "Other"
  ];

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(" ").map(s => s[0]).join("").slice(0, 3).toUpperCase();
  };

  // Autocomplete fetch for batsman
  useEffect(() => {
    if (batQuery.trim().length < 2) {
      setBatSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(getApiUrl(`/search?q=${encodeURIComponent(batQuery)}&role=BAT`))
        .then(res => res.json())
        .then(data => setBatSuggestions(data))
        .catch(err => console.error("Error fetching batters autocomplete:", err));
    }, 150);
    return () => clearTimeout(timer);
  }, [batQuery]);

  // Autocomplete fetch for bowler
  useEffect(() => {
    if (bowlQuery.trim().length < 2) {
      setBowlSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(getApiUrl(`/search?q=${encodeURIComponent(bowlQuery)}&role=BOWL`))
        .then(res => res.json())
        .then(data => setBowlSuggestions(data))
        .catch(err => console.error("Error fetching bowlers autocomplete:", err));
    }, 150);
    return () => clearTimeout(timer);
  }, [bowlQuery]);

  const simulateMatchup = async () => {
    if (!selectedBat || !selectedBowl) {
      setSimError("Please select both a batsman and a bowler.");
      return;
    }
    
    setIsSimulating(true);
    setSimError("");
    
    try {
      const res = await fetch(getApiUrl(`/matchup?batter=${encodeURIComponent(selectedBat)}&bowler=${encodeURIComponent(selectedBowl)}`));
      if (!res.ok) {
        throw new Error("No face-off record found between these two players.");
      }
      
      const data = await res.json();
      
      // Separate T20s, ODIs, and Tests matchups
      const t20Match: Matchup = {
        batsman: data.batsman,
        bowler: data.bowler,
        format: "T20s",
        runs: data.t20.runs,
        balls: data.t20.balls,
        wickets: data.t20.wickets,
        sr: data.t20.sr,
        dismissalProb: data.t20.dismissalProb,
        weakness: data.t20.weakness,
        strength: data.t20.strength,
        zones: data.t20.zones,
        isCustom: true,
        statsByCountry: data.t20.statsByCountry
      };
      
      const odiMatch: Matchup = {
        batsman: data.batsman,
        bowler: data.bowler,
        format: "ODIs",
        runs: data.odi.runs,
        balls: data.odi.balls,
        wickets: data.odi.wickets,
        sr: data.odi.sr,
        dismissalProb: data.odi.dismissalProb,
        weakness: data.odi.weakness,
        strength: data.odi.strength,
        zones: data.odi.zones,
        isCustom: true,
        statsByCountry: data.odi.statsByCountry
      };
      
      const testMatch: Matchup = {
        batsman: data.batsman,
        bowler: data.bowler,
        format: "Tests",
        runs: data.test.runs,
        balls: data.test.balls,
        wickets: data.test.wickets,
        sr: data.test.sr,
        dismissalProb: data.test.dismissalProb,
        weakness: data.test.weakness,
        strength: data.test.strength,
        zones: data.test.zones,
        isCustom: true,
        statsByCountry: data.test.statsByCountry
      };
      
      setCustomMatchups([t20Match, odiMatch, testMatch]);
      
      // Reset simulator inputs
      setBatQuery("");
      setBowlQuery("");
      setSelectedBat("");
      setSelectedBowl("");
      setBatSuggestions([]);
      setBowlSuggestions([]);
    } catch (err: any) {
      setSimError(err.message || "Failed to simulate matchup.");
    } finally {
      setIsSimulating(false);
    }
  };

  function getMatchupStatsForCountry(m: Matchup, country: string) {
    if (m.statsByCountry && m.statsByCountry[country]) {
      return m.statsByCountry[country];
    }
    
    // Fallback if statsByCountry is missing (e.g. for default/mock matchups)
    const seed = (m.batsman.length + m.bowler.length + (m.format || '').length) % 100;
    
    if (country === "All") {
      return {
        runs: m.runs ?? Math.round(m.sr * 0.4),
        balls: m.balls ?? 40,
        wickets: m.wickets ?? Math.round(m.dismissalProb * 0.01 * (m.balls ?? 40)),
        sr: m.sr,
        dismissalProb: m.dismissalProb,
        weakness: m.weakness,
        strength: m.strength,
        zones: m.zones
      };
    }
    
    const hash = (country.charCodeAt(0) + seed) % 10;
    const batCountry = getPlayerCountry(m.batsman);
    const bowlCountry = getPlayerCountry(m.bowler);
    const isPlayerCountry = country === batCountry || country === bowlCountry;
    
    const hasStats = isPlayerCountry || (hash % 3 !== 0);
    if (!hasStats) {
      return {
        runs: 0,
        balls: 0,
        wickets: 0,
        sr: 0,
        dismissalProb: 0,
        weakness: `No recorded face-offs in ${country}.`,
        strength: "",
        zones: [0, 0, 0, 0, 0, 0, 0, 0]
      };
    }
    
    const share = isPlayerCountry ? 0.5 + (hash % 4) / 10.0 : 0.2 + (hash % 3) / 10.0;
    const baseBalls = m.balls ?? 40;
    const baseRuns = m.runs ?? Math.round(m.sr * 0.4);
    const baseWickets = m.wickets ?? Math.round(m.dismissalProb * 0.01 * baseBalls);
    
    const balls = Math.max(1, Math.round(baseBalls * share));
    const runs = Math.round(baseRuns * share);
    const wickets = baseWickets > 0 ? (hash % 2 === 0 ? 1 : 0) : 0;
    
    const sr = balls > 0 ? parseFloat(((runs / balls) * 100).toFixed(1)) : 0;
    const dismissalProb = balls > 0 ? parseFloat(((wickets / balls) * 100).toFixed(1)) : 0;
    
    const zones = m.zones.map((z: number) => Math.max(5, Math.min(100, Math.round(z * (0.8 + (hash % 5) * 0.08)))));
    
    return {
      runs,
      balls,
      wickets,
      sr,
      dismissalProb,
      weakness: wickets > 0 ? `Exploited by bowler in ${country} matches.` : m.weakness,
      strength: m.strength ? `Showed strong resistance in ${country} matches.` : "",
      zones
    };
  }

  const baseMatchups = customMatchups.length > 0 ? customMatchups : defaultMatchups;
  const filteredMatchups = baseMatchups;

  return (
    <section className="relative mx-auto mt-32 max-w-7xl px-6">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Swords size={14} /> Matchup Analysis
          </div>
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            Bowler vs batsman,
            <br />
            <span className="text-gradient-cyan">numbers that bite.</span>
          </h2>
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">
          Strike rate, dismissal probability, scoring zones and weakness maps — modeled across
          every recorded delivery between two players from the live **11M+ dataset**.
        </p>
      </div>

      {/* Duel Simulator Panel */}
      <div className="relative z-30 mb-10 rounded-3xl border border-white/5 bg-white/[0.02] glass-strong p-6 shadow-glow-cyan/5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
          <Sparkles size={14} className="animate-pulse" /> Live head-to-head simulator
        </div>
        
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_200px] items-start">
          {/* Batsman input */}
          <div className="relative">
            <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Select Batsman</div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={selectedBat ? selectedBat : batQuery}
                onChange={(e) => {
                  setBatQuery(e.target.value);
                  if (selectedBat) setSelectedBat("");
                }}
                placeholder="Search e.g. V Kohli, MS Dhoni..."
                className="w-full rounded-xl border border-white/10 bg-background/60 py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
              />
            </div>
            
            {batSuggestions.length > 0 && !selectedBat && (
              <div className="absolute z-50 mt-1.5 w-full rounded-xl bg-[#0b130e]/95 border border-white/10 shadow-2xl max-h-56 overflow-y-auto backdrop-blur-xl p-1.5 space-y-1 scrollbar-thin">
                {batSuggestions.map(s => {
                  const initials = getInitials(s.name);
                  return (
                    <button
                      key={s.name}
                      onClick={() => {
                        setSelectedBat(s.name);
                        setBatSuggestions([]);
                      }}
                      className="group flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-cyan-500/50 hover:bg-cyan-500/[0.06] hover:shadow-[0_0_15px_rgba(6,182,212,0.12)] px-3 py-2 text-left transition-all duration-300 cursor-pointer"
                    >
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-950 border border-white/10">
                        <span className="font-display text-[10px] font-bold text-white">
                          {initials}
                        </span>
                        <span className="absolute -bottom-1 -right-1 rounded-md px-1 text-[7px] font-extrabold uppercase bg-cyan-400 text-black">
                          {s.role}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">{s.name}</div>
                        <div className="truncate font-mono text-[9px] uppercase tracking-widest text-cyan-400/80">
                          {s.details}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="self-center text-center font-display text-xs font-bold text-muted-foreground pt-4 md:pt-0">VS</div>

          {/* Bowler input */}
          <div className="relative">
            <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Select Bowler</div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={selectedBowl ? selectedBowl : bowlQuery}
                onChange={(e) => {
                  setBowlQuery(e.target.value);
                  if (selectedBowl) setSelectedBowl("");
                }}
                placeholder="Search e.g. JJ Bumrah, PJ Cummins..."
                className="w-full rounded-xl border border-white/10 bg-background/60 py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
              />
            </div>
            
            {bowlSuggestions.length > 0 && !selectedBowl && (
              <div className="absolute z-50 mt-1.5 w-full rounded-xl bg-[#0b130e]/95 border border-white/10 shadow-2xl max-h-56 overflow-y-auto backdrop-blur-xl p-1.5 space-y-1 scrollbar-thin">
                {bowlSuggestions.map(s => {
                  const initials = getInitials(s.name);
                  return (
                    <button
                      key={s.name}
                      onClick={() => {
                        setSelectedBowl(s.name);
                        setBowlSuggestions([]);
                      }}
                      className="group flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-emerald-500/50 hover:bg-emerald-500/[0.06] hover:shadow-[0_0_15px_rgba(16,185,129,0.12)] px-3 py-2 text-left transition-all duration-300 cursor-pointer"
                    >
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-950 border border-white/10">
                        <span className="font-display text-[10px] font-bold text-white">
                          {initials}
                        </span>
                        <span className="absolute -bottom-1 -right-1 rounded-md px-1 text-[7px] font-extrabold uppercase bg-emerald-400 text-black">
                          {s.role}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{s.name}</div>
                        <div className="truncate font-mono text-[9px] uppercase tracking-widest text-emerald-400/80">
                          {s.details}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>


          {/* Simulate button */}
          <div className="pt-4 md:pt-4 w-full">
            <button
              onClick={simulateMatchup}
              disabled={isSimulating}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 py-2.5 text-sm font-bold text-white shadow-glow-cyan transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Swords size={16} />
              {isSimulating ? "Simulating..." : "Simulate Duel"}
            </button>
          </div>
        </div>

        {simError && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/[0.05] border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
            <ShieldAlert size={14} className="shrink-0" /> {simError}
          </div>
        )}
      </div>

      {/* Country wise filter dropdown */}
      <div className="mb-8 max-w-xs relative z-20">
        <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
          Filter matchup stats by venue country
        </label>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/60 hover:bg-black/60 transition-colors py-2.5 px-3 text-sm font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 cursor-pointer"
        >
          {countries.map((c) => (
            <option key={c} value={c} className="bg-[#0b130e] text-white">
              {c === "All" ? "All Countries" : c}
            </option>
          ))}
        </select>
      </div>

      {filteredMatchups.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.01] glass-strong p-12 text-center shadow-card min-h-[220px]">
          <Swords className="h-10 w-10 text-primary/30 animate-pulse mb-3" />
          <div className="font-display text-base font-bold">No Matchups Found</div>
          <div className="text-xs text-muted-foreground mt-1 max-w-[280px]">
            No tracked matchups contain a player from {selectedCountry}. Try simulating a live matchup at the top!
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <AnimatePresence>
          {filteredMatchups.map((m, i) => {
            const stats = getMatchupStatsForCountry(m, selectedCountry);
            const showDirectStats = stats.balls > 0;
            
            return (
              <motion.article
                key={m.batsman + m.bowler + (m.format || '')}
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                whileHover={{ y: -6 }}
                className={`group relative overflow-hidden rounded-3xl glass-strong p-5 shadow-card transition-all hover:shadow-glow-cyan ${
                  m.isCustom ? "border border-emerald-500/20 bg-emerald-500/[0.02]" : ""
                }`}
              >
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${
                  m.isCustom ? "from-transparent via-emerald-500/60 to-transparent" : "from-transparent via-primary/60 to-transparent"
                }`} />
                
                <div className="absolute right-4 top-4 flex gap-1.5 items-center">
                  {m.isCustom ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-500/20">
                      <Database size={8} /> Live Duel
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.03] px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-muted-foreground border border-white/5">
                      Mock Duel
                    </span>
                  )}
                  {m.format && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border ${
                      m.format === "T20s" 
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                        : m.format === "ODIs" 
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" 
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {m.format}
                    </span>
                  )}
                </div>
                
                {/* Heads */}
                <div className="flex items-center justify-between mt-3">
                  <PlayerChip name={m.batsman} role="BAT" />
                  <span className="font-display text-xs font-bold tracking-widest text-muted-foreground">VS</span>
                  <PlayerChip name={m.bowler} role="BOWL" reverse />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Stat icon={<TrendingUp size={12} />} label="Strike rate" value={stats.sr.toFixed(1)} />
                  <Stat icon={<AlertTriangle size={12} />} label="Dismissal" value={`${stats.dismissalProb}%`} accent="amber" />
                </div>

                {typeof stats.runs === 'number' && typeof stats.balls === 'number' && (
                  showDirectStats ? (
                    <div className="mt-3 grid grid-cols-3 gap-2 py-2.5 border-y border-white/5 text-center">
                      <div>
                        <div className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Runs</div>
                        <div className="font-display text-xs font-bold text-white mt-0.5">{stats.runs}</div>
                      </div>
                      <div>
                        <div className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Balls</div>
                        <div className="font-display text-xs font-bold text-white mt-0.5">{stats.balls}</div>
                      </div>
                      <div>
                        <div className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Outs</div>
                        <div className="font-display text-xs font-bold text-white mt-0.5">{stats.wickets}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 py-3 border-y border-white/5 text-center text-[10px] text-muted-foreground italic tracking-wide">
                      No face-off record in {selectedCountry === "All" ? (m.format || "this format") : selectedCountry}
                    </div>
                  )
                )}

                {/* Scoring zones radial bars */}
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <span>Scoring zones</span>
                    <span className="font-mono">8 sectors</span>
                  </div>
                  <div className="flex h-20 items-end gap-1 relative z-10">
                    {stats.zones.map((z, idx) => (
                      <div
                        key={idx}
                        className="group/bar relative flex-1 rounded-t-sm transition-all hover:scale-y-[1.05] hover:opacity-100 cursor-pointer"
                        style={{
                          height: `${z}%`,
                          background:
                            z > 60
                              ? "linear-gradient(180deg, oklch(0.85 0.20 55), oklch(0.65 0.18 35))"
                              : "linear-gradient(180deg, oklch(0.82 0.17 195), oklch(0.55 0.14 210))",
                          opacity: 0.85,
                        }}
                      >
                        {/* Tooltip on Hover showing sector details */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/bar:block bg-black/95 border border-white/10 text-[9px] font-bold font-mono text-emerald-400 px-2 py-1 rounded shadow-2xl whitespace-nowrap z-50 pointer-events-none scale-y-[1]">
                          {`${[
                            "Fine Leg",
                            "Square Leg",
                            "Mid-Wicket",
                            "Mid-On / Long-On",
                            "Mid-Off / Long-Off",
                            "Covers",
                            "Point",
                            "Third Man"
                          ][idx]}: ${z}%`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Complete Weakness & Strength details */}
                <div className="mt-4 flex flex-col gap-2 rounded-xl bg-white/[0.02] p-3 border border-white/5 text-xs">
                  <div className="flex items-start gap-2">
                    <Crosshair size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-widest block">Weakness</span>
                      <span className="font-medium text-foreground text-xs leading-normal mt-0.5 block">{stats.weakness}</span>
                    </div>
                  </div>
                  {stats.strength && (
                    <div className="flex items-start gap-2 pt-2 border-t border-white/5 mt-1">
                      <Sparkles size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-widest block">Strength</span>
                        <span className="font-medium text-foreground text-xs leading-normal mt-0.5 block">{stats.strength}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}

function PlayerChip({ name, role, reverse }: { name: string; role: string; reverse?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${reverse ? "flex-row-reverse text-right" : ""}`}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-card shadow-card shrink-0">
        <span className="font-display text-sm font-bold">
          {name.split(" ").map((p) => p[0]).join("")}
        </span>
        <span className={`absolute -bottom-1 ${reverse ? "-left-1" : "-right-1"} rounded-md bg-primary px-1 text-[8px] font-bold text-primary-foreground`}>
          {role}
        </span>
      </div>
      <div className="min-w-0">
        <div className="font-display text-sm font-semibold leading-tight truncate max-w-[100px]">{name}</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">{getPlayerCountry(name)}</div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent = "cyan",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: "cyan" | "amber";
}) {
  return (
    <div className="rounded-xl bg-white/[0.025] p-3 ring-1 ring-white/5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground truncate">
        {icon} {label}
      </div>
      <div className={`mt-1 font-display text-xl font-bold ${accent === "amber" ? "text-destructive" : "text-primary"}`}>
        {value}
      </div>
    </div>
  );
}
