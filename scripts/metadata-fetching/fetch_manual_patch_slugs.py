import json
import os
import time
import requests
from dotenv import load_dotenv

# === FILES ===
MANUAL_PATCH_FILE = "manual_contract_patch_template.json"  # File you filled with Correct Contracts
SLUG_FILE = "contract_to_slug.json"  # Existing slug mappings

# === OpenSea API Settings ===
load_dotenv(".env.local")
OPENSEA_API_KEY = os.getenv("OPENSEA_API_KEY")
HEADERS = {
    "accept": "application/json",
    "x-api-key": OPENSEA_API_KEY
}
OPENSEA_API_URL = "https://api.opensea.io/api/v2/chain/matic/contract/"

# === LOAD FILES ===
with open(MANUAL_PATCH_FILE, "r", encoding="utf-8") as f:
    manual_patches = json.load(f)

if os.path.exists(SLUG_FILE):
    with open(SLUG_FILE, "r", encoding="utf-8") as f:
        slug_map = json.load(f)
else:
    slug_map = {}

# === GATHER CONTRACTS TO FETCH ===
contracts_to_fetch = [entry["Correct Contract"].lower() for entry in manual_patches if entry.get("Correct Contract")]
contracts_to_fetch = [c for c in contracts_to_fetch if c not in slug_map]

print(f"\n🔍 {len(contracts_to_fetch)} manual patch contracts missing slug mappings.")

# === FETCH SLUGS ===
for idx, contract in enumerate(contracts_to_fetch):
    url = OPENSEA_API_URL + contract
    print(f"[{idx+1}/{len(contracts_to_fetch)}] Fetching slug for {contract}...")
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            if 'application/json' in content_type:
                try:
                    data = response.json()
                    if isinstance(data, dict):
                        collection_field = data.get("collection")
                        if isinstance(collection_field, str):
                            slug = collection_field
                            slug_map[contract] = slug
                            print(f"✅ Slug found: {slug}")
                        else:
                            print(f"❌ Unexpected collection structure for {contract}")
                    else:
                        print(f"❌ Unexpected JSON structure for {contract}: {type(data).__name__}")
                except Exception as e:
                    print(f"❌ JSON parsing error for {contract}: {str(e)}")
            else:
                print(f"❌ Non-JSON 200 OK response for {contract}: {response.text[:80]}...")
        elif response.status_code == 429:
            print("🚦 Rate limited, sleeping 2s...")
            time.sleep(2)
            continue
        else:
            print(f"❌ Error {response.status_code} for {contract}: {response.text}")
        time.sleep(2)
    except Exception as e:
        print(f"❌ Exception fetching {contract}: {str(e)}")
        time.sleep(2)

# === SAVE UPDATED SLUG FILE ===
with open(SLUG_FILE, "w", encoding="utf-8") as f:
    json.dump(slug_map, f, indent=2)

print(f"\n✅ Manual patch slug fetching complete. Updated {SLUG_FILE}")
