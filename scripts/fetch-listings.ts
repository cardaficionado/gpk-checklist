const fs = require('fs');
const path = require('path');
const nodeFetch = require('node-fetch');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const enrichedMetadata = JSON.parse(
    fs.readFileSync('./public/data/topps/gpk/grouped_by_contract.json', 'utf-8')
);

const contractAddresses = Object.keys(enrichedMetadata);
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY;

if (!RESERVOIR_API_KEY) {
    console.error('❌ RESERVOIR_API_KEY not set. Check .env.local');
    process.exit(1);
}

async function fetchListings(contract: string) {
    const url = `https://api.reservoir.tools/orders/asks/v5?contracts%5B%5D=${contract}&status=active&chain=polygon&limit=50`;

    const res = await nodeFetch(url, {
        headers: {
            'accept': 'application/json',
            'x-api-key': RESERVOIR_API_KEY
        }
    });

    if (!res.ok) {
        console.warn(`❌ Reservoir failed for ${contract}: ${res.statusText}`);
        return [];
    }

    const raw = await res.json();
    const orders = raw.orders || [];

    return orders.map((order: any) => {
        const tokenId = order.token.tokenId;
        const price = order.price.amount.decimal;
        const source = order.source?.domain || 'unknown';

        const metadata = enrichedMetadata[contract.toLowerCase()]?.find((entry: any) => entry.token_id === tokenId)
            || enrichedMetadata[contract.toLowerCase()][0];

        return {
            character: metadata?.character || 'Unknown',
            rarity: metadata?.rarity || 'Unknown',
            slug: metadata?.slug || '',
            token_id: tokenId,
            price: price.toFixed(3),
            contract,
            image: metadata?.image || '',
            source,
        };
    });
}

(async () => {
    const allListings = [];

    for (let i = 0; i < contractAddresses.length; i++) {
        const contract = contractAddresses[i];
        console.log(`🔎 Fetching from Reservoir: ${contract} (${i + 1}/${contractAddresses.length})`);

        const results = await fetchListings(contract);
        if (results.length > 0) {
            console.log(`✅ ${results.length} listings found`);
            allListings.push(...results);
        } else {
            console.log(`❌ No listings found`);
        }

        await new Promise((r) => setTimeout(r, 500)); // Rate limit buffer
    }

    const outputPath = './public/data/topps/gpk/live_listings.json';
    fs.writeFileSync(outputPath, JSON.stringify(allListings, null, 2));
    console.log(`📝 Saved ${allListings.length} listings to ${outputPath}`);
})();