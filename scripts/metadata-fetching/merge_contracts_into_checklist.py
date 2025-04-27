# merge_contracts_into_checklist.py

import json
import os

# === SETTINGS ===
PLAYERNAME_FILE = "contract_to_playername_dynamic.json"
CHECKLIST_INPUT_FILE = "grouped_by_set_inception.json"  # Your starter checklist
CHECKLIST_OUTPUT_FILE = "grouped_by_set_inception_final.json"

# === MAIN SCRIPT ===

def load_json(filepath):
    with open(filepath, "r") as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

def normalize_name(name):
    # Basic normalization: lowercase and strip whitespace
    return name.lower().strip() if name else ""

def main():
    if not os.path.exists(PLAYERNAME_FILE) or not os.path.exists(CHECKLIST_INPUT_FILE):
        print("❌ Required input files not found.")
        return

    player_mapping = load_json(PLAYERNAME_FILE)
    checklist = load_json(CHECKLIST_INPUT_FILE)

    # Build a quick lookup: player name -> contract
    name_to_contract = {}
    for contract, player_name in player_mapping.items():
        if player_name and player_name not in ["FAILED_METADATA", "FAILED_TOKENURI", "NO_TOKENS", "INVALID_URI"]:
            normalized = normalize_name(player_name)
            name_to_contract[normalized] = contract

    # Fill in contract addresses in checklist
    updated = checklist.copy()

    for set_entry in updated.get("Sets", []):
        for rarity_entry in set_entry.get("Rarities", []):
            for nft in rarity_entry.get("NFTs", []):
                player_name = normalize_name(nft.get("Name", "")).split(" - ")[0]  # Strip team name if present
                contract = name_to_contract.get(player_name)
                if contract:
                    nft["Contract Address"] = contract
                else:
                    nft["Contract Address"] = "MISSING"

    # Save the final checklist
    save_json(CHECKLIST_OUTPUT_FILE, updated)

    print(f"✅ Merge complete! Final checklist saved as {CHECKLIST_OUTPUT_FILE}")

if __name__ == "__main__":
    main()

"""
README:

This script merges real contract addresses into your starter grouped_by_set.json.
It matches based on player name.

Usage:
- Ensure contract_to_playername_dynamic.json is available.
- Ensure grouped_by_set_inception.json (starter checklist) is available.
- Run `python3 merge_contracts_into_checklist.py`.

Output:
- Creates grouped_by_set_inception_final.json with real contract addresses filled in.
"""
