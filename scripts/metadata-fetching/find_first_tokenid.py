# find_first_tokenid.py

import requests
import time
import json
import os

# === SETTINGS ===
API_KEY = "HB6KJVTD6IESTZ86QM9FJFKXMHPSN2ACZM"
RATE_LIMIT_SECONDS = 0.25  # ~4 requests per second
CONTRACTS_FILE = "inception_contracts_list.txt"  # Or your list of contracts
OUTPUT_FILE = "contract_to_first_tokenid.json"

# === FUNCTIONS ===

def get_first_token_id(contract_address):
    url = "https://api.polygonscan.com/api"
    params = {
        "module": "account",
        "action": "tokennfttx",
        "contractaddress": contract_address,
        "page": 1,
        "offset": 1,  # Just need first result
        "startblock": 0,
        "endblock": 99999999,
        "sort": "asc",  # Get earliest minted token first
        "apikey": API_KEY
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        result = response.json()
        if result.get('status') == '1' and result.get('result'):
            token_id = result['result'][0]['tokenID']
            return token_id
        else:
            return None
    else:
        print(f"Error fetching token transfers for {contract_address}: {response.status_code}")
        return None

# === MAIN SCRIPT ===

def main():
    if not os.path.exists(CONTRACTS_FILE):
        print(f"Contracts file {CONTRACTS_FILE} not found.")
        return

    with open(CONTRACTS_FILE, "r") as f:
        contracts = [line.strip().strip('",') for line in f.readlines() if line.strip()]

    output = {}
    total_contracts = len(contracts)
    current_index = 0

    for contract in contracts:
        current_index += 1
        print(f"[{current_index}/{total_contracts}] Finding first tokenId for contract: {contract}")

        token_id = get_first_token_id(contract)
        if token_id:
            output[contract] = token_id
            print(f"Found tokenId: {token_id}")
        else:
            output[contract] = "NOT_FOUND"
            print(f"No token transfers found for contract: {contract}")

        time.sleep(RATE_LIMIT_SECONDS)

    # Save the results
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"✅ Done! Saved first tokenIds to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

"""
README:

This script finds the first minted tokenId for each contract in a list.
It uses the Polygonscan API `tokennfttx` action to look up the first transaction.

Usage:
- Ensure inception_contracts_list.txt or similar is available.
- Install requests package if needed (`pip install requests`).
- Run `python3 find_first_tokenid.py`.

Output:
- Creates contract_to_first_tokenid.json mapping contracts to their first tokenId minted.
"""
