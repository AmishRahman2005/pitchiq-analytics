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
    
    res.json({
        name: actualName,
        role: isBatter ? "BAT" : "BOWL",
        batting,
        bowling,
        weakness: aiAnalysis.weakness,
        strength: aiAnalysis.strength
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
