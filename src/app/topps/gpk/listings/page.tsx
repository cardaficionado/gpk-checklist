'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface Listing {
    character: string
    rarity: string
    token_id: string
    price: string
    contract: string
    image: string
}

export default function ListingsPage() {
    const [listings, setListings] = useState<Listing[]>([])

    useEffect(() => {
        // Load your listings data — maybe fetch from a server or local JSON
        fetch('/data/gpk/sample_listings.json')
            .then(res => res.json())
            .then(data => setListings(data))
    }, [])

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-4">Live Listings</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((nft, idx) => (
                    <Card key={idx}>
                        <CardContent className="p-4">
                            <img src={nft.image} alt={nft.character} className="rounded-lg mb-2" />
                            <div className="font-semibold text-lg">{nft.character}</div>
                            <Badge variant="outline" className="mr-2">{nft.rarity}</Badge>
                            <div className="text-sm text-gray-400 mb-2">Price: {nft.price} MATIC</div>
                            <div className="flex gap-2 mt-2">
                                <a
                                    href={`https://opensea.io/assets/matic/${nft.contract}/${nft.token_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" size="sm">
                                        OpenSea <ExternalLink className="w-4 h-4 ml-1" />
                                    </Button>
                                </a>
                                <a
                                    href={`https://magiceden.io/item-details/polygon/${nft.contract}/${nft.token_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" size="sm">
                                        Magic Eden <ExternalLink className="w-4 h-4 ml-1" />
                                    </Button>
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}