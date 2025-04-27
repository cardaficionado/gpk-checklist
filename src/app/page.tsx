import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "ToppsNFT Polygon Checklist",
    description: "Unofficial community resource for tracking and managing ToppsNFTs after Polygon migration."
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head />
            <body className={inter.className}>
                {/* Content in the root layout */}
                <div className="min-h-screen flex flex-col justify-center items-center text-white bg-black p-8">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">
                        ToppsNFTs Polygon Checklists & Resources
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-300 mb-8 max-w-2xl text-center">
                        This is an unofficial community resource to help collectors track ownership, view rarity information, and complete their 2021 Topps MLB Inception NFT sets after the Polygon migration.
                    </p>
                    {/* Inception Image */}
                    <img
                        src="/data/topps/mlb/2021-topps-mlb-inception/Inception_premium_Front_01.png"
                        alt="2021 Topps MLB Inception"
                        className="mx-auto mb-8 w-60 rounded-lg shadow-lg" // Adjust size as necessary
                    />
                    <h2 className="text-3xl font-semibold mt-8 mb-4">
                        2021 Topps MLB Inception NFT Checklist
                    </h2>

                    <div className="flex flex-col gap-4">
                        {/* Link to Inception checklist */}
                        <Link
                            href="/topps/mlb/2021-topps-mlb-inception"
                            className="bg-white text-black font-semibold px-8 py-4 rounded-md text-lg hover:bg-gray-300 transition text-center"
                        >
                            View 2021 Topps MLB Inception Checklist
                        </Link>

                        {/* GPK Links */}
                        <img
                            src="/data/topps/gpk/IMG_2427.webp"
                            alt="2022 Topps Garbage Pail Kids Non-Flushable Tokens"
                            className="mx-auto mb-8 w-60 rounded-lg shadow-lg" // Adjust size as necessary
                        />
                        <h2 className="text-3xl font-semibold mt-8 mb-4">2022 Topps Garbage Pail Kids NFT Checklist</h2>
                        <Link
                            href="/topps/gpk/checklist"
                            className="bg-white text-black font-semibold px-8 py-4 rounded-md text-lg hover:bg-gray-300 transition text-center"
                        >
                            View Checklist (Grid View) With Wallet Checker
                        </Link>
                        <Link
                            href="/topps/gpk/characters"
                            className="bg-white text-black font-semibold px-8 py-4 rounded-md text-lg hover:bg-gray-300 transition text-center"
                        >
                            View Checklist (Card View)
                        </Link>
                        <Link
                            href="/topps/gpk/sales"
                            className="bg-white text-black font-semibold px-8 py-4 rounded-md text-lg hover:bg-gray-300 transition text-center"
                        >
                            View Recent GPK Sales Tracker
                        </Link>
                    </div>

                    <div className="mt-12 flex justify-center">
                        <div className="border border-gray-700 rounded-2xl p-4 max-w-xl text-center text-gray-400 text-sm shadow-md bg-black/20 backdrop-blur-sm">
                            Checklist and images for 2021 Topps MLB Inception adapted with thanks to{" "}
                            <a
                                href="https://x.com/lifofifo"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-white"
                            >
                                @lifofifo
                            </a>{" "}
                            and{" "}
                            <a
                                href="https://mlbinception.netlify.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-white"
                            >
                                mlbinception.netlify.app
                            </a>. Originally created for the Avalanche blockchain version of Topps NFTs.
                        </div>
                    </div>

                    <div className="mt-10 text-sm text-gray-400 text-center">
                        <p className="mt-2">
                            <a
                                href="https://github.com/cardaficionado/toppsnft-checklists"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-white"
                            >
                                View Project on GitHub
                            </a>
                        </p>
                        <p className="mt-2">Version 1.0</p>
                        <p>Conceived and refined by neurons. Built by ChatGPT.</p>
                    </div>
                </div>
            </body>
        </html>
    );
}