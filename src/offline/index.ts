import { offlineMovies } from "./offlineMovies";
import { scoreOfflineMovie, buildOfflineMatchChips, reasonForOfflineMovie } from "./offlineScoring";
import type { OfflineMovie } from "./offlineTypes";

export { offlineMovies, scoreOfflineMovie, buildOfflineMatchChips, reasonForOfflineMovie };
export type { OfflineMovie };

export function getOfflineRecommendations(
  selectedColors: { id: string; name: string; tags: string[] }[],
  direction: "reflect" | "shift",
  sliders: { pace: number; tone: number; complexity: number; intensity: number },
  excludeIds: number[] = []
) {
  const colorIds = selectedColors.map((c) => c.id);

  const scored = offlineMovies.map((movie) => {
    const score = scoreOfflineMovie(movie, colorIds, direction, sliders);
    return { ...movie, score };
  });

  const filtered = scored.filter((movie) => !excludeIds.includes(movie.id));

  const sorted = filtered.sort((a, b) => b.score - a.score);

  const topCandidates = sorted.slice(0, 8);
  
  const bestMatch = topCandidates[0];
  const remaining = topCandidates.slice(1);
  
  const shuffled = [...remaining].sort(() => Math.random() - 0.5);
  
  const selectedCandidates = [bestMatch, ...shuffled].slice(0, 5).filter(Boolean);

  const finalFive = selectedCandidates.length >= 5 ? selectedCandidates : sorted.slice(0, 5);

  return finalFive.map((movie, index) => {
    const wildcard = index === 4;
    const score = movie.score;
    const reason = reasonForOfflineMovie(movie, selectedColors, direction, sliders, wildcard);
    const matchChips = buildOfflineMatchChips(selectedColors, direction, sliders, wildcard, score);
    
    const moodTags = selectedColors.flatMap((c) => c.tags).slice(0, 2);
    const finalVibeTags = [...new Set([...movie.genres.slice(0, 2), ...moodTags])].slice(0, 4);

    return {
      id: movie.id,
      title: movie.title,
      year: movie.year,
      runtime: movie.runtime,
      poster: movie.poster,
      backdrop: movie.backdrop,
      genres: finalVibeTags,
      matchScore: score,
      reason: reason,
      trailerKey: movie.trailerKey,
      wildcard: wildcard,
      overview: movie.overview,
      director: movie.director,
      writer: movie.writer,
      cast: movie.cast,
      rating: movie.rating,
      votes: movie.votes,
      providers: movie.providers,
      isOffline: true,
      matchChips
    };
  });
}
