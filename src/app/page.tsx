import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-white bg-black p-8">
      <img
        src="/data/gpk/IMG_2427.webp"
        alt="Launch Image"
        className="mx-auto mb-8 w-84 rounded-lg shadow-lg"
      />
      <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">
        2022 Topps Garbage Pail Kids NFT Checklist
      </h1>
      <p className="text-lg md:text-2xl text-gray-300 mb-8 max-w-2xl text-center">
        This is an unofficial community resource to help collectors track ownership, view rarity information, and complete their GPK NFT sets after the Polygon migration.
      </p>
      <Link
        href="/checklist"
        className="bg-white text-black font-semibold px-8 py-4 rounded-md text-lg hover:bg-gray-300 transition"
      >
        View Checklist (Grid View) With Wallet Checker
      </Link>
      <p></p>
      <Link
        href="/characters"
        className="bg-white text-black font-semibold px-8 py-4 rounded-md text-lg hover:bg-gray-300 transition"
      >
        View Checklist (Card View)
      </Link>
      <div className="mt-10 text-sm text-gray-400 text-center">
        <p>Note: Magic Eden collections may not be fully accessible at this time due to recent change in contract pages.</p>
        <p className="mt-2">
          <a
            href="https://github.com/cardaficionado/gpk-checklist"
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
  );
}