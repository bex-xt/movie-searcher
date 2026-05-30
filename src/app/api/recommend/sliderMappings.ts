import type { MoodInput } from "./tmdbTypes";
import { keywordId } from "./tmdbClient";
import { keywordIdDictionary } from "./keywordDictionary";

export async function buildDiscoverParamsRelaxed(
  input: MoodInput,
  relaxationLevel: number,
  seedInfo?: { directorId: number | null; genreIds: number[]; keywordIds: number[] },
  isModern: boolean = true
): Promise<URLSearchParams> {
  const mapping = await getSliderMappings(input);
  const defaultSortBy = isModern ? "vote_count.desc" : "vote_average.desc";
  const sortBy = mapping.forceSortBy || defaultSortBy;

  const intensity = input.sliders?.intensity ?? 50;
  let withoutGenres = "16";
  if (intensity <= 35) {
    withoutGenres += "|27|53";
  }

  let minVoteCount = "150";
  if (intensity >= 65 && relaxationLevel === 0) {
    minVoteCount = "250";
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
    without_keywords: "210024|6513|297442",
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

export async function getSliderMappings(input: MoodInput) {
  let tone = input.sliders?.tone ?? 50;
  const pace = input.sliders?.pace ?? 50;
  let complexity = input.sliders?.complexity ?? 50;
  let intensity = input.sliders?.intensity ?? 50;

  const genres = new Set<number>();
  const keywordSearchTerms: string[] = [];
  const keywordIds = new Set<number>();
  let forceSortBy: string | null = null;

  const direction = input.direction ?? "reflect";

  const colorGenreMap: Record<string, number[]> = {
    "deep-blue": [18, 9648],
    "muted-green": [18, 12],
    "warm-amber": [35, 10749],
    "red": [28, 53],
    "violet": [878, 14, 9648],
    "gray": [18, 80],
    "pale-yellow": [35, 10751],
    "charcoal": [53, 80, 27],
    "rose": [10749, 18],
    "teal": [9648, 878],
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

  if (intensity <= 35) {
    genres.add(35);
    genres.add(10751);
    keywordSearchTerms.push("comforting", "low stakes", "feel-good");
  } else if (intensity >= 65) {
    genres.add(28);
    genres.add(53);
    genres.add(80);
    keywordSearchTerms.push("suspense", "intense", "thrilling", "dark");
  }

  if (tone <= 30) {
    genres.add(27);
    genres.add(53);
    [10292, 284439, 10933, 197682, 12377].forEach((id) => keywordIds.add(id));
  } else if (tone <= 60) {
    genres.add(18);
    genres.add(80);
    keywordSearchTerms.push("dark", "dystopia", "gritty", "psychological thriller");
  } else if (tone <= 85) {
    genres.add(35);
    keywordSearchTerms.push("humor", "parody", "lighthearted", "witty");
  } else {
    genres.add(35);
    genres.add(10749);
    [1115, 1931, 33637].forEach((id) => keywordIds.add(id));
  }

  if (pace <= 40) {
    keywordSearchTerms.push("slow cinema", "contemplative", "art house");
    forceSortBy = "vote_average.desc";
  } else if (pace >= 60) {
    genres.add(28);
    keywordSearchTerms.push("adrenaline", "fast-paced", "heist", "chase");
    forceSortBy = "popularity.desc";
  }

  if (complexity <= 40) {
    genres.add(35);
    genres.add(10749);
    keywordSearchTerms.push("comforting", "predictable");
  } else if (complexity >= 60) {
    genres.add(878);
    genres.add(9648);
    [1119, 12554, 10883].forEach((id) => keywordIds.add(id));
    keywordSearchTerms.push("complex plot");
  }

  if (keywordSearchTerms.length > 0) {
    try {
      const resolved = await Promise.all(
        keywordSearchTerms.map((term) => {
          // Check the static dictionary first — avoids a live network call
          const cached = keywordIdDictionary[term.toLowerCase()];
          if (cached !== undefined) return Promise.resolve(cached);
          // Fall back to live TMDB keyword search for anything not pre-resolved
          return keywordId(term);
        })
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
