import json

# === FILES ===
PATCH_FILE = "manual_contract_patch_template.json"  # The file you will fill in
CHECKLIST_TO_FIX = "grouped_by_set_inception_flattened_final_with_contracts_fixed_corrected.json"
OUTPUT_FILE = "grouped_by_set_inception_flattened_final_with_contracts_fixed_corrected_final.json"

# === LOAD FILES ===
with open(PATCH_FILE, "r", encoding="utf-8") as f:
    patch_entries = json.load(f)

with open(CHECKLIST_TO_FIX, "r", encoding="utf-8") as f:
    checklist = json.load(f)

# === BUILD PATCH LOOKUP ===
patch_lookup = {}
for entry in patch_entries:
    if entry.get("Correct Contract") not in (None, ""):
        key = (entry["Player"].strip(), entry["Subset"].strip(), entry["Rarity"].strip())
        patch_lookup[key] = entry["Correct Contract"].lower()

# === APPLY PATCH ===
corrections = 0
for nft in checklist:
    key = (nft["Player"].strip(), nft["Subset"].strip(), nft["Rarity"].strip())
    if key in patch_lookup:
        print(f"🔧 Patching {key}: {nft.get('Contract Address', 'MISSING')} -> {patch_lookup[key]}")
        nft["Contract Address"] = patch_lookup[key]
        corrections += 1

# === SAVE OUTPUT ===
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(checklist, f, indent=2)

print(f"\n✅ Manual patching complete. {corrections} contracts updated.")
print(f"Corrected final checklist saved to {OUTPUT_FILE}")
