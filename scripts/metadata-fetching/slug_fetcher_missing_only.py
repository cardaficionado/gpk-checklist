import json
import os
import time
import requests
from dotenv import load_dotenv

# === FILES ===
CHECKLIST_FILE = "grouped_by_set_inception_flattened_final_with_contracts_fixed_corrected_final.json"  # Updated checklist
SLUG_FILE = "contract_to_slug.json"  # Existing slugs

# === OpenSea API Settings ===
load_dotenv(".env.local")
OPENSEA_API_KEY = os.getenv("OPENSEA_API_KEY")
HEADERS = {
    "accept": "application/json",
    "x-api-key": OPENSEA_API_KEY
}
OPENSEA_API_URL = "https://api.opensea.io/api/v2/chain/matic/contract/"

# === LOAD DATA ===
with open(CHECKLIST_FILE, "r", encoding="utf-8") as f:
    checklist = json.load(f)

if os.path.exists(SLUG_FILE):
    with open(SLUG_FILE, "r", encoding="utf-8") as f:
        slug_map = json.load(f)
else:
    slug_map = {}

# === FIND MISSING CONTRACTS ===
contracts = {nft["Contract Address"].lower() for nft in checklist if nft.get("Contract Address") not in (None, "", "MISSING")}
missing_contracts = [c for c in contracts if c not in slug_map]

print(f"\n🔍 {len(missing_contracts)} contracts missing slug mappings.")

# === FETCH SLUGS FOR MISSING CONTRACTS ===
for idx, contract in enumerate(missing_contracts):
    url = OPENSEA_API_URL + contract
    print(f"[{idx+1}/{len(missing_contracts)}] Fetching slug for {contract}...")
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            if 'application/json' in content_type:
                try:
                    data = response.json()
                    if isinstance(data, dict):
                        slug = data.get("collection", {}).get("slug")
                        if slug:
                            slug_map[contract] = slug
                            print(f"✅ Slug found: {slug}")
                        else:
                            print(f"⚠️ No slug found for {contract}")
                    else:
                        print(f"❌ Unexpected JSON structure for {contract}: {data}")
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
        time.sleep(2)  # Gentle throttle
    except Exception as e:
        print(f"❌ Exception fetching {contract}: {str(e)}")
        time.sleep(2)

# === SAVE UPDATED SLUG FILE ===
with open(SLUG_FILE, "w", encoding="utf-8") as f:
    json.dump(slug_map, f, indent=2)

print(f"\n✅ Slug fetching complete. Updated {SLUG_FILE}")
