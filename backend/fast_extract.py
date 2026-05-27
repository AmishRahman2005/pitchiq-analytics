import zipfile
import orjson
import csv
from pathlib import Path

zip_path = "all_json.zip"
csv_path = "all_deliveries.csv"

rows_written = 0

with zipfile.ZipFile(zip_path, "r") as zf:

    json_files = [f for f in zf.namelist() if f.endswith(".json")]

    with open(csv_path, "w", newline="", encoding="utf-8") as csvfile:

        writer = csv.writer(csvfile)

        writer.writerow([
            "match_id",
            "over",
            "ball",
            "batter",
            "bowler",
            "runs",
            "extras",
            "total_runs",
            "wicket"
        ])

        for idx, file in enumerate(json_files):

            try:

                with zf.open(file) as f:
                    data = orjson.loads(f.read())

                innings = data.get("innings", [])

                for inning in innings:

                    overs = inning.get("overs", [])

                    for over_data in overs:

                        over_number = over_data.get("over", 0)

                        deliveries = over_data.get("deliveries", [])

                        for ball_num, delivery in enumerate(deliveries):

                            runs_data = delivery.get("runs", {})

                            writer.writerow([
                                Path(file).stem,
                                over_number,
                                ball_num + 1,
                                delivery.get("batter"),
                                delivery.get("bowler"),
                                runs_data.get("batter", 0),
                                runs_data.get("extras", 0),
                                runs_data.get("total", 0),
                                1 if delivery.get("wickets") else 0
                            ])

                            rows_written += 1

                if idx % 1000 == 0:
                    print(f"Processed {idx}/{len(json_files)} matches")

            except Exception as e:
                print(f"Skipped {file}: {e}")

print("\nDONE")
print(f"Rows written: {rows_written}")
print(f"CSV saved at: {csv_path}")
