import csv
import json

# --- INPUT FILES ---
CHECKLIST_CSV = "topps_mlb_inception_2020_21_nfts_preview_checklist.csv"
CONTRACTS_JSON = "grouped_by_set_inception_flattened_final_with_contracts_images.json"

# --- OUTPUT FILE ---
OUTPUT_JSON = "grouped_by_set_inception_flattened_final_with_contracts_fixed.json"

# --- LOAD DATA ---
with open(CHECKLIST_CSV, "r", encoding="utf-8") as f:
    checklist = list(csv.DictReader(f))

with open(CONTRACTS_JSON, "r", encoding="utf-8") as f:
    contract_data = json.load(f)

# Build quick lookup for contracts
contract_lookup = {}
for item in contract_data:
    key = (item["Name"].strip(), item["Subset Name"].strip(), item["Rarity Name"].strip())
    contract_lookup[key] = {
        "Contract Address": item.get("Contract Address"),
        "On Chain": item.get("On Chain", False)
    }

# --- MERGE CONTRACTS ---
enriched_checklist = []
missing_matches = []

for row in checklist:
    player_team = f"{row['Player'].strip()} - {row['Team'].strip()}"
    key = (player_team, row["Subset"].strip(), row["Rarity"].strip())
    contract_info = contract_lookup.get(key)

    if contract_info:
        row["Contract Address"] = contract_info["Contract Address"]
        row["On Chain"] = contract_info["On Chain"]
    else:
        missing_matches.append(key)

    # Add Image URL from Card column
    row["Image URL"] = row.get("Card", "").strip()

    # Always pull Mint Count from Total Supply column
    try:
        row["Mint Count"] = int(row.get("Total Supply", 0))
    except ValueError:
        row["Mint Count"] = 0

    enriched_checklist.append(row)

# --- WRITE OUTPUT ---
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(enriched_checklist, f, indent=2)

# --- REPORT ---
print(f"✅ Merging complete. {len(enriched_checklist)} entries written.")
if missing_matches:
    print(f"⚠️ WARNING: {len(missing_matches)} entries had no matching contract:")
    for miss in missing_matches:
        print("  -", miss)
else:
    print("🎉 All checklist entries successfully matched!")
