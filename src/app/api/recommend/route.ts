import { NextResponse } from "next/server";
import { getOfflineRecommendations } from "@/offlinePool";

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
};

interface TmdbMovieDetail {
  id: number;
  title: string;
  genres?: { id: number; name: string }[];
  release_date?: string;
  runtime?: number | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  overview?: string;
}

interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
}

interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string | null;
}

interface TmdbCredits {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

interface TmdbKeyword {
  id: number;
  name: string;
}

interface TmdbKeywordsList {
  keywords?: TmdbKeyword[];
}

interface TmdbWatchProvider {
  provider_name: string;
  logo_path: string;
}

interface TmdbWatchProvidersResults {
  results?: {
    US?: {
      flatrate?: TmdbWatchProvider[];
      rent?: TmdbWatchProvider[];
      buy?: TmdbWatchProvider[];
    };
  };
}

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
  matchChips?: string[];
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

const imageBase = "https://image.tmdb.org/t/p/w500";

export async function POST(request: Request) {
  let input: MoodInput & {
    exclude_ids?: number[];
    excludeIds?: number[];
    seed_movie_id?: number;
    seedMovieId?: number;
  };

  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload provided." }, { status: 400 });
  }

  // 1. Validate selectedColors
  if (!input.selectedColors || !Array.isArray(input.selectedColors) || input.selectedColors.length < 2) {
    return NextResponse.json({ error: "Please select at least two mood colors to generate recommendations." }, { status: 400 });
  }

  // 2. Validate sliders if present
  if (input.sliders) {
    const { pace, tone, complexity, intensity } = input.sliders;
    for (const [key, val] of Object.entries({ pace, tone, complexity, intensity })) {
      if (val !== undefined) {
        if (typeof val !== "number" || val < 0 || val > 100 || Number.isNaN(val)) {
          return NextResponse.json({ error: `Slider '${key}' must be a valid number between 0 and 100.` }, { status: 400 });
        }
      }
    }
  }

  try {
    const excludeIds = input.exclude_ids || input.excludeIds || [];
    const seedMovieId = input.seed_movie_id || input.seedMovieId || null;

    const recommendations = await buildRecommendations(input, excludeIds, seedMovieId);
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("TMDB/Backend recommendation failed. Falling back to offline pool:", error);
    try {
      const excludeIds = input.exclude_ids || input.excludeIds || [];
      const recommendations = getOfflineRecommendations(
        input.selectedColors || [],
        input.direction || "reflect",
        {
          pace: input.sliders?.pace ?? 50,
          tone: input.sliders?.tone ?? 50,
          complexity: input.sliders?.complexity ?? 50,
          intensity: input.sliders?.intensity ?? 50,
        },
        excludeIds
      );
      return NextResponse.json({ recommendations, isOffline: true });
    } catch (fallbackError) {
      const message = fallbackError instanceof Error ? fallbackError.message : "Unknown recommendation error.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
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
        tmdb<TmdbMovieDetail>(`/movie/${seedMovieId}?language=en-US`),
        tmdb<TmdbCredits>(`/movie/${seedMovieId}/credits?language=en-US`).catch(() => ({ cast: [], crew: [] })),
        tmdb<TmdbKeywordsList>(`/movie/${seedMovieId}/keywords?language=en-US`).catch(() => ({ keywords: [] })),
      ]);

      directorId = movieCredits.crew?.find((person) => person.job === "Director")?.id || null;
      seedGenreIds = movieDetail.genres?.map((g) => g.id) || [];
      seedKeywordIds = movieKeywords.keywords?.slice(0, 3).map((k) => k.id) || [];
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

  const intensity = input.sliders?.intensity ?? 50;
  let withoutGenres = "16"; // PHASE 1: IRONCLAD PURE CINEMA RULE (No Animation)
  if (intensity <= 35) {
    withoutGenres += "|27|53"; // Low intensity: Exclude Horror (27) and Thriller (53)
  }

  let minVoteCount = "150";
  if (intensity >= 65 && relaxationLevel === 0) {
    minVoteCount = "250"; // High intensity: Focus on more widely reviewed/established movies initially
  }

  const params = new URLSearchParams({
    include_adult: "false",
    include_video: "false",
    language: "en-US",
    page: "1",
    sort_by: sortBy,
    "vote_count.gte": minVoteCount,
    "vote_average.gte": "6.5",
    without_genres: withoutGenres,
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
    const genreIds = mapping.genreIds;
    const keywordIds = mapping.keywordIds;

    if (relaxationLevel < 3 && genreIds.length > 0) {
      params.set("with_genres", genreIds.join("|"));
    }
    if (relaxationLevel < 1 && keywordIds.length > 0) {
      params.set("with_keywords", keywordIds.join("|"));
    }
  }

  return params;
}

async function getSliderMappings(input: MoodInput) {
  let tone = input.sliders?.tone ?? 50;
  const pace = input.sliders?.pace ?? 50;
  let complexity = input.sliders?.complexity ?? 50;
  let intensity = input.sliders?.intensity ?? 50;

  const genres = new Set<number>();
  const keywordSearchTerms: string[] = [];
  const keywordIds = new Set<number>();
  let forceSortBy: string | null = null;

  const direction = input.direction ?? "reflect";

  // Compact color-to-genre and color-to-keyword mapping for REFLECT mode
  const colorGenreMap: Record<string, number[]> = {
    "deep-blue": [18, 9648], // Drama, Mystery
    "muted-green": [18, 12], // Drama, Adventure
    "warm-amber": [35, 10749], // Comedy, Romance
    "red": [28, 53], // Action, Thriller
    "violet": [878, 14, 9648], // Sci-Fi, Fantasy, Mystery
    "gray": [18, 80], // Drama, Crime
    "pale-yellow": [35, 10751], // Comedy, Family
    "charcoal": [53, 80, 27], // Thriller, Crime, Horror
    "rose": [10749, 18], // Romance, Drama
    "teal": [9648, 878], // Mystery, Sci-Fi
  };

  const colorKeywordMap: Record<string, string[]> = {
    "deep-blue": ["reflective", "melancholy"],
    "muted-green": ["quiet", "healing"],
    "warm-amber": ["cozy", "nostalgia"],
    "red": ["intense", "thrilling"],
    "violet": ["surreal", "mysterious"],
    "gray": ["serious", "bleak"],
    "pale-yellow": ["cheerful", "uplifting"],
    "charcoal": ["dark", "brooding"],
    "rose": ["tender", "romantic"],
    "teal": ["atmospheric", "moody"],
  };

  // Compact color-to-genre and color-to-keyword mapping for SHIFT mode
  const shiftedColorGenreMap: Record<string, number[]> = {
    "charcoal": [35, 12, 10749],
    "red": [35, 12, 10749],
    "pale-yellow": [18, 9648],
    "warm-amber": [18, 9648],
    "rose": [18, 9648],
    "deep-blue": [12, 35, 10749],
    "gray": [12, 35, 10749],
    "teal": [12, 35, 10749],
    "muted-green": [12, 35, 10749],
    "violet": [12, 35, 10749],
  };

  const shiftedColorKeywordMap: Record<string, string[]> = {
    "charcoal": ["feel-good", "lighthearted", "optimistic", "heartwarming"],
    "red": ["feel-good", "lighthearted", "optimistic", "heartwarming"],
    "pale-yellow": ["philosophical", "thought-provoking", "cerebral", "complex"],
    "warm-amber": ["philosophical", "thought-provoking", "cerebral", "complex"],
    "rose": ["philosophical", "thought-provoking", "cerebral", "complex"],
    "deep-blue": ["hopeful", "uplifting", "heartwarming", "inspiring"],
    "gray": ["hopeful", "uplifting", "heartwarming", "inspiring"],
    "teal": ["hopeful", "uplifting", "heartwarming", "inspiring"],
    "muted-green": ["hopeful", "uplifting", "heartwarming", "inspiring"],
    "violet": ["hopeful", "uplifting", "heartwarming", "inspiring"],
  };

  // 1. Shift the slider values first if direction === "shift"
  if (direction === "shift") {
    const colorIds = input.selectedColors?.map((c) => c.id) || [];
    const hasDark = colorIds.some((id) => ["charcoal", "red"].includes(id));
    const hasLight = colorIds.some((id) => ["pale-yellow", "warm-amber", "rose"].includes(id));
    const hasBlueGray = colorIds.some((id) => ["deep-blue", "gray", "teal", "muted-green", "violet"].includes(id));

    if (hasDark) {
      // Soften tone, decrease intensity
      tone = Math.min(100, tone + 30);
      intensity = Math.max(0, intensity - 25);
    }
    if (hasLight) {
      // Add complexity/drama, slightly darken tone
      complexity = Math.min(100, complexity + 30);
      tone = Math.max(0, tone - 20);
    }
    if (hasBlueGray) {
      // Add hope/warmth/adventure
      tone = Math.min(100, tone + 25);
      intensity = Math.min(100, intensity + 15);
    }
  }

  // 2. Apply color influence
  if (input.selectedColors && Array.isArray(input.selectedColors)) {
    const activeGenreMap = direction === "shift" ? shiftedColorGenreMap : colorGenreMap;
    const activeKeywordMap = direction === "shift" ? shiftedColorKeywordMap : colorKeywordMap;

    for (const color of input.selectedColors) {
      if (color && color.id) {
        const mappedGenres = activeGenreMap[color.id] || [];
        mappedGenres.forEach((g) => genres.add(g));

        const mappedKeywords = activeKeywordMap[color.id] || [];
        mappedKeywords.forEach((kw) => keywordSearchTerms.push(kw));
      }
    }
  }

  // 3. Apply Intensity influence on dynamic search pool (utilizing potentially shifted intensity)
  if (intensity <= 35) {
    genres.add(35); // Comedy
    genres.add(10751); // Family
    keywordSearchTerms.push("comforting", "low stakes", "feel-good");
  } else if (intensity >= 65) {
    genres.add(28); // Action
    genres.add(53); // Thriller
    genres.add(80); // Crime
    keywordSearchTerms.push("suspense", "intense", "thrilling", "dark");
  }

  // 4. Tone Mapping
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

  // 5. Pace Mapping
  if (pace <= 40) {
    keywordSearchTerms.push("slow cinema", "contemplative", "art house");
    forceSortBy = "vote_average.desc";
  } else if (pace >= 60) {
    genres.add(28); // Action
    keywordSearchTerms.push("adrenaline", "fast-paced", "heist", "chase");
    forceSortBy = "popularity.desc";
  }

  // 6. Complexity Mapping
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
    throw error;
  }

  return allResults.filter(uniqueById);
}

async function toRecommendation(movie: TmdbMovie, input: MoodInput, wildcard: boolean): Promise<Recommendation> {
  const [detail, videos, credits, watchData] = await Promise.all([
    tmdb<TmdbMovieDetail>(`/movie/${movie.id}?language=en-US`),
    tmdb<TmdbList<{ key: string; site: string; type: string; official?: boolean; name: string }>>(
      `/movie/${movie.id}/videos?language=en-US`,
    ),
    tmdb<TmdbCredits>(`/movie/${movie.id}/credits?language=en-US`).catch(() => ({ cast: [], crew: [] })),
    tmdb<TmdbWatchProvidersResults>(`/movie/${movie.id}/watch/providers`).catch(() => ({} as TmdbWatchProvidersResults)),
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
    .map((c) => ({
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
  const providers = providerList.slice(0, 3).map((p) => ({
    name: p.provider_name,
    logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`,
  }));

  const title = detail.title || movie.title;
  const matchScore = scoreMovie(movie, input);
  const matchChips = buildMatchChips(movie, input, wildcard, matchScore);
  const reason = reasonFor(title, input, genres, wildcard);

  return {
    id: movie.id,
    title,
    year: (detail.release_date || movie.release_date || "----").slice(0, 4),
    runtime: detail.runtime || null,
    poster: detail.poster_path ? `${imageBase}${detail.poster_path}` : null,
    genres: buildVibeTags(genres, input),
    matchScore,
    reason,
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
    matchChips,
  };
}

// Removed unused keywordsForTone function to keep codebase compact.

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

// Removed unused genresForMood, scoreAndPick, and interleave functions to keep codebase compact.

function scoreMovie(movie: TmdbMovie, input: MoodInput) {
  const vote = movie.vote_average || 6.5;
  const popularity = Math.min(movie.popularity || 20, 260);
  const base = 62 + (vote - 5.8) * 6 + popularity / 22;
  let tone = input.sliders?.tone ?? 50;
  const pace = input.sliders?.pace ?? 50;
  let complexity = input.sliders?.complexity ?? 50;
  let intensity = input.sliders?.intensity ?? 50;

  const direction = input.direction ?? "reflect";

  if (direction === "shift") {
    const colorIds = input.selectedColors?.map((c) => c.id) || [];
    const hasDark = colorIds.some((id) => ["charcoal", "red"].includes(id));
    const hasLight = colorIds.some((id) => ["pale-yellow", "warm-amber", "rose"].includes(id));
    const hasBlueGray = colorIds.some((id) => ["deep-blue", "gray", "teal", "muted-green", "violet"].includes(id));

    if (hasDark) {
      tone = Math.min(100, tone + 30);
      intensity = Math.max(0, intensity - 25);
    }
    if (hasLight) {
      complexity = Math.min(100, complexity + 30);
      tone = Math.max(0, tone - 20);
    }
    if (hasBlueGray) {
      tone = Math.min(100, tone + 25);
      intensity = Math.min(100, intensity + 15);
    }
  }

  const toneBoost = tone > 55 && movie.genre_ids?.some((id) => [35, 12, 16, 10751].includes(id)) ? 5 : 0;
  const darkBoost = tone < 46 && movie.genre_ids?.some((id) => [53, 80, 9648, 18].includes(id)) ? 5 : 0;
  const paceBoost = pace > 55 && movie.genre_ids?.some((id) => [28, 53, 12].includes(id)) ? 4 : 0;
  const complexityBoost = complexity > 55 && movie.genre_ids?.some((id) => [878, 9648].includes(id)) ? 4 : 0;

  let intensityBoost = 0;
  if (intensity <= 35) {
    // Low intensity: Penalize heavy/intense genres, boost light/family/romance
    if (movie.genre_ids?.some((id) => [27, 53, 80, 28].includes(id))) {
      intensityBoost = -8;
    } else if (movie.genre_ids?.some((id) => [35, 10751, 10749].includes(id))) {
      intensityBoost = 6;
    }
  } else if (intensity >= 65) {
    // High intensity: Boost heavy/action/suspense genres
    if (movie.genre_ids?.some((id) => [27, 53, 80, 28].includes(id))) {
      intensityBoost = 6;
    } else if (movie.genre_ids?.some((id) => [35, 10751].includes(id))) {
      intensityBoost = -4; // slightly penalize very light family/comedy
    }
  }

  return Math.max(76, Math.min(97, Math.round(base + toneBoost + darkBoost + paceBoost + intensityBoost + complexityBoost)));
}

function buildMatchChips(
  movie: unknown,
  input: MoodInput,
  wildcard: boolean,
  matchScore: number
): string[] {
  const chips: string[] = [];

  // 1. Mood Match (using colors)
  const colors = input.selectedColors || [];
  if (colors.length > 0) {
    chips.push(`Mood: ${colors.map((c) => c.name).join(" & ")}`);
  }

  // 2. Trajectory / Direction
  chips.push(input.direction === "shift" ? "Vibe Pivot" : "Vibe Echo");

  // 3. Narrative sliders (Tone/Pacing/Complexity/Intensity)
  const pace = input.sliders?.pace ?? 50;
  if (pace < 35) chips.push("Slow-Burn");
  else if (pace > 65) chips.push("High-Tempo");

  const tone = input.sliders?.tone ?? 50;
  if (tone < 35) chips.push("Visceral Tone");
  else if (tone > 65) chips.push("Luminous Tone");

  const complexity = input.sliders?.complexity ?? 50;
  if (complexity < 35) chips.push("Direct Plot");
  else if (complexity > 65) chips.push("Intricate Plot");

  // 4. Wildcard
  if (wildcard) {
    chips.push("Wildcard Pick");
  }

  // 5. Match/Quality Score
  chips.push(`${matchScore}% Match`);

  return chips.slice(0, 5); // Keep exactly 3-5 chips
}

function reasonFor(
  title: string,
  input: MoodInput,
  genres: string[],
  wildcard: boolean
): string {
  const colors = input.selectedColors || [];
  const colorNames = colors.map((c) => c.name).slice(0, 2).join(" and ") || "your color spectrum";
  const direction = input.direction ?? "reflect";

  let tone = input.sliders?.tone ?? 50;
  const pace = input.sliders?.pace ?? 50;
  let complexity = input.sliders?.complexity ?? 50;

  if (direction === "shift") {
    const colorIds = colors.map((c) => c.id);
    const hasDark = colorIds.some((id) => ["charcoal", "red"].includes(id));
    const hasLight = colorIds.some((id) => ["pale-yellow", "warm-amber", "rose"].includes(id));
    const hasBlueGray = colorIds.some((id) => ["deep-blue", "gray", "teal", "muted-green", "violet"].includes(id));

    if (hasDark) {
      tone = Math.min(100, tone + 30);
    }
    if (hasLight) {
      complexity = Math.min(100, complexity + 30);
      tone = Math.max(0, tone - 20);
    }
    if (hasBlueGray) {
      tone = Math.min(100, tone + 25);
    }
  }

  const paceText = pace > 58 ? "dynamic tempo" : "slow burn pacing";
  const toneText = tone > 58 ? "comforting luminosity" : "grave atmospheric shadows";
  const complexityText = complexity > 58 ? "intricate narrative depth" : "direct, engaging storytelling";

  if (wildcard) {
    return `Selected as a wildcard match for your ${colorNames} spectrum. Chosen specifically to disrupt standard scroll patterns by introducing ${title} as a fresh narrative route.`;
  }

  if (direction === "shift") {
    return `Highly tailored for your vibe trajectory. We mapped your ${colorNames} mood and steered the tone of ${title} toward ${toneText} to successfully pivot your emotional state.`;
  }

  return `Chosen to mirror your current state. Maps directly to your ${colorNames} selection, delivering a ${paceText} and ${toneText} with ${complexityText} to reflect your frequency.`;
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
