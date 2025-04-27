import json

# === FILES ===
GOOD_SOURCE_FILE = "enriched_nft_metadata_with_setnames_fixed.json"  # Correct trusted source
CHECKLIST_TO_FIX = "grouped_by_set_inception_flattened_final_with_contracts_fixed.json"  # Current checklist
OUTPUT_FILE = "grouped_by_set_inception_flattened_final_with_contracts_fixed_corrected.json"  # Output after correction

# === LOAD FILES ===
with open(GOOD_SOURCE_FILE, "r", encoding="utf-8") as f:
    good_source = json.load(f)

with open(CHECKLIST_TO_FIX, "r", encoding="utf-8") as f:
    checklist = json.load(f)

# === BUILD TRUSTED LOOKUP ===
good_lookup = {}
for item in good_source:
    if item.get("set_name_official") == "2021 Topps MLB Inception":
        char = item.get("character")
        subset = item.get("subset")
        rarity = item.get("rarity")
        if char and subset and rarity:
            key = (char.strip(), subset.strip(), rarity.strip())
            if item.get("contract") not in (None, "", "MISSING"):
                good_lookup[key] = item["contract"].lower()

# === PATCH BAD CONTRACTS ===
corrections = 0
for nft in checklist:
    key = (nft["Player"].strip(), nft["Subset"].strip(), nft["Rarity"].strip())
    correct_contract = good_lookup.get(key)
    
    if correct_contract and nft.get("Contract Address", "").lower() != correct_contract:
        print(f"🔧 Fixing {key}: {nft.get('Contract Address')} -> {correct_contract}")
        nft["Contract Address"] = correct_contract
        corrections += 1

# === SAVE OUTPUT ===
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(checklist, f, indent=2)

print(f"\n✅ Done! {corrections} contracts corrected.")
print(f"Corrected checklist saved to {OUTPUT_FILE}")

# === OPTIONAL: AUDIT PASS ===
missing_contracts = []
for nft in checklist:
    if nft.get("Contract Address") in (None, "", "MISSING"):
        missing_contracts.append((nft["Player"], nft["Subset"], nft["Rarity"]))

if missing_contracts:
    print(f"\n⚠️ WARNING: {len(missing_contracts)} entries have missing contracts:")
    for miss in missing_contracts:
        print(" -", miss)
else:
    print("\n🎯 Audit passed: No missing contracts!")
