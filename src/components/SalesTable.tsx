'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

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

interface SalesTableProps {
  slugMap: { [contract: string]: string };
}

export default function SalesTable({ slugMap }: SalesTableProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<string | null>(null);
  const [cacheTime, setCacheTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setSales([]);
      let allSales: Sale[] = [];
      let count = 0;

      const slugEntries = Object.entries(slugMap);

      for (const [contract, slug] of slugEntries) {
        count++;
        setProgress(`${count} of ${slugEntries.length} collections checked`);

        try {
          const res = await fetch(`/api/sales/opensea`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slugMap: { [contract]: slug }
            })
          });

          if (res.ok) {
            const data = await res.json();
            allSales = [...allSales, ...(data.sales || [])];

            // ✅ Set cache timestamp if present (after final fetch)
            if (count === slugEntries.length && data.cacheTimestamp) {
              setCacheTime(data.cacheTimestamp);
            }
          } else {
            console.warn(`Fetch failed for slug ${slug}`);
          }

          await new Promise(r => setTimeout(r, 750));
        } catch (e) {
          console.error(`Error fetching slug ${slug}:`, e);
        }
      }

      setSales(allSales);
      setLoading(false);
      setProgress(null);
    };

    fetchSales();
  }, [slugMap]);

  return (
    <>
      {progress && (
        <div className="text-center text-gray-300 text-sm mt-4">
          ⏳ {progress}
        </div>
      )}
      {cacheTime && (
        <div className="text-center text-gray-400 text-sm mt-1">
          🕒 Showing results from {formatDistanceToNow(new Date(cacheTime))} ago
        </div>
      )}
      <div className="grid gap-4">
        {!loading && sales.length === 0 ? (
          <div className="text-center text-gray-400 text-lg mt-12">
            No recent sales found for this set.
          </div>
        ) : (
          sales.map((sale, index) => (
            <Card key={index}>
              <CardContent className="p-4 space-y-2">
                <div className="text-sm text-white">
                  <strong>Collection:</strong> {sale.slug}<br />
                  <strong>Token ID:</strong> {sale.tokenId}<br />
                  <strong>From:</strong> {sale.from}<br />
                  <strong>To:</strong> {sale.to}<br />
                  <strong>Price:</strong> {sale.price} MATIC<br />
                  <strong>Marketplace:</strong> {sale.marketplace}<br />
                  <strong>Time:</strong> {formatDistanceToNow(new Date(sale.timestamp * 1000))} ago<br />
                  <a
                    href={sale.explorerUrl}
                    className="text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Transaction ↗
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}