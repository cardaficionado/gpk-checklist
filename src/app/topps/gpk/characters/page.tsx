'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ship, Wand2 } from 'lucide-react'

interface Appearance {
    set: string
    rarity: string
    contract: string
    total_minted: number
    on_chain: boolean
}

interface CharacterGroup {
    [character: string]: Appearance[]
}

interface CharacterImage {
    character: string
    image: string
}

const rarityColors: Record<string, string> = {
    common: 'bg-green-100 text-green-800',
    uncommon: 'bg-blue-100 text-blue-800',
    rare: 'bg-purple-200 text-purple-800',
    'super rare': 'bg-yellow-100 text-yellow-800',
    epic: 'bg-purple-500 text-white',
    legendary: 'bg-yellow-400 text-black'
}

const fallbackImage = 'https://mediacache.wax.io/QmQPh9jQFq1TvTJBwPBeSEzUXjS9bNhKC33Jt3RS2mDaWc/375x100'

export default function CharacterChecklist() {
    const [characters, setCharacters] = useState<CharacterGroup>({})
    const [imageMap, setImageMap] = useState<Record<string, string>>({})

    useEffect(() => {
        fetch('/data/topps/gpk/grouped_by_character.json')
            .then((res) => res.json())
            .then((data) => setCharacters(data))
            .catch((err) => console.error('Error loading character data:', err))
    }, [])

    useEffect(() => {
        fetch('/data/topps/gpk/character_image_map.json')
            .then((res) => res.json())
            .then((data: CharacterImage[]) => {
                const map: Record<string, string> = {}
                data.forEach(entry => {
                    if (entry.character && entry.image) {
                        map[entry.character.toLowerCase()] = entry.image
                    }
                })
                setImageMap(map)
            })
            .catch((err) => console.error('Error loading image map:', err))
    }, [])

    return (
        <div className="p-6 max-w-screen-xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">GPK Checklist by Character</h1>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Object.entries(characters).map(([name, appearances]) => {
                    const imageSrc = imageMap[name.toLowerCase()] || fallbackImage

                    return (
                        <Card key={name} className="rounded-2xl shadow">
                            <CardContent className="p-4">
                                <h2 className="text-lg font-semibold mb-2 text-center">{name}</h2>
                                {imageSrc && (
                                    <img
                                        src={imageSrc}
                                        alt={name}
                                        width={150}
                                        height={150}
                                        className="rounded-xl object-cover mx-auto mb-2"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null
                                            e.currentTarget.src = fallbackImage
                                        }}
                                    />
                                )}

                                <div className="flex flex-col gap-1">
                                    {appearances.map((a, i) => {
                                        const setLabel = a.set === '2022 Topps GPK Non-Flushable Tokens Challenge Rewards' ? 'Reward' : ''
                                        const magicEdenUrl = `https://magiceden.us/collections/polygon/${a.contract}`
                                        const openSeaUrl = `https://opensea.io/assets/matic/${a.contract}/1`
                                        return (
                                            <div key={`${a.set}-${a.rarity}-${i}`} className="flex justify-between items-center">
                                                <Badge
                                                    className={
                                                        rarityColors[a.rarity.toLowerCase()] || 'bg-gray-100 text-gray-800'
                                                    }
                                                >
                                                    {a.rarity} • {a.total_minted}{setLabel ? ` • ${setLabel}` : ''}
                                                </Badge>
                                                <div className="flex gap-1">
                                                    <a
                                                        href={magicEdenUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="View on Magic Eden"
                                                        aria-label="View on Magic Eden"
                                                    >
                                                        <Button variant="ghost" size="icon" className="h-5 w-5">
                                                            <Wand2 className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                    <a
                                                        href={openSeaUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="View on OpenSea"
                                                        aria-label="View on OpenSea"
                                                    >
                                                        <Button variant="ghost" size="icon" className="h-5 w-5">
                                                            <Ship className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
