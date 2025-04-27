# static_metadata_merger_final.py (Checklist Name Matching Version)

import json
import os
import unicodedata

# === SETTINGS ===
ENRICHED_METADATA_FILE = "enriched_nft_metadata_with_setnames.json"
CHECKLIST_INPUT_FILE = "grouped_by_set_inception.json"
OUTPUT_FILE = "grouped_by_set_inception_final.json"

# === FUNCTIONS ===

def load_json(filepath):
    with open(filepath, "r") as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

def normalize_text(text):
    if not text:
        return ""
    text = text.lower().strip()
    text = unicodedata.normalize("NFKD", text)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    return text

# === MAIN SCRIPT ===

def main():
    if not os.path.exists(ENRICHED_METADATA_FILE) or not os.path.exists(CHECKLIST_INPUT_FILE):
        print("❌ Required input files not found.")
        return

    enriched_metadata = load_json(ENRICHED_METADATA_FILE)
    checklist = load_json(CHECKLIST_INPUT_FILE)

    # Get Checklist Name from checklist
    checklist_name = normalize_text(checklist.get("Checklist Name", ""))

    # Build lookup: (player, checklist name, rarity) --> contract
    lookup = {}
    for entry in enriched_metadata:
        player = normalize_text(entry.get("character"))
        set_name = normalize_text(entry.get("set_name_official") or entry.get("set_name"))
        rarity = normalize_text(entry.get("rarity"))
        contract = entry.get("contract")

        if player and set_name and rarity and contract:
            lookup[(player, set_name, rarity)] = contract

    updated = checklist.copy()

    for set_entry in updated.get("Sets", []):
        for rarity_entry in set_entry.get("Rarities", []):
            rarity_name = normalize_text(rarity_entry.get("Rarity Name", ""))
            for nft in rarity_entry.get("NFTs", []):
                player_full = nft.get("Name", "")
                player_name = normalize_text(player_full.split(" - ")[0])

                contract = lookup.get((player_name, checklist_name, rarity_name))
                if contract:
                    nft["Contract Address"] = contract
                else:
                    nft["Contract Address"] = "MISSING"

    save_json(OUTPUT_FILE, updated)
    print(f"✅ Static merge complete! Final checklist saved as {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

"""
README:

This script merges enriched Topps metadata into grouped_by_set_inception.json.
It matches using (Player Name, Checklist Name, Rarity Name).

Checklist Name is now correctly taken from the top level of the checklist JSON.

Usage:
- Make sure enriched_nft_metadata_with_setnames.json and grouped_by_set_inception.json are available.
- Run `python3 static_metadata_merger_final.py`

Output:
- Creates grouped_by_set_inception_final.json with real contract addresses populated.
"""
