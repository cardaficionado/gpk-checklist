import { notFound } from "next/navigation";
import SalesClient from "./SalesClient";

interface SlugMap {
    [contract: string]: string;
}

async function getSlugMap(set: string): Promise<SlugMap | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/data/topps/mlb/${set}/contract_to_slug.json`);
        if (!res.ok) throw new Error("Failed to load slug map");
        return await res.json();
    } catch (err) {
        console.error("Error loading slug map:", err);
        return null;
    }
}

// ✅ change here — let Next handle `params` destructuring
export default async function SalesPage({ params }: { params: { set: string } }) {
    const slugMap = await getSlugMap(params.set);
    if (!slugMap) return notFound();

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-4 text-center text-white">
                Sales Tracker – {params.set.replace(/-/g, " ")}
            </h1>
            <SalesClient slugMap={slugMap} />
        </div>
    );
}