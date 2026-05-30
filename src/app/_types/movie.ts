export type Direction = "reflect" | "shift";

export type MoodColor = {
  id: string;
  name: string;
  hex: string;
  tags: string[];
};

export type MoodSliders = {
  pace: number;
  tone: number;
  complexity: number;
  intensity: number;
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
  providers?: {
    name: string;
    logo: string;
  }[];
  isOffline?: boolean;
  matchChips?: string[];
};

export type SavedMovie = Recommendation & {
  savedAt?: number;
};
