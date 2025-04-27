# checklist_restructurer.py

import json
import os

# === SETTINGS ===
INPUT_FILE = "grouped_by_set_inception.json"
OUTPUT_FILE = "grouped_by_set_inception_flattened.json"

# === FUNCTIONS ===

def load_json(filepath):
    with open(filepath, "r") as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

# === MAIN SCRIPT ===

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Input file {INPUT_FILE} not found.")
        return

    checklist = load_json(INPUT_FILE)

    set_name = checklist.get("Checklist Name", "").strip()
    flattened_nfts = []

    for set_entry in checklist.get("Sets", []):
        subset_name = set_entry.get("Set Name", "").strip()

        for rarity_entry in set_entry.get("Rarities", []):
            rarity_name = rarity_entry.get("Rarity Name", "").strip()

            for nft in rarity_entry.get("NFTs", []):
                flattened_nft = {
                    "Name": nft.get("Name", "").strip(),
                    "Set Name": set_name,
                    "Subset Name": subset_name,
                    "Rarity Name": rarity_name,
                    "Mint Count": nft.get("Total Minted", 0),
                    "Contract Address": nft.get("Contract Address", ""),
                    "On Chain": nft.get("On Chain", False)
                }
                flattened_nfts.append(flattened_nft)

    save_json(OUTPUT_FILE, flattened_nfts)
    print(f"✅ Checklist restructuring complete! Flattened checklist saved as {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

"""
README:

This script restructures the nested grouped_by_set_inception.json into a flattened list format.
Each NFT record includes:
- Set Name (formerly Checklist Name)
- Subset Name (formerly Set Name)
- Rarity Name
- Mint Count (formerly Total Minted)
- Contract Address
- On Chain

Usage:
- Place grouped_by_set_inception.json in the folder.
- Run `python3 checklist_restructurer.py`

Output:
- Creates grouped_by_set_inception_flattened.json with all NFTs flattened and enriched.
"""
