# static_metadata_merger_debug_lookup.py (First 10 NFT Debug Mode + Lookup Table Debug)

import json
import os
import unicodedata

# === SETTINGS ===
ENRICHED_METADATA_FILE = "enriched_nft_metadata_with_setnames.json"
CHECKLIST_INPUT_FILE = "grouped_by_set_inception.json"
OUTPUT_FILE = "grouped_by_set_inception_final_debug.json"

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

    checklist_name = normalize_text(checklist.get("Checklist Name", ""))

    # Build lookup: (player, checklist name, rarity) --> contract
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
                print(f"[LOOKUP {lookup_debug_count+1}] Player: {player} | Set Name: {set_name} | Rarity: {rarity} | Contract: {contract}")
                lookup_debug_count += 1

    updated = checklist.copy()
    debug_count = 0

    for set_entry in updated.get("Sets", []):
        for rarity_entry in set_entry.get("Rarities", []):
            rarity_name = normalize_text(rarity_entry.get("Rarity Name", ""))
            for nft in rarity_entry.get("NFTs", []):
                player_full = nft.get("Name", "")
                player_name = normalize_text(player_full.split(" - ")[0])

                key = (player_name, checklist_name, rarity_name)
                contract = lookup.get(key)

                if debug_count < 10:
                    print(f"[CHECKLIST {debug_count+1}] Player: {player_name} | Checklist: {checklist_name} | Rarity: {rarity_name}")
                    if contract:
                        print(f"✅ Match found! Contract: {contract}\n")
                    else:
                        print("❌ Missing match!\n")
                    debug_count += 1

                if contract:
                    nft["Contract Address"] = contract
                else:
                    nft["Contract Address"] = "MISSING"

    save_json(OUTPUT_FILE, updated)
    print(f"✅ Debug merge complete! Final checklist saved as {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

"""
README:

This debug script prints:
- First 10 entries of the lookup table built from enriched metadata.
- First 10 NFTs from the checklist during matching.

Usage:
- Run `python3 static_metadata_merger_debug_lookup.py`
- Compare what is in lookup vs checklist.

Output:
- grouped_by_set_inception_final_debug.json
"""
