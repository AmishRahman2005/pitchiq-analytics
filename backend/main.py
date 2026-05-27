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

@app.get("/player/{name}")
def get_player_stats(name: str):
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
        
    return {
        "name": actual_name,
        "role": "BAT" if len(bat_df) >= len(bowl_df) else "BOWL",
        "batting": bat_stats,
        "bowling": bowl_stats
    }
