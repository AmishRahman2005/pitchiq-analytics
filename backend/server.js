import express from 'express';
import cors from 'cors';
import fs from 'fs';
import readline from 'readline';

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const battersPath = 'data/batters.json';
const bowlersPath = 'data/bowlers.json';

let battersFile = battersPath;
let bowlersFile = bowlersPath;

if (!fs.existsSync(battersFile)) {
    battersFile = 'backend/data/batters.json';
    bowlersFile = 'backend/data/bowlers.json';
}

function getPlayerCountry(name) {
    if (!name) return "Other";
    const n = name.toLowerCase();
    
    // India
    if (
      n.includes("kohli") || n.includes("bumrah") || n.includes("rohit") || n.includes("sharma") || 
      n.includes("dhoni") || n.includes("tendulkar") || n.includes("jadeja") || n.includes("ashwin") || 
      n.includes("gill") || n.includes("rahul") || n.includes("pant") || n.includes("pandya") || 
      n.includes("jaiswal") || n.includes("iyer") || n.includes("samson") || n.includes("suryakumar") || 
      n.includes("chahal") || n.includes("kuldeep") || n.includes("siraj") || n.includes("shami") || 
      n.includes("bhuvneshwar") || n.includes("axar") || n.includes("rahane") || n.includes("pujara") || 
      n.includes("sehwag") || n.includes("dravid") || n.includes("ganguly") || n.includes("laxman") || 
      n.includes("gambhir") || n.includes("yuvraj") || n.includes("raina") || n.includes("dhawan") ||
      n.includes("dube") || n.includes("rinku") || n.includes("jurel") || n.includes("bihari") || 
      n.includes("shankar") || n.includes("prasidh") || n.includes("bhanuka")
    ) {
      return "India";
    }
    
    // Australia
    if (
      n.includes("cummins") || n.includes("smith") || n.includes("warner") || n.includes("labuschagne") || 
      n.includes("head") || n.includes("marsh") || n.includes("starc") || n.includes("hazlewood") || 
      n.includes("lyon") || n.includes("maxwell") || n.includes("green") || n.includes("carey") || 
      n.includes("zampa") || n.includes("wade") || n.includes("stoinis") || n.includes("finch") || 
      n.includes("ponting") || n.includes("clarke") || n.includes("hussey") || n.includes("gilchrist") || 
      n.includes("hayden") || n.includes("mcgrath") || n.includes("warne") || n.includes("langer") || 
      n.includes("watson") || n.includes("johnson") || n.includes("khawaja") || n.includes("handscomb") ||
      n.includes("inglis") || n.includes("david") || n.includes("agar") || n.includes("behrendorff")
    ) {
      return "Australia";
    }
    
    // England
    if (
      n.includes("stokes") || n.includes("root") || n.includes("buttler") || n.includes("brook") || 
      n.includes("bairstow") || n.includes("anderson") || n.includes("broad") || n.includes("wood") || 
      n.includes("rashid") || n.includes("ali") || n.includes("archer") || n.includes("crawley") || 
      n.includes("duckett") || n.includes("pope") || n.includes("woakes") || n.includes("curran") || 
      n.includes("roy") || n.includes("morgan") || n.includes("cook") || n.includes("pietersen") || 
      n.includes("flintoff") || n.includes("salt") || n.includes("hartley") || n.includes("ahmed") ||
      n.includes("tongue") || n.includes("carse") || n.includes("livingstone") || n.includes("jacks")
    ) {
      return "England";
    }
    
    // Pakistan
    if (
      n.includes("babar") || n.includes("azam") || n.includes("rizwan") || n.includes("shaheen") || 
      n.includes("afridi") || n.includes("naseem") || n.includes("rauf") || n.includes("shadab") || 
      n.includes("fakhar") || n.includes("zaman") || n.includes("imam") || n.includes("masood") || 
      n.includes("iftikhar") || n.includes("imad") || n.includes("wasim") || n.includes("amir") || 
      n.includes("inzamam") || n.includes("younis") || n.includes("misbah") || n.includes("malik") || 
      n.includes("hafeez") || n.includes("akhtar") || n.includes("saim") || n.includes("ayub") ||
      n.includes("haris") || n.includes("abrar") || n.includes("hasan") || n.includes("dahani")
    ) {
      return "Pakistan";
    }
    
    // South Africa
    if (
      n.includes("rabada") || n.includes("de villiers") || n.includes("du plessis") || n.includes("miller") || 
      n.includes("de kock") || n.includes("bavuma") || n.includes("markram") || n.includes("klaasen") || 
      n.includes("jansen") || n.includes("maharaj") || n.includes("coetzee") || n.includes("ngidi") || 
      n.includes("nortje") || n.includes("steyn") || n.includes("morkel") || n.includes("kallis") || 
      n.includes("amla") || n.includes("tahir") || n.includes("elgar") || n.includes("stubbs") ||
      n.includes("rickelton") || n.includes("breetzke") || n.includes("burger") || n.includes("phehlukwayo")
    ) {
      return "South Africa";
    }
    
    // New Zealand
    if (
      n.includes("williamson") || n.includes("boult") || n.includes("southee") || n.includes("mitchell") || 
      n.includes("latham") || n.includes("conway") || n.includes("phillips") || n.includes("santner") || 
      n.includes("ravindra") || n.includes("henry") || n.includes("ferguson") || n.includes("bracewell") || 
      n.includes("guptill") || n.includes("taylor") || n.includes("mccullum") || n.includes("vettori") || 
      n.includes("fleming") || n.includes("chapman") || n.includes("seifert") || n.includes("sodhi") ||
      n.includes("jamieson") || n.includes("milne") || n.includes("o'rourke") || n.includes("sears")
    ) {
      return "New Zealand";
    }
    
    // West Indies
    if (
      n.includes("gayle") || n.includes("russell") || n.includes("pooran") || n.includes("hetmyer") || 
      n.includes("hope") || n.includes("joseph") || n.includes("holder") || n.includes("chase") || 
      n.includes("powell") || n.includes("king") || n.includes("shepherd") || n.includes("hosein") || 
      n.includes("narine") || n.includes("pollard") || n.includes("bravo") || n.includes("sammy") || 
      n.includes("chanderpaul") || n.includes("lara") || n.includes("sarwan") || n.includes("walsh") || 
      n.includes("ambrose") || n.includes("carty") || n.includes("motie") ||
      n.includes("rutherford") || n.includes("thomas") || n.includes("cariah")
    ) {
      return "West Indies";
    }
    
    // Sri Lanka
    if (
      n.includes("hasaranga") || n.includes("mendis") || n.includes("nissanka") || n.includes("samarawickrama") || 
      n.includes("asalanka") || n.includes("shanaka") || n.includes("theekshana") || n.includes("madushanka") || 
      n.includes("pathirana") || n.includes("karunaratne") || n.includes("mathews") || n.includes("de silva") || 
      n.includes("sangakkara") || n.includes("jayawardene") || n.includes("dilshan") || n.includes("muralitharan") || 
      n.includes("malinga") || n.includes("herath") || n.includes("chameera") || n.includes("rajitha") ||
      n.includes("wellalage") || n.includes("fernando") || n.includes("madushan")
    ) {
      return "Sri Lanka";
    }
    
    // Bangladesh
    if (
      n.includes("shakib") || n.includes("mushfiqur") || n.includes("tamim") || n.includes("mahmudullah") || 
      n.includes("litton") || n.includes("mustafizur") || n.includes("taskin") || n.includes("mehidy") || 
      n.includes("miraz") || n.includes("shanto") || n.includes("hridoy") || n.includes("shoriful") ||
      n.includes("tawhid") || n.includes("hasan") || n.includes("tanzim") || n.includes("rishad") ||
      n.includes("nasum") || n.includes("ebadat")
    ) {
      return "Bangladesh";
    }
    
    // Afghanistan
    if (
      n.includes("gurbaz") || n.includes("ibrahim") || n.includes("zadran") || n.includes("nabi") || 
      n.includes("mujib") || n.includes("mujeeb") || n.includes("naveen") || n.includes("farooqi") || 
      n.includes("omarzai") || n.includes("noor") || n.includes("janat") ||
      n.includes("ul-haq") || n.includes("shahidi") || n.includes("rahmat") || n.includes("ikram")
    ) {
      return "Afghanistan";
    }
  
    return "Other";
}

// Memory indexes for player and matchup lookups
const batters = new Map();
const bowlers = new Map();
let totalRecords = 0;

const loadData = () => {
    return new Promise((resolve) => {
        console.log("Loading pre-aggregated databases from JSON...");
        
        if (!fs.existsSync(battersFile) || !fs.existsSync(bowlersFile)) {
            console.error("ERROR: Pre-aggregated JSON databases not found! Please run extraction first.");
            process.exit(1);
        }
        
        try {
            const battersData = JSON.parse(fs.readFileSync(battersFile, 'utf8'));
            const bowlersData = JSON.parse(fs.readFileSync(bowlersFile, 'utf8'));
            
            for (const [k, v] of Object.entries(battersData)) {
                batters.set(k, v);
                totalRecords += v.balls;
            }
            for (const [k, v] of Object.entries(bowlersData)) {
                bowlers.set(k, v);
            }
            
            console.log("Database loaded successfully!");
            console.log(`Indexed ${batters.size} batters and ${bowlers.size} bowlers.`);
            resolve();
        } catch (err) {
            console.error("CRITICAL ERROR loading pre-aggregated databases: ", err);
            process.exit(1);
        }
    });
};

// Autocomplete search endpoint
app.get('/search', (req, res) => {
    const q = (req.query.q || '').toLowerCase().trim();
    const role = req.query.role || 'ALL';
    
    if (q.length < 2) {
        return res.json([]);
    }
    
    const matches = [];
    
    if (role === 'ALL' || role === 'BAT') {
        for (const [key, value] of batters.entries()) {
            if (key.includes(q)) {
                matches.push({
                    name: value.name,
                    role: 'BAT',
                    details: `LIVE DATABASE · BATTER · ${value.runs.toLocaleString()} RUNS`
                });
                if (matches.length >= 10) break;
            }
        }
    }
    
    if (role === 'ALL' || role === 'BOWL') {
        for (const [key, value] of bowlers.entries()) {
            if (key.includes(q) && !matches.some(m => m.name === value.name)) {
                matches.push({
                    name: value.name,
                    role: 'BOWL',
                    details: `LIVE DATABASE · BOWLER · ${value.wickets} WICKETS`
                });
                if (matches.length >= 15) break;
            }
        }
    }
    
    res.json(matches.slice(0, 10));
});

// Data-driven AI analytical engine to generate tailored weaknesses and strengths
function generatePlayerAIAnalysis(playerData, isBatter) {
    if (!playerData) {
        return {
            weakness: isBatter ? "Variable bounce & lateral seam movement" : "Flat wickets & heavy boundary hitters",
            strength: isBatter ? "Lofted cover drive over the infield" : "Disciplined length bowler"
        };
    }

    if (isBatter) {
        const avg = playerData.dismissals > 0 ? (playerData.runs / playerData.dismissals) : playerData.runs;
        const sr = playerData.balls > 0 ? (playerData.runs / playerData.balls * 100) : 0;
        
        // Find top bowler who dismissed them
        let worstBowler = "None";
        let maxDismissals = 0;
        if (playerData.dismissedBy && Object.keys(playerData.dismissedBy).length > 0) {
            const sorted = Object.entries(playerData.dismissedBy).sort((a, b) => b[1] - a[1]);
            worstBowler = sorted[0][0];
            maxDismissals = sorted[0][1];
        }
        
        // Count spin vs pace outs
        const spinners = ["rashid", "ashwin", "jadeja", "chahal", "lyon", "narine", "maharaj", "shakib", "tahir", "ali", "santner", "sodhi", "hasaranga", "zampa", "kuldeep", "yuzvendra", "muralitharan", "warne", "kumble", "ajmal", "sharma", "axar", "trent", "boult"];
        let fastOuts = 0;
        let spinOuts = 0;
        if (playerData.dismissedBy) {
            Object.entries(playerData.dismissedBy).forEach(([bowler, count]) => {
                const bLower = bowler.toLowerCase();
                if (spinners.some(s => bLower.includes(s))) {
                    spinOuts += count;
                } else {
                    fastOuts += count;
                }
            });
        }
        
        // Build dynamic weakness
        let weakness = "";
        if (maxDismissals > 0) {
            if (spinOuts > fastOuts) {
                weakness = `Slow left-arm/wrist-spin. Struggles against drift, flight, and sharp turn. Modeled threat: ${worstBowler} (dismissed them ${maxDismissals} times in live matchups).`;
            } else {
                weakness = `High-velocity seam & swing corridor outside 4th/5th stump line. Susceptible to early-wicket risk when ball is moving. Modeled threat: ${worstBowler} (dismissed them ${maxDismissals} times).`;
            }
        } else {
            if (avg < 25) {
                weakness = "Heavy swing & lateral seam movement corridor of uncertainty. High early-wicket risk before getting eyes set in.";
            } else if (sr < 110) {
                weakness = "Slow pacing and conservative strike rotation in middle overs. Vulnerable to defensive containing lines and spin squeeze traps.";
            } else {
                weakness = "Vulnerable to high-velocity short-pitched deliveries targeting the ribs and wide off-stump changes-of-pace.";
            }
        }
        
        // Build dynamic strength
        let strength = "";
        if (avg >= 40 && sr >= 130) {
            strength = `Elite multi-format accumulator. Dominates cover drives and flick shots; exceptionally fast wrist work enables range-hitting inside the V.`;
        } else if (avg >= 35) {
            strength = `Technically sound anchor. Possesses exceptional backfoot control, superb leave judgment in the corridor of uncertainty, and dominant pull shots.`;
        } else if (sr >= 125) {
            strength = `High-velocity accelerator and boundary specialist. Dominates powerplays and death overs with innovative ramp and sweep shots.`;
        } else {
            strength = `Disciplined batsman showing strong straight drive mechanics and high scoring conversion rates against overpitched deliveries.`;
        }
        
        return { weakness, strength };
    } else {
        const economy = playerData.balls > 0 ? ((playerData.runsConceded / playerData.balls) * 6) : 0;
        const wickets = playerData.wickets;
        const avg = wickets > 0 ? (playerData.runsConceded / wickets) : 0;
        const sr = wickets > 0 ? (playerData.balls / wickets) : 24;
        
        // Find favorite target
        let favoriteTarget = "None";
        let maxWickets = 0;
        if (playerData.wicketsList && Object.keys(playerData.wicketsList).length > 0) {
            const sorted = Object.entries(playerData.wicketsList).sort((a, b) => b[1] - a[1]);
            favoriteTarget = sorted[0][0];
            maxWickets = sorted[0][1];
        }
        
        // Build dynamic weakness
        let weakness = "";
        if (economy > 8.5) {
            weakness = `Struggles to contain runs when batsmen target deep boundaries on flat batting tracks. Vulnerable to aggressive power-hitters under pressure.`;
        } else if (sr > 30) {
            weakness = `Lacks lethal, wicket-taking deliveries on placid pitches; relies on defensive containing lines that batsman can comfortably navigate.`;
        } else if (favoriteTarget !== "None") {
            weakness = `Occasionally vulnerable to aggressive counter-attacks by left-handed batsmen who disrupt line and length adjustments.`;
        } else {
            weakness = `Flat batting tracks and heavy boundary hitters. Performance drops when pitch offers zero lateral movement or seam bounce.`;
        }
        
        // Build dynamic strength
        let strength = "";
        if (economy < 6.5 && sr < 20) {
            strength = `Elite strike bowler. Combines lethal wicket-taking deliveries (sharp leg-cutters/outswingers) with exceptional run containment.`;
        } else if (economy < 7.2) {
            strength = `Superb defensive containment bowler. Exceptional accuracy targeting the blockhole and wide-stump channels under pressure.`;
        } else if (sr < 22) {
            strength = `Aggressive wicket-taker. Exceptional bounce and lateral movement; excels at forcing top-order errors and breaking partnerships.`;
        } else {
            strength = `Disciplined length bowler. Extremely reliable line and length, creating pressure through dot-ball consistency.`;
        }
        
        return { weakness, strength };
    }
}

// Data-driven AI analytical engine to generate tailored fun facts for players
function generatePlayerFunFact(playerData, isBatter) {
    if (!playerData) {
        return "Did you know? This player has indexed extensive career stats in our live database.";
    }

    if (isBatter) {
        const runs = playerData.runs || 0;
        const balls = playerData.balls || 0;
        const avg = playerData.dismissals > 0 ? (playerData.runs / playerData.dismissals) : playerData.runs;
        const sr = playerData.balls > 0 ? (playerData.runs / playerData.balls * 100) : 0;
        
        if (playerData.doubleHundreds > 0) {
            return `Did you know? This batsman has registered ${playerData.doubleHundreds} double centuries in our database, displaying a supreme appetite for marathon innings.`;
        }
        if (playerData.hundreds > 10) {
            return `Did you know? This batsman has registered ${playerData.hundreds} centuries in our database, making them one of the premier match-winners of their generation.`;
        }
        if (playerData.ducks > 12) {
            return `Did you know? Despite their legendary batting records, this player has registered ${playerData.ducks} career ducks, proving even cricket icons face early vulnerability!`;
        }
        if (sr > 140) {
            return `Did you know? This batsman scores at a blistering career strike rate of ${sr.toFixed(1)}, making them a certified bowler's nightmare in short-form cricket.`;
        }
        
        // Find most productive over
        if (playerData.runsByOver && Object.keys(playerData.runsByOver).length > 0) {
            const sortedOvers = Object.entries(playerData.runsByOver).sort((a, b) => b[1] - a[1]);
            if (sortedOvers[0][1] > 100) {
                return `Did you know? Over #${sortedOvers[0][0]} is this batsman's absolute favorite, yielding a total of ${sortedOvers[0][1].toLocaleString()} runs in our database!`;
            }
        }
        
        return `Did you know? This batsman has faced a total of ${balls.toLocaleString()} balls in our live database, accumulating ${runs.toLocaleString()} career runs.`;
    } else {
        const economy = playerData.balls > 0 ? ((playerData.runsConceded / playerData.balls) * 6) : 0;
        const wickets = playerData.wickets || 0;
        const balls = playerData.balls || 0;
        const sr = wickets > 0 ? (playerData.balls / wickets) : 24;
        
        if (playerData.fiveWickets > 0) {
            return `Did you know? This bowler has registered ${playerData.fiveWickets} five-wicket hauls in our database, proving their ability to single-handedly dismantle batting lineups.`;
        }
        if (playerData.wicketsList && Object.keys(playerData.wicketsList).length > 0) {
            const sortedVictims = Object.entries(playerData.wicketsList).sort((a, b) => b[1] - a[1]);
            if (sortedVictims[0][1] > 3) {
                return `Did you know? This bowler's favorite target is ${sortedVictims[0][0]}, dismissing them a staggering ${sortedVictims[0][1]} times in our database!`;
            }
        }
        if (economy > 0 && economy < 6.5) {
            return `Did you know? This bowler boasts an exceptional economy rate of ${economy.toFixed(2)} runs per over, making them one of the hardest bowlers to score against in cricket history.`;
        }
        if (sr > 0 && sr < 20) {
            return `Did you know? This bowler takes a wicket every ${sr.toFixed(1)} balls on average, indicating a highly lethal and aggressive wicket-taking style.`;
        }
        
        return `Did you know? This bowler has delivered a staggering ${balls.toLocaleString()} balls in our database, conceding ${playerData.runsConceded?.toLocaleString() || 0} runs and taking ${wickets} wickets.`;
    }
}

// Head-to-head matchup analysis split by T20, ODI, and Test
app.get('/matchup', (req, res) => {
    const batterName = req.query.batter || '';
    const bowlerName = req.query.bowler || '';
    
    const batterLower = batterName.toLowerCase().trim();
    const bowlerLower = bowlerName.toLowerCase().trim();
    
    const bKey = [...batters.keys()].find(k => k === batterLower || k.includes(batterLower));
    const bwKey = [...bowlers.keys()].find(k => k === bowlerLower || k.includes(bowlerLower));
    
    if (!bKey || !bwKey) {
        return res.status(404).json({ error: "One or both players not found" });
    }
    
    const actualBatter = batters.get(bKey).name;
    const actualBowler = bowlers.get(bwKey).name;
    
    // Load matchups partition dynamically to save memory!
    const letter = /^[a-z]$/.test(bKey[0]) ? bKey[0] : 'other';
    let matchupsPart = {};
    let partFile = `data/matchups_${letter}.json`;
    if (!fs.existsSync(partFile)) {
        partFile = `backend/data/matchups_${letter}.json`;
    }
    
    if (fs.existsSync(partFile)) {
        try {
            matchupsPart = JSON.parse(fs.readFileSync(partFile, 'utf8'));
        } catch (e) {
            console.error(`Error loading matchup partition ${partFile}:`, e);
        }
    }
    
    const formats = ['t20', 'odi', 'test'];
    const responseData = {
        batsman: actualBatter,
        bowler: actualBowler,
    };
    
    formats.forEach(format => {
        const pairKey = `${bKey}|${bwKey}|${format}`;
        const matchData = matchupsPart[pairKey] || { runs: 0, balls: 0, wickets: 0 };
        
        const seed = actualBatter.length + actualBowler.length + format.length;
        const zones = [];
        for (let i = 0; i < 8; i++) {
            zones.push(10 + Math.floor(((seed * (i + 1) * 17) % 75)));
        }
        
        const weaknessTypes = {
            t20: [
                "Slower ball in the slot",
                "Wide off-stump yorker",
                "Quick bouncer into the ribs"
            ],
            odi: [
                "Googly on middle-stump line",
                "Outswinging corridor of uncertainty",
                "Late inswinger targeting the pads"
            ],
            test: [
                "4th/5th stump channel at 135+ kph",
                "Short leg trap with rising delivery",
                "Sharp leg-break finding the outside edge"
            ]
        };
        
        const strengthTypes = {
            t20: [
                "Lofted cover drive over the infield",
                "Powerful pull shot over deep mid-wicket",
                "Innovative ramp shot over fine leg"
            ],
            odi: [
                "Elegant straight drive past the bowler",
                "Controlled flick through mid-wicket gap",
                "Crisp square cut past point boundary"
            ],
            test: [
                "Solid defensive block & leave",
                "Fluid cover drive to overpitched balls",
                "Subtle glance off the pads for runs"
            ]
        };
        
        let weakness = "";
        let strength = "";
        
        if (matchData.balls > 0) {
            const matchSr = parseFloat(((matchData.runs / matchData.balls) * 100).toFixed(1));
            const matchWickets = matchData.wickets;
            
            if (matchWickets > 0) {
                weakness = `Exploited by ${actualBowler}'s lines; dismissed ${matchWickets} time(s) with ${matchData.balls} balls faced.`;
                strength = `Scored ${matchData.runs} runs off ${actualBowler}, but struggled to maintain safety against target deliveries.`;
            } else if (matchSr > 140) {
                weakness = `Failed to contain batsman's aggressive strike rate of ${matchSr}. Struggles to find a dot-ball line.`;
                strength = `Dominates this duel with a high strike rate of ${matchSr}, scoring ${matchData.runs} runs without being dismissed.`;
            } else if (matchData.balls > 18) {
                weakness = `Dot-ball pressure buildup. Bowler contains batsman successfully with disciplined containment lines.`;
                strength = `Accumulates steady runs (${matchData.runs} runs off ${matchData.balls} balls), low risk but conservative pacing.`;
            } else {
                weakness = weaknessTypes[format][seed % 3];
                strength = strengthTypes[format][seed % 3];
            }
        } else {
            // No direct matchups: use player profiles to project duels!
            const bProfile = batters.get(bKey) || {};
            const bwProfile = bowlers.get(bwKey) || {};
            
            const bAI = generatePlayerAIAnalysis(bProfile, true);
            const bwAI = generatePlayerAIAnalysis(bwProfile, false);
            
            weakness = `No direct face-off. Model projects: ${bAI.weakness.split('.')[0]}.`;
            strength = `Model projects: ${bwAI.strength.split('.')[0]}.`;
        }
        
        responseData[format] = {
            runs: matchData.runs,
            balls: matchData.balls,
            wickets: matchData.wickets,
            sr: matchData.balls > 0 ? parseFloat(((matchData.runs / matchData.balls) * 100).toFixed(1)) : 0,
            dismissalProb: matchData.balls > 0 ? parseFloat(((matchData.wickets / matchData.balls) * 100).toFixed(1)) : 0,
            weakness,
            strength,
            zones
        };
    });
    
    res.json(responseData);
});

app.get('/player/:name', (req, res) => {
    const nameLower = req.params.name.toLowerCase();
    
    const bData = batters.get(nameLower);
    const bwData = bowlers.get(nameLower);
    
    if (!bData && !bwData) {
        // Try partial match suggestions
        const suggestions = [];
        for (const [key, value] of batters.entries()) {
            if (key.includes(nameLower)) {
                suggestions.push({
                    name: value.name,
                    role: 'BAT',
                    details: `LIVE DATABASE · BATTER · ${value.runs.toLocaleString()} RUNS`
                });
                if (suggestions.length >= 5) break;
            }
        }
        if (suggestions.length < 5) {
            for (const [key, value] of bowlers.entries()) {
                if (key.includes(nameLower) && !suggestions.some(m => m.name === value.name)) {
                    suggestions.push({
                        name: value.name,
                        role: 'BOWL',
                        details: `LIVE DATABASE · BOWLER · ${value.wickets} WICKETS`
                    });
                    if (suggestions.length >= 5) break;
                }
            }
        }
        
        if (suggestions.length > 0) {
            return res.json({ error: "Player not found", suggestions });
        }
        return res.status(404).json({ error: "Player not found" });
    }
    
    const actualName = bData ? bData.name : bwData.name;
    let isBatter = bData && (!bwData || bData.balls >= bwData.balls);
    if (req.query.role) {
        if (req.query.role === 'BAT' && bData) {
            isBatter = true;
        } else if (req.query.role === 'BOWL' && bwData) {
            isBatter = false;
        }
    }
    
    const batting = bData ? {
        runs: bData.runs,
        balls_faced: bData.balls,
        dismissals: bData.dismissals,
        average: bData.dismissals > 0 ? parseFloat((bData.runs / bData.dismissals).toFixed(2)) : bData.runs,
        strike_rate: bData.balls > 0 ? parseFloat(((bData.runs / bData.balls) * 100).toFixed(2)) : 0,
        ducks: bData.ducks || 0,
        fifties: bData.fifties || 0,
        hundreds: bData.hundreds || 0,
        double_hundreds: bData.doubleHundreds || 0,
        top_bowlers_faced: Object.entries(bData.bowlersFaced)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {}),
        dismissed_by: Object.entries(bData.dismissedBy)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {}),
        runs_by_over: bData.runsByOver,
        formats: {
            t20: {
                runs: bData.formats.t20.runs,
                balls: bData.formats.t20.balls,
                average: bData.formats.t20.dismissals > 0 ? parseFloat((bData.formats.t20.runs / bData.formats.t20.dismissals).toFixed(2)) : bData.formats.t20.runs,
                strike_rate: bData.formats.t20.balls > 0 ? parseFloat(((bData.formats.t20.runs / bData.formats.t20.balls) * 100).toFixed(2)) : 0,
                ducks: bData.formats.t20.ducks || 0,
                fifties: bData.formats.t20.fifties || 0,
                hundreds: bData.formats.t20.hundreds || 0,
                double_hundreds: bData.formats.t20.doubleHundreds || 0,
            },
            odi: {
                runs: bData.formats.odi.runs,
                balls: bData.formats.odi.balls,
                average: bData.formats.odi.dismissals > 0 ? parseFloat((bData.formats.odi.runs / bData.formats.odi.dismissals).toFixed(2)) : bData.formats.odi.runs,
                strike_rate: bData.formats.odi.balls > 0 ? parseFloat(((bData.formats.odi.runs / bData.formats.odi.balls) * 100).toFixed(2)) : 0,
                ducks: bData.formats.odi.ducks || 0,
                fifties: bData.formats.odi.fifties || 0,
                hundreds: bData.formats.odi.hundreds || 0,
                double_hundreds: bData.formats.odi.doubleHundreds || 0,
            },
            test: {
                runs: bData.formats.test.runs,
                balls: bData.formats.test.balls,
                average: bData.formats.test.dismissals > 0 ? parseFloat((bData.formats.test.runs / bData.formats.test.dismissals).toFixed(2)) : bData.formats.test.runs,
                strike_rate: bData.formats.test.balls > 0 ? parseFloat(((bData.formats.test.runs / bData.formats.test.balls) * 100).toFixed(2)) : 0,
                ducks: bData.formats.test.ducks || 0,
                fifties: bData.formats.test.fifties || 0,
                hundreds: bData.formats.test.hundreds || 0,
                double_hundreds: bData.formats.test.doubleHundreds || 0,
            }
        }
    } : {};
    
    const bowling = bwData ? {
        wickets: bwData.wickets,
        balls_bowled: bwData.balls,
        overs_bowled: parseFloat((bwData.balls / 6).toFixed(1)),
        runs_conceded: bwData.runsConceded,
        economy: bwData.balls > 0 ? parseFloat(((bwData.runsConceded / bwData.balls) * 6).toFixed(2)) : 0,
        average: bwData.wickets > 0 ? parseFloat((bwData.runsConceded / bwData.wickets).toFixed(2)) : 0,
        three_wickets: bwData.threeWickets || 0,
        four_wickets: bwData.fourWickets || 0,
        five_wickets: bwData.fiveWickets || 0,
        top_batters_faced: Object.entries(bwData.battersFaced)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {}),
        wickets_list: Object.entries(bwData.wicketsList)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {}),
        formats: {
            t20: {
                wickets: bwData.formats.t20.wickets,
                overs: parseFloat((bwData.formats.t20.balls / 6).toFixed(1)),
                economy: bwData.formats.t20.balls > 0 ? parseFloat(((bwData.formats.t20.runsConceded / bwData.formats.t20.balls) * 6).toFixed(2)) : 0,
                average: bwData.formats.t20.wickets > 0 ? parseFloat((bwData.formats.t20.runsConceded / bwData.formats.t20.wickets).toFixed(2)) : 0,
                three_wickets: bwData.formats.t20.threeWickets || 0,
                four_wickets: bwData.formats.t20.fourWickets || 0,
                five_wickets: bwData.formats.t20.fiveWickets || 0,
            },
            odi: {
                wickets: bwData.formats.odi.wickets,
                overs: parseFloat((bwData.formats.odi.balls / 6).toFixed(1)),
                economy: bwData.formats.odi.balls > 0 ? parseFloat(((bwData.formats.odi.runsConceded / bwData.formats.odi.balls) * 6).toFixed(2)) : 0,
                average: bwData.formats.odi.wickets > 0 ? parseFloat((bwData.formats.odi.runsConceded / bwData.formats.odi.wickets).toFixed(2)) : 0,
                three_wickets: bwData.formats.odi.threeWickets || 0,
                four_wickets: bwData.formats.odi.fourWickets || 0,
                five_wickets: bwData.formats.odi.fiveWickets || 0,
            },
            test: {
                wickets: bwData.formats.test.wickets,
                overs: parseFloat((bwData.formats.test.balls / 6).toFixed(1)),
                economy: bwData.formats.test.balls > 0 ? parseFloat(((bwData.formats.test.runsConceded / bwData.formats.test.balls) * 6).toFixed(2)) : 0,
                average: bwData.formats.test.wickets > 0 ? parseFloat((bwData.formats.test.runsConceded / bwData.formats.test.wickets).toFixed(2)) : 0,
                three_wickets: bwData.formats.test.threeWickets || 0,
                four_wickets: bwData.formats.test.fourWickets || 0,
                five_wickets: bwData.formats.test.fiveWickets || 0,
            }
        }
    } : {};
    
    const pProfile = isBatter ? bData : bwData;
    const aiAnalysis = generatePlayerAIAnalysis(pProfile, isBatter);
    const funFact = generatePlayerFunFact(pProfile, isBatter);
    
    // Group stats by opposition country dynamically
    let statsByCountry = {};
    const opponentCountries = [
        "All", "India", "Australia", "England", "Pakistan", "South Africa", 
        "New Zealand", "West Indies", "Sri Lanka", "Bangladesh", "Afghanistan", "Other"
    ];
    
    opponentCountries.forEach(country => {
        statsByCountry[country] = { runs: 0, balls: 0, wickets: 0 };
    });

    if (isBatter && bData) {
        const letter = /^[a-z]$/.test(nameLower[0]) ? nameLower[0] : 'other';
        let partFile = `data/matchups_${letter}.json`;
        if (!fs.existsSync(partFile)) {
            partFile = `backend/data/matchups_${letter}.json`;
        }
        let matchupsPart = {};
        if (fs.existsSync(partFile)) {
            try {
                matchupsPart = JSON.parse(fs.readFileSync(partFile, 'utf8'));
            } catch (e) {
                console.error(`Error loading matchups for country filter:`, e);
            }
        }
        
        for (const [key, matchData] of Object.entries(matchupsPart)) {
            const parts = key.split('|');
            if (parts[0] === nameLower) {
                const bowlerName = parts[1];
                const country = getPlayerCountry(bowlerName);
                statsByCountry[country].runs += matchData.runs || 0;
                statsByCountry[country].balls += matchData.balls || 0;
                statsByCountry[country].wickets += matchData.wickets || 0;
            }
        }
        
        // "All" is the sum of all countries
        statsByCountry["All"] = {
            runs: batting.runs || 0,
            balls: batting.balls_faced || 0,
            wickets: batting.dismissals || 0
        };
    } else if (!isBatter && bwData) {
        for (const [batterName, balls] of Object.entries(bwData.battersFaced || {})) {
            const country = getPlayerCountry(batterName);
            statsByCountry[country].balls += balls;
        }
        for (const [batterName, wickets] of Object.entries(bwData.wicketsList || {})) {
            const country = getPlayerCountry(batterName);
            statsByCountry[country].wickets += wickets;
        }
        
        const totalRuns = bwData.runsConceded || 0;
        const totalBalls = bwData.balls || 1;
        opponentCountries.forEach(country => {
            if (country !== "All" && statsByCountry[country].balls > 0) {
                statsByCountry[country].runs = Math.round((statsByCountry[country].balls / totalBalls) * totalRuns);
            }
        });
        
        statsByCountry["All"] = {
            runs: totalRuns,
            balls: totalBalls,
            wickets: bwData.wickets || 0
        };
    }

    opponentCountries.forEach(country => {
        const item = statsByCountry[country];
        if (isBatter) {
            item.average = item.wickets > 0 ? parseFloat((item.runs / item.wickets).toFixed(2)) : item.runs;
            item.strike_rate = item.balls > 0 ? parseFloat(((item.runs / item.balls) * 100).toFixed(2)) : 0;
        } else {
            item.average = item.wickets > 0 ? parseFloat((item.runs / item.wickets).toFixed(2)) : 0;
            item.economy = item.balls > 0 ? parseFloat(((item.runs / item.balls) * 6).toFixed(2)) : 0;
        }
    });
    
    res.json({
        name: actualName,
        role: isBatter ? "BAT" : "BOWL",
        batting,
        bowling,
        weakness: aiAnalysis.weakness,
        strength: aiAnalysis.strength,
        funFact: funFact,
        statsByCountry
    });
});

app.get('/', (req, res) => {
    res.json({ status: "online", total_records: totalRecords });
});

// Load database then start server
loadData().then(() => {
    app.listen(port, () => {
        console.log(`Node Express Server running at http://localhost:${port}`);
    });
});
