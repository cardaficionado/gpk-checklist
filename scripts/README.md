# Slug Fetcher README

## 📦 Overview

This folder contains utility scripts for generating OpenSea and Magic Eden slugs for Topps NFT contracts.

These scripts read from the `grouped_by_set.json` checklist data, pull the appropriate contract addresses, and query OpenSea's API to retrieve the associated collection slugs.

---

## 🔁 Reusing This for Other Topps Sets

### ✅ Checklist-Driven Design

Scripts pull contract addresses from:

```
/public/data/topps/<set>/grouped_by_set.json
```

Update these two lines in `fetchSlugs.ts` for each set:

```ts
const checklistPath = path.join(process.cwd(), "public/data/topps/<set>/grouped_by_set.json");
const outputPath = path.join(process.cwd(), "public/data/topps/<set>/contract-to-slug.json");
```

---

### ✅ OpenSea Endpoint

OpenSea’s V2 API endpoint (used for Polygon):

```
https://api.opensea.io/api/v2/chain/matic/contract/{contractAddress}
```

To support other chains, change `"matic"` to the appropriate chain (e.g., `ethereum`).

---

### ✅ Script Capabilities

- Retries on 429 or other transient API errors
- 2-second delay between calls
- Automatically skips contracts with no slug
- Writes `contract-to-slug.json` output for each set

---

## 🛠 Compiling & Running

1. Compile the script:

```bash
npx tsc -p tsconfig.build.json
```

2. Run the compiled version:

```bash
node dist/fetchSlugs.js
```

Optional: add to `package.json`:

```json
"scripts": {
  "build:slugs": "tsc -p tsconfig.build.json",
  "fetch:slugs": "node dist/fetchSlugs.js"
}
```

---

## ✅ Summary

| Component              | Reusable? |
|------------------------|-----------|
| Slug fetcher script    | ✅ Yes    |
| OpenSea API endpoint   | ✅ Yes    |
| Checklist format       | ✅ Yes    |
| UI integration         | ✅ Yes    |

This is a production-ready, future-proof pipeline. 🚀
