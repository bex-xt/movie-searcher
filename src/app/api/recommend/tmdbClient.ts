import type { TmdbList } from "./tmdbTypes";

export function assertTmdbCredentials() {
  if (!process.env.TMDB_ACCESS_TOKEN && !process.env.TMDB_API_KEY) {
    throw new Error("Missing TMDB credentials. Set TMDB_ACCESS_TOKEN or TMDB_API_KEY in .env.local.");
  }
}

export async function tmdb<T>(path: string): Promise<T> {
  const token = process.env.TMDB_ACCESS_TOKEN;
  const key = process.env.TMDB_API_KEY;
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  if (!token && key) url.searchParams.set("api_key", key);

  const headers: Record<string, string> = { accept: "application/json" };
  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const response = await fetch(url, {
    headers,
    next: { revalidate: 86400 }, // Cache TMDB responses for 24 hours
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("TMDB API Error:", response.status, errText);
    throw new Error(`TMDB request failed (${response.status}) for ${url.pathname}${url.search}: ${errText.slice(0, 240)}`);
  }

  return response.json();
}

export async function keywordId(keyword: string): Promise<number | undefined> {
  const data = await tmdb<TmdbList<{ id: number; name: string }>>(`/search/keyword?query=${encodeURIComponent(keyword)}&page=1`);
  return data.results.find((item) => item.name.toLowerCase() === keyword.toLowerCase())?.id || data.results[0]?.id;
}
