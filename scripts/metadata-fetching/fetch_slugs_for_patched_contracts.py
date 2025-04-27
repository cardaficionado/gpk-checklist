# fetch_slugs_for_patched_contracts.py

import json
import os
import requests
import time
from dotenv import load_dotenv

# Load API key
load_dotenv(".env.local")
OPENSEA_API_KEY = os.getenv("OPENSEA_API_KEY")

# Files
PATCH_TEMPLATE_FILE = "manual_contract_patch_template.json"
EXISTING_SLUGS_FILE = "../../public/data/topps/mlb/2021-topps-mlb-inception/contract_to_slug.json"
OUTPUT_SLUGS_FILE = "../../public/data/topps/mlb/2021-topps-mlb-inception/contract_to_slug.json"

# Load manual patch template
with open(PATCH_TEMPLATE_FILE, "r") as f:
    patch_entries = json.load(f)

# Load existing slug map
with open(EXISTING_SLUGS_FILE, "r") as f:
    slug_map = json.load(f)

# Extract contracts
contracts_to_fetch = [entry["Correct Contract"].lower() for entry in patch_entries]

print(f"🔍 Fetching slugs for {len(contracts_to_fetch)} manually patched contracts.")

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

# Fetch slugs
for idx, contract in enumerate(contracts_to_fetch):
    if contract in slug_map and slug_map[contract] != "MISSING":
        print(f"✅ Slug already exists for {contract}, skipping.")
        continue

    print(f"🔎 [{idx+1}/{len(contracts_to_fetch)}] Fetching slug for {contract}...")
    slug = fetch_slug(contract)
    if slug:
        slug_map[contract] = slug
        print(f"✅ Found slug: {slug}")
    else:
        slug_map[contract] = "MISSING"
        print(f"⚠️ No slug found for {contract}")

    time.sleep(2)  # Respect OpenSea API rate limits

# Save updated slug map
with open(OUTPUT_SLUGS_FILE, "w") as f:
    json.dump(slug_map, f, indent=2)

print(f"\n🎉 Done! Updated slugs saved back to {OUTPUT_SLUGS_FILE}")