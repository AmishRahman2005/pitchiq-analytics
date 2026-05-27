import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const zipPath = "all_json.zip";
const dataDir = "data";

if (!fs.existsSync(zipPath)) {
    console.error(`ERROR: '${zipPath}' not found!`);
    console.error("Please place your 'all_json.zip' in the backend folder beside this script.");
    process.exit(1);
}

console.log("Loading zip file... This might take a few moments.");
const zip = new AdmZip(zipPath);
const zipEntries = zip.getEntries();

const jsonEntries = zipEntries.filter(entry => entry.entryName.endsWith('.json'));
const totalFiles = jsonEntries.length;
console.log(`Found ${totalFiles} JSON files in zip. Starting aggregation...`);

const batters = {};
const bowlers = {};
const matchups = {};

const batterMatchRuns = {};
const bowlerMatchWickets = {};

jsonEntries.forEach((entry, idx) => {
    try {
        const fileContent = entry.getData().toString('utf8');
        const data = JSON.parse(fileContent);
        const matchId = path.basename(entry.entryName, '.json');

        const innings = data.innings || [];
        
        // Format Heuristic Count
        let deliveriesCount = 0;
        for (const inning of innings) {
            const overs = inning.overs || [];
            for (const overData of overs) {
                deliveriesCount += (overData.deliveries || []).length;
            }
        }

        let formatName = 't20';
        if (deliveriesCount > 660) formatName = 'test';
        else if (deliveriesCount > 270) formatName = 'odi';

        for (const inning of innings) {
            const overs = inning.overs || [];
            for (const overData of overs) {
                const overNumber = overData.over || 0;
                const deliveries = overData.deliveries || [];
                
                deliveries.forEach((delivery, ballNum) => {
                    const batterName = delivery.batter || '';
                    const bowlerName = delivery.bowler || '';
                    if (!batterName || !bowlerName) return;

                    const runsData = delivery.runs || {};
                    const runs = runsData.batter || 0;
                    const extras = runsData.extras || 0;
                    const totalRuns = runsData.total || 0;
                    const wicket = delivery.wickets ? 1 : 0;

                    const batterLower = batterName.toLowerCase().trim();
                    const bowlerLower = bowlerName.toLowerCase().trim();

                    // --- Batter Match Runs ---
                    const bmKey = `${batterLower}|${matchId}`;
                    if (!batterMatchRuns[bmKey]) {
                        batterMatchRuns[bmKey] = { runs: 0, dismissed: 0, format: formatName };
                    }
                    batterMatchRuns[bmKey].runs += runs;
                    batterMatchRuns[bmKey].dismissed += wicket;

                    // --- Bowler Match Wickets ---
                    const bwKey = `${bowlerLower}|${matchId}`;
                    if (!bowlerMatchWickets[bwKey]) {
                        bowlerMatchWickets[bwKey] = { wickets: 0, format: formatName };
                    }
                    bowlerMatchWickets[bwKey].wickets += wicket;

                    // --- Batter Index ---
                    if (!batters[batterLower]) {
                        batters[batterLower] = {
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
                        };
                    }
                    const bData = batters[batterLower];
                    bData.runs += runs;
                    bData.balls += 1;
                    bData.dismissals += wicket;
                    bData.bowlersFaced[bowlerName] = (bData.bowlersFaced[bowlerName] || 0) + 1;
                    if (wicket === 1) {
                        bData.dismissedBy[bowlerName] = (bData.dismissedBy[bowlerName] || 0) + 1;
                    }
                    const overStr = String(overNumber);
                    bData.runsByOver[overStr] = (bData.runsByOver[overStr] || 0) + runs;
                    
                    const bFmt = bData.formats[formatName];
                    if (bFmt) {
                        bFmt.runs += runs;
                        bFmt.balls += 1;
                        bFmt.dismissals += wicket;
                    }

                    // --- Bowler Index ---
                    if (!bowlers[bowlerLower]) {
                        bowlers[bowlerLower] = {
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
                        };
                    }
                    const bwData = bowlers[bowlerLower];
                    bwData.wickets += wicket;
                    bwData.balls += 1;
                    bwData.runsConceded += totalRuns;
                    bwData.battersFaced[batterName] = (bwData.battersFaced[batterName] || 0) + 1;
                    if (wicket === 1) {
                        bwData.wicketsList[batterName] = (bwData.wicketsList[batterName] || 0) + 1;
                    }
                    
                    const bwFmt = bwData.formats[formatName];
                    if (bwFmt) {
                        bwFmt.wickets += wicket;
                        bwFmt.balls += 1;
                        bwFmt.runsConceded += totalRuns;
                    }

                    // --- Matchup Index ---
                    const pairKey = `${batterLower}|${bowlerLower}|${formatName}`;
                    if (!matchups[pairKey]) {
                        matchups[pairKey] = { runs: 0, balls: 0, wickets: 0 };
                    }
                    const mData = matchups[pairKey];
                    mData.runs += runs;
                    mData.balls += 1;
                    mData.wickets += wicket;
                });
            }
        }

        if (idx % 1000 === 0) {
            console.log(`Processed ${idx}/${totalFiles} matches...`);
        }
    } catch (e) {
        console.error(`Error parsing ${entry.entryName}: ${e.message}`);
    }
});

// --- Compute Milestones ---
console.log("Computing batter milestones...");
for (const [key, stats] of Object.entries(batterMatchRuns)) {
    const [bLow, mId] = key.split('|');
    const bData = batters[bLow];
    if (bData) {
        const r = stats.runs;
        const out = stats.dismissed > 0;
        const fmt = stats.format;

        const isDuck = r === 0 && out;
        const isFifty = r >= 50 && r < 100;
        const isHundred = r >= 100 && r < 200;
        const isDouble = r >= 200;

        if (isDuck) {
            bData.ducks += 1;
            if (bData.formats[fmt]) bData.formats[fmt].ducks += 1;
        } else if (isFifty) {
            bData.fifties += 1;
            if (bData.formats[fmt]) bData.formats[fmt].fifties += 1;
        } else if (isHundred) {
            bData.hundreds += 1;
            if (bData.formats[fmt]) bData.formats[fmt].hundreds += 1;
        } else if (isDouble) {
            bData.doubleHundreds += 1;
            if (bData.formats[fmt]) bData.formats[fmt].doubleHundreds += 1;
        }
    }
}

console.log("Computing bowler milestones...");
for (const [key, stats] of Object.entries(bowlerMatchWickets)) {
    const [bwLow, mId] = key.split('|');
    const bwData = bowlers[bwLow];
    if (bwData) {
        const w = stats.wickets;
        const fmt = stats.format;

        if (w === 3) {
            bwData.threeWickets += 1;
            if (bwData.formats[fmt]) bwData.formats[fmt].threeWickets += 1;
        } else if (w === 4) {
            bwData.fourWickets += 1;
            if (bwData.formats[fmt]) bwData.formats[fmt].fourWickets += 1;
        } else if (w >= 5) {
            bwData.fiveWickets += 1;
            if (bwData.formats[fmt]) bwData.formats[fmt].fiveWickets += 1;
        }
    }
}

// --- Save JSON Files ---
console.log("Saving pre-aggregated JSON databases...");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(path.join(dataDir, "batters.json"), JSON.stringify(batters), "utf8");
fs.writeFileSync(path.join(dataDir, "bowlers.json"), JSON.stringify(bowlers), "utf8");
fs.writeFileSync(path.join(dataDir, "matchups.json"), JSON.stringify(matchups), "utf8");

console.log("AGGREGATION DONE! Databases created successfully!");
