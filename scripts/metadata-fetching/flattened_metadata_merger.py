# flattened_metadata_merger.py

import json
import os
import unicodedata

# === SETTINGS ===
ENRICHED_METADATA_FILE = "enriched_nft_metadata_with_setnames.json"
CHECKLIST_INPUT_FILE = "grouped_by_set_inception_flattened.json"
OUTPUT_FILE = "grouped_by_set_inception_flattened_final.json"

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
    checklist_nfts = load_json(CHECKLIST_INPUT_FILE)

    # Build lookup: (player, set name, rarity) --> contract
    lookup = {}
    for entry in enriched_metadata:
        player = normalize_text(entry.get("character"))
        set_name = normalize_text(entry.get("set_name_official") or entry.get("set_name"))
        rarity = normalize_text(entry.get("rarity"))
        contract = entry.get("contract")

        if player and set_name and rarity and contract:
            lookup[(player, set_name, rarity)] = contract

    updated_nfts = []

    for nft in checklist_nfts:
        player_full = nft.get("Name", "")
        player_name = normalize_text(player_full.split(" - ")[0])
        set_name_checklist = normalize_text(nft.get("Set Name", ""))
        rarity_name = normalize_text(nft.get("Rarity Name", ""))

        key = (player_name, set_name_checklist, rarity_name)
        contract = lookup.get(key)

        if contract:
            nft["Contract Address"] = contract
        else:
            nft["Contract Address"] = "MISSING"

        updated_nfts.append(nft)

    save_json(OUTPUT_FILE, updated_nfts)
    print(f"✅ Flattened merge complete! Final checklist saved as {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

"""
README:

This merger script is built for the flattened checklist structure.
It matches based on (player name, set name, rarity name) directly from NFT attributes.

Usage:
- Ensure enriched_nft_metadata_with_setnames.json and grouped_by_set_inception_flattened.json are available.
- Run `python3 flattened_metadata_merger.py`

Output:
- Creates grouped_by_set_inception_flattened_final.json with contracts populated.
"""
