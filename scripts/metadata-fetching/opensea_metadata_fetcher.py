# opensea_metadata_fetcher_final.py (Final Corrected Version)

import requests
import time
import json
import os
from pathlib import Path
from dotenv import load_dotenv

# === SETTINGS ===
# Load OpenSea API Key from project root .env.local
env_path = Path(__file__).resolve().parents[2] / ".env.local"
load_dotenv(dotenv_path=env_path)
OPENSEA_API_KEY = os.getenv("OPENSEA_API_KEY")
INPUT_FILE = "enriched_nft_metadata_normalized_corrected.json"
OUTPUT_FILE = "enriched_nft_metadata_corrected.json"
CHAIN = "matic"
DEFAULT_TOKEN_ID = 1
RATE_LIMIT_SECONDS = 0.25  # ~4 requests per second

# === FUNCTIONS ===

def load_json(filepath):
    with open(filepath, "r") as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

def fetch_nft_metadata(contract_address, token_id=DEFAULT_TOKEN_ID):
    url = f"https://api.opensea.io/api/v2/chain/{CHAIN}/contract/{contract_address}/nfts/{token_id}"
    headers = {"x-api-key": OPENSEA_API_KEY}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching contract {contract_address}: {response.status_code}")
        return None

def extract_traits(traits, key):
    if not traits:
        return None
    for trait in traits:
        if trait.get("trait_type", "").lower() == key.lower():
            return trait.get("value")
    return None

# === MAIN SCRIPT ===

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Input file {INPUT_FILE} not found.")
        return

    if not OPENSEA_API_KEY:
        print("❌ OPENSEA_API_KEY not found in .env.local.")
        return

    enriched_metadata = load_json(INPUT_FILE)
    updated_metadata = []

    for idx, entry in enumerate(enriched_metadata):
        contract = entry.get("contract")
        if not contract:
            continue

        print(f"[{idx+1}/{len(enriched_metadata)}] Fetching metadata for contract: {contract}")

        nft_data = fetch_nft_metadata(contract)
        if nft_data and "nft" in nft_data:
            nft = nft_data["nft"]
            traits = nft.get("traits", [])

            player_name = extract_traits(traits, "Player Name")
            team = extract_traits(traits, "Team")
            subset = extract_traits(traits, "Subset")
            color = extract_traits(traits, "Color")
            rarity = extract_traits(traits, "Rarity")

            if player_name:
                entry["character"] = player_name
            if team:
                entry["team"] = team
            if subset:
                entry["subset"] = subset
            if color:
                entry["color"] = color
            if rarity and not entry.get("rarity"):
                entry["rarity"] = rarity

        updated_metadata.append(entry)

        # Save a checkpoint every 100 contracts
        if (idx + 1) % 100 == 0:
            temp_file = OUTPUT_FILE.replace(".json", f"_checkpoint_{idx+1}.json")
            save_json(temp_file, updated_metadata)
            print(f"💾 Checkpoint saved: {temp_file}")

        time.sleep(RATE_LIMIT_SECONDS)

    # Final full save
    save_json(OUTPUT_FILE, updated_metadata)
    print(f"✅ Enrichment complete! Saved updated metadata to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

"""
README:

This final corrected script:
- Loads OpenSea API Key from your project .env.local file
- Enriches metadata with Player Name, Team, Subset, Color, Rarity
- Saves checkpoints every 100 contracts
- Saves a full final output at the end

Usage:
- Install python-dotenv if needed (`pip3 install python-dotenv`)
- Set OPENSEA_API_KEY in your .env.local
- Run `python3 opensea_metadata_fetcher_final.py`
"""
