'use client'

import {
    ColumnDef,
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import { SaleEvent } from '@/lib/fetchSales'

interface Props {
    data: SaleEvent[]
    columns: ColumnDef<SaleEvent>[]
}

export function SalesTable({ data, columns }: Props) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    // ✅ Fallback message when no results
    if (data.length === 0) {
        return (
            <div className="text-center text-white mt-8">
                <p className="text-lg font-semibold">No recent sales found for these contracts.</p>
                <p className="text-sm text-gray-400">Try again later or check OpenSea directly for updates.</p>
            </div>
        )
    }
     
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-800 text-white">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} className="px-3 py-2 text-left">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-900 text-white">
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-800">
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="px-3 py-2">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export const columns: ColumnDef<SaleEvent>[] = [
    {
        accessorKey: 'image',
        header: '',
        cell: ({ row }) => (
            <img src={row.original.image} alt="NFT" className="w-12 h-12 rounded" />
        ),
    },
    {
        accessorKey: 'slug',
        header: 'Character',
        cell: ({ row }) => row.original.slug.replace(/-/g, ' '), // nicer formatting
    },
    {
        accessorKey: 'priceUsd',
        header: 'Price (USD)',
        cell: ({ row }) => `$${row.original.priceUsd.toFixed(2)}`,
    },
    {
        accessorKey: 'priceEth',
        header: 'Price (ETH)',
        cell: ({ row }) => row.original.priceEth.toFixed(3),
    },
    {
        accessorKey: 'timestamp',
        header: 'Date',
        cell: ({ row }) =>
            new Date(row.original.timestamp).toLocaleString(undefined, {
                dateStyle: 'short',
                timeStyle: 'short',
            }),
    },
]