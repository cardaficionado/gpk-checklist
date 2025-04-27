# fetch_missing_slugs.py

import json
import os
import requests
import time
from dotenv import load_dotenv

# Load API key
load_dotenv(".env.local")
OPENSEA_API_KEY = os.getenv("OPENSEA_API_KEY")

# Input files
MISSING_CONTRACTS_FILE = "missing_contracts.json"
EXISTING_SLUGS_FILE = "public/data/topps/mlb/2021-topps-mlb-inception/contract_to_slug.json"
OUTPUT_SLUGS_FILE = "public/data/topps/mlb/2021-topps-mlb-inception/contract_to_slug.json"

# Load missing contracts
with open(MISSING_CONTRACTS_FILE, "r") as f:
    missing_contracts = json.load(f)

# Load existing slug map
with open(EXISTING_SLUGS_FILE, "r") as f:
    slug_map = json.load(f)

print(f"🔍 Found {len(missing_contracts)} missing contracts to fetch.")

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
                print(f"🚦 Rate limited. Waiting 2 seconds...")
                time.sleep(2)
                continue

            if not response.ok:
                print(f"❌ Error {response.status_code} for {contract_address}")
                return None

            data = response.json()
            return data.get("collection")

        except Exception as e:
            print(f"❌ Exception fetching {contract_address}: {e}")
            time.sleep(2)

    return None

# Fetch missing slugs
for idx, contract in enumerate(missing_contracts):
    print(f"🔎 [{idx+1}/{len(missing_contracts)}] Fetching slug for {contract}...")
    slug = fetch_slug(contract)
    if slug:
        slug_map[contract.lower()] = slug
        print(f"✅ Found slug: {slug}")
    else:
        print(f"⚠️ No slug found for {contract}")
    time.sleep(2)  # Respectful delay

# Save updated slug map
with open(OUTPUT_SLUGS_FILE, "w") as f:
    json.dump(slug_map, f, indent=2)

print(f"\n🎉 Done! Updated slugs saved back to {OUTPUT_SLUGS_FILE}")