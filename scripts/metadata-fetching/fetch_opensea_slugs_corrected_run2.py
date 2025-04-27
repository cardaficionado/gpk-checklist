# fetch_opensea_slugs_corrected.py (with .env.local support)

import json
import os
import requests
import time
from dotenv import load_dotenv

# === SETTINGS ===
load_dotenv(".env.local")
CHECKLIST_INPUT_FILE = "grouped_by_set_inception_flattened_final_with_contracts_fixed.json"
OUTPUT_SLUG_FILE = "contract_to_slug_run2.json"
OPENSEA_API_KEY = os.getenv("OPENSEA_API_KEY")

# === FUNCTIONS ===

def load_json(filepath):
    with open(filepath, "r") as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

def fetch_slug(contract_address):
    url = f"https://api.opensea.io/api/v2/chain/matic/contract/{contract_address}"
    headers = {
        "accept": "application/json",
        "x-api-key": OPENSEA_API_KEY
    }

    for attempt in range(3):
        try:
            response = requests.get(url, headers=headers)

            if response.status_code == 429:
                print(f"🚦 Rate limited. Retrying in 2s...")
                time.sleep(2)
                continue

            if not response.ok:
                print(f"❌ Error for {contract_address}: {response.status_code} {response.reason}")
                return None

            data = response.json()
            return data.get("collection")

        except Exception as e:
            print(f"❌ Exception fetching {contract_address}: {e}")
            time.sleep(2)

    return None

# === MAIN SCRIPT ===

def main():
    if not OPENSEA_API_KEY is None:
        print("✅ OPENSEA_API_KEY loaded from .env.local")
    else:
        print("❌ OPENSEA_API_KEY not set or missing from .env.local.")
        return

    if not os.path.exists(CHECKLIST_INPUT_FILE):
        print(f"❌ Input file {CHECKLIST_INPUT_FILE} not found.")
        return

    checklist_nfts = load_json(CHECKLIST_INPUT_FILE)
    contracts = {nft["Contract Address"] for nft in checklist_nfts if nft.get("Contract Address") not in ("", "MISSING")}

    contract_to_slug = {}

    print(f"📦 Fetching slugs for {len(contracts)} contracts...")

    for idx, contract in enumerate(sorted(contracts)):
        print(f"🔎 [{idx + 1}/{len(contracts)}] Fetching slug for contract: {contract}")
        slug = fetch_slug(contract)
        if slug:
            contract_to_slug[contract] = slug
            print(f"✅ Slug: {slug}\n")
        else:
            contract_to_slug[contract] = "MISSING"
            print(f"⚠️ Slug missing for contract: {contract}\n")
        time.sleep(2)  # Respectful delay

    save_json(OUTPUT_SLUG_FILE, contract_to_slug)
    print(f"\n🎉 Done! Slugs saved to {OUTPUT_SLUG_FILE}")

if __name__ == "__main__":
    main()

"""
README:

This script now supports loading the OpenSea API key from a .env.local file.
- Uses python-dotenv to load environment variables.
- Continues to fetch collection slugs correctly.

Usage:
- Ensure you have `python-dotenv` installed: `pip install python-dotenv`
- Ensure your `.env.local` file contains `OPENSEA_API_KEY=your-api-key`
- Run `python3 fetch_opensea_slugs_corrected.py`

Output:
- contract_to_slug.json
"""
