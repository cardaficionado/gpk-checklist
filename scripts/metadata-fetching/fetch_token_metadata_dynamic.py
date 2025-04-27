# fetch_token_metadata_dynamic.py

import requests
import time
import json
import os

# === SETTINGS ===
RATE_LIMIT_SECONDS = 0.25  # ~4 requests per second
INPUT_FILE = "contract_to_first_tokenid.json"
OUTPUT_FILE = "contract_to_playername_dynamic.json"
API_KEY = "HB6KJVTD6IESTZ86QM9FJFKXMHPSN2ACZM"

# === FUNCTIONS ===

def get_token_uri(contract_address, token_id):
    url = "https://api.polygonscan.com/api"
    params = {
        "module": "token",
        "action": "tokenuri",
        "contractaddress": contract_address,
        "tokenid": token_id,
        "apikey": API_KEY
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        result = response.json()
        if result.get('status') == '1':
            return result.get('result')
        else:
            return None
    else:
        return None

def fetch_metadata_from_uri(uri):
    try:
        if uri.startswith("ipfs://"):
            uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/")
        response = requests.get(uri)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error fetching metadata from {uri}: {response.status_code}")
            return None
    except Exception as e:
        print(f"Exception fetching metadata from {uri}: {e}")
        return None

# === MAIN SCRIPT ===

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Input file {INPUT_FILE} not found.")
        return

    with open(INPUT_FILE, "r") as f:
        contract_to_tokenid = json.load(f)

    output = {}
    total_contracts = len(contract_to_tokenid)
    current_index = 0

    for contract, token_id in contract_to_tokenid.items():
        current_index += 1
        print(f"[{current_index}/{total_contracts}] Fetching metadata for contract: {contract} tokenId: {token_id}")

        if token_id != "NOT_FOUND":
            token_uri = get_token_uri(contract, token_id)
            if token_uri and not token_uri.startswith("Error!"):
                metadata = fetch_metadata_from_uri(token_uri)
                if metadata:
                    player_name = metadata.get("name")
                    output[contract] = player_name if player_name else "UNKNOWN"
                else:
                    output[contract] = "FAILED_METADATA"
            else:
                output[contract] = "FAILED_TOKENURI"
        else:
            output[contract] = "NO_TOKENS"

        time.sleep(RATE_LIMIT_SECONDS)

    # Save the results
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"✅ Done! Saved player names to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

"""
README:

This script uses the actual first minted tokenId per contract to fetch real metadata.
It then extracts the player name from the metadata and saves it cleanly.

Usage:
- Ensure contract_to_first_tokenid.json is available.
- Install requests package if needed (`pip install requests`).
- Run `python3 fetch_token_metadata_dynamic.py`.

Output:
- Creates contract_to_playername_dynamic.json with the correct player names.
"""
