import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type MoodInput = {
  selectedColors?: { id: string; name: string; tags: string[] }[];
  direction?: "reflect" | "shift";
  sliders?: {
    pace?: number;
    tone?: number;
    complexity?: number;
    intensity?: number;
  };
  craving?: string;
  filters?: {
    releaseMix?: "balanced" | "newer" | "classics";
    runtime?: "under90" | "any" | "epic";
    language?: "any" | "english" | "international";
    ratingComfort?: "safe" | "open";
  };
};

type TmdbMovie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  genre_ids?: number[];
  overview?: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
};

type TmdbList<T> = {
  page: number;
  results: T[];
  total_results: number;
  total_pages: number;
};

type Recommendation = {
  id: number;
  title: string;
  year: string;
  runtime: number | null;
  poster: string | null;
  genres: string[];
  matchScore: number;
  reason: string;
  trailerKey: string | null;
  wildcard?: boolean;
  backdrop: string | null;
  overview: string;
  director: string | null;
  writer: string | null;
  cast: {
    id: number;
    name: string;
    character: string;
    profilePath: string | null;
  }[];
  rating: number;
  votes: number;
  providers: {
    name: string;
    logo: string;
  }[];
};

const genreNames: Record<number, string> = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  36: "History",
  53: "Thriller",
  80: "Crime",
  878: "Sci-Fi",
  9648: "Mystery",
  10402: "Music",
  10749: "Romance",
  10751: "Family",
};

const colorGenreMap: Record<string, number[]> = {
  "deep-blue": [18, 9648],
  "muted-green": [18, 12],
  "warm-amber": [35, 10749, 36],
  red: [28, 53],
  violet: [878, 14, 9648],
  gray: [18, 80],
  "pale-yellow": [35, 10751],
  charcoal: [53, 80, 27],
  rose: [10749, 18],
  teal: [9648, 878, 53],
};

const toneKeywordMap = {
  dark: ["dark", "dystopia", "cynical"],
  light: ["hopeful", "uplifting", "feel-good"],
};

const imageBase = "https://image.tmdb.org/t/p/w500";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as MoodInput & {
      exclude_ids?: number[];
      excludeIds?: number[];
      seed_movie_id?: number;
      seedMovieId?: number;
    };
    const excludeIds = input.exclude_ids || input.excludeIds || [];
    const seedMovieId = input.seed_movie_id || input.seedMovieId || null;

    const recommendations = await buildRecommendations(input, excludeIds, seedMovieId);
    return NextResponse.json({ recommendations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown recommendation error.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

async function buildRecommendations(
  input: MoodInput,
  excludeIds: number[],
  seedMovieId: number | null = null
): Promise<Recommendation[]> {
  assertTmdbCredentials();

  let directorId: number | null = null;
  let seedGenreIds: number[] = [];
  let seedKeywordIds: number[] = [];

  if (seedMovieId) {
    try {
      const [movieDetail, movieCredits, movieKeywords] = await Promise.all([
        tmdb<any>(`/movie/${seedMovieId}?language=en-US`),
        tmdb<any>(`/movie/${seedMovieId}/credits?language=en-US`).catch(() => ({ crew: [] })),
        tmdb<any>(`/movie/${seedMovieId}/keywords?language=en-US`).catch(() => ({ keywords: [] })),
      ]);

      directorId = movieCredits.crew?.find((person: any) => person.job === "Director")?.id || null;
      seedGenreIds = movieDetail.genres?.map((g: any) => g.id) || [];
      seedKeywordIds = movieKeywords.keywords?.slice(0, 3).map((k: any) => k.id) || [];
    } catch (error) {
      console.error("Error fetching seed movie details:", error);
    }
  }

  const seedInfo = seedMovieId
    ? { directorId, genreIds: seedGenreIds, keywordIds: seedKeywordIds }
    : undefined;

  let combinedPool: TmdbMovie[] = [];
  let relaxationLevel = 0;
  const maxRelaxation = 3;

  while (relaxationLevel <= maxRelaxation) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const today = now.toISOString().slice(0, 10);
    
    let modernFrom = `${currentYear - 3}-01-01`;
    let classicFrom = "1980-01-01";
    let classicTo = "2015-12-31";

    if (relaxationLevel >= 2) {
      modernFrom = `${currentYear - 15}-01-01`;
      classicFrom = "1960-01-01";
      classicTo = `${currentYear - 5}-12-31`;
    }

    const [paramsModern, paramsClassic] = await Promise.all([
      buildDiscoverParamsRelaxed(input, relaxationLevel, seedInfo, true),
      buildDiscoverParamsRelaxed(input, relaxationLevel, seedInfo, false),
    ]);

    const [modernPool, classicPool] = await Promise.all([
      discoverPool(paramsModern, modernFrom, today, "modern", excludeIds),
      discoverPool(paramsClassic, classicFrom, classicTo, "classic", excludeIds),
    ]);

    combinedPool = [...modernPool, ...classicPool]
      .filter(uniqueById)
      .filter((movie) => !excludeIds.includes(movie.id));

    if (combinedPool.length >= 5) {
      break;
    }

    relaxationLevel++;
  }

  // Phase 1 Quality-First Prioritization:
  // Sort the candidate pool descending by TMDB average rating to find the absolute top 20 best movies
  const scoredPool = combinedPool.sort((a, b) => {
    const voteA = a.vote_average || 6.5;
    const voteB = b.vote_average || 6.5;
    return voteB - voteA;
  });

  const top20 = scoredPool.slice(0, 20);
  const randomized = shuffle(top20);
  const selected = randomized.slice(0, 5);

  if (selected.length === 0) {
    return [];
  }

  return Promise.all(selected.map((movie, index) => toRecommendation(movie, input, index === 4 && selected.length === 5)));
}

async function buildDiscoverParamsRelaxed(
  input: MoodInput,
  relaxationLevel: number,
  seedInfo?: { directorId: number | null; genreIds: number[]; keywordIds: number[] },
  isModern: boolean = true
) {
  const mapping = await getSliderMappings(input);
  const defaultSortBy = isModern ? "vote_count.desc" : "vote_average.desc";
  const sortBy = mapping.forceSortBy || defaultSortBy;

  const params = new URLSearchParams({
    include_adult: "false",
    include_video: "false",
    language: "en-US",
    page: "1",
    sort_by: sortBy,
    "vote_count.gte": "150",
    "vote_average.gte": "6.5",
    without_genres: "16", // PHASE 1: IRONCLAD PURE CINEMA RULE (No Animation)
    without_keywords: "210024|6513|297442", // Exclude anime, cartoon, animation keywords
  });

  if (seedInfo) {
    const { directorId, genreIds, keywordIds } = seedInfo;

    if (relaxationLevel < 1 && keywordIds.length > 0) {
      params.set("with_keywords", keywordIds.join("|"));
    }

    if (relaxationLevel < 2 && directorId) {
      params.set("with_people", directorId.toString());
    }

    if (relaxationLevel < 3 && genreIds.length > 0) {
      params.set("with_genres", genreIds.join("|"));
    }
  } else {
    let genreIds = mapping.genreIds;
    let keywordIds = mapping.keywordIds;

    if (relaxationLevel < 3 && genreIds.length > 0) {
      params.set("with_genres", genreIds.join("|"));
    }
    if (relaxationLevel < 1 && keywordIds.length > 0) {
      params.set("with_keywords", keywordIds.join("|"));
    }
  }

  if (input.filters?.language === "english") params.set("with_original_language", "en");
  if (input.filters?.language === "international") params.set("without_original_language", "en");
  if (input.filters?.runtime === "under90") params.set("with_runtime.lte", "90");
  if (input.filters?.runtime === "epic") params.set("with_runtime.gte", "150");

  return params;
}

async function getSliderMappings(input: MoodInput) {
  const tone = input.sliders?.tone ?? 50;
  const pace = input.sliders?.pace ?? 50;
  const complexity = input.sliders?.complexity ?? 50;

  const genres = new Set<number>();
  const keywordSearchTerms: string[] = [];
  const keywordIds = new Set<number>();
  let forceSortBy: string | null = null;

  // 1. Tone Mapping
  if (tone <= 30) {
    genres.add(27); // Horror
    genres.add(53); // Thriller
    [10292, 284439, 10933, 197682, 12377].forEach((id) => keywordIds.add(id)); // gore (10292), blood (284439), violent (10933), ruthless (197682), serial killer (12377)
  } else if (tone <= 60) {
    genres.add(18); // Drama
    genres.add(80); // Crime
    keywordSearchTerms.push("dark", "dystopia", "gritty", "psychological thriller");
  } else if (tone <= 85) {
    genres.add(35); // Comedy
    keywordSearchTerms.push("humor", "parody", "lighthearted", "witty");
  } else {
    genres.add(35); // Comedy
    genres.add(10749); // Romance
    [1115, 1931, 33637].forEach((id) => keywordIds.add(id)); // feel good, heartwarming, uplifting
  }

  // 2. Pace Mapping
  if (pace <= 40) {
    keywordSearchTerms.push("slow cinema", "contemplative", "art house");
    forceSortBy = "vote_average.desc";
  } else if (pace >= 60) {
    genres.add(28); // Action
    keywordSearchTerms.push("adrenaline", "fast-paced", "heist", "chase");
    forceSortBy = "popularity.desc";
  }

  // 3. Complexity Mapping
  if (complexity <= 40) {
    genres.add(35); // Comedy
    genres.add(10749); // Romance
    keywordSearchTerms.push("comforting", "predictable");
  } else if (complexity >= 60) {
    genres.add(878); // Sci-Fi
    genres.add(9648); // Mystery
    [1119, 12554, 10883].forEach((id) => keywordIds.add(id)); // mind bending, surrealism, philosophical
    keywordSearchTerms.push("complex plot");
  }

  // Resolve dynamic keywords in parallel
  if (keywordSearchTerms.length > 0) {
    try {
      const resolved = await Promise.all(
        keywordSearchTerms.map((term) => keywordId(term))
      );
      resolved.forEach((id) => {
        if (id !== null && id !== undefined) keywordIds.add(id);
      });
    } catch (e) {
      console.error("Error resolving keywords dynamically:", e);
    }
  }

  return {
    genreIds: Array.from(genres),
    keywordIds: Array.from(keywordIds),
    forceSortBy,
  };
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

async function discoverPool(
  baseParams: URLSearchParams,
  from: string,
  to: string,
  label: string,
  excludeIds: number[] = []
): Promise<TmdbMovie[]> {
  const params = new URLSearchParams(baseParams);
  params.set("primary_release_date.gte", from);
  params.set("primary_release_date.lte", to);

  if (excludeIds.length > 0) {
    params.set("without_movies", excludeIds.slice(0, 80).join(","));
  }

  let allResults: TmdbMovie[] = [];
  const pagesToFetch = [1, 2];

  try {
    const responses = await Promise.all(
      pagesToFetch.map(async (page) => {
        const pageParams = new URLSearchParams(params);
        pageParams.set("page", page.toString());
        const pool = await tmdb<TmdbList<TmdbMovie>>(`/discover/movie?${pageParams.toString()}`);
        return pool.results || [];
      })
    );

    for (const results of responses) {
      const usable = results.filter(
        (movie) => movie.poster_path && movie.release_date && !excludeIds.includes(movie.id)
      );
      allResults = [...allResults, ...usable];
    }
  } catch (error) {
    console.error(`Error discovering ${label} movies:`, error);
  }

  return allResults.filter(uniqueById);
}

async function toRecommendation(movie: TmdbMovie, input: MoodInput, wildcard: boolean): Promise<Recommendation> {
  const [detail, videos, credits, watchData] = await Promise.all([
    tmdb<TmdbMovie>(`/movie/${movie.id}?language=en-US`),
    tmdb<TmdbList<{ key: string; site: string; type: string; official?: boolean; name: string }>>(
      `/movie/${movie.id}/videos?language=en-US`,
    ),
    tmdb<{ cast: any[]; crew: any[] }>(`/movie/${movie.id}/credits?language=en-US`).catch(() => ({ cast: [], crew: [] })),
    tmdb<any>(`/movie/${movie.id}/watch/providers`).catch(() => ({ results: {} })),
  ]);

  const trailer =
    videos.results.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official) ||
    videos.results.find((video) => video.site === "YouTube" && video.type === "Trailer") ||
    videos.results.find((video) => video.site === "YouTube");

  const genres = detail.genres?.map((genre) => genre.name) || movie.genre_ids?.map((id) => genreNames[id]).filter(Boolean) || [];

  const director = credits.crew?.find((person) => person.job === "Director")?.name || null;
  const writer = credits.crew?.find(
    (person) => person.job === "Writer" || person.job === "Screenplay" || person.job === "Writer (Screenplay)"
  )?.name || null;

  const cast = (credits.cast || [])
    .slice(0, 8)
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path ? `${imageBase}${c.profile_path}` : null,
    }));

  const rating = detail.vote_average ? Math.round(detail.vote_average * 10) / 10 : (movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : 0.0);
  const votes = detail.vote_count || movie.vote_count || 0;

  // Parse watch providers for the US region, prioritizing flatrate (subscription), fallback to rent, then buy.
  const usWatch = watchData?.results?.US || {};
  const providerList = usWatch.flatrate || usWatch.rent || usWatch.buy || [];
  const providers = providerList.slice(0, 3).map((p: any) => ({
    name: p.provider_name,
    logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`,
  }));

  return {
    id: movie.id,
    title: detail.title || movie.title,
    year: (detail.release_date || movie.release_date || "----").slice(0, 4),
    runtime: detail.runtime || null,
    poster: detail.poster_path ? `${imageBase}${detail.poster_path}` : null,
    genres: buildVibeTags(genres, input),
    matchScore: scoreMovie(movie, input),
    reason: reasonFor(input, genres, wildcard),
    trailerKey: trailer?.key || null,
    wildcard,
    backdrop: detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : null,
    overview: detail.overview || movie.overview || "",
    director,
    writer,
    cast,
    rating,
    votes,
    providers,
  };
}

async function keywordsForTone(input: MoodInput) {
  const tone = input.sliders?.tone ?? 50;
  const keywords = tone <= 45 ? toneKeywordMap.dark : tone >= 55 ? toneKeywordMap.light : [];
  const results = await Promise.all(keywords.map((keyword) => keywordId(keyword)));
  return results.filter((id): id is number => typeof id === "number");
}

async function keywordId(keyword: string) {
  const data = await tmdb<TmdbList<{ id: number; name: string }>>(`/search/keyword?query=${encodeURIComponent(keyword)}&page=1`);
  return data.results.find((item) => item.name.toLowerCase() === keyword.toLowerCase())?.id || data.results[0]?.id;
}

async function tmdb<T>(path: string): Promise<T> {
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
    cache: "no-store",
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("TMDB API Error:", response.status, errText);
    throw new Error(`TMDB request failed (${response.status}) for ${url.pathname}${url.search}: ${errText.slice(0, 240)}`);
  }

  return response.json();
}

function assertTmdbCredentials() {
  if (!process.env.TMDB_ACCESS_TOKEN && !process.env.TMDB_API_KEY) {
    throw new Error("Missing TMDB credentials. Set TMDB_ACCESS_TOKEN or TMDB_API_KEY in .env.local.");
  }
}

function genresForMood(input: MoodInput) {
  const ids = new Set<number>();

  for (const color of input.selectedColors || []) {
    (colorGenreMap[color.id] || []).forEach((id) => ids.add(id));
  }

  if (ids.size === 0) {
    throw new Error("No supported color/vibe mapping was provided. Select mapped vibe colors before requesting recommendations.");
  }

  return Array.from(ids);
}

function scoreAndPick(movies: TmdbMovie[], input: MoodInput, count: number) {
  return movies
    .filter(uniqueById)
    .sort((a, b) => scoreMovie(b, input) - scoreMovie(a, input))
    .slice(0, count);
}

function interleave<T>(first: T[], second: T[]) {
  const mixed: T[] = [];
  const length = Math.max(first.length, second.length);

  for (let index = 0; index < length; index += 1) {
    if (first[index]) mixed.push(first[index]);
    if (second[index]) mixed.push(second[index]);
  }

  return mixed;
}

function scoreMovie(movie: TmdbMovie, input: MoodInput) {
  const vote = movie.vote_average || 6.5;
  const popularity = Math.min(movie.popularity || 20, 260);
  const base = 62 + (vote - 5.8) * 6 + popularity / 22;
  const tone = input.sliders?.tone ?? 50;
  const pace = input.sliders?.pace ?? 50;
  const toneBoost = tone > 55 && movie.genre_ids?.some((id) => [35, 12, 16, 10751].includes(id)) ? 5 : 0;
  const darkBoost = tone < 46 && movie.genre_ids?.some((id) => [53, 80, 9648, 18].includes(id)) ? 5 : 0;
  const paceBoost = pace > 55 && movie.genre_ids?.some((id) => [28, 53, 12].includes(id)) ? 4 : 0;

  return Math.max(76, Math.min(97, Math.round(base + toneBoost + darkBoost + paceBoost)));
}

function reasonFor(input: MoodInput, genres: string[], wildcard: boolean) {
  const tags = tagsFor(input);
  const direction = input.direction === "shift" ? "shift from your current mood" : "reflect your current mood";
  const pace = (input.sliders?.pace ?? 50) > 58 ? "faster pacing" : "a patient rhythm";
  const tone = (input.sliders?.tone ?? 50) > 58 ? "a lighter emotional landing" : "a darker emotional edge";
  const complexity = (input.sliders?.complexity ?? 50) > 58 ? "room to think" : "an easy path into the story";

  if (wildcard) {
    return `This is your wildcard: a less obvious TMDB match for ${tags[0] || "your mood"}, chosen to interrupt the scroll without breaking the vibe.`;
  }

  if (genres.some((genre) => ["Comedy", "Animation", "Family", "Adventure"].includes(genre))) {
    return `Chosen to ${direction} with ${tone}, ${pace}, and enough warmth to make the choice feel low-friction.`;
  }

  if (genres.some((genre) => ["Mystery", "Thriller", "Science Fiction", "Sci-Fi"].includes(genre))) {
    return `Recommended because your profile leans ${tags.slice(0, 2).join(" and ") || "atmospheric"}, with ${complexity} and controlled tension.`;
  }

  return `This fits your ${tags.slice(0, 2).join(" and ") || "emotional"} mood, balancing ${pace} with ${complexity}.`;
}

function buildVibeTags(genres: string[], input: MoodInput) {
  const tags = tagsFor(input).slice(0, 2);
  return [...new Set([...genres.slice(0, 2), ...tags])].slice(0, 4);
}

function tagsFor(input: MoodInput) {
  const colorTags = input.selectedColors?.flatMap((color) => color?.tags || []) || [];
  const craving = (input.craving || "").toLowerCase();
  const textTags = [
    craving.includes("cozy") && "cozy",
    craving.includes("myster") && "mysterious",
    craving.includes("thriller") && "tense",
    craving.includes("smart") && "cerebral",
    craving.includes("nostalg") && "nostalgic",
    craving.includes("not too heavy") && "light",
    craving.includes("visual") && "atmospheric",
  ].filter(Boolean) as string[];

  return [...new Set([...colorTags, ...textTags])];
}

function uniqueById<T extends { id: number }>(movie: T, index: number, array: T[]) {
  return array.findIndex((item) => item.id === movie.id) === index;
}
