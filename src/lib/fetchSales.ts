export interface SaleEvent {
    contract: string;
    tokenId: string;
    name: string;
    slug: string;
    priceEth: number;
    priceUsd: number;
    timestamp: string;
    image: string | null;
}

const OPENSEA_API = "https://api.opensea.io/api/v2/events";
const API_KEY = process.env.OPENSEA_API_KEY;

export async function fetchRecentSalesForContracts(
    contracts: string[],
    contractToSlug: Record<string, string>
): Promise<SaleEvent[]> {
    const results: SaleEvent[] = [];

    for (const contract of contracts) {
        const url = `${OPENSEA_API}?event_type=sale&asset_contract_address=${contract}&limit=25&chain=matic`;

        const res = await fetch(url, {
            headers: {
                Accept: "application/json",
                "X-API-KEY": API_KEY!,
            },
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            console.warn(`Failed to fetch for contract ${contract}: ${res.status}`);
            continue;
        }

        const data = await res.json();

        const events = (data.asset_events || []).flatMap((e: any): SaleEvent[] => {
            // Ensure this sale matches the contract we requested
            if (!e.nft || e.nft.contract.toLowerCase() !== contract.toLowerCase()) return [];

            const ethPrice = e.payment.token_address === "0x0000000000000000000000000000000000000000"
                ? parseFloat(e.payment.quantity) / 1e18
                : 0;

            const usdPrice = e.payment.symbol === "USDC"
                ? parseFloat(e.payment.quantity) / 1e6
                : ethPrice * 0; // You could multiply by historical ETH/USD if needed

            return [{
                contract,
                tokenId: e.nft.identifier,
                name: contractToSlug[contract] ?? `Token ${e.nft.identifier}`,
                slug: contractToSlug[contract] ?? "unknown",
                priceEth: ethPrice,
                priceUsd: usdPrice,
                timestamp: new Date(e.event_timestamp * 1000).toISOString(),
                image: e.nft.image_url,
            }];
        });

        results.push(...events);
    }

    // Sort all events by timestamp (most recent first)
    return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}