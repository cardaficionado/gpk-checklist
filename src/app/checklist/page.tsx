"use client";

import { useEffect, useState } from "react";
import { Ship, Wand2 } from "lucide-react";

export default function ChecklistPage() {
  const [sets, setSets] = useState<any>({});
  const [wallet, setWallet] = useState("");
  const [walletOwnership, setWalletOwnership] = useState<any>({});
  const [characterImages, setCharacterImages] = useState<any[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const rarityOrder = ["common", "uncommon", "rare", "super rare", "epic", "legendary"];

  useEffect(() => {
    async function fetchChecklist() {
      try {
        const res = await fetch("/data/gpk/grouped_by_set.json");
        const data = await res.json();
        setSets(data);
        console.log("Loaded sets:", data);
      } catch (error) {
        console.error("Failed to load checklist data:", error);
      }
    }

    async function fetchCharacterImages() {
      try {
        const res = await fetch("/data/gpk/gpk_character_image_map_master_template.json");
        const data = await res.json();
        setCharacterImages(data);
        console.log("Loaded character images:", data);
      } catch (error) {
        console.error("Failed to load character images:", error);
      }
    }

    fetchChecklist();
    fetchCharacterImages();
  }, []);

  async function checkWallet() {
    if (!wallet) return;
    setIsChecking(true);
    const ownership: any = {};

    for (const setName in sets) {
      const characters = sets[setName];
      for (const characterName in characters) {
        ownership[characterName] = ownership[characterName] || {};
        const rarities = characters[characterName];

        for (const rarity of rarityOrder) {
          const card = rarities[rarity];
          if (!card) continue;

          try {
            const response = await fetch(
              `https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${card.contract}&address=${wallet}&tag=latest&apikey=HB6KJVTD6IESTZ86QM9FJFKXMHPSN2ACZM`
            );
            const data = await response.json();
            ownership[characterName][rarity] = parseInt(data.result) > 0;

            await new Promise(resolve => setTimeout(resolve, 350)); // Wait 250ms to avoid rate limits
          } catch (error) {
            console.error("Error checking ownership for", characterName, rarity, error);
          }
        }
      }
    }

    setWalletOwnership(ownership);
    setIsChecking(false);
  }

  function generateCSV() {
    let csv = "Set,Character,Rarity,Status\n";

    for (const setName in sets) {
      for (const characterName in sets[setName]) {
        const rarities = sets[setName][characterName];  // <- fix: direct access, no .rarities

        for (const rarity of rarityOrder) {
          const card = rarities?.[rarity];
          if (card) {
            const owned =
              walletOwnership[characterName]?.[rarity] === true
                ? "Owned"
                : walletOwnership[characterName]?.[rarity] === false
                  ? "Not Owned"
                  : "";

            csv += `"${setName}","${characterName}","${rarity}","${owned}"\n`;
          }
        }
      }
    }

    return csv;
  }

  function handleDownload() {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "gpk_checklist.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">2022 Topps Garbage Pail Kids</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Paste wallet address..."
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className="border rounded px-2 py-1 text-black bg-white placeholder-gray-400"
          />
          <button onClick={checkWallet} className="bg-white text-black px-3 py-1 rounded">
            {isChecking ? "Checking..." : "Check Wallet"}
          </button>
          <button
            onClick={handleDownload}
            className="bg-white text-black px-3 py-1 rounded flex items-center gap-2"
          >
            Export CSV
          </button>
        </div>
      </div>

      {Object.entries(sets).map(([setName, characters]: any, idx) => (
        <div key={idx} className="mb-12">
          <h2 className="text-2xl font-bold mb-4">{setName}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border px-4 py-2">Character</th>
                  {rarityOrder.map((rarity) => (
                    <th key={rarity} className="border px-4 py-2 capitalize">{rarity}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(characters).map(([characterName, rarities]: any, index) => {
                  const characterImageObj = characterImages.find((img) => img.character === characterName);
                  const characterImageUrl = characterImageObj?.image;

                  return (
                    <tr key={index} className="even:bg-gray-800 hover:bg-gray-700">
                      <td className="border px-4 py-2 flex items-center gap-2">
                        {characterImageUrl ? (
                          <img
                            src={characterImageUrl}
                            alt={characterName}
                            className="w-20 h-auto rounded object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-700"></div>
                        )}
                        {characterName}
                      </td>
                      {rarityOrder.map((rarity) => {
                        const card = rarities[rarity];
                        const owned = walletOwnership[characterName]?.[rarity];
                        return (
                          <td
                            key={rarity}
                            className={`border p-2 text-center ${!card
                              ? "bg-gray-700"
                              : owned === true
                                ? "bg-green-900"
                                : "bg-red-900"
                              }`}
                          >
                            {card ? (
                              <div className="flex justify-center gap-2">
                                <a
                                  href={`https://opensea.io/assets/matic/${card.contract}/1`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View on OpenSea"
                                >
                                  <Ship className="h-5 w-5" />
                                </a>
                                <Wand2 className="h-5 w-5 opacity-30" title="Magic Eden unavailable" />
                              </div>
                            ) : (
                              <div className="opacity-20">✖</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}