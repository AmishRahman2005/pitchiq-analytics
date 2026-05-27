import zipfile
import json
from pathlib import Path

zip_path = "all_json.zip"

batters = {}
bowlers = {}
matchups = {}

# We'll use match-level tracking for milestones (fifties, hundreds, wickets)
# Keys will be: (player_lower, match_id)
batter_match_runs = {}
bowler_match_wickets = {}

with zipfile.ZipFile(zip_path, "r") as zf:
    json_files = [f for f in zf.namelist() if f.endswith(".json")]
    
    total_files = len(json_files)
    print(f"Starting extraction and aggregation of {total_files} matches...")
    
    for idx, file in enumerate(json_files):
        match_id = Path(file).stem
        try:
            with zf.open(file) as f:
                data = json.loads(f.read())
            
            # Format classification
            # First, count all deliveries in this match
            deliveries_count = 0
            innings = data.get("innings", [])
            for inning in innings:
                overs = inning.get("overs", [])
                for over_data in overs:
                    deliveries_count += len(over_data.get("deliveries", []))
            
            format_name = "t20"
            if deliveries_count > 660:
                format_name = "test"
            elif deliveries_count > 270:
                format_name = "odi"
                
            for inning in innings:
                overs = inning.get("overs", [])
                for over_data in overs:
                    over_number = over_data.get("over", 0)
                    deliveries = over_data.get("deliveries", [])
                    
                    for ball_num, delivery in enumerate(deliveries):
                        batter_name = delivery.get("batter", "")
                        bowler_name = delivery.get("bowler", "")
                        if not batter_name or not bowler_name:
                            continue
                            
                        runs_data = delivery.get("runs", {})
                        runs = runs_data.get("batter", 0)
                        extras = runs_data.get("extras", 0)
                        total_runs = runs_data.get("total", 0)
                        wicket = 1 if delivery.get("wickets") else 0
                        
                        batter_lower = batter_name.lower().strip()
                        bowler_lower = bowler_name.lower().strip()
                        
                        # --- Batter Match Runs ---
                        bm_key = (batter_lower, match_id)
                        if bm_key not in batter_match_runs:
                            batter_match_runs[bm_key] = {"runs": 0, "dismissed": 0, "format": format_name}
                        batter_match_runs[bm_key]["runs"] += runs
                        batter_match_runs[bm_key]["dismissed"] += wicket
                        
                        # --- Bowler Match Wickets ---
                        bw_key = (bowler_lower, match_id)
                        if bw_key not in bowler_match_wickets:
                            bowler_match_wickets[bw_key] = {"wickets": 0, "format": format_name}
                        bowler_match_wickets[bw_key]["wickets"] += wicket
                        
                        # --- Batter Index ---
                        if batter_lower not in batters:
                            batters[batter_lower] = {
                                "name": batter_name,
                                "runs": 0,
                                "balls": 0,
                                "dismissals": 0,
                                "bowlersFaced": {},
                                "dismissedBy": {},
                                "runsByOver": {},
                                "ducks": 0,
                                "fifties": 0,
                                "hundreds": 0,
                                "doubleHundreds": 0,
                                "formats": {
                                    "t20": {"runs": 0, "balls": 0, "dismissals": 0, "ducks": 0, "fifties": 0, "hundreds": 0, "doubleHundreds": 0},
                                    "odi": {"runs": 0, "balls": 0, "dismissals": 0, "ducks": 0, "fifties": 0, "hundreds": 0, "doubleHundreds": 0},
                                    "test": {"runs": 0, "balls": 0, "dismissals": 0, "ducks": 0, "fifties": 0, "hundreds": 0, "doubleHundreds": 0}
                                }
                            }
                        b_data = batters[batter_lower]
                        b_data["runs"] += runs
                        b_data["balls"] += 1
                        b_data["dismissals"] += wicket
                        b_data["bowlersFaced"][bowler_name] = b_data["bowlersFaced"].get(bowler_name, 0) + 1
                        if wicket == 1:
                            b_data["dismissedBy"][bowler_name] = b_data["dismissedBy"].get(bowler_name, 0) + 1
                        over_str = str(over_number)
                        b_data["runsByOver"][over_str] = b_data["runsByOver"].get(over_str, 0) + runs
                        
                        b_fmt = b_data["formats"][format_name]
                        b_fmt["runs"] += runs
                        b_fmt["balls"] += 1
                        b_fmt["dismissals"] += wicket
                        
                        # --- Bowler Index ---
                        if bowler_lower not in bowlers:
                            bowlers[bowler_lower] = {
                                "name": bowler_name,
                                "wickets": 0,
                                "balls": 0,
                                "runsConceded": 0,
                                "battersFaced": {},
                                "wicketsList": {},
                                "threeWickets": 0,
                                "fourWickets": 0,
                                "fiveWickets": 0,
                                "formats": {
                                    "t20": {"wickets": 0, "balls": 0, "runsConceded": 0, "threeWickets": 0, "fourWickets": 0, "fiveWickets": 0},
                                    "odi": {"wickets": 0, "balls": 0, "runsConceded": 0, "threeWickets": 0, "fourWickets": 0, "fiveWickets": 0},
                                    "test": {"wickets": 0, "balls": 0, "runsConceded": 0, "threeWickets": 0, "fourWickets": 0, "fiveWickets": 0}
                                }
                            }
                        bw_data = bowlers[bowler_lower]
                        bw_data["wickets"] += wicket
                        bw_data["balls"] += 1
                        bw_data["runsConceded"] += total_runs
                        bw_data["battersFaced"][batter_name] = bw_data["battersFaced"].get(batter_name, 0) + 1
                        if wicket == 1:
                            bw_data["wicketsList"][batter_name] = bw_data["wicketsList"].get(batter_name, 0) + 1
                        
                        bw_fmt = bw_data["formats"][format_name]
                        bw_fmt["wickets"] += wicket
                        bw_fmt["balls"] += 1
                        bw_fmt["runsConceded"] += total_runs
                        
                        # --- Matchup Index ---
                        pair_key = f"{batter_lower}|{bowler_lower}|{format_name}"
                        if pair_key not in matchups:
                            matchups[pair_key] = {"runs": 0, "balls": 0, "wickets": 0}
                        m_data = matchups[pair_key]
                        m_data["runs"] += runs
                        m_data["balls"] += 1
                        m_data["wickets"] += wicket
                        
            if idx % 1000 == 0:
                print(f"Processed {idx}/{total_files} matches...")
        except Exception as e:
            print(f"Error parsing {file}: {e}")

# --- Compute Milestones ---
print("Computing batter milestones...")
for (b_low, m_id), stats in batter_match_runs.items():
    if b_low in batters:
        b_data = batters[b_low]
        r = stats["runs"]
        out = stats["dismissed"] > 0
        fmt = stats["format"]
        
        is_duck = r == 0 and out
        is_fifty = 50 <= r < 100
        is_hundred = 100 <= r < 200
        is_double = r >= 200
        
        if is_duck:
            b_data["ducks"] += 1
            b_data["formats"][fmt]["ducks"] += 1
        elif is_fifty:
            b_data["fifties"] += 1
            b_data["formats"][fmt]["fifties"] += 1
        elif is_hundred:
            b_data["hundreds"] += 1
            b_data["formats"][fmt]["hundreds"] += 1
        elif is_double:
            b_data["doubleHundreds"] += 1
            b_data["formats"][fmt]["doubleHundreds"] += 1

print("Computing bowler milestones...")
for (bw_low, m_id), stats in bowler_match_wickets.items():
    if bw_low in bowlers:
        bw_data = bowlers[bw_low]
        w = stats["wickets"]
        fmt = stats["format"]
        
        if w == 3:
            bw_data["threeWickets"] += 1
            bw_data["formats"][fmt]["threeWickets"] += 1
        elif w == 4:
            bw_data["fourWickets"] += 1
            bw_data["formats"][fmt]["fourWickets"] += 1
        elif w >= 5:
            bw_data["fiveWickets"] += 1
            bw_data["formats"][fmt]["fiveWickets"] += 1

# --- Save JSON Files ---
print("Saving pre-aggregated JSON databases...")
data_dir = Path("data")
data_dir.mkdir(parents=True, exist_ok=True)

with open(data_dir / "batters.json", "w", encoding="utf-8") as f:
    json.dump(batters, f)
    
with open(data_dir / "bowlers.json", "w", encoding="utf-8") as f:
    json.dump(bowlers, f)
    
with open(data_dir / "matchups.json", "w", encoding="utf-8") as f:
    json.dump(matchups, f)
    
print("AGGREGATION DONE! Databases created successfully!")
