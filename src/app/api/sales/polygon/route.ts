// File: /src/app/api/sales/polygon/route.ts (repurposed for Reservoir slug-based tracking)

import { NextRequest, NextResponse } from "next/server";

const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY;
const BASE_URL = "https://api.reservoir.tools";

interface Sale {
    txHash: string;
    contract: string;
    slug: string;
    from: string;
    to: string;
    tokenId: string;
    price: string;
    marketplace: string;
    timestamp: number;
    explorerUrl: string;
}

export async function POST(req: NextRequest) {
    try {
        const { slugMap } = await req.json();
        const sales: Sale[] = [];

        for (const [contract, slug] of Object.entries(slugMap)) {
            const url = `${BASE_URL}/sales/v5?collection=${slug}&limit=10&sortBy=createdAt&order=desc&includeCriteriaMetadata=true`;

            const response = await fetch(url, {
                headers: {
                    'x-api-key': RESERVOIR_API_KEY || '',
                    'accept': 'application/json'
                }
            });

            const data = await response.json();
            if (!data.sales) continue;

            for (const sale of data.sales) {
                sales.push({
                    txHash: sale.txHash,
                    contract,
                    slug,
                    from: sale.from || 'unknown',
                    to: sale.to || 'unknown',
                    tokenId: sale.token?.tokenId || 'unknown',
                    price: (sale.price?.amount?.decimal || 0).toFixed(4),
                    marketplace: sale.order?.source?.domain || 'unknown',
                    timestamp: Date.parse(sale.createdAt) / 1000,
                    explorerUrl: `https://polygonscan.com/tx/${sale.txHash}`
                });
            }
        }

        return NextResponse.json({ count: sales.length, sales });
    } catch (error) {
        console.error("Reservoir fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch from Reservoir" }, { status: 500 });
    }
}
