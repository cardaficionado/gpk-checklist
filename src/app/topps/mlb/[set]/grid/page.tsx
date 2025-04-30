'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Ship, Wand2, Link as LinkIcon } from 'lucide-react';
import slugMapRaw from '@/../public/data/topps/mlb/2021-topps-mlb-inception/contract_to_slug.json';

const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

const slugMap = Object.fromEntries(
    Object.entries(slugMapRaw).map(([k, v]) => [k.toLowerCase(), v])
);

export default function GridPage() {
    const { set } = useParams();
    const [gridData, setGridData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<'player' | 'subset'>('player');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [filterText, setFilterText] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/data/topps/mlb/${set}/grouped_by_set_inception_flattened.json`);
                if (!res.ok) throw new Error(`Failed to load JSON for set: ${set}`);
                const flatData = await res.json();

                const grouped = flatData.reduce((acc: any, item: any) => {
                    const player = item['Player'];
                    const subset = item['Subset'];
                    const rarity = item['Rarity'];
                    const contract = item['Contract Address'];
                    const mintCount = item['Mint Count'];

                    if (!player || !subset || !rarity || !contract) return acc;

                    const key = `${player}|${subset}`;
                    const normalizedRarity =
                        rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();

                    if (!rarities.includes(normalizedRarity)) return acc;

                    if (!acc[key]) {
                        acc[key] = {
                            player,
                            subset,
                            Common: null,
                            Uncommon: null,
                            Rare: null,
                            Epic: null,
                            Legendary: null,
                        };
                    }

                    acc[key][normalizedRarity] = {
                        contract,
                        mintCount
                    };

                    return acc;
                }, {});

                setGridData(Object.values(grouped));
            } catch (err: any) {
                setError(err.message || 'Unknown error');
            }
        };

        fetchData();
    }, [set]);

    const filteredAndSorted = gridData
        .filter(row =>
            row.player.toLowerCase().includes(filterText.toLowerCase()) ||
            row.subset.toLowerCase().includes(filterText.toLowerCase())
        )
        .sort((a, b) => {
            const aVal = a[sortKey] ?? '';
            const bVal = b[sortKey] ?? '';
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-white capitalize">{set} – Grid View</h1>

            {error && <p className="text-red-500 mb-4">Error: {error}</p>}

            <div className="mb-4 flex items-center space-x-4">
                <input
                    type="text"
                    placeholder="Filter by player or subset..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="p-2 rounded bg-gray-800 text-white border border-gray-600 w-80"
                />
            </div>

            <table className="w-full table-fixed border-collapse border border-gray-700">
                <thead>
                    <tr className="bg-gray-800 text-white">
                        <th
                            className="p-2 border border-gray-700 cursor-pointer hover:bg-gray-700"
                            onClick={() => {
                                setSortKey('player');
                                setSortDirection(dir => (sortKey === 'player' && dir === 'asc') ? 'desc' : 'asc');
                            }}
                        >
                            Player {sortKey === 'player' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th
                            className="p-2 border border-gray-700 cursor-pointer hover:bg-gray-700"
                            onClick={() => {
                                setSortKey('subset');
                                setSortDirection(dir => (sortKey === 'subset' && dir === 'asc') ? 'desc' : 'asc');
                            }}
                        >
                            Subset {sortKey === 'subset' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        {rarities.map(rarity => (
                            <th key={rarity} className="p-2 border border-gray-700">{rarity}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredAndSorted.map((row, i) => (
                        <tr key={i} className="bg-black text-white">
                            <td className="p-2 border border-gray-700">{row.player}</td>
                            <td className="p-2 border border-gray-700">{row.subset}</td>
                            {rarities.map(rarity => {
                                const cell = row[rarity];
                                return (
                                    <td key={rarity} className="p-2 border border-gray-700 text-center">
                                        {cell ? (
                                            <div className="flex flex-col items-center space-y-1">
                                                <span className="text-sm text-gray-300">{cell.mintCount}</span>
                                                <div className="space-x-1">
                                                    <Link href={`https://opensea.io/assets/matic/${cell.contract}`} target="_blank" title="OpenSea">
                                                        <Ship className="inline w-4 h-4 hover:text-blue-400" />
                                                    </Link>
                                                    {slugMap[cell.contract.toLowerCase()] && (
                                                        <Link
                                                            href={`https://magiceden.io/polygon/collections/${slugMap[cell.contract.toLowerCase()]}`}
                                                            target="_blank"
                                                            title="Magic Eden"
                                                        >
                                                            <Wand2 className="inline w-4 h-4 hover:text-pink-400" />
                                                        </Link>
                                                    )}
                                                    <Link href={`https://polygonscan.com/address/${cell.contract}`} target="_blank" title="Polygonscan">
                                                        <LinkIcon className="inline w-4 h-4 hover:text-green-400" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-600 italic opacity-50">N/A</div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}