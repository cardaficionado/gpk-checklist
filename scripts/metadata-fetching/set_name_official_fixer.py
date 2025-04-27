# set_name_official_fixer_final.py

import json
import os
import unicodedata

# === SETTINGS ===
INPUT_FILE = "enriched_nft_metadata_corrected.json"
OUTPUT_FILE = "enriched_nft_metadata_with_setnames_fixed.json"

# Define your mapping here: keyword in description -> official set name
DESCRIPTION_TO_SETNAME = {
    "2021 Topps MLB Inception NFT Collection": "2021 Topps MLB Inception",
    "2022 Topps Series 1 Baseball": "2022 Topps Series 1 Baseball",
    "2021 Topps Bazooka Joe": "2021 Topps Bazooka Joe",
    "2021 Season Celebration Collection ": "2020-2021 Bundesliga Season Celebration",
    "2021 Topps Series 2 Baseball NFT Collection": "2021 Topps Series 2 Baseball",
    "Topps Series 1 - 21/22 Bundesliga": "2021-2022 Topps Bundesliga Series 1",
    "2021 Topps NOW MLB World Series": "2021 MLB Topps Now",
    "2021 Topps MLB Postseason": "2021 Topps MLB Postseason",
    "2021 Topps Year End Celebration": "2021 Topps Year End Celebration",
    "Topps Series 2 - 21/22 Bundesliga": "2021-2022 Topps Bundesliga Series 2",
    "awards from the 2021 MLB season": "2021 MLB Challenge Reward",
    "2022 Topps Legendary MLB": "2022 Topps Legendary MLB",
    "2021 Topps Series 2 Baseball Set Completion Challenge Rewards": "2021 Topps Series 2 Baseball Set Completion Rewards",
    "2022 Topps Year End Celebration NFT ": "2022 Topps Year End Celebration",
    "2022 MLB End Of Year Challenge Rewards": "2022 Topps MLB End of Year Challenge Rewards",
    "2022 Topps MLB All-Star Game Challenge Rewards": "2022 Topps MLB ASG Challenge Reward",
    "2022 Topps NOW MLB Postseason Collection": "2022 Topps Now MLB Postseason",
    "2022 Topps Pristine Baseball NFT Collection": "2022 Topps Pristine Baseball",
    "Topps Series Challenge Rewards NFT": "2021-22 Topps Bundesliga Challenge Rewards",
    "2022 Topps Pristine Baseball NFT Collection Challenge Rewards": "2022 Topps Pristine Baseball Challenge Rewards",
    "2022 Postseason World Series MVP Challenge Rewards": "2022 Topps Baseball Postseason World Series MVP Challenge Rewards",
    "Topps Kickoff - 22-23 Bundesliga": "2022-23 Topps Bundesliga Kickoff",
    "2022 Topps Series 1 Baseball NFT Collection Stats Challenge Rewards": "2022 Topps Series 1 Baseball Stats Challenge Rewards",
    "2022 Topps MLB All-Star Game NFT Collection": "2022 Topps MLB All-Star Game",
    "Reward NFT from the 2022 Topps GPK Non-Flushable Tokens NFT": "2022 Topps GPK Non-Flushable Tokens Challenge Rewards",
    "Topps Limitless Challenge Rewards - 22-23 Bundesliga": "2022-23 Topps Bundesliga Limitless Challenge Rewards",
    "Topps Series 3 - 21-22 Bundesliga": "2021-22 Topps Bundesliga Series 3",
    "Topps Series 4 - 21-22 Bundesliga": "2021-22 Topps Bundesliga Series 4",
    "2022 Topps MLB All-Star Game Event Exclusive NFT Collection": "2022 Topps MLB All-Star Game Event Exclusive",
    "2021 MLB Inception Set Completion Challenge": "2021 Topps MLB Inception Set Completion Reward",
    "2022 Topps GPK Non-Flushable Tokens NFT Collection": "2022 Topps GPK Non-Flushable Tokens"
}

# === FUNCTIONS ===

def load_json(filepath):
    with open(filepath, "r") as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

def normalize_unicode(text):
    text = unicodedata.normalize("NFKD", text)
    return "".join([c for c in text if not unicodedata.combining(c)])

def assign_set_name(entry):
    description = normalize_unicode(entry.get("description", "") or "").lower()
    set_name_raw = normalize_unicode(entry.get("set_name", "") or "").lower()
    for keyword, official_setname in DESCRIPTION_TO_SETNAME.items():
        keyword_normalized = normalize_unicode(keyword).lower()
        if keyword_normalized in description or keyword_normalized in set_name_raw:
            return official_setname
    return None

# === MAIN SCRIPT ===

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Input file {INPUT_FILE} not found.")
        return

    metadata = load_json(INPUT_FILE)
    updated = []

    for entry in metadata:
        if not entry.get("set_name_official"):  # Only fill if empty
            assigned_name = assign_set_name(entry)
            if assigned_name:
                entry["set_name_official"] = assigned_name
        updated.append(entry)

    save_json(OUTPUT_FILE, updated)
    print(f"✅ Set Name enrichment complete! Saved updated metadata to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

"""
README:

This script scans 'description' and 'set_name' fields for known keywords.
It normalizes Unicode spaces before matching.
It fills 'set_name_official' if it is currently null.

Usage:
- Place enriched_nft_metadata_corrected.json in the folder.
- Run `python3 set_name_official_fixer_final.py`

Output:
- Creates enriched_nft_metadata_with_setnames_fixed.json with corrected 'set_name_official' fields.
"""
