import type { NextApiRequest, NextApiResponse } from 'next'

const POLYGONSCAN_API_KEY = process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY;

async function fetchBalance(wallet: string, contract: string) {
  const url = `https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${contract}&address=${wallet}&tag=latest&apikey=${POLYGONSCAN_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.result && parseInt(data.result) > 0) {
      return true;
    }
  } catch (error) {
    console.error(`Error fetching balance for ${contract}:`, error);
  }

  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { wallet, contracts } = req.body;

  if (!wallet || !Array.isArray(contracts)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const results: Record<string, boolean> = {};

  for (const contract of contracts) {
    await new Promise(resolve => setTimeout(resolve, 250)); // Pacing

    const owns = await fetchBalance(wallet, contract.toLowerCase());
    results[contract.toLowerCase()] = owns;
  }

  res.status(200).json({ ownership: results });
}