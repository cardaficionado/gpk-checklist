'use client';

import SalesTable from '@/components/SalesTable';

interface SalesClientProps {
    slugMap: { [contract: string]: string };
}

export default function SalesClient({ slugMap }: SalesClientProps) {
    return <SalesTable slugMap={slugMap} />;
}