// /src/app/layout.tsx

import "../styles/globals.css";
import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';

// (Optional) If you want nice fonts later:
// import { GeistSans } from "geist/font/sans"; // Example if using custom fonts

export const metadata: Metadata = {
  title: "2022 Topps Garbage Pail Kids",
  description: "View and track your 2022 Topps GPK Non-Flushable Tokens collection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}