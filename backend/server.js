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
        
        const weakness = weaknessTypes[format][seed % 3];
        const strength = strengthTypes[format][seed % 3];
        
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
    const isBatter = bData && (!bwData || bData.balls >= bwData.balls);
    
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
    
    res.json({
        name: actualName,
        role: isBatter ? "BAT" : "BOWL",
        batting,
        bowling
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
