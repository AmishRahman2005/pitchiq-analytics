# PitchIQ Analytics - Extract Deliveries

This folder contains two extraction scripts that parse and transform match data from `all_json.zip` into a structured CSV file `all_deliveries.csv` for the backend database.

## Prerequisites

1. Place your **`all_json.zip`** file directly in this `backend` folder.
2. Select one of the two execution options below (Node.js is recommended if you do not have Python installed on your system).

---

## Option A: Node.js (Recommended - Fast & Easy)

Since Node.js is already installed and fully operational on your system, you can use the JavaScript version of the script. It uses `adm-zip` to extract the data rapidly.

### Setup & Run:
1. **Open PowerShell/Terminal** inside the `backend` folder:
   ```powershell
   cd backend
   ```
2. **Install `adm-zip`**:
   ```powershell
   npm install adm-zip
   ```
3. **Run the script**:
   ```powershell
   node fast_extract.js
   ```

---

## Option B: Python

If you prefer to use the Python script, ensure you have Python 3.x installed on your computer.

### Setup & Run:
1. **Install Python** (if not already installed):
   * Run in PowerShell: `winget install Python.Python.3.12`
   * Or download from [python.org](https://www.python.org/downloads/) (ensure **"Add Python to PATH"** is checked during installation).
2. **Install the dependencies**:
   ```powershell
   pip install orjson pandas
   ```
3. **Run the script**:
   ```powershell
   python fast_extract.py
   ```

---

## Output
Once run, a file called **`all_deliveries.csv`** will be generated under `backend/`. 
Move this CSV file into `backend/data/` for the FastAPI backend to load it.
