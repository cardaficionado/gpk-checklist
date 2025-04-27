// /src/app/topps/mlb/[set]/checklist/page.tsx

import { notFound } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import toppsSetList from "@/../public/data/topps/topps-setlist.json";

interface ToppsSet {
  set_name: string;
  year: number;
  category: string;
  note: string;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default async function ChecklistPage({ params }: { params: { set: string } }) {
  const { set } = params;

  // Find matching set in topps-setlist.json
  const matchingSet = (toppsSetList as ToppsSet[]).find(
    (s) => slugify(s.set_name) === set
  );

  if (!matchingSet) {
    notFound(); // If no matching set, show 404
  }

  // Build the file path dynamically
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "topps",
    "mlb",
    set,
    "grouped_by_set.json"
  );

  let checklistData: any;
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    checklistData = JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading checklist for ${set}`, error);
    notFound(); // Show 404 if file missing
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">
        {matchingSet.set_name} Checklist
      </h1>

      {/* Render checklist data here */}
      <pre>{JSON.stringify(checklistData, null, 2)}</pre>
    </div>
  );
}