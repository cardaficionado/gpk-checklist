import fs from "node:fs/promises";
import path from "node:path";
import fetch from "node-fetch";

// Replace this with your actual OpenSea API key
const OPENSEA_API_KEY = "fa43a8b3fb0b4c2baf8eca4d3b2995b2";

// File paths
const checklistPath = path.join(process.cwd(), "public/data/topps/gpk/grouped_by_set.json");
const outputPath = path.join(process.cwd(), "public/data/topps/gpk/contract-to-slug.json");

// Helper: pause between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: fetch slug with retry
async function fetchSlug(contractAddress: string): Promise<string | null> {
    const url = `https://api.opensea.io/api/v2/chain/matic/contract/${contractAddress}`;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await fetch(url, {
                headers: {
                    "x-api-key": OPENSEA_API_KEY,
                    "Accept": "application/json",
                },
            });

            if (res.status === 429) {
                console.warn(`Rate limited. Retrying in 2s...`);
                await delay(2000);
                continue;
            }

            if (!res.ok) {
                console.error(`Failed for ${contractAddress}: ${res.statusText}`);
                return null;
            }

            const data = await res.json();
            return (data as any)?.collection || null;

        } catch (err) {
            console.error(`Fetch error for ${contractAddress}:`, err);
            await delay(2000);
        }
    }

    return null;
}

async function main() {
    const checklistRaw = await fs.readFile(checklistPath, "utf-8");
    const checklistData = JSON.parse(checklistRaw);

    const contractSet = new Set<string>();

    for (const set of Object.values(checklistData)) {
        for (const character of Object.values(set as any)) {
            for (const rarity of Object.values(character as any)) {
                const contract = (rarity as any)?.contract;
                if (contract) contractSet.add(contract.toLowerCase());
            }
        }
    }

    const contracts = Array.from(contractSet);
    console.log(`📦 Fetching slugs for ${contracts.length} contracts...`);

    const result: Record<string, string> = {};

    for (let i = 0; i < contracts.length; i++) {
        const contract = contracts[i];
        console.log(`🔎 [${i + 1}/${contracts.length}] ${contract}`);
        const slug = await fetchSlug(contract);
        if (slug) {
            result[contract] = slug;
            console.log(`✅  → ${slug}`);
        } else {
            console.log(`❌  → No slug found`);
        }

        await delay(2000); // Respectful pause
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));

    console.log(`\n🎉 Done! Saved slugs to ${outputPath}`);
}

main().catch(err => {
    console.error("🚨 Script failed:", err);
    process.exit(1);
});