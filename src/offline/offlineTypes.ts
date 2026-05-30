export type OfflineMovie = {
  id: number;
  title: string;
  year: string;
  runtime: number;
  poster: string;
  backdrop: string;
  genres: string[];
  overview: string;
  rating: number;
  votes: number;
  director: string;
  writer: string;
  cast: { id: number; name: string; character: string; profilePath: string | null }[];
  providers: { name: string; logo: string }[];
  trailerKey: string;
  idealSliders: { pace: number; tone: number; complexity: number; intensity: number };
  idealColors: string[];
};
