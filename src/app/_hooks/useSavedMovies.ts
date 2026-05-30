import { useState, useEffect } from "react";
import type { SavedMovie, Recommendation } from "@/app/_types/movie";

export function useSavedMovies() {
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [showSavedPanel, setShowSavedPanel] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem("netflix_de_syndrome_saved_movies");
        if (stored) setSavedMovies(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load saved movies", e);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function persistSavedMovies(movies: SavedMovie[]) {
    setSavedMovies(movies);
    try {
      localStorage.setItem("netflix_de_syndrome_saved_movies", JSON.stringify(movies));
    } catch (e) {
      console.error("Failed to persist saved movies", e);
    }
  }

  function isMovieSaved(movieId: number) {
    return savedMovies.some((m) => m.id === movieId);
  }

  function toggleSaveMovie(movie: Recommendation) {
    if (isMovieSaved(movie.id)) {
      persistSavedMovies(savedMovies.filter((m) => m.id !== movie.id));
    } else {
      persistSavedMovies([{ ...movie, savedAt: Date.now() }, ...savedMovies]);
    }
  }

  function removeSavedMovie(movieId: number) {
    persistSavedMovies(savedMovies.filter((m) => m.id !== movieId));
  }

  return {
    savedMovies,
    showSavedPanel,
    setShowSavedPanel,
    isMovieSaved,
    toggleSaveMovie,
    removeSavedMovie,
  };
}
