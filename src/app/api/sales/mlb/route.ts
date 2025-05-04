import { NextRequest, NextResponse } from "next/server";

const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY;
const BASE_URL = "https://api.reservoir.tools";
const CHAIN = "polygon";

export async function POST(req: NextRequest) {
    try {
        const { slugMap } = await req.json();
        const contracts = Object.keys(slugMap);
        const sales: any[] = [];

        for (const contract of contracts) {
            const url = `${BASE_URL}/sales/v5?contract=${contract}&limit=20&sortBy=createdAt&order=desc&includeCriteriaMetadata=true`;

            const response = await fetch(url, {
                headers: {
                    "x-api-key": RESERVOIR_API_KEY || "",
                    accept: "application/json",
                },
            });

            if (!response.ok) continue;
            const json = await response.json();

            for (const sale of json.sales || []) {
                sales.push({
                    price: (sale.price?.amount?.decimal || 0).toFixed(2),
                    token: sale.token?.name || "Unknown Token",
                    tokenUrl: `https://opensea.io/assets/matic/${contract}/${sale.token?.tokenId}`,
                    tokenId: sale.token?.tokenId || "",
                    rarity:
                        sale.token?.attributes?.find((attr: any) => attr.key === "Rarity")?.value || "Unknown",
                    marketplace: sale.order?.source?.domain || "Unknown",
                    timestamp: sale.createdAt,
                });
            }
        }

        return NextResponse.json({ sales });
    } catch (error) {
        console.error("Error fetching sales:", error);
        return NextResponse.json({ error: "Failed to load sales data." }, { status: 500 });
    }
}