import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'Topps MLB Sales Tracker',
  description: 'Track recent sales activity for Topps MLB NFT sets on Polygon.',
};

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}