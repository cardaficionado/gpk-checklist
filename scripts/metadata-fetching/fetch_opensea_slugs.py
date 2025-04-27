# fetch_opensea_slugs.py

import json
import os
import requests
import time

# === SETTINGS ===
CHECKLIST_INPUT_FILE = "grouped_by_set_inception_flattened_final_with_contracts_images.json"
OUTPUT_SLUG_FILE = "contract_to_slug.json"
OPENSEA_API_KEY = os.getenv("OPENSEA_API_KEY")  # Make sure your OpenSea API key is set in your environment

# === FUNCTIONS ===

def load_json(filepath):
    with open(filepath, "r") as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

def fetch_slug(contract_address):
    url = f"https://api.opensea.io/api/v2/chain/matic/contract/{contract_address}/collections"
    headers = {
        "accept": "application/json",
        "x-api-key": OPENSEA_API_KEY
    }
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()
        if data and "collections" in data and len(data["collections"]) > 0:
            return data["collections"][0].get("slug")
        else:
            return None
    else:
        print(f"❌ Error fetching slug for contract {contract_address}: {response.status_code}")
        return None

# === MAIN SCRIPT ===

def main():
    if not os.path.exists(CHECKLIST_INPUT_FILE):
        print(f"❌ Input file {CHECKLIST_INPUT_FILE} not found.")
        return

    checklist_nfts = load_json(CHECKLIST_INPUT_FILE)
    contracts = {nft["Contract Address"] for nft in checklist_nfts if nft.get("Contract Address") not in ("", "MISSING")}

    contract_to_slug = {}

    for idx, contract in enumerate(sorted(contracts)):
        print(f"[{idx+1}/{len(contracts)}] Fetching slug for contract: {contract}")
        slug = fetch_slug(contract)
        if slug:
            contract_to_slug[contract] = slug
            print(f"✅ Slug found: {slug}\n")
        else:
            contract_to_slug[contract] = "MISSING"
            print(f"⚠️ Slug missing for contract: {contract}\n")
        time.sleep(0.2)  # slight delay to avoid hammering the API

    save_json(OUTPUT_SLUG_FILE, contract_to_slug)
    print(f"✅ Contract-to-slug mapping complete! Saved to {OUTPUT_SLUG_FILE}")

if __name__ == "__main__":
    main()

"""
README:

This script queries OpenSea's v2 API to fetch collection slugs for each NFT contract.
It builds a mapping {contract: slug} and saves it to contract_to_slug.json.

Usage:
- Make sure you have your OpenSea API Key set as an environment variable named OPENSEA_API_KEY.
- Run `python3 fetch_opensea_slugs.py`

Output:
- contract_to_slug.json mapping contract addresses to OpenSea collection slugs.
"""
