// /src/app/topps/mlb/[set]/page.tsx (with fetch URL logging for debug)

'use client'

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface NFTEntry {
  Name: string;
  'Set Name': string;
  'Subset Name': string;
  'Rarity Name': string;
  'Mint Count': number;
  'Contract Address': string;
  'Image URL': string;
}

interface SlugMap {
  [contract: string]: string;
}

const rarityColors: Record<string, string> = {
  legendary: 'bg-yellow-500 text-black',
  epic: 'bg-purple-500 text-white',
  rare: 'bg-red-500 text-white',
  uncommon: 'bg-blue-500 text-white',
  common: 'bg-green-500 text-white',
};

export default function ChecklistPage({ params }: { params: { set: string } }) {
  const { set } = params;
  const [checklist, setChecklist] = useState<NFTEntry[]>([]);
  const [slugMap, setSlugMap] = useState<SlugMap>({});
  const [loading, setLoading] = useState(true);
  const [sorted, setSorted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching checklist from:', `/data/topps/mlb/${set}/grouped_by_set_inception_flattened_final_with_contracts_images.json`);
        console.log('Fetching slug map from:', `/data/topps/mlb/${set}/contract_to_slug.json`);

        const checklistRes = await fetch(`/data/topps/mlb/${set}/grouped_by_set_inception_flattened_final_with_contracts_images.json`);
        const slugRes = await fetch(`/data/topps/mlb/${set}/contract_to_slug.json`);

        if (!checklistRes.ok || !slugRes.ok) {
          console.error('Checklist or Slug JSON not found or failed to load.');
          return notFound();
        }

        const checklistData = await checklistRes.json();
        const slugData = await slugRes.json();

        setChecklist(checklistData);
        setSlugMap(slugData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading checklist data:', error);
        notFound();
      }
    }

    fetchData();
  }, [set]);

  // ... (the rest of the file remains the same, no changes to checklist rendering)
}
