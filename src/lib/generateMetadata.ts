// /src/lib/generateMetadata.ts

import { Metadata } from 'next';
import toppsSetList from "@/../public/data/topps/topps-setlist.json"; // Static import for setlist
import { slugify } from "@/utils/slugify"; // If you have this utility function elsewhere

export function generateMetadata({ params }: { params: { set: string } }): Metadata {
    const matchingSet = toppsSetList.find((set) => slugify(set.set_name) === params.set);

    return {
        title: matchingSet ? `${matchingSet.set_name} NFT Checklist` : "Topps NFT Checklist",
        description: `Track and manage your ${matchingSet?.set_name} NFTs after the Polygon migration.`,
    };
}