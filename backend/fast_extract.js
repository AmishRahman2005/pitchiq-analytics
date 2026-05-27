import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const zipPath = "all_json.zip";
const csvPath = "all_deliveries.csv";

if (!fs.existsSync(zipPath)) {
    console.error(`ERROR: '${zipPath}' not found!`);
    console.error("Please place your 'all_json.zip' in the backend folder beside this script.");
    process.exit(1);
}

console.log("Loading zip file... This might take a few moments.");
const zip = new AdmZip(zipPath);
const zipEntries = zip.getEntries();

const jsonEntries = zipEntries.filter(entry => entry.entryName.endsWith('.json'));
console.log(`Found ${jsonEntries.length} JSON files in zip.`);

const csvStream = fs.createWriteStream(csvPath, { encoding: 'utf8' });

// Write CSV header
csvStream.write([
    "match_id",
    "over",
    "ball",
    "batter",
    "bowler",
    "runs",
    "extras",
    "total_runs",
    "wicket"
].join(",") + "\n");

let rowsWritten = 0;

jsonEntries.forEach((entry, idx) => {
    try {
        const fileContent = entry.getData().toString('utf8');
        const data = JSON.parse(fileContent);
        const matchId = path.basename(entry.entryName, '.json');

        const innings = data.innings || [];
        for (const inning of innings) {
            const overs = inning.overs || [];
            for (const overData of overs) {
                const overNumber = overData.over || 0;
                const deliveries = overData.deliveries || [];
                
                deliveries.forEach((delivery, ballNum) => {
                    const runsData = delivery.runs || {};
                    // Escape double quotes in player names for valid CSV formatting
                    const batterName = (delivery.batter || '').replace(/"/g, '""');
                    const bowlerName = (delivery.bowler || '').replace(/"/g, '""');
                    
                    const row = [
                        matchId,
                        overNumber,
                        ballNum + 1,
                        `"${batterName}"`,
                        `"${bowlerName}"`,
                        runsData.batter || 0,
                        runsData.extras || 0,
                        runsData.total || 0,
                        delivery.wickets ? 1 : 0
                    ];
                    csvStream.write(row.join(",") + "\n");
                    rowsWritten++;
                });
            }
        }

        if (idx % 1000 === 0) {
            console.log(`Processed ${idx}/${jsonEntries.length} matches`);
        }
    } catch (e) {
        console.error(`Skipped ${entry.entryName}: ${e.message}`);
    }
});

csvStream.end();
console.log("\nDONE");
console.log(`Rows written: ${rowsWritten}`);
console.log(`CSV saved at: ${csvPath}`);
