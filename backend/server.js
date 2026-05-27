import express from 'express';
import cors from 'cors';
import fs from 'fs';
import readline from 'readline';

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

let csvPath = 'data/all_deliveries.csv';
if (!fs.existsSync(csvPath)) {
    csvPath = 'all_deliveries.csv';
}

console.log(`Loading database (CSV) from ${csvPath}... this might take a moment.`);

if (!fs.existsSync(csvPath)) {
    console.error(`ERROR: Database not found at data/all_deliveries.csv or all_deliveries.csv. Please run extraction first.`);
    process.exit(1);
}

// Memory indexes for instant player and matchup lookups!
const batters = new Map();
const bowlers = new Map();
const matchupsIndex = new Map();
let totalRecords = 0;

const loadData = () => {
    return new Promise(async (resolve) => {
        console.log("Analyzing match formats (Pass 1)...");
        const matchCounts = new Map();
        
        // Pass 1: Count deliveries per match to classify formats
        const fileStream1 = fs.createReadStream(csvPath);
        const rl1 = readline.createInterface({
            input: fileStream1,
            crlfDelay: Infinity
        });

        let isHeader1 = true;
        for await (const line of rl1) {
            if (isHeader1) {
                isHeader1 = false;
                continue;
            }
            const parts = line.split(',');
            if (parts.length < 9) continue;
            const matchId = parts[0];
            matchCounts.set(matchId, (matchCounts.get(matchId) || 0) + 1);
        }
        console.log(`Analyzed ${matchCounts.size} total matches.`);

        // Pass 2: Load and index everything
        console.log("Indexing delivery records by format (Pass 2)...");
        const fileStream2 = fs.createReadStream(csvPath);
        const rl2 = readline.createInterface({
            input: fileStream2,
            crlfDelay: Infinity
        });

        const batterMatchRuns = new Map();
        const bowlerMatchWickets = new Map();

        let isHeader2 = true;
        rl2.on('line', (line) => {
            if (isHeader2) {
                isHeader2 = false;
                return;
            }
            
            totalRecords++;
            const parts = line.split(',');
            if (parts.length < 9) return;
            
            const matchId = parts[0];
            const over = parseInt(parts[1], 10) || 0;
            const ball = parseInt(parts[2], 10) || 0;
            const batterName = parts[3].replace(/"/g, ''); // strip quotes
            const bowlerName = parts[4].replace(/"/g, '');
            const runs = parseInt(parts[5], 10) || 0;
            const extras = parseInt(parts[6], 10) || 0;
            const totalRuns = parseInt(parts[7], 10) || 0;
            const wicket = parseInt(parts[8], 10) || 0;
            
            const batterLower = batterName.toLowerCase();
            const bowlerLower = bowlerName.toLowerCase();

            // Format heuristic based on total match balls
            const matchBallCount = matchCounts.get(matchId) || 0;
            let format = 't20';
            if (matchBallCount > 660) format = 'test';
            else if (matchBallCount > 270) format = 'odi';

            // Track batter match runs
            const bmKey = `${batterLower}|${matchId}`;
            if (!batterMatchRuns.has(bmKey)) {
                batterMatchRuns.set(bmKey, { runs: 0, dismissed: 0, format });
            }
            const bmData = batterMatchRuns.get(bmKey);
            bmData.runs += runs;
            bmData.dismissed += wicket;
            
            // Track bowler match wickets
            const bwMatchKey = `${bowlerLower}|${matchId}`;
            if (!bowlerMatchWickets.has(bwMatchKey)) {
                bowlerMatchWickets.set(bwMatchKey, { wickets: 0, format });
            }
            const bwmData = bowlerMatchWickets.get(bwMatchKey);
            bwmData.wickets += wicket;

            // 1. Batter index
            if (!batters.has(batterLower)) {
                batters.set(batterLower, {
                    name: batterName,
                    runs: 0,
                    balls: 0,
                    dismissals: 0,
                    bowlersFaced: {},
                    dismissedBy: {},
                    runsByOver: {},
                    ducks: 0,
                    fifties: 0,
                    hundreds: 0,
                    doubleHundreds: 0,
                    formats: {
                        t20: { runs: 0, balls: 0, dismissals: 0, ducks: 0, fifties: 0, hundreds: 0, doubleHundreds: 0 },
                        odi: { runs: 0, balls: 0, dismissals: 0, ducks: 0, fifties: 0, hundreds: 0, doubleHundreds: 0 },
                        test: { runs: 0, balls: 0, dismissals: 0, ducks: 0, fifties: 0, hundreds: 0, doubleHundreds: 0 }
                    }
                });
            }
            const bData = batters.get(batterLower);
            bData.runs += runs;
            bData.balls += 1;
            bData.dismissals += wicket;
            bData.bowlersFaced[bowlerName] = (bData.bowlersFaced[bowlerName] || 0) + 1;
            if (wicket === 1) {
                bData.dismissedBy[bowlerName] = (bData.dismissedBy[bowlerName] || 0) + 1;
            }
            bData.runsByOver[over] = (bData.runsByOver[over] || 0) + runs;
            if (bData.formats[format]) {
                bData.formats[format].runs += runs;
                bData.formats[format].balls += 1;
                bData.formats[format].dismissals += wicket;
            }

            // 2. Bowler index
            if (!bowlers.has(bowlerLower)) {
                bowlers.set(bowlerLower, {
                    name: bowlerName,
                    wickets: 0,
                    balls: 0,
                    runsConceded: 0,
                    battersFaced: {},
                    wicketsList: {},
                    threeWickets: 0,
                    fourWickets: 0,
                    fiveWickets: 0,
                    formats: {
                        t20: { wickets: 0, balls: 0, runsConceded: 0, threeWickets: 0, fourWickets: 0, fiveWickets: 0 },
                        odi: { wickets: 0, balls: 0, runsConceded: 0, threeWickets: 0, fourWickets: 0, fiveWickets: 0 },
                        test: { wickets: 0, balls: 0, runsConceded: 0, threeWickets: 0, fourWickets: 0, fiveWickets: 0 }
                    }
                });
            }
            const bwData = bowlers.get(bowlerLower);
            bwData.wickets += wicket;
            bwData.balls += 1;
            bwData.runsConceded += totalRuns;
            bwData.battersFaced[batterName] = (bwData.battersFaced[batterName] || 0) + 1;
            if (wicket === 1) {
                bwData.wicketsList[batterName] = (bwData.wicketsList[batterName] || 0) + 1;
            }
            if (bwData.formats[format]) {
                bwData.formats[format].wickets += wicket;
                bwData.formats[format].balls += 1;
                bwData.formats[format].runsConceded += totalRuns;
            }

            // 3. Matchup index (head-to-head by format)
            const pairKey = `${batterLower}|${bowlerLower}|${format}`;
            if (!matchupsIndex.has(pairKey)) {
                matchupsIndex.set(pairKey, {
                    runs: 0,
                    balls: 0,
                    wickets: 0
                });
            }
            const matchData = matchupsIndex.get(pairKey);
            matchData.runs += runs;
            matchData.balls += 1;
            matchData.wickets += wicket;
        });

        rl2.on('close', () => {
            console.log("Aggregating batsman and bowler match milestones...");
            
            // Batter milestones
            for (const [key, data] of batterMatchRuns.entries()) {
                const [batterLower, matchId] = key.split('|');
                const bData = batters.get(batterLower);
                if (!bData) continue;
                
                const r = data.runs;
                const out = data.dismissed > 0;
                const fmt = data.format;
                
                let isDuck = r === 0 && out;
                let isFifty = r >= 50 && r < 100;
                let isHundred = r >= 100 && r < 200;
                let isDoubleHundred = r >= 200;
                
                if (isDuck) {
                    bData.ducks++;
                    if (bData.formats[fmt]) bData.formats[fmt].ducks++;
                } else if (isFifty) {
                    bData.fifties++;
                    if (bData.formats[fmt]) bData.formats[fmt].fifties++;
                } else if (isHundred) {
                    bData.hundreds++;
                    if (bData.formats[fmt]) bData.formats[fmt].hundreds++;
                } else if (isDoubleHundred) {
                    bData.doubleHundreds++;
                    if (bData.formats[fmt]) bData.formats[fmt].doubleHundreds++;
                }
            }
            
            // Bowler milestones
            for (const [key, data] of bowlerMatchWickets.entries()) {
                const [bowlerLower, matchId] = key.split('|');
                const bwData = bowlers.get(bowlerLower);
                if (!bwData) continue;
                
                const w = data.wickets;
                const fmt = data.format;
                
                let isThree = w === 3;
                let isFour = w === 4;
                let isFive = w >= 5;
                
                if (isThree) {
                    bwData.threeWickets++;
                    if (bwData.formats[fmt]) bwData.formats[fmt].threeWickets++;
                } else if (isFour) {
                    bwData.fourWickets++;
                    if (bwData.formats[fmt]) bwData.formats[fmt].fourWickets++;
                } else if (isFive) {
                    bwData.fiveWickets++;
                    if (bwData.formats[fmt]) bwData.formats[fmt].fiveWickets++;
                }
            }

            console.log(`Database loaded successfully! Total records: ${totalRecords}`);
            console.log(`Indexed ${batters.size} batters, ${bowlers.size} bowlers, and ${matchupsIndex.size} face-offs across formats.`);
            resolve();
        });
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
    
    const formats = ['t20', 'odi', 'test'];
    const responseData = {
        batsman: actualBatter,
        bowler: actualBowler,
    };
    
    formats.forEach(format => {
        const pairKey = `${bKey}|${bwKey}|${format}`;
        const matchData = matchupsIndex.get(pairKey) || { runs: 0, balls: 0, wickets: 0 };
        
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
