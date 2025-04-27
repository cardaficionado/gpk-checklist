import { ReactNode } from 'react'

export default function ListingsLayout({ children }: { children: ReactNode }) {
    return (
        <section className="bg-black text-white min-h-screen p-6">
            <header className="mb-6">
                <h1 className="text-4xl font-bold">GPK Listings Explorer</h1>
                <p className="text-gray-400">Find NFTs currently listed for sale</p>
            </header>
            {children}
        </section>
    )
}