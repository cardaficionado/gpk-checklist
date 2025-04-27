import requests
from dotenv import load_dotenv
import os

# === Setup ===
load_dotenv(".env.local")
OPENSEA_API_KEY = os.getenv("OPENSEA_API_KEY")

HEADERS = {
    "accept": "application/json",
    "x-api-key": OPENSEA_API_KEY
}

# === Contracts to Test ===
contracts = [
    "0x3228d8534f9bf2dc3b40e0e232496742817812ea",  # Example 1
    "0xf655f5c45918f5acd379846de149bed5d2e5f761",  # Example 2
    "0xa0f7564cf2f68bedea54a5e01017d381bffc6942"   # Example 3
]

# === Query Each Contract ===
for idx, contract in enumerate(contracts):
    url = f"https://api.opensea.io/api/v2/chain/matic/contract/{contract}"
    print(f"\n🔍 [{idx+1}/{len(contracts)}] Fetching contract: {contract}")

    try:
        response = requests.get(url, headers=HEADERS)
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        
        # Try showing structured response if possible
        try:
            data = response.json()
            print("JSON Response:")
            print(json.dumps(data, indent=2))
        except Exception:
            print("Raw Response:")
            print(response.text[:500])  # Just in case it's not valid JSON

    except Exception as e:
        print(f"❌ Exception: {str(e)}")