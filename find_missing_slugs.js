// find_missing_slugs.js

const fs = require("fs");
const checklist = require("./public/data/topps/mlb/2021-topps-mlb-inception/grouped_by_set_inception_flattened.json");
const slugMap = require("./public/data/topps/mlb/2021-topps-mlb-inception/contract_to_slug.json");

const missing = [];

for (const nft of checklist) {
    const contract = nft["Contract Address"];
    if (contract && !slugMap[contract.toLowerCase()]) {
        missing.push(contract.toLowerCase());
    }
}

// Print how many
console.log(`🛠 Found ${missing.length} contracts missing slugs.`);

// Save to a file
const outputPath = "./missing_contracts.json";
fs.writeFileSync(outputPath, JSON.stringify(missing, null, 2));

console.log(`✅ Saved missing contracts list to: ${outputPath}`);