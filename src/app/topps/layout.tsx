export default function ToppsLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className="p-4">
            <h1 className="text-2xl font-bold mb-6">ToppsNFT Resource Index</h1>
            {children}
        </section>
    );
}