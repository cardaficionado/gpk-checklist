const fs = require('fs');

// Adjust the path if your source file lives elsewhere
const groupedBySet = JSON.parse(fs.readFileSync('./public/data/topps/gpk/grouped_by_set.json', 'utf-8'));

const groupedByContract: { [contract: string]: any[] } = {};

for (const setName in groupedBySet) {
    const characters = groupedBySet[setName];
    for (const characterName in characters) {
        const rarities = characters[characterName];
        for (const rarityKey in rarities) {
            const appearance = rarities[rarityKey];
            const contract = appearance.contract.toLowerCase();

            const entry = {
                character: characterName,
                rarity: appearance.rarity,
                contract,
                image: `/data/topps/gpk/images/${characterName.replace(/\s+/g, '_')}.webp`, // guess image path
                slug: characterName.toLowerCase().replace(/\s+/g, '-'),
                set: setName,
                total_minted: appearance.total_minted
            };

            if (!groupedByContract[contract]) {
                groupedByContract[contract] = [];
            }

            groupedByContract[contract].push(entry);
        }
    }
}

fs.writeFileSync(
    './public/data/topps/gpk/grouped_by_contract.json',
    JSON.stringify(groupedByContract, null, 2)
);

console.log('✅ Created grouped_by_contract.json');