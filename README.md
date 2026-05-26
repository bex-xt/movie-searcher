# Netflix De-Syndrome

A mood-first movie recommendation site built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and TMDB.

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## TMDB

Create `.env.local` from `.env.example` and add either:

```bash
TMDB_API_KEY=
TMDB_ACCESS_TOKEN=
```

The app includes a curated fallback set, so the interface still works without TMDB credentials. Live recommendations and trailer discovery use TMDB when credentials are present.
