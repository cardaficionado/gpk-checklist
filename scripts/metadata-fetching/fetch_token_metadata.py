# fetch_token_metadata.py

import requests
import time
import json
import os

# === SETTINGS ===
RATE_LIMIT_SECONDS = 0.25  # ~4 requests per second
INPUT_FILE = "contract_to_tokenuri.json"
OUTPUT_FILE = "contract_to_playername.json"

# === FUNCTIONS ===

def fetch_metadata_from_uri(uri):
    try:
        if uri.startswith("ipfs://"):
            # Convert IPFS to public gateway
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
        print(f"Input file {INPUT_FILE} not found. Run query_inception_contracts.py first.")
        return

    with open(INPUT_FILE, "r") as f:
        contract_to_uri = json.load(f)

    output = {}
    total_contracts = len(contract_to_uri)
    current_index = 0

    for contract, uri in contract_to_uri.items():
        current_index += 1
        print(f"[{current_index}/{total_contracts}] Checking contract: {contract}")

        if uri and not uri.startswith("Error!"):
            print(f"Fetching metadata for contract: {contract}")
            metadata = fetch_metadata_from_uri(uri)
            if metadata:
                player_name = metadata.get("name")
                output[contract] = player_name if player_name else "UNKNOWN"
            else:
                output[contract] = "FAILED"
        else:
            print(f"Skipping invalid URI for contract: {contract}")
            output[contract] = "INVALID_URI"

        time.sleep(RATE_LIMIT_SECONDS)

    # Save the results
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"✅ Done! Saved player names to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

"""
README:

This script reads contract_to_tokenuri.json created by query_inception_contracts.py.
It then fetches the actual metadata JSON for each tokenURI and extracts the "name" field (typically player name).

Usage:
- Ensure contract_to_tokenuri.json is available.
- Install requests package if needed (`pip install requests`).
- Run `python3 fetch_token_metadata.py`.

Output:
- Creates contract_to_playername.json mapping contract addresses to player names.
"""
