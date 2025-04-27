# patch_incorrect_contracts.py

import json

INPUT_FILE = "grouped_by_set_inception_flattened_final_with_contracts_fixed.json"
OUTPUT_FILE = "grouped_by_set_inception_flattened_final_with_contracts_fixed_patched.json"

patch_map = {
    ("Jazz Chisholm", "Gold Signings Facsimile Signature", "Epic"): "0xa8d82e2ce5ef66c5acb1263fc8b0da6218b2ef17",
    # Add other known fixes here
}

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

for nft in data:
    key = (nft["Player"], nft["Subset"], nft["Rarity"])
    if key in patch_map:
        print(f"Patching {key}: {nft['Contract Address']} -> {patch_map[key]}")
        nft["Contract Address"] = patch_map[key]

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("✅ Patch complete!")