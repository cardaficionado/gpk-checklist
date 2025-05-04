import { NextRequest, NextResponse } from 'next/server';

const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;
const BASE_URL = 'https://api.opensea.io/api/v2/events';

// 🧠 Simple in-memory cache
let lastCache: { timestamp: number; sales: any[] } | null = null;
const CACHE_LIFETIME = 6 * 60 * 60 * 1000; // 6 hours in ms

export async function POST(req: NextRequest) {
    try {
        const { slugMap } = await req.json();

        // ✅ Serve from cache if recent
        if (lastCache && Date.now() - lastCache.timestamp < CACHE_LIFETIME) {
            return NextResponse.json({
                source: 'cache',
                sales: lastCache.sales,
                cacheTimestamp: new Date(lastCache.timestamp).toISOString()
            });
        }

        const sales: any[] = [];

        for (const [contract, slug] of Object.entries(slugMap)) {
            const url = `${BASE_URL}?collection_slug=${slug}&event_type=sale&limit=5`;

            const response = await fetch(url, {
                headers: {
                    'X-API-KEY': OPENSEA_API_KEY || '',
                    'accept': 'application/json',
                }
            });

            if (!response.ok) continue;

            const data = await response.json();
            const events = data.asset_events || [];

            for (const event of events) {
                const eventContract = event.nft?.contract?.toLowerCase();
                if (eventContract !== contract.toLowerCase()) continue;

                const payment = event.payment || {};
                const price = Number(payment.quantity || 0) / 10 ** (payment.decimals || 18);

                sales.push({
                    txHash: event.transaction || event.order_hash || 'unknown',
                    contract,
                    slug,
                    from: event.seller || 'unknown',
                    to: event.buyer || 'unknown',
                    tokenId: event.nft?.identifier || 'unknown',
                    price: price.toFixed(4),
                    marketplace: 'OpenSea',
                    timestamp: event.event_timestamp || Math.floor(Date.now() / 1000),
                    explorerUrl: `https://polygonscan.com/tx/${event.transaction || event.order_hash}`,
                });
            }

            // 🕰️ Delay to avoid throttling
            await new Promise((r) => setTimeout(r, 750));
        }

        // ✅ Save to cache
        lastCache = {
            timestamp: Date.now(),
            sales,
        };

        return NextResponse.json({
            source: 'fresh',
            sales,
            cacheTimestamp: new Date(lastCache.timestamp).toISOString()
        });
    } catch (error) {
        console.error('OpenSea fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch from OpenSea' }, { status: 500 });
    }
}