import Link from "next/link";

export default function MlbLandingPage() {
    return (
        <main className="p-8">
            {/* Your main content here */}

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
        </main>
    );
}