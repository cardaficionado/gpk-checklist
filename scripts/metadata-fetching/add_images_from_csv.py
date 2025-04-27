# add_images_from_csv.py (final clean version)

import csv
import json
import os
import unicodedata

# === SETTINGS ===
CSV_FILE = "topps_mlb_inception_2020_21_nfts_preview_checklist_simplified.csv"
CHECKLIST_INPUT_FILE = "grouped_by_set_inception_flattened_final_with_contracts.json"
OUTPUT_FILE = "grouped_by_set_inception_flattened_final_with_contracts_images.json"

# === FUNCTIONS ===

def load_json(filepath):
    with open(filepath, "r") as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

def normalize_text(text):
    if not text:
        return ""
    text = text.lower().strip()
    text = unicodedata.normalize("NFKD", text)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    return text

# === MAIN SCRIPT ===

def main():
    if not os.path.exists(CSV_FILE) or not os.path.exists(CHECKLIST_INPUT_FILE):
        print("❌ Required input files not found.")
        return

    # Build (player, rarity) -> image_url lookup from CSV
    image_lookup = {}

    with open(CSV_FILE, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            player = normalize_text(row.get("Player", "").split(" - ")[0])
            rarity = normalize_text(row.get("Rarity", ""))
            image_url = row.get("Image_URL", "")

            if player and rarity and image_url:
                image_lookup[(player, rarity)] = image_url

    # Load checklist
    checklist_nfts = load_json(CHECKLIST_INPUT_FILE)
    updated_nfts = []
    missing_images = 0

    for nft in checklist_nfts:
        player_full = nft.get("Name", "")
        player_name = normalize_text(player_full.split(" - ")[0])
        rarity_name = normalize_text(nft.get("Rarity Name", ""))

        key = (player_name, rarity_name)
        image_url = image_lookup.get(key)

        if image_url:
            nft["Image URL"] = image_url
        else:
            nft["Image URL"] = "MISSING"
            missing_images += 1

        updated_nfts.append(nft)

    save_json(OUTPUT_FILE, updated_nfts)
    print(f"✅ Image mapping complete! Final checklist saved as {OUTPUT_FILE}")
    print(f"🔎 Total NFTs processed: {len(updated_nfts)}")
    print(f"⚠️ Missing images: {missing_images}")

if __name__ == "__main__":
    main()

"""
README:

This final script injects image URLs into your flattened checklist.
It matches on (Player Name, Rarity) and pulls from a simplified CSV.

Usage:
- Run `python3 add_images_from_csv.py`

Output:
- grouped_by_set_inception_flattened_final_with_contracts_images.json with 'Image URL' field populated.
"""
