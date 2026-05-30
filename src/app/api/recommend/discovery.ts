import type {
  MoodInput,
  TmdbMovie,
  TmdbMovieDetail,
  TmdbCredits,
  TmdbKeywordsList,
  TmdbWatchProvidersResults,
  TmdbList,
  Recommendation,
} from "./tmdbTypes";
import { genreNames, imageBase } from "./tmdbTypes";
import { tmdb, assertTmdbCredentials } from "./tmdbClient";
import { scoreMovie, buildMatchChips, reasonFor, buildVibeTags } from "./scoring";
import { buildDiscoverParamsRelaxed } from "./sliderMappings";

export async function buildRecommendations(
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

export async function discoverPool(
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

export async function toRecommendation(movie: TmdbMovie, input: MoodInput, wildcard: boolean): Promise<Recommendation> {
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

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function uniqueById<T extends { id: number }>(movie: T, index: number, array: T[]) {
  return array.findIndex((item) => item.id === movie.id) === index;
}
