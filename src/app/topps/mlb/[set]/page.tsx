'use client';

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import toppsSetList from "@/../public/data/topps/topps-setlist.json"; // Static import for setlist
import checklistData from "@/../public/data/topps/mlb/2021-topps-mlb-inception/grouped_by_set_inception_flattened.json"; // Static import
import slugData from "@/../public/data/topps/mlb/2021-topps-mlb-inception/contract_to_slug.json"; // Static import
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Ship, Wand2, LinkIcon } from 'lucide-react';

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const rarityColors: Record<string, string> = {
  legendary: 'bg-yellow-500 text-black',
  epic: 'bg-purple-500 text-white',
  rare: 'bg-red-500 text-white',
  uncommon: 'bg-blue-500 text-white',
  common: 'bg-green-500 text-white',
};

export default function ChecklistPage({ params }: { params: { set: string } }) {
  const [matchingSet, setMatchingSet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSet = async () => {
      const { set } = await params;

      const matchingSet = toppsSetList.find(
        (s) => slugify(s.set_name) === set
      );

      if (matchingSet) {
        setMatchingSet(matchingSet);
        setLoading(false);
      } else {
        notFound();
      }
    };

    fetchSet();
  }, [params]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6 text-center">
        {matchingSet.set_name} Checklist
      </h1>
      <div className="text-center mb-6">
        <Link href="/" passHref>
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </div>
      <ChecklistDisplay checklist={checklistData} slugMap={slugData} />
    </div>
  );
}

function ChecklistDisplay({ checklist, slugMap }: { checklist: NFTEntry[], slugMap: Record<string, string> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [sortField, setSortField] = useState('Player'); // Sorting by 'Player' now
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredChecklist = checklist.filter(nft =>
    nft.Player.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedRarity ? nft['Rarity'].toLowerCase() === selectedRarity : true)
  );

  const sortedChecklist = filteredChecklist.sort((a, b) => {
    const aValue = a[sortField as keyof NFTEntry]?.toLowerCase() || '';
    const bValue = b[sortField as keyof NFTEntry]?.toLowerCase() || '';
    const comparison = aValue.localeCompare(bValue);

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div>
      {/* Search Input */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Player Name..."
          className="w-full max-w-md p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter by Rarity */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <select
          value={selectedRarity}
          onChange={(e) => setSelectedRarity(e.target.value)}
          className="w-full max-w-md p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
        >
          <option value="">Filter by Rarity</option>
          <option value="legendary">Legendary</option>
          <option value="epic">Epic</option>
          <option value="rare">Rare</option>
          <option value="uncommon">Uncommon</option>
          <option value="common">Common</option>
        </select>
      </div>

      {/* Sort By Dropdown */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
        >
          <option value="Player">Player Name</option>
          <option value="Team">Team</option>
          <option value="Subset">Subset</option>
          <option value="Rarity">Rarity</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
        >
          {sortOrder === "asc" ? "Ascending" : "Descending"}
        </button>
      </div>

      {/* Render the filtered and sorted checklist */}
      {sortedChecklist.length === 0 ? (
        <div className="text-center text-gray-400">No matching players found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {sortedChecklist.map((nft, idx) => {
            const slug = slugMap[nft['Contract Address']];
            const openSeaURL = slug ? `https://opensea.io/collection/${slug}` : '#';
            const magicEdenURL = slug ? `https://magiceden.io/collections/polygon/${slug}` : '#';
            const rarityClass = rarityColors[nft['Rarity']?.toLowerCase()] || 'bg-gray-500 text-white';

            return (
              <div key={idx} className="border rounded-lg p-4 bg-black text-white flex flex-col items-center">
                {nft['Image URL'] !== 'MISSING' && (
                  <img
                    src={nft['Image URL']}
                    alt={nft.Player}
                    className="w-full h-auto mb-4 rounded-lg max-w-xs mx-auto"
                  />
                )}
                <h2 className="text-xl font-bold text-center mb-2">{nft.Player}</h2>
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                  <Badge className={rarityClass}>{nft['Rarity']}</Badge>
                  <Badge>{nft['Subset']}</Badge>
                </div>
                <p className="text-gray-400 text-sm mb-2">Minted: {nft['Mint Count']}</p>
                {slug && (
                  <div className="flex gap-2 mt-2">
                    <Link href={openSeaURL} target="_blank">
                      <Button variant="secondary">
                        <Ship size={24} className="mr-2" /> OpenSea
                      </Button>
                    </Link>
                    <Link href={magicEdenURL} target="_blank">
                      <Button variant="secondary">
                        <Wand2 size={24} className="mr-2" /> Magic Eden
                      </Button>
                    </Link>
                    <Link href={`https://polygonscan.com/address/${nft['Contract Address']}`} target="_blank">
                      <Button variant="secondary">
                        <LinkIcon size={24} className="mr-2" /> PolygonScan
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}