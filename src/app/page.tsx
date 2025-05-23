'use client'

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white p-8">

            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center tracking-tight">
                ToppsNFT Polygon Checklists
            </h1>
            <p className="text-lg md:text-lg text-gray-400 mb-10 max-w-2xl text-center leading-relaxed">
                An unofficial community resource to help collectors track ownership, view rarity details, and complete their ToppsNFT sets after the Polygon migration.
            </p>

            {/* Primary Product Links */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
                <Link href="/topps/gpk/checklist" className="group">
                    <img
                        src="/data/topps/gpk/IMG_2427.webp"
                        alt="GPK Checklist Grid View"
                        className="w-64 md:w-72 rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                </Link>
                <Link href="/topps/mlb/2021-topps-mlb-inception/grid" className="group">
                    <img
                        src="/data/topps/mlb/2021-topps-mlb-inception/Inception_premium_Front_01.png"
                        alt="Inception Checklist Grid View"
                        className="w-64 md:w-72 rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                </Link>
            </div>

            {/* Secondary MLB Links */}
            <div className="flex flex-col items-center gap-4 mb-16">
                <h2 className="text-2xl font-bold mb-4 text-center">More MLB Pages</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/topps/mlb/2021-topps-mlb-inception" className="px-6 py-3 bg-white text-black font-semibold rounded-full shadow hover:bg-gray-200 transition">
                        2021 Inception Players View
                    </Link>
                </div>
            </div>

            {/* Secondary GPK Links */}
            <div className="flex flex-col items-center gap-4 mb-16">
                <h2 className="text-2xl font-bold mb-4 text-center">More GPK Pages</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/topps/gpk/characters" className="px-6 py-3 bg-white text-black font-semibold rounded-full shadow hover:bg-gray-200 transition">
                        Characters View
                    </Link>
                </div>
            </div>

            {/* Attribution Section */}
            <div className="mt-16 text-s text-gray-500 text-center max-w-md border-t border-gray-700 pt-4">
                <p className="mb-2">
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
                </p>
                <p>
                    Conceived and refined by neurons. Built by ChatGPT. View project on{" "}
                    <a
                        href="https://github.com/cardaficionado/toppsnft-checklists"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white"
                    >
                        GitHub
                    </a>{" "}
                </p>
            </div>
        </div>
    );
}