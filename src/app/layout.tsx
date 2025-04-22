import { Analytics } from '@vercel/analytics/react';
import '@/styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <div className="bg-black text-white min-h-screen">
                    {children}
                </div>
                <Analytics />
            </body>
        </html>
    );
}