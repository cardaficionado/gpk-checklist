'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Sale {
  price: string;
  token: string;
  tokenUrl: string;
  tokenId: string;
  rarity: string;
  marketplace: string;
  timestamp: string;
}

interface SalesTableProps {
  slugMap: { [contract: string]: string };
}

export default function SalesTable({ slugMap }: SalesTableProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      const response = await fetch('/api/sales/mlb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugMap }),
      });

      if (response.ok) {
        const data = await response.json();
        setSales(data.sales || []);
      }

      setLoading(false);
    };

    fetchSales();
  }, [slugMap]);

  if (loading) {
    return (
      <div className="text-center text-gray-400 text-lg mt-12">
        Loading sales data...
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sales.length === 0 ? (
        <div className="text-center text-gray-400 text-lg mt-12">
          No recent sales found for this set.
        </div>
      ) : (
        sales.map((sale, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <a
                  href={sale.tokenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {sale.token}
                </a>
                <Badge>{sale.marketplace}</Badge>
              </div>
              <div className="text-white font-semibold">{sale.price} MATIC</div>
              <div className="text-sm text-gray-400 mt-1">
                Token ID: {sale.tokenId} &nbsp;|&nbsp; Rarity: {sale.rarity}
              </div>
              <div className="text-sm text-gray-400">
                {formatDistanceToNow(new Date(sale.timestamp), { addSuffix: true })}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

