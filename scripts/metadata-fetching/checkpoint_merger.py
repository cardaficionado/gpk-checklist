# checkpoint_merger.py

import json
import os

# === SETTINGS ===
CHECKPOINT_FILES = [
    "enriched_nft_metadata_corrected_checkpoint_100.json",
    "enriched_nft_metadata_corrected_checkpoint_200.json",
    # Add more checkpoint files here in order if needed
]
FINAL_OUTPUT_FILE = "enriched_nft_metadata_corrected_merged.json"

# === FUNCTIONS ===

def load_json(filepath):
    with open(filepath, "r") as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

def main():
    merged_metadata = []

    for checkpoint_file in CHECKPOINT_FILES:
        if os.path.exists(checkpoint_file):
            print(f"✅ Loading {checkpoint_file}")
            checkpoint_data = load_json(checkpoint_file)
            merged_metadata.extend(checkpoint_data)
        else:
            print(f"⚠️ Warning: {checkpoint_file} not found, skipping.")

    print(f"Merging {len(CHECKPOINT_FILES)} files into {FINAL_OUTPUT_FILE}")
    save_json(FINAL_OUTPUT_FILE, merged_metadata)
    print(f"✅ Merge complete! Total records: {len(merged_metadata)}")

if __name__ == "__main__":
    main()

"""
README:

This script merges multiple checkpoint JSON files created by the OpenSea Metadata Fetcher.
It combines them into a single unified enriched metadata file.

Usage:
- Update CHECKPOINT_FILES list to include the paths of your saved checkpoint files.
- Run `python3 checkpoint_merger.py`.

Output:
- Creates enriched_nft_metadata_corrected_merged.json containing all merged entries.
"""
