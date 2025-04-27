# add_images_from_csv_debug.py (pointed to simplified CSV + header print)

import csv
import json
import os
import unicodedata

# === SETTINGS ===
CSV_FILE = "topps_mlb_inception_2020_21_nfts_preview_checklist_simplified.csv"
CHECKLIST_INPUT_FILE = "grouped_by_set_inception_flattened_final_with_contracts.json"
OUTPUT_FILE = "grouped_by_set_inception_flattened_final_with_contracts_images_debug.json"

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
    lookup_debug_count = 0

    with open(CSV_FILE, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        print(f"🔎 CSV Headers: {reader.fieldnames}")

        for row in reader:
            player = normalize_text(row.get("Player", "").split(" - ")[0])
            rarity = normalize_text(row.get("Rarity", ""))
            image_url = row.get("Image_URL", "")

            if player and rarity and image_url:
                image_lookup[(player, rarity)] = image_url
                if lookup_debug_count < 10:
                    print(f"[LOOKUP {lookup_debug_count+1}] Player: {player} | Rarity: {rarity} | Image: {image_url}")
                    lookup_debug_count += 1

    # Load checklist
    checklist_nfts = load_json(CHECKLIST_INPUT_FILE)
    updated_nfts = []
    missing_images = 0
    checklist_debug_count = 0

    for nft in checklist_nfts:
        player_full = nft.get("Name", "")
        player_name = normalize_text(player_full.split(" - ")[0])
        rarity_name = normalize_text(nft.get("Rarity Name", ""))

        key = (player_name, rarity_name)
        image_url = image_lookup.get(key)

        if checklist_debug_count < 10:
            print(f"[CHECKLIST {checklist_debug_count+1}] Player: {player_name} | Rarity: {rarity_name}")
            if image_url:
                print(f"✅ Match found! Image: {image_url}\n")
            else:
                print("❌ Missing image match!\n")
            checklist_debug_count += 1

        if image_url:
            nft["Image URL"] = image_url
        else:
            nft["Image URL"] = "MISSING"
            missing_images += 1

        updated_nfts.append(nft)

    save_json(OUTPUT_FILE, updated_nfts)
    print(f"✅ Debug image mapping complete! Final checklist saved as {OUTPUT_FILE}")
    print(f"🔎 Total NFTs processed: {len(updated_nfts)}")
    print(f"⚠️ Missing images: {missing_images}")

if __name__ == "__main__":
    main()

"""
README:

This debug script prints:
- First 10 image lookup entries from the simplified CSV
- First 10 checklist entries being matched
- Also prints CSV headers for validation

Usage:
- Run `python3 add_images_from_csv_debug.py`

Output:
- grouped_by_set_inception_flattened_final_with_contracts_images_debug.json
"""
