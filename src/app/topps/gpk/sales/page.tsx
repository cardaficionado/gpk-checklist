import { fetchRecentSalesForContracts } from '@/lib/fetchSales'
import { SalesTable, columns } from './SalesTable'

export default async function SalesPage() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/data/topps/gpk/contract-to-slug.json`);
    const contractToSlug = await res.json();
    const contractList = Object.keys(contractToSlug);

    const sales = await fetchRecentSalesForContracts(contractList.slice(0, 5), contractToSlug);
    
    return (
        <div className="p-4 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Recent GPK NFT Sales</h1>
            <SalesTable data={sales} columns={columns} />
        </div>

        
    );

}