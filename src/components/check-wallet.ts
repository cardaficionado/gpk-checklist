import type { NextApiRequest, NextApiResponse } from 'next'

export async function batchFetchOwnership(address: string, groupedData: any): Promise<Record<string, Record<string, boolean>>> {
    const ownedContracts = new Set<string>();

    console.log(`🔎 Fetching NFTs owned by: ${address}`);

    for (const [setName, characters] of Object.entries(groupedData)) {
        for (const [characterName, rarities] of Object.entries(characters)) {
            for (const [rarityName, details] of Object.entries(rarities)) {
                const contract = details.contract;
                if (!contract) continue;

                const normalizedContract = contract.toLowerCase();

                try {
                    await new Promise(resolve => setTimeout(resolve, 250)); // 🛑 Add pacing between requests

                    let response = await fetch(`https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${normalizedContract}&address=${address}&tag=latest&apikey=${process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY}`);
                    let data = await response.json();

                    if (data.status !== "1" || !data.result) {
                        console.warn(`⚠️ Fetch failed for ${normalizedContract}, retrying after delay...`);
                        await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retry
                        response = await fetch(`https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${normalizedContract}&address=${address}&tag=latest&apikey=${process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY}`);
                        data = await response.json();
                    }

                    if (data.status === "1" && parseInt(data.result) > 0) {
                        ownedContracts.add(normalizedContract);
                    }

                    console.log(`Checked contract ${normalizedContract} for ${characterName} ${rarityName}: ${data.result && parseInt(data.result) > 0 ? '✅ Owned' : '❌ Not owned'}`);
                } catch (error) {
                    console.error(`❌ Completely failed fetching ${normalizedContract}:`, error);
                }
            }
        }
    }

    console.log(`✅ Completed wallet scan. Found ${ownedContracts.size} owned contracts.`);

    const ownershipStatus: Record<string, Record<string, boolean>> = {};

    for (const [setName, characters] of Object.entries(groupedData)) {
        for (const [characterName, rarities] of Object.entries(characters)) {
            for (const [rarityName, details] of Object.entries(rarities)) {
                const normalizedCharacter = characterName.toLowerCase().trim();
                const normalizedRarity = rarityName.toLowerCase().trim();
                const contract = details.contract?.toLowerCase();

                if (!ownershipStatus[normalizedCharacter]) {
                    ownershipStatus[normalizedCharacter] = {};
                }

                const ownsNFT = contract && ownedContracts.has(contract);

                ownershipStatus[normalizedCharacter][normalizedRarity] = ownsNFT;

                console.log(`🧠 Ownership check: character="${normalizedCharacter}", rarity="${normalizedRarity}", owns=${ownsNFT}`);
            }
        }
    }

    console.log("🏁 Ownership mapping complete:", ownershipStatus);

    return ownershipStatus;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { wallet, contracts } = req.body

  if (!wallet || !Array.isArray(contracts)) {
    return res.status(400).json({ error: 'Invalid request payload' })
  }

  const apiKey = process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY

  const results: Record<string, boolean> = {}

  for (const contract of contracts) {
    try {
      const response = await fetch(`https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${contract}&address=${wallet}&tag=latest&apikey=${apiKey}`)
      const data = await response.json()
      if (data.status === '1') {
          results[contract.toLowerCase()] = parseInt(data.result) > 0
      } else {
        results[contract] = false
      }
    } catch (error) {
      console.error(`Error fetching contract ${contract}:`, error)
      results[contract] = false
    }
  }

  return res.status(200).json({ ownership: results })
}