// /src/app/topps/mlb/[set]/grid/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Ship, Wand2, Link as LinkIcon } from 'lucide-react';
import slugMapRaw from '@/../public/data/topps/mlb/2021-topps-mlb-inception/contract_to_slug.json';
import { isAddress } from 'ethers';

const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

const slugMap = Object.fromEntries(
    Object.entries(slugMapRaw).map(([k, v]) => [k.toLowerCase(), v])
);

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWalletOwnership(wallet: string, contracts: string[], updateProgress: (completed: number, total: number) => void): Promise<Record<string, boolean>> {
    const ownershipMap: Record<string, boolean> = {};
    const total = contracts.length;

    for (let i = 0; i < total; i++) {
        const contract = contracts[i];
        const url = `https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${contract}&address=${wallet}&tag=latest&apikey=${process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.status === '1' && data.result !== '0') {
                ownershipMap[contract] = true;
            } else {
                ownershipMap[contract] = false;
            }
        } catch (error) {
            console.warn(`Failed to fetch balance for contract ${contract}`, error);
            ownershipMap[contract] = false;
        }

        updateProgress(i + 1, total);
        await delay(200);
    }

    return ownershipMap;
}

export default function GridPage() {
    const { set } = useParams();
    const [gridData, setGridData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<'player' | 'subset'>('player');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [filterText, setFilterText] = useState('');
    const [wallet, setWallet] = useState('');
    const [walletOwnership, setWalletOwnership] = useState<Record<string, boolean>>({});
    const [checkingWallet, setCheckingWallet] = useState(false);
    const [checkComplete, setCheckComplete] = useState(false);
    const [progress, setProgress] = useState({ completed: 0, total: 0 });
    const ownedCount = Object.values(walletOwnership).filter(Boolean).length;

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
                    const normalizedRarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();

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
            return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });

    const checkOwnership = async () => {
        if (!wallet || !isAddress(wallet)) {
            console.warn('Invalid wallet address.');
            return;
        }

        setCheckingWallet(true);
        setCheckComplete(false);
        setProgress({ completed: 0, total: 0 });

        try {
            const contractList = [...new Set(
                gridData
                    .flatMap(row => rarities.map(r => row[r]?.contract?.toLowerCase()))
                    .filter(addr => typeof addr === 'string' && /^0x[a-f0-9]{40}$/.test(addr))
            )];

            if (contractList.length === 0) {
                console.warn('No contracts found.');
                return;
            }

            const updateProgress = (completed: number, total: number) => setProgress({ completed, total });

            const ownershipMap = await fetchWalletOwnership(wallet.toLowerCase(), contractList, updateProgress);
            setWalletOwnership(ownershipMap);
        } catch (error) {
            console.error('Wallet check failed:', error);
            setWalletOwnership({});
        } finally {
            setCheckingWallet(false);
            setCheckComplete(true);
        }
    };

    const exportCSV = () => {
        const rows = [
            ['Player', 'Subset', 'Rarity', 'Contract Address', 'Mint Count', 'Wallet Status'],
        ];

        gridData.forEach(row => {
            rarities.forEach(rarity => {
                const cell = row[rarity];
                if (cell) {
                    const owned = wallet ? (walletOwnership[cell.contract.toLowerCase()] ? 'In Wallet' : 'Not In Wallet') : '';
                    rows.push([row.player, row.subset, rarity, cell.contract, cell.mintCount, owned]);
                }
            });
        });

        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${set}-checklist.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold text-white capitalize">{set} – Grid View</h1>
                <div className="space-y-2 text-right">
                    <input
                        type="text"
                        placeholder="Enter wallet address..."
                        value={wallet}
                        onChange={(e) => setWallet(e.target.value)}
                        className="p-2 rounded bg-gray-800 text-white border border-gray-600 w-[420px]"
                    />
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={checkOwnership}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Check Wallet
                        </button>
                        <button
                            onClick={exportCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Export CSV
                        </button>
                    </div>
                    {checkingWallet && (
                        <p className="text-sm text-yellow-400">
                            Checking wallet ownership... {progress.completed} of {progress.total}
                        </p>
                    )}
                    {checkComplete && !checkingWallet && (
                        <div className="text-sm text-green-400 space-y-1">
                            <p>Wallet check complete!</p>
                            <p>{ownedCount} of {Object.keys(walletOwnership).length} contracts owned</p>
                        </div>
                    )}
                </div>
            </div>

            <input
                type="text"
                placeholder="Filter by player or subset..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="mb-4 p-2 rounded bg-gray-800 text-white border border-gray-600 w-80"
            />

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
                                const contract = cell?.contract.toLowerCase();
                                const owned = walletOwnership[contract];
                                const borderColor = wallet ? (owned ? 'border-green-500' : 'border-red-500') : 'border-gray-700';

                                return (
                                    <td key={rarity} className={`p-2 border border-gray-700 text-center`}>
                                        {cell ? (
                                            <div className={`flex flex-col items-center space-y-1 border-2 ${borderColor} rounded p-1`}>
                                                <span className="text-sm text-gray-300">{cell.mintCount}</span>
                                                <div className="space-x-1">
                                                    <Link href={`https://opensea.io/assets/matic/${cell.contract}`} target="_blank" title="OpenSea">
                                                        <Ship className="inline w-4 h-4 hover:text-blue-400" />
                                                    </Link>
                                                    {slugMap[contract] && (
                                                        <Link
                                                            href={`https://magiceden.io/polygon/collections/${slugMap[contract]}`}
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