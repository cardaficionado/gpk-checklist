# final_contract_filler.py

import json
import os
import unicodedata

# === SETTINGS ===
ENRICHED_METADATA_FILE = "enriched_nft_metadata_with_setnames_fixed.json"
FLATTENED_CHECKLIST_FILE = "grouped_by_set_inception_flattened_final.json"
OUTPUT_FILE = "grouped_by_set_inception_flattened_final_with_contracts.json"

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
    if not os.path.exists(ENRICHED_METADATA_FILE) or not os.path.exists(FLATTENED_CHECKLIST_FILE):
        print("❌ Required input files not found.")
        return

    enriched_metadata = load_json(ENRICHED_METADATA_FILE)
    checklist_nfts = load_json(FLATTENED_CHECKLIST_FILE)

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
    missing_count = 0

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
            missing_count += 1

        updated_nfts.append(nft)

    save_json(OUTPUT_FILE, updated_nfts)
    print(f"✅ Contract filling complete! Final checklist saved as {OUTPUT_FILE}")
    print(f"🔎 Total NFTs processed: {len(updated_nfts)}")
    print(f"⚠️ Missing contract matches: {missing_count}")

if __name__ == "__main__":
    main()

"""
README:

This script matches flattened checklist NFTs against enriched metadata by:
- Player Name
- Set Name
- Rarity Name

It fills "Contract Address" where found, otherwise sets "MISSING".

Usage:
- Ensure enriched_nft_metadata_with_setnames.json and grouped_by_set_inception_flattened_final.json are available.
- Run `python3 final_contract_filler.py`

Output:
- grouped_by_set_inception_flattened_final_with_contracts.json with filled contract addresses.
"""
