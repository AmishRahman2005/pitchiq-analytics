from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os

app = FastAPI(title="PitchIQ Analytics API")

# Enable CORS so the React frontend can call it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

csv_path = "data/all_deliveries.csv"

# Global data frames
df = None
df_batters_lower = {}
df_bowlers_lower = {}

print("Loading database (CSV)... this may take a few seconds.")
if not os.path.exists(csv_path):
    # Try to find it if we are run from parent CWD
    csv_path = "backend/data/all_deliveries.csv"
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Database not found at data/all_deliveries.csv. Please run extraction first.")

# Load CSV
df = pd.read_csv(csv_path)
print(f"Database loaded successfully! Total records: {len(df)}")

# Pre-lowercase batter and bowler columns for blazing fast searches
print("Indexing database...")
df['batter_lower'] = df['batter'].astype(str).str.lower()
df['bowler_lower'] = df['bowler'].astype(str).str.lower()
print("Database indexing completed! Server ready.")

@app.get("/")
def read_root():
    return {"status": "online", "total_records": len(df)}

def generate_player_ai_analysis(bat_stats, bowl_stats, is_batter):
    if is_batter:
        if not bat_stats:
            return {
                "weakness": "Variable bounce & lateral seam movement",
                "strength": "Lofted cover drive over the infield"
            }
        
        runs = bat_stats.get("runs", 0)
        balls = bat_stats.get("balls_faced", 0)
        dismissals = bat_stats.get("dismissals", 0)
        avg = runs / dismissals if dismissals > 0 else runs
        sr = (runs / balls * 100) if balls > 0 else 0
        
        # Find top bowler who dismissed them
        dismissed_by = bat_stats.get("dismissed_by", {})
        worst_bowler = "None"
        max_dismissals = 0
        if dismissed_by:
            sorted_dismissed = sorted(dismissed_by.items(), key=lambda x: x[1], reverse=True)
            if sorted_dismissed:
                worst_bowler = sorted_dismissed[0][0]
                max_dismissals = sorted_dismissed[0][1]
        
        # Count spin vs pace outs
        spinners = ["rashid", "ashwin", "jadeja", "chahal", "lyon", "narine", "maharaj", "shakib", "tahir", "ali", "santner", "sodhi", "hasaranga", "zampa", "kuldeep", "yuzvendra", "muralitharan", "warne", "kumble", "ajmal", "sharma", "axar", "trent", "boult"]
        fast_outs = 0
        spin_outs = 0
        for bowler, count in dismissed_by.items():
            b_lower = bowler.lower()
            if any(s in b_lower for s in spinners):
                spin_outs += count
            else:
                fast_outs += count
        
        # Build dynamic weakness
        weakness = ""
        if max_dismissals > 0:
            if spin_outs > fast_outs:
                weakness = f"Slow left-arm/wrist-spin. Struggles against drift, flight, and sharp turn. Modeled threat: {worst_bowler} (dismissed them {max_dismissals} times in live matchups)."
            else:
                weakness = f"High-velocity seam & swing corridor outside 4th/5th stump line. Susceptible to early-wicket risk when ball is moving. Modeled threat: {worst_bowler} (dismissed them {max_dismissals} times)."
        else:
            if avg < 25:
                weakness = "Heavy swing & lateral seam movement corridor of uncertainty. High early-wicket risk before getting eyes set in."
            elif sr < 110:
                weakness = "Slow pacing and conservative strike rotation in middle overs. Vulnerable to defensive containing lines and spin squeeze traps."
            else:
                weakness = "Vulnerable to high-velocity short-pitched deliveries targeting the ribs and wide off-stump changes-of-pace."
        
        # Build dynamic strength
        strength = ""
        if avg >= 40 and sr >= 130:
            strength = "Elite multi-format accumulator. Dominates cover drives and flick shots; exceptionally fast wrist work enables range-hitting inside the V."
        elif avg >= 35:
            strength = "Technically sound anchor. Possesses exceptional backfoot control, superb leave judgment in the corridor of uncertainty, and dominant pull shots."
        elif sr >= 125:
            strength = "High-velocity accelerator and boundary specialist. Dominates powerplays and death overs with innovative ramp and sweep shots."
        else:
            strength = "Disciplined batsman showing strong straight drive mechanics and high scoring conversion rates against overpitched deliveries."
        
        return {"weakness": weakness, "strength": strength}
    else:
        if not bowl_stats:
            return {
                "weakness": "Flat wickets & heavy boundary hitters",
                "strength": "Disciplined length bowler"
            }
            
        economy = bowl_stats.get("economy", 0)
        wickets = bowl_stats.get("wickets", 0)
        balls = bowl_stats.get("balls_bowled", 0)
        sr = balls / wickets if wickets > 0 else 24
        
        # Find favorite target
        wickets_list = bowl_stats.get("wickets_list", {})
        favorite_target = "None"
        max_wickets = 0
        if wickets_list:
            sorted_wickets = sorted(wickets_list.items(), key=lambda x: x[1], reverse=True)
            if sorted_wickets:
                favorite_target = sorted_wickets[0][0]
                max_wickets = sorted_wickets[0][1]
                
        # Build dynamic weakness
        weakness = ""
        if economy > 8.5:
            weakness = "Struggles to contain runs when batsmen target deep boundaries on flat batting tracks. Vulnerable to aggressive power-hitters under pressure."
        elif sr > 30:
            weakness = "Lacks lethal, wicket-taking deliveries on placid pitches; relies on defensive containing lines that batsman can comfortably navigate."
        elif favorite_target != "None":
            weakness = "Occasionally vulnerable to aggressive counter-attacks by left-handed batsmen who disrupt line and length adjustments."
        else:
            weakness = "Flat batting tracks and heavy boundary hitters. Performance drops when pitch offers zero lateral movement or seam bounce."
            
        # Build dynamic strength
        strength = ""
        if economy < 6.5 and sr < 20:
            strength = "Elite strike bowler. Combines lethal wicket-taking deliveries (sharp leg-cutters/outswingers) with exceptional run containment."
        elif economy < 7.2:
            strength = "Superb defensive containment bowler. Exceptional accuracy targeting the blockhole and wide-stump channels under pressure."
        elif sr < 22:
            strength = "Aggressive wicket-taker. Exceptional bounce and lateral movement; excels at forcing top-order errors and breaking partnerships."
        else:
            strength = "Disciplined length bowler. Extremely reliable line and length, creating pressure through dot-ball consistency."
            
        return {"weakness": weakness, "strength": strength}

def generate_player_fun_fact(bat_stats, bowl_stats, is_batter):
    if is_batter:
        if not bat_stats:
            return "Did you know? This player has indexed extensive career stats in our live database."
        runs = bat_stats.get("runs", 0)
        balls = bat_stats.get("balls_faced", 0)
        dismissals = bat_stats.get("dismissals", 0)
        avg = runs / dismissals if dismissals > 0 else runs
        sr = (runs / balls * 100) if balls > 0 else 0
        
        runs_by_over = bat_stats.get("runs_by_over", {})
        if runs_by_over:
            sorted_overs = sorted(runs_by_over.items(), key=lambda x: x[1], reverse=True)
            if sorted_overs and sorted_overs[0][1] > 100:
                return f"Did you know? Over #{sorted_overs[0][0]} is this batsman's absolute favorite, yielding a total of {sorted_overs[0][1]:,} runs in our database!"
        
        if sr > 140:
            return f"Did you know? This batsman scores at a blistering career strike rate of {sr:.1f}, making them a certified bowler's nightmare in short formats."
        
        return f"Did you know? This batsman has faced a total of {balls:,} balls in our live database, accumulating {runs:,} career runs."
    else:
        if not bowl_stats:
            return "Did you know? This player has indexed extensive career stats in our live database."
        economy = bowl_stats.get("economy", 0)
        wickets = bowl_stats.get("wickets", 0)
        balls = bowl_stats.get("balls_bowled", 0)
        sr = balls / wickets if wickets > 0 else 24
        
        wickets_list = bowl_stats.get("wickets_list", {})
        if wickets_list:
            sorted_victims = sorted(wickets_list.items(), key=lambda x: x[1], reverse=True)
            if sorted_victims and sorted_victims[0][1] > 3:
                return f"Did you know? This bowler's favorite target is {sorted_victims[0][0]}, dismissing them a staggering {sorted_victims[0][1]} times in our database!"
        
        if economy > 0 and economy < 6.5:
            return f"Did you know? This bowler boasts an exceptional economy rate of {economy:.2f} runs per over, making them one of the hardest bowlers to score against in cricket history."
        
        if sr > 0 and sr < 20:
            return f"Did you know? This bowler takes a wicket every {sr:.1f} balls on average, indicating a highly lethal and aggressive wicket-taking style."
            
        runs_conceded = bowl_stats.get("runs_conceded", 0)
        return f"Did you know? This bowler has delivered a staggering {balls:,} balls in our database, conceding {runs_conceded:,} runs and taking {wickets} wickets."

@app.get("/player/{name}")
def get_player_stats(name: str, role: str = None):
    name_lower = name.lower()
    
    # Filter data for when player is batter (ultra fast using indexed columns)
    bat_df = df[df['batter_lower'] == name_lower]
    # Filter data for when player is bowler
    bowl_df = df[df['bowler_lower'] == name_lower]
    
    if len(bat_df) == 0 and len(bowl_df) == 0:
        # Try partial match suggestions
        matching_batters = df[df['batter_lower'].str.contains(name_lower, na=False, regex=False)]['batter'].unique()
        matching_bowlers = df[df['bowler_lower'].str.contains(name_lower, na=False, regex=False)]['bowler'].unique()
        all_matches = list(set(list(matching_batters) + list(matching_bowlers)))
        if len(all_matches) > 0:
            return {
                "error": "Player not found",
                "suggestions": all_matches[:5]
            }
        raise HTTPException(status_code=404, detail="Player not found")
        
    actual_name = bat_df['batter'].iloc[0] if len(bat_df) > 0 else bowl_df['bowler'].iloc[0]
    
    # Calculate Batter Stats
    bat_stats = {}
    if len(bat_df) > 0:
        total_runs = int(bat_df['runs'].sum())
        balls_faced = len(bat_df)
        dismissals = int(bat_df['wicket'].sum())
        avg = round(total_runs / dismissals, 2) if dismissals > 0 else total_runs
        sr = round((total_runs / balls_faced) * 100, 2) if balls_faced > 0 else 0
        
        # Top bowlers who got them out
        dismissed_by = bat_df[bat_df['wicket'] == 1]['bowler'].value_counts().head(5).to_dict()
        
        # Runs scored by over
        runs_by_over = {int(k): int(v) for k, v in bat_df.groupby('over')['runs'].sum().to_dict().items()}
        
        # Bowling plans (analysis of runs scored against different bowlers)
        top_bowlers_faced = bat_df['bowler'].value_counts().head(5).to_dict()
        
        bat_stats = {
            "runs": total_runs,
            "balls_faced": balls_faced,
            "dismissals": dismissals,
            "average": avg,
            "strike_rate": sr,
            "top_bowlers_faced": top_bowlers_faced,
            "dismissed_by": dismissed_by,
            "runs_by_over": runs_by_over
        }
        
    # Calculate Bowler Stats
    bowl_stats = {}
    if len(bowl_df) > 0:
        wickets = int(bowl_df['wicket'].sum())
        balls_bowled = len(bowl_df)
        overs_bowled = round(balls_bowled / 6, 1)
        runs_conceded = int(bowl_df['total_runs'].sum())
        economy = round((runs_conceded / balls_bowled) * 6, 2) if balls_bowled > 0 else 0
        bowl_avg = round(runs_conceded / wickets, 2) if wickets > 0 else 0
        
        # Top batters got out
        wickets_list = bowl_df[bowl_df['wicket'] == 1]['batter'].value_counts().head(5).to_dict()
        
        # Top batters faced
        top_batters_faced = bowl_df['batter'].value_counts().head(5).to_dict()
        
        bowl_stats = {
            "wickets": wickets,
            "balls_bowled": balls_bowled,
            "overs_bowled": overs_bowled,
            "runs_conceded": runs_conceded,
            "economy": economy,
            "average": bowl_avg,
            "top_batters_faced": top_batters_faced,
            "wickets_list": wickets_list
        }
        
    is_batter = len(bat_df) >= len(bowl_df)
    if role:
        if role == 'BAT' and len(bat_df) > 0:
            is_batter = True
        elif role == 'BOWL' and len(bowl_df) > 0:
            is_batter = False
    ai_analysis = generate_player_ai_analysis(bat_stats, bowl_stats, is_batter)
    fun_fact = generate_player_fun_fact(bat_stats, bowl_stats, is_batter)
    
    return {
        "name": actual_name,
        "role": "BAT" if is_batter else "BOWL",
        "batting": bat_stats,
        "bowling": bowl_stats,
        "weakness": ai_analysis["weakness"],
        "strength": ai_analysis["strength"],
        "funFact": fun_fact
    }
