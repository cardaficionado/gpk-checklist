import { notFound } from "next/navigation";
import SalesClient from "./SalesClient";

interface SlugMap {
    [contract: string]: string;
}

async function getSlugMap(set: string): Promise<SlugMap | null> {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/data/topps/mlb/${set}/contract_to_slug.json`
        );
        if (!res.ok) throw new Error("Failed to load slug map");
        return await res.json();
    } catch (err) {
        console.error("Error loading slug map:", err);
        return null;
    }
}

export default async function SalesPage(props: { params: { set: string } }) {
    const { set } = props.params;
    const slugMap = await getSlugMap(set);
    if (!slugMap) return notFound();

    const formattedSet = decodeURIComponent(set).replace(/-/g, " ");

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-4 text-center text-white">
                Sales Tracker – {formattedSet}
            </h1>
            <SalesClient slugMap={slugMap} />
        </div>
    );
}