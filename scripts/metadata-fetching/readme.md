# Metadata Fetching Scripts for Topps NFT Checklist

This folder contains scripts to automate recovering real player metadata and contract addresses for Topps NFTs (e.g., 2021 Topps MLB Inception) after the Polygon migration.

---

## 📋 Script Overview

| Script | Purpose |
|:---|:---|
| `find_first_tokenid.py` | Find the first real minted tokenId for each contract address |
| `fetch_token_metadata_dynamic.py` | Fetch token metadata using the correct tokenId, extract player names |
| `merge_contracts_into_checklist.py` | Merge real contract addresses into your grouped_by_set.json checklist |
| (helper) `query_inception_contracts.py` | (Initial attempt — replaced by dynamic tokenId detection) |
| (helper) `fetch_token_metadata.py` | (Initial attempt — replaced by dynamic tokenId detection) |


---

## 🛠 Setup Instructions

1. Make sure you have a Polygonscan API key.
2. Install the `requests` library if needed:
   ```bash
   pip3 install requests
   ```

3. Save your contract list as `inception_contracts_list.txt` (one contract per line, quoted).

---

## 🚀 How to Run the Full Workflow

### Step 1: Find Real Token IDs
```bash
python3 find_first_tokenid.py
```
- Input: `inception_contracts_list.txt`
- Output: `contract_to_first_tokenid.json`

### Step 2: Fetch Player Metadata
```bash
python3 fetch_token_metadata_dynamic.py
```
- Input: `contract_to_first_tokenid.json`
- Output: `contract_to_playername_dynamic.json`

### Step 3: Merge Contracts into Checklist
```bash
python3 merge_contracts_into_checklist.py
```
- Inputs:
  - `contract_to_playername_dynamic.json`
  - `grouped_by_set_inception.json` (starter checklist)
- Output:
  - `grouped_by_set_inception_final.json`

✅ Now you have a final checklist with real player mappings and contract addresses filled in.


---

## 📚 Notes

- Scripts respect Polygonscan API rate limits (~4 requests/second).
- Metadata fetching automatically resolves IPFS links.
- Player names are normalized internally for matching but keep their original capitalization in output.
- Missing or broken contracts are flagged clearly as `"MISSING"`.


---

## 📦 Folder Structure Example

```bash
/scripts/
  /metadata-fetching/
    find_first_tokenid.py
    fetch_token_metadata_dynamic.py
    merge_contracts_into_checklist.py
    inception_contracts_list.txt
    contract_to_first_tokenid.json
    contract_to_playername_dynamic.json
    grouped_by_set_inception.json
    README.md  <-- you are here
```

---

## 🎯 Future Improvements

- Add fuzzy matching for player name typos
- Automate retry logic on slow IPFS nodes
- Extend for Bundesliga, Pristine, and other Topps sets easily

---

Built for the Topps NFT community — let's keep this history alive! 🚀
