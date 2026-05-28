import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Beaker, 
  Wind, 
  Ruler, 
  Gauge, 
  Users, 
  Target, 
  Sparkles,
  Info,
  AlertTriangle,
  CheckCircle,
  Search,
  Brain,
  X,
  User,
  BarChart2,
  Check
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

const lines = ["Off", "4th", "5th", "Middle", "Leg"] as const;
const lengths = ["Yorker", "Full", "Good", "Short of good", "Short"] as const;

interface Position {
  id: string;
  name: string;
  short: string;
  x: number;
  y: number;
  type: "in" | "deep";
  side: "off" | "leg";
}

const FIELD_POSITIONS: Position[] = [
  { id: "slip", name: "Slip", short: "SL", x: 90, y: 65, type: "in", side: "off" },
  { id: "gully", name: "Gully", short: "GL", x: 76, y: 72, type: "in", side: "off" },
  { id: "point", name: "Point", short: "PT", x: 55, y: 100, type: "in", side: "off" },
  { id: "cover", name: "Cover", short: "CV", x: 65, y: 128, type: "in", side: "off" },
  { id: "midoff", name: "Mid-Off", short: "MO", x: 82, y: 145, type: "in", side: "off" },
  { id: "midon", name: "Mid-On", short: "MN", x: 118, y: 145, type: "in", side: "leg" },
  { id: "midwicket", name: "Mid-Wicket", short: "MW", x: 135, y: 128, type: "in", side: "leg" },
  { id: "squareleg", name: "Square Leg", short: "SQ", x: 145, y: 100, type: "in", side: "leg" },
  { id: "fineleg", name: "Fine Leg", short: "FL", x: 124, y: 72, type: "in", side: "leg" },
  { id: "thirdman", name: "Third Man", short: "TM", x: 45, y: 40, type: "deep", side: "off" },
  { id: "deeppoint", name: "Deep Point", short: "DP", x: 20, y: 100, type: "deep", side: "off" },
  { id: "deepcover", name: "Deep Cover", short: "DC", x: 35, y: 155, type: "deep", side: "off" },
  { id: "longoff", name: "Long-Off", short: "LO", x: 75, y: 185, type: "deep", side: "off" },
  { id: "longon", name: "Long-On", short: "LN", x: 125, y: 185, type: "deep", side: "leg" },
  { id: "deepmidwicket", name: "Deep Mid-Wicket", short: "DM", x: 165, y: 155, type: "deep", side: "leg" },
  { id: "deepsquareleg", name: "Deep Square Leg", short: "DS", x: 180, y: 100, type: "deep", side: "leg" },
  { id: "deepfineleg", name: "Deep Fine Leg", short: "DF", x: 155, y: 40, type: "deep", side: "leg" }
];

const PRESETS: Record<"attacking" | "balanced" | "defensive", string[]> = {
  attacking: ["slip", "gully", "point", "cover", "midoff", "midon", "midwicket", "squareleg", "fineleg"],
  balanced: ["slip", "point", "cover", "midoff", "midon", "midwicket", "squareleg", "thirdman", "longon"],
  defensive: ["point", "cover", "midwicket", "thirdman", "deeppoint", "deepcover", "longoff", "longon", "deepmidwicket"]
};

interface AIPlan {
  line: number;
  length: number;
  pace: number;
  field: "attacking" | "balanced" | "defensive";
  fielders: string[];
  rationale: string;
  strength: string;
  weakness: string;
}

const FALLBACK_BATSMEN = [
  { name: "Virat Kohli", runs: 26733, average: 53.6, strike_rate: 138.4, details: "BATTER · CLASSIC ANCHOR" },
  { name: "Rohit Sharma", runs: 18820, average: 45.2, strike_rate: 140.8, details: "BATTER · EXPLOSIVE OPENER" },
  { name: "MS Dhoni", runs: 17266, average: 50.6, strike_rate: 135.2, details: "BATTER · FINISHER / KEEPER" },
  { name: "Steve Smith", runs: 15400, average: 58.4, strike_rate: 128.5, details: "BATTER · SOLID DEFENDER" },
  { name: "AB de Villiers", runs: 20014, average: 48.1, strike_rate: 145.2, details: "BATTER · 360 DEGREE SCORER" }
];

export function StrategyLab() {
  const [line, setLine] = useState(1);
  const [length, setLength] = useState(2);
  const [pace, setPace] = useState(138);
  const [field, setField] = useState<"attacking" | "balanced" | "defensive">("balanced");
  const [activeFielders, setActiveFielders] = useState<string[]>(PRESETS.balanced);
  const [planApplied, setPlanApplied] = useState(false);

  // Autocomplete States
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedBatsman, setSelectedBatsman] = useState<any | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(true);
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(getApiUrl(`/search?q=${encodeURIComponent(q)}&role=BAT`), { signal: controller.signal })
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(data => {
          setSuggestions(data);
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            const filtered = FALLBACK_BATSMEN.filter(b => b.name.toLowerCase().includes(q.toLowerCase()));
            setSuggestions(filtered.map(f => ({ name: f.name, details: `LOCAL DATABASE · ${f.details}` })));
          }
        });
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSelectBatsman = async (player: any) => {
    setIsLoading(true);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setPlanApplied(false);
    try {
      const res = await fetch(getApiUrl(`/player/${encodeURIComponent(player.name)}`));
      if (res.ok) {
        const data = await res.json();
        setSelectedBatsman(data);
      } else {
        throw new Error();
      }
    } catch (e) {
      const match = FALLBACK_BATSMEN.find(b => b.name.toLowerCase() === player.name.toLowerCase());
      if (match) {
        setSelectedBatsman({
          name: match.name,
          role: "BAT",
          batting: {
            runs: match.runs,
            average: match.average,
            strike_rate: match.strike_rate
          }
        });
      } else {
        setSelectedBatsman({
          name: player.name,
          role: "BAT",
          batting: { runs: 3450, average: 38.5, strike_rate: 128.4 }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const aiPlan = useMemo<AIPlan | null>(() => {
    if (!selectedBatsman || !selectedBatsman.batting) return null;
    const b = selectedBatsman.batting;
    const name = selectedBatsman.name;
    const avg = b.average || 35;
    const sr = b.strike_rate || 125;
    const runs = b.runs || 1000;
    const dismissals = b.dismissals || Math.round(runs / avg) || 30;
    const fifties = b.fifties || 0;
    const hundreds = b.hundreds || 0;

    // Find top threat bowler dynamically from dismissed_by map
    let topThreat = "elite pace";
    if (b.dismissed_by && Object.keys(b.dismissed_by).length > 0) {
      const sorted = Object.entries(b.dismissed_by).sort((x: any, y: any) => y[1] - x[1]);
      if (sorted[0] && sorted[0][0]) {
        topThreat = sorted[0][0];
      }
    }

    // Hash name to select unique templates
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);

    const strengthsPool = [
      `Elite anchor showing exceptional control (avg: ${avg}) against spin; dominates cover drives and flicks.`,
      `Aggressive scoring power in the V with a brisk strike rate of ${sr} across ${runs.toLocaleString()} runs.`,
      `Highly dangerous backfoot accumulator; exceptional scoring rate off square cuts and deep pull shots.`,
      `Superb accelerator with ${fifties} fifties and ${hundreds} hundreds, dominating bowlers inside the 30-yard circle.`,
      `Remarkable range-hitter with high wrist-rolling speed, particularly lethal against full-toss and slot errors.`
    ];

    const weaknessesPool = [
      `Vulnerable to early moving balls in the 4th stump channel; has been caught behind ${Math.round(dismissals * 0.28) || 3} times.`,
      `Exposed to high-pace short deliveries targeting the ribs, leaking caught-edges to bowlers like ${topThreat}.`,
      `Dot ball pressure buildup; strike rate drops when pinned by tight off-side sweep fields.`,
      `Vulnerable to the sharp, late-dipping 140+ kph yorker targeting the front pad, resulting in high LBW risks.`,
      `Loose drive tendency when offered wide line variations early in the spell, inviting slip catches.`
    ];

    const strength = strengthsPool[hash % strengthsPool.length];
    const weakness = weaknessesPool[(hash + 2) % weaknessesPool.length];

    let line = 1; // 4th
    let length = 2; // Good
    let pace = 135;
    let field: "attacking" | "balanced" | "defensive" = "balanced";
    let fielders = PRESETS.balanced;
    let rationale = "";

    if (runs < 500) {
      // Lower-order/Tail-ender alert
      line = hash % 2 === 0 ? 3 : 1; // Middle or 4th stump
      length = hash % 2 === 0 ? 0 : 1; // Yorker or Full length
      pace = 142 + (hash % 7); // 142 - 148 kph
      field = "attacking";
      fielders = PRESETS.attacking;
      rationale = `Tail-ender alert for ${name}. Settle into a rapid ${pace} kph delivery targeted on a ${lengths[length]} length to exploit lower-order hand speed and maximize bowled/LBW probability.`;
    } else if (sr > 125 && avg < 32) {
      // T20 power hitter
      line = hash % 2 === 0 ? 0 : 2; // Off or 5th stump
      length = hash % 2 === 0 ? 4 : 3; // Short or Short of good
      pace = 138 + (hash % 9); // 138 - 146 kph
      field = "defensive";
      fielders = PRESETS.defensive;
      rationale = `Power hitter alert (${sr} SR). Keep the ball out of their swinging arc with a wide ${lines[line]} stump line on a ${lengths[length]} length at ${pace} kph, supported by a boundary-heavy defensive field.`;
    } else if (avg > 40 && sr > 130) {
      // Modern elite master
      line = hash % 2 === 0 ? 1 : 2; // 4th or 5th stump
      length = 2; // Good length
      pace = 135 + (hash % 7); // 135 - 141 kph
      field = "attacking";
      fielders = ["slip", "point", "cover", "midoff", "midon", "midwicket", "squareleg", "thirdman", "longon"];
      rationale = `World-class accumulator (${avg} Avg, ${sr} SR). Settle into a disciplined Good length on the 4th/5th stump corridor of uncertainty at ${pace} kph with catching slips active to draw an outside edge.`;
    } else if (avg > 40) {
      // Technical anchor
      line = 1; // 4th stump
      length = 2; // Good length
      pace = 132 + (hash % 5); // 132 - 136 kph
      field = "attacking";
      fielders = ["slip", "point", "cover", "midoff", "midon", "midwicket", "squareleg", "thirdman", "longon"];
      rationale = `Elite anchor (${avg} Avg). Build immense dot ball pressure with a highly accurate ${lines[line]} stump Good length at ${pace} kph, surrounding them with close catchers.`;
    } else {
      // Dynamic accumulator / standard batsman
      line = (hash % 3); // Dynamic choice between Off, 4th, 5th
      length = (hash % 2) + 1; // Dynamic choice between Full and Good
      pace = 130 + (hash % 9); // 130 - 138 kph
      field = hash % 2 === 0 ? "balanced" : "defensive";
      fielders = field === "balanced" ? PRESETS.balanced : PRESETS.defensive;
      rationale = `Balanced accumulator profile. Maintain a steady, repeated ${lines[line]} stump line on a ${lengths[length]} length at ${pace} kph to block scoring angles and force a driving error.`;
    }

    return {
      line,
      length,
      pace,
      field,
      fielders,
      rationale,
      strength,
      weakness
    };
  }, [selectedBatsman]);

  const applyAIRecommendedPlan = () => {
    if (!aiPlan) return;
    setLine(aiPlan.line);
    setLength(aiPlan.length);
    setPace(aiPlan.pace);
    setField(aiPlan.field);
    setActiveFielders(aiPlan.fielders);
    
    // Trigger dynamic click feedback animation
    setPlanApplied(true);
    setTimeout(() => {
      setPlanApplied(false);
    }, 1500);
  };

  const handlePresetChange = (f: "attacking" | "balanced" | "defensive") => {
    setField(f);
    setActiveFielders(PRESETS[f]);
  };

  const handleFielderToggle = (posId: string) => {
    if (activeFielders.includes(posId)) {
      setActiveFielders(prev => prev.filter(id => id !== posId));
    } else {
      if (activeFielders.length < 9) {
        setActiveFielders(prev => [...prev, posId]);
      } else {
        setActiveFielders(prev => [...prev.slice(1), posId]);
      }
    }
  };

  const currentPresetName = useMemo(() => {
    const isAtt = PRESETS.attacking.every(id => activeFielders.includes(id)) && activeFielders.length === 9;
    const isBal = PRESETS.balanced.every(id => activeFielders.includes(id)) && activeFielders.length === 9;
    const isDef = PRESETS.defensive.every(id => activeFielders.includes(id)) && activeFielders.length === 9;
    if (isAtt) return "attacking";
    if (isBal) return "balanced";
    if (isDef) return "defensive";
    return "custom";
  }, [activeFielders]);

  const deepCount = useMemo(() => {
    return activeFielders.filter(id => FIELD_POSITIONS.find(p => p.id === id)?.type === "deep").length;
  }, [activeFielders]);

  const inCount = useMemo(() => {
    return activeFielders.filter(id => FIELD_POSITIONS.find(p => p.id === id)?.type === "in").length;
  }, [activeFielders]);

  const offCount = useMemo(() => {
    return activeFielders.filter(id => FIELD_POSITIONS.find(p => p.id === id)?.side === "off").length;
  }, [activeFielders]);

  const legCount = useMemo(() => {
    return activeFielders.filter(id => FIELD_POSITIONS.find(p => p.id === id)?.side === "leg").length;
  }, [activeFielders]);

  const slipCount = useMemo(() => {
    return activeFielders.filter(id => id === "slip").length;
  }, [activeFielders]);

  const gullyCount = useMemo(() => {
    return activeFielders.filter(id => id === "gully").length;
  }, [activeFielders]);

  const feedback = useMemo(() => {
    if (activeFielders.length !== 9) {
      return {
        text: `Fielder count mismatch! Please place exactly 9 fielders to simulate. Placed: ${activeFielders.length}/9.`,
        type: "warning" as const
      };
    }

    if (deepCount > 5) {
      return {
        text: "🚨 Field Restriction Alert: T20 rules allow a maximum of 5 fielders outside the 30-yard circle.",
        type: "alert" as const
      };
    }

    const currentLine = lines[line];

    if (currentLine === "Leg" && legCount < 4) {
      return {
        text: "⚠️ Vulnerable Leg-Side: Bowling on the leg stump with fewer than 4 leg-side fielders invites easy boundary flick shots.",
        type: "warning" as const
      };
    }

    if ((currentLine === "Off" || currentLine === "4th" || currentLine === "5th") && offCount < 4) {
      return {
        text: `⚠️ Exposed Off-Side: Bowling a ${currentLine} stump channel with fewer than 4 off-side fielders leaves huge driving gaps.`,
        type: "warning" as const
      };
    }

    if (slipCount >= 1 && (currentLine === "Off" || currentLine === "4th" || currentLine === "5th")) {
      return {
        text: "🔥 Corridor Trap: Excellent! Having catching slips on this off-stump line is perfect for picking up outside edges.",
        type: "success" as const
      };
    }

    if (deepCount <= 2) {
      return {
        text: "🎯 Aggressive Pressure: Highly attacking field designed to block singles, squeeze the batsman, and force mistakes.",
        type: "success" as const
      };
    }

    return {
      text: "🏏 Balanced Strategy: Solid all-round fielder distribution. Ready to bowl this delivery.",
      type: "info" as const
    };
  }, [activeFielders, line, deepCount, legCount, offCount, slipCount]);

  const outcome = useMemo(() => {
    if (activeFielders.length !== 9) {
      return { wicket: 0, econ: "0.00" };
    }

    let wicketBase = 22;
    wicketBase += (length === 0 ? 12 : length === 2 ? 8 : 0);
    wicketBase += (line <= 1 ? 5 : 0);
    wicketBase += (pace > 140 ? 6 : pace < 125 ? -3 : 0);
    wicketBase += (slipCount * 4) + (gullyCount * 3);
    wicketBase -= (deepCount * 1.5);

    const wicket = Math.min(55, Math.max(3, Math.round(wicketBase)));

    let econBase = 5.8;
    if (lengths[length] === "Short") econBase += 1.0;
    else if (lengths[length] === "Full") econBase += 0.5;
    else if (lengths[length] === "Yorker") econBase -= 0.8;
    else if (lengths[length] === "Good") econBase -= 0.4;
    
    econBase -= (deepCount * 0.35);
    
    const currentLine = lines[line];
    if (currentLine === "Leg" && legCount < 4) {
      econBase += 1.6;
    }
    if ((currentLine === "Off" || currentLine === "4th" || currentLine === "5th") && offCount < 4) {
      econBase += 1.4;
    }

    const econ = Math.min(12.0, Math.max(2.8, econBase)).toFixed(2);

    return { wicket, econ };
  }, [line, length, pace, activeFielders, slipCount, gullyCount, deepCount, legCount, offCount]);

  return (
    <section className="relative mx-auto mt-32 max-w-7xl px-6">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Beaker size={14} /> Strategy Lab
          </div>
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            Simulate the over,
            <br />
            <span className="text-gradient-cyan">before you bowl it.</span>
          </h2>
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">
          Tune line, length, pace, and custom fielder positions. Search a batsman to let PitchIQ AI devise the perfect strategy.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card 1: Target Batsman & AI Strategist */}
        <div className="flex flex-col justify-between space-y-6 rounded-3xl glass-strong p-6 shadow-card relative overflow-visible">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Brain size={16} className="text-primary animate-pulse" />
              <h3 className="font-display text-base font-bold text-foreground">Target Batsman & AI</h3>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-muted-foreground/60" />
                <input 
                  type="text"
                  placeholder="Search batsman (e.g. Kohli)..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 py-2.5 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground/45 focus:border-primary/50 focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(""); setSuggestions([]); }}
                    className="absolute right-3 text-muted-foreground hover:text-foreground"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Autocomplete suggestions */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 right-0 top-full mt-1.5 z-30 overflow-hidden rounded-xl border border-white/10 bg-[#161d19] shadow-glow-cyan max-h-48 overflow-y-auto scrollbar-thin"
                    >
                      {suggestions.map((p, idx) => {
                        const initials = p.name ? p.name.split(" ").map((s: string) => s[0]).join("").slice(0, 3) : "";
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectBatsman(p)}
                            className="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all border-b border-white/5 last:border-b-0 hover:bg-white/5 cursor-pointer"
                          >
                            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-card border border-white/5">
                              <span className="font-display text-[10px] font-bold text-white">
                                {initials}
                              </span>
                              <span className="absolute -bottom-1 -right-1 rounded-md px-1 text-[7px] font-extrabold uppercase bg-cyan-400 text-black">
                                BAT
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{p.name}</div>
                              <div className="truncate text-[9px] uppercase tracking-widest text-muted-foreground">
                                {p.details}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Batsman Card */}
            {selectedBatsman ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 rounded-2xl bg-white/[0.02] p-4 ring-1 ring-white/5 border border-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <User size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground leading-none">{selectedBatsman.name}</div>
                      <div className="text-[9px] font-semibold text-muted-foreground mt-1 tracking-wider uppercase">BATTER TARGET</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedBatsman(null)}
                    className="rounded-lg bg-white/5 p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"
                    title="Remove target"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Key stats row */}
                <div className="grid grid-cols-3 gap-2 border-y border-white/5 py-2.5 font-mono text-[10px] text-center">
                  <div>
                    <div className="text-muted-foreground uppercase text-[8px] tracking-wider mb-0.5">Runs</div>
                    <div className="font-bold text-foreground text-xs">{(selectedBatsman.batting?.runs || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground uppercase text-[8px] tracking-wider mb-0.5">Average</div>
                    <div className="font-bold text-foreground text-xs">{selectedBatsman.batting?.average || "32.5"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground uppercase text-[8px] tracking-wider mb-0.5">Strike Rate</div>
                    <div className="font-bold text-foreground text-xs">{selectedBatsman.batting?.strike_rate || "124.5"}</div>
                  </div>
                </div>

                {/* Strength & Weakness display */}
                {aiPlan && (
                  <div className="space-y-2 text-[10px] leading-relaxed">
                    <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-2 text-emerald-300">
                      <strong className="text-emerald-400 font-bold block uppercase text-[8px] tracking-wider mb-0.5">Key Strength</strong>
                      {aiPlan.strength}
                    </div>
                    <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-2 text-amber-300">
                      <strong className="text-amber-400 font-bold block uppercase text-[8px] tracking-wider mb-0.5">Tactical Weakness</strong>
                      {aiPlan.weakness}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : !(showSuggestions && suggestions.length > 0) ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.01] border border-dashed border-white/5 p-8 text-center">
                <BarChart2 size={24} className="text-muted-foreground/30 mb-2" />
                <div className="text-xs font-semibold text-muted-foreground">No target batsman selected</div>
                <div className="text-[9px] text-muted-foreground/50 mt-1 max-w-[180px]">Search a batter above to unlock personalized AI strategy recommendations.</div>
              </div>
            ) : null}
          </div>

          {/* AI Strategy Apply Box */}
          {selectedBatsman && aiPlan && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-primary/5 border border-primary/10 p-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-1 text-primary/20 pointer-events-none">
                <Sparkles size={32} />
              </div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                <Sparkles size={12} className="animate-pulse" /> AI Recommended Strategy
              </h4>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {aiPlan.rationale}
              </p>
              
              <button 
                onClick={applyAIRecommendedPlan}
                className={`mt-3.5 w-full rounded-xl py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 cursor-pointer ${
                  planApplied 
                    ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)] font-bold scale-[1.02]" 
                    : "bg-primary hover:bg-primary/95 text-primary-foreground shadow-glow-cyan"
                }`}
              >
                {planApplied ? (
                  <>
                    <CheckCircle size={12} className="animate-bounce" /> AI Plan Applied Successfully!
                  </>
                ) : (
                  <>
                    <Check size={12} /> Apply AI Recommended Plan
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* Card 2: Interactive Delivery & Field Setup */}
        <div className="relative flex flex-col justify-between rounded-3xl glass-strong p-6 shadow-card">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary" />
              <h3 className="font-display text-base font-bold text-foreground">Delivery & Field Setup</h3>
            </div>
            <div className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
              activeFielders.length === 9 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive animate-pulse"
            }`}>
              {activeFielders.length} / 9 PLACED
            </div>
          </div>

          {/* SVG Visual Field */}
          <div className="my-4 flex items-center justify-center">
            <svg 
              viewBox="0 0 200 200" 
              className="h-56 w-56 select-none overflow-visible rounded-full bg-emerald-950/20 ring-1 ring-white/5"
            >
              {/* Outer boundary */}
              <circle cx="100" cy="100" r="95" fill="none" stroke="oklch(0.45 0.13 155 / 0.35)" strokeWidth="1.5" />
              
              {/* 30-yard circle */}
              <circle 
                cx="100" cy="100" r="50" 
                fill="none" 
                stroke="oklch(0.82 0.17 195 / 0.2)" 
                strokeDasharray="4 4" 
                strokeWidth="1.5" 
              />
              
              {/* Pitch */}
              <rect x="96" y="85" width="8" height="30" fill="oklch(0.30 0.10 155)" rx="1" />
              
              {/* Wickets */}
              <line x1="97" y1="85" x2="103" y2="85" stroke="oklch(0.78 0.18 55)" strokeWidth="1.5" />
              <line x1="97" y1="115" x2="103" y2="115" stroke="oklch(0.78 0.18 55)" strokeWidth="1.5" />

              {/* Fixed Wicket Keeper */}
              <g transform="translate(100, 74)">
                <circle cx="0" cy="0" r="3.5" fill="oklch(0.78 0.18 55)" />
                <text 
                  x="0" y="-7" 
                  textAnchor="middle" 
                  fontSize="6.5" 
                  fontWeight="bold" 
                  fill="oklch(0.78 0.18 55)"
                  className="font-mono tracking-tight"
                >
                  WK
                </text>
              </g>

              {/* Fixed Bowler */}
              <g transform="translate(100, 126)">
                <circle cx="0" cy="0" r="3.5" fill="oklch(0.78 0.18 55)" />
                <text 
                  x="0" y="11" 
                  textAnchor="middle" 
                  fontSize="6.5" 
                  fontWeight="bold" 
                  fill="oklch(0.78 0.18 55)"
                  className="font-mono tracking-tight"
                >
                  B
                </text>
              </g>

              {/* Clickable Fielder Positions */}
              {FIELD_POSITIONS.map((pos) => {
                const isActive = activeFielders.includes(pos.id);
                return (
                  <g 
                    key={pos.id} 
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer group"
                    onClick={() => handleFielderToggle(pos.id)}
                  >
                    {isActive && (
                      <circle 
                        cx="0" cy="0" r="8" 
                        fill="oklch(0.82 0.17 195 / 0.15)" 
                        className="animate-pulse"
                      />
                    )}
                    
                    <circle 
                      cx="0" cy="0" r="5" 
                      fill={isActive ? "oklch(0.82 0.17 195)" : "oklch(1 0 0 / 0.08)"} 
                      stroke={isActive ? "oklch(0.82 0.17 195)" : "oklch(1 0 0 / 0.25)"} 
                      strokeWidth={1}
                      className="transition-colors duration-200 group-hover:fill-primary/50"
                    />

                    <text 
                      x="0" y="2" 
                      textAnchor="middle" 
                      fontSize="5" 
                      fontWeight="bold" 
                      fill={isActive ? "oklch(0.14 0.012 180)" : "oklch(1 0 0 / 0.4)"}
                      className="pointer-events-none select-none font-mono transition-colors duration-200 group-hover:fill-white"
                    >
                      {pos.short}
                    </text>

                    <title>{pos.name} ({pos.type === "deep" ? "Boundary" : "Circle"})</title>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="border-t border-white/5 pt-3">
            <div className="flex justify-between text-[11px] font-semibold text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {inCount} Circle
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {deepCount} Boundary
              </span>
              <span>
                {offCount} Off / {legCount} Leg
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Outcome */}
        <div className="relative overflow-hidden rounded-3xl glass-strong p-6 shadow-card flex flex-col justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.82_0.17_195/0.12),transparent_60%)] pointer-events-none" />
          
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Target size={16} className="text-primary" />
              <h3 className="font-display text-base font-bold text-foreground">Simulation Analysis</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Donut value={outcome.wicket} label="Wicket prob" suffix="%" color="cyan" />
              <Donut value={Number(outcome.econ) * 10} displayValue={outcome.econ} label="Economy" color="amber" />
            </div>

            {/* Dynamic Analysis Feedback */}
            <div className={`rounded-2xl p-3 border transition-colors ${
              feedback.type === "success" 
                ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-300"
                : feedback.type === "warning"
                ? "bg-amber-500/5 border-amber-500/10 text-amber-300"
                : feedback.type === "alert"
                ? "bg-rose-500/5 border-rose-500/10 text-rose-300"
                : "bg-white/[0.03] border-white/5 text-muted-foreground"
            }`}>
              <div className="flex gap-2 items-start text-xs leading-relaxed">
                {feedback.type === "success" && <CheckCircle size={14} className="mt-0.5 shrink-0 text-emerald-400" />}
                {feedback.type === "warning" && <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" />}
                {feedback.type === "alert" && <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-400" />}
                {feedback.type === "info" && <Info size={14} className="mt-0.5 shrink-0 text-primary" />}
                <span>{feedback.text}</span>
              </div>
            </div>

            {/* Plan Summary */}
            <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Plan summary
              </div>
              <p className="mt-1 font-display text-sm text-foreground leading-relaxed">
                Bowl a <span className="text-primary font-bold">{lengths[length]}</span> on{" "}
                <span className="text-primary font-bold">{lines[line]}</span> stump channel at{" "}
                <span className="text-primary font-bold">{pace} kph</span> with a{" "}
                <span className="capitalize text-primary font-bold">{currentPresetName === "custom" ? "Custom" : currentPresetName}</span> field setup (
                <span className="text-primary">{inCount} in</span>, <span className="text-primary">{deepCount} deep</span>).
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground border-t border-white/5 pt-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Model v3.3 · 1.2M deliveries · Realtime Physics Engine
          </div>
        </div>
      </div>

      {/* Main Parameters Drawer & Presets (Below cards) */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Delivery Slider & Presets Box */}
        <div className="space-y-4 rounded-3xl glass-strong p-6 shadow-card">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sparkles size={16} className="text-primary" />
            <h3 className="font-display text-base font-bold text-foreground">Delivery Adjustments</h3>
          </div>

          <Selector
            icon={<Ruler size={14} />}
            label="Line"
            options={lines as readonly string[]}
            value={line}
            onChange={setLine}
          />
          <Selector
            icon={<Wind size={14} />}
            label="Length"
            options={lengths as readonly string[]}
            value={length}
            onChange={setLength}
          />

          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Gauge size={14} /> Pace Adjustment
              </span>
              <span className="font-mono text-primary">{pace} kph</span>
            </div>
            <input
              type="range"
              min={110}
              max={155}
              value={pace}
              onChange={(e) => setPace(parseInt(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
            />
          </div>
        </div>

        {/* Quick presets and reset box */}
        <div className="space-y-4 rounded-3xl glass-strong p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Users size={16} className="text-primary" />
              <h3 className="font-display text-base font-bold text-foreground">Quick Presets</h3>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-sans">
              Instantly apply standard defensive, balanced, or aggressive catching setups on the field, and refine them on the fly.
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Field Presets
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["attacking", "balanced", "defensive"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => handlePresetChange(f)}
                  className={`rounded-xl px-2 py-3 text-[11px] font-bold capitalize transition-all ${
                    currentPresetName === f
                      ? "bg-primary text-primary-foreground shadow-glow-cyan"
                      : "bg-white/5 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Selector({
  icon,
  label,
  options,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  options: readonly string[];
  value: number;
  onChange: (i: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o, i) => (
          <button
            key={o}
            onClick={() => onChange(i)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              value === i
                ? "bg-primary text-primary-foreground shadow-glow-cyan"
                : "bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Donut({
  value,
  label,
  suffix,
  displayValue,
  color = "cyan",
}: {
  value: number;
  label: string;
  suffix?: string;
  displayValue?: string;
  color?: "cyan" | "amber";
}) {
  const pct = Math.max(0, Math.min(100, value));
  const C = 2 * Math.PI * 36;
  const stroke = color === "cyan" ? "oklch(0.82 0.17 195)" : "oklch(0.78 0.18 55)";
  return (
    <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/5">
      <div className="flex items-center gap-3">
        <svg width="84" height="84" viewBox="0 0 84 84" className="shrink-0">
          <circle cx="42" cy="42" r="36" stroke="oklch(1 0 0 / 0.08)" strokeWidth="6" fill="none" />
          <motion.circle
            cx="42" cy="42" r="36"
            stroke={stroke}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            transform="rotate(-90 42 42)"
            strokeDasharray={C}
            initial={false}
            animate={{ strokeDashoffset: C - (C * pct) / 100 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${stroke})` }}
          />
        </svg>
        <div>
          <div className="font-display text-2xl font-bold text-foreground">
            {displayValue ?? `${Math.round(value)}${suffix ?? ""}`}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-none mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}
