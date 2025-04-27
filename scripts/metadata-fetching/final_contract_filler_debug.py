# final_contract_filler_debug.py (With First 10 Lookup + Checklist Debug)

import json
import os
import unicodedata

# === SETTINGS ===
ENRICHED_METADATA_FILE = "enriched_nft_metadata_with_setnames.json"
FLATTENED_CHECKLIST_FILE = "grouped_by_set_inception_flattened_final.json"
OUTPUT_FILE = "grouped_by_set_inception_flattened_final_with_contracts_debug.json"

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
    lookup_debug_count = 0

    for entry in enriched_metadata:
        player = normalize_text(entry.get("character"))
        set_name = normalize_text(entry.get("set_name_official") or entry.get("set_name"))
        rarity = normalize_text(entry.get("rarity"))
        contract = entry.get("contract")

        if player and set_name and rarity and contract:
            lookup[(player, set_name, rarity)] = contract

            if lookup_debug_count < 10:
                print(f"[LOOKUP {lookup_debug_count+1}] Player: {player} | Set: {set_name} | Rarity: {rarity} | Contract: {contract}")
                lookup_debug_count += 1

    updated_nfts = []
    missing_count = 0
    checklist_debug_count = 0

    for nft in checklist_nfts:
        player_full = nft.get("Name", "")
        player_name = normalize_text(player_full.split(" - ")[0])
        set_name_checklist = normalize_text(nft.get("Set Name", ""))
        rarity_name = normalize_text(nft.get("Rarity Name", ""))

        key = (player_name, set_name_checklist, rarity_name)
        contract = lookup.get(key)

        if checklist_debug_count < 10:
            print(f"[CHECKLIST {checklist_debug_count+1}] Player: {player_name} | Set: {set_name_checklist} | Rarity: {rarity_name}")
            if contract:
                print(f"✅ Match found! Contract: {contract}\n")
            else:
                print("❌ Missing match!\n")
            checklist_debug_count += 1

        if contract:
            nft["Contract Address"] = contract
        else:
            nft["Contract Address"] = "MISSING"
            missing_count += 1

        updated_nfts.append(nft)

    save_json(OUTPUT_FILE, updated_nfts)
    print(f"✅ Debug contract filling complete! Final checklist saved as {OUTPUT_FILE}")
    print(f"🔎 Total NFTs processed: {len(updated_nfts)}")
    print(f"⚠️ Missing contract matches: {missing_count}")

if __name__ == "__main__":
    main()

"""
README:

This debug version prints:
- First 10 lookup table entries.
- First 10 checklist NFTs being matched.

Usage:
- Run `python3 final_contract_filler_debug.py`

Output:
- grouped_by_set_inception_flattened_final_with_contracts_debug.json with match info.
"""
