# 🏏 PitchIQ Analytics

PitchIQ is a cinematic, broadcast-grade **sports-tech analytics platform** designed for modern cricket coaches, analysts, and players. Powered by a massive dataset indexing **11.1M+ delivery records**, PitchIQ delivers real-time strategic plans, dynamic field setups, head-to-head match-up indices, and interactive coordinate maps in milliseconds.

Designed and developed by **Amish Rahman**, a B.Tech student and fast-rising sports-tech engineer, the application bridges the gap between complex raw data engineering and on-field tactical execution.

---

## 🚀 Live Demo & Key Features

### 🔬 1. Interactive Strategy Lab
* **Simulate Before You Bowl:** Tune exact delivery lines, lengths, and speeds (110 - 155 kph) on a top-down pitch canvas and watch the model calculate expected wicket probability and economy in real-time.
* **Drag-and-Drop Fielder customizer:** Dynamically place **9 active fielders** across 17 real-time SVG fielding coordinates. 
* **Field Restriction Sentinel:** Features built-in automatic boundary checks enforcing official T20 restrictions (max 5 deep boundary fielders) and provides live coaching feedback alerts.
* **Dynamic AI Plans:** Integrates a state-of-the-art plan generator that hashes batsman profiles, computes career stats (runs, average, strike rate, milestones), and devises custom visual recommendations at a single click.

### 🎯 2. Hawk-Eye Dismissal Mapping
* **Surgical Visualizations:** Visualizes tracked database landing spot coordinates on a virtual pitch strip.
* **Historical Mapping:** Plots exactly where every tracked ball pitched, how they got out (Bowled, LBW, Caught, Caught Behind, Stumped), and against which bowler.
* **Format-Specific Milestones:** Allows seamless filtering across T20s, ODIs, and Tests formats with live database connection indicators.

### ⚔️ 3. Head-to-Head Duel Simulator
* **Bowler vs. Batsman Duelist:** Compare any pitcher and batter combination on the fly to see how the model rates the matchup.
* **Granular Duel telemetry:** Computes precise strike rates, dismissal probability metrics, exact runs, balls, and outs logged directly from the live database.
* **8-Sector scoring zones:** Maps batsman sweet-spots across a gorgeous, interactive 8-sector radial scoring zone bar chart.

### 📰 4. Daily Editorial Slate
* **Broadcast Intelligence:** Stay ahead of the game with daily briefing slates deterministically seeded from calendar days.
* **Live Telemetry Ticker:** Feeds real-time sliding tickers displaying critical player and matchup indicators.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, TanStack Start (Router), Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express, CORS, Memory Indexing maps |
| **Data Engineering** | Python, CSV streams, zipfile classifiers |
| **Integrations** | Web3Forms API (Direct-to-email form telemetry) |

---

## ⚙️ Quick Start & Local Run

To run the application locally on your machine, follow these steps:

### 1. Extract the Database
PitchIQ utilizes a compressed archive containing match records. Run the extraction script to unpack the JSON records and generate the unified CSV:
```bash
# Navigate to the backend directory and run extraction
cd backend
python fast_extract.py
```

### 2. Run the Node.js Express Server
The backend handles blazing-fast autocomplete searches, head-to-head simulations, and individual player career calculations in memory.
```bash
# From the backend directory
npm install
npm run dev
```
*The API will start running locally at `http://localhost:8000`.*

### 3. Run the React Frontend Application
Start the frontend development server:
```bash
# From the project root directory
npm install
npm run dev
```
*Vite will compile and launch the application locally at `http://localhost:8080`.*

---

## 📬 Let's Connect!

I am always looking to collaborate on sports analytics, machine learning research, and high-performance web applications. Feel free to connect!

* **Email:** [amishrahmanind@gmail.com](mailto:amishrahmanind@gmail.com)
* **LinkedIn:** [amish-rahman-2k26](https://www.linkedin.com/in/amish-rahman-2k26)
* **GitHub:** [@AmishRahman2005](https://github.com/AmishRahman2005)

---

*Designed and engineered with passion by **Amish Rahman**.*
