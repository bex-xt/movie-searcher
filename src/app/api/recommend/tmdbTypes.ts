export type MoodInput = {
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

export interface TmdbMovieDetail {
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

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string | null;
}

export interface TmdbCredits {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbKeyword {
  id: number;
  name: string;
}

export interface TmdbKeywordsList {
  keywords?: TmdbKeyword[];
}

export interface TmdbWatchProvider {
  provider_name: string;
  logo_path: string;
}

export interface TmdbWatchProvidersResults {
  results?: {
    US?: {
      flatrate?: TmdbWatchProvider[];
      rent?: TmdbWatchProvider[];
      buy?: TmdbWatchProvider[];
    };
  };
}

export type TmdbMovie = {
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

export type TmdbList<T> = {
  page: number;
  results: T[];
  total_results: number;
  total_pages: number;
};

export type Recommendation = {
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

export const genreNames: Record<number, string> = {
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

export const imageBase = "https://image.tmdb.org/t/p/w500";
