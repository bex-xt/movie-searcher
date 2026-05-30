import { useState, useEffect } from "react";
import type { Recommendation, MoodColor, Direction } from "@/app/_types/movie";
import { getOfflineRecommendations } from "@/offlinePool";
import { moodColors, loadingMessages } from "@/app/_data/moodConfig";

export function useRecommendations(
  selectedColors: string[],
  direction: Direction,
  sliders: { pace: number; tone: number; complexity: number; intensity: number },
  setStep: (step: number) => void,
  setLastVibe: (vibe: {
    selectedColors: string[];
    direction: Direction;
    sliders: { pace: number; tone: number; complexity: number; intensity: number };
  } | null) => void

) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [activeMovie, setActiveMovie] = useState<Recommendation | null>(null);
  const [activeTrailer, setActiveTrailer] = useState<Recommendation | null>(null);
  const [excludeIds, setExcludeIds] = useState<number[]>([]);
  const [contextualLoadingText, setContextualLoadingText] = useState("");
  const [isRequestSlow, setIsRequestSlow] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1300);
    return () => clearInterval(interval);
  }, [loading]);

  async function retryConnection() {
    setIsOfflineMode(false);
    await getRecommendations();
  }

  function toUserFriendlyError(err: unknown): string {
    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      if (msg.includes("credentials") || msg.includes("tmdb") || msg.includes("api_key") || msg.includes("token")) {
        return "Connection to our movie service is temporarily unavailable. Please verify server configuration settings and try again.";
      }
      if (msg.includes("failed to fetch") || msg.includes("network") || msg.includes("timeout")) {
        return "Network connection issues detected. Please check your internet connection and try again.";
      }
      return err.message;
    }
    return "We encountered an unexpected glitch while curating your movies. Please try again.";
  }

  function triggerOfflineFallback() {
    setIsRequestSlow(false);
    setLoading(false);
    try {
      const fallbackColors = selectedColors
        .map((id) => moodColors.find((color) => color.id === id))
        .filter(Boolean) as MoodColor[];
      const recs = getOfflineRecommendations(fallbackColors, direction, sliders, []);
      setRecommendations(recs);
      setIsOfflineMode(true);
      setExcludeIds(recs.map((m) => m.id));
      setStep(4);
    } catch {
      setError("Unable to generate alternative picks offline.");
    }
  }

  async function getRecommendations() {
    if (selectedColors.length < 2) {
      setError("Please select at least two mood colors to calibrate your vibe.");
      return;
    }

    setLoading(true);
    setError("");
    setRecommendations([]);
    setExcludeIds([]);
    setIsRequestSlow(false);
    setStep(4);

    const slowTimeout = setTimeout(() => {
      setIsRequestSlow(true);
    }, 7000);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedColors: selectedColors.map((id) => moodColors.find((color) => color.id === id)),
          direction,
          sliders: {
            pace: Math.min(100, Math.max(0, sliders.pace)),
            tone: Math.min(100, Math.max(0, sliders.tone)),
            complexity: Math.min(100, Math.max(0, sliders.complexity)),
            intensity: Math.min(100, Math.max(0, sliders.intensity)),
          },
          exclude_ids: [],
        }),
      });

      const data = (await response.json()) as { recommendations?: Recommendation[]; error?: string; isOffline?: boolean };
      if (!response.ok) throw new Error(data.error || "Recommendation service failed.");

      const recs = data.recommendations || [];
      setRecommendations(recs);
      setIsOfflineMode(!!data.isOffline);
      setExcludeIds(recs.map((m) => m.id));

      try {
        const payload = { selectedColors, direction, sliders };
        localStorage.setItem("netflix_de_syndrome_last_vibe", JSON.stringify(payload));
        setLastVibe(payload);
      } catch (e) {
        console.error("Failed to save vibe to localStorage", e);
      }
    } catch (caught) {
      console.warn("Client network request failed. Triggering offline fallback curation:", caught);
      try {
        const fallbackColors = selectedColors
          .map((id) => moodColors.find((color) => color.id === id))
          .filter(Boolean) as MoodColor[];
        const recs = getOfflineRecommendations(fallbackColors, direction, sliders, []);
        setRecommendations(recs);
        setIsOfflineMode(true);
        setExcludeIds(recs.map((m) => m.id));
      } catch {
        setError(toUserFriendlyError(caught));
      }
    } finally {
      clearTimeout(slowTimeout);
      setLoading(false);
      setIsRequestSlow(false);
    }
  }

  async function fetchMoreRecommendations() {
    if (selectedColors.length < 2) return;

    setLoadingMore(true);
    setError("");

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedColors: selectedColors.map((id) => moodColors.find((color) => color.id === id)),
          direction,
          sliders: {
            pace: Math.min(100, Math.max(0, sliders.pace)),
            tone: Math.min(100, Math.max(0, sliders.tone)),
            complexity: Math.min(100, Math.max(0, sliders.complexity)),
            intensity: Math.min(100, Math.max(0, sliders.intensity)),
          },
          exclude_ids: excludeIds,
        }),
      });

      const data = (await response.json()) as { recommendations?: Recommendation[]; error?: string; isOffline?: boolean };
      if (!response.ok) throw new Error(data.error || "Recommendation service failed.");

      const recs = data.recommendations || [];
      if (recs.length === 0) {
        setRecommendations([]);
      } else {
        setRecommendations(recs);
        setIsOfflineMode(!!data.isOffline);
        setExcludeIds((prev) => [...prev, ...recs.map((m) => m.id)]);
      }
    } catch (caught) {
      console.warn("Client network request failed during show more. Falling back to offline:", caught);
      try {
        const fallbackColors = selectedColors
          .map((id) => moodColors.find((color) => color.id === id))
          .filter(Boolean) as { id: string; name: string; tags: string[] }[];
        const recs = getOfflineRecommendations(fallbackColors, direction, sliders, excludeIds);
        if (recs.length === 0) {
          setRecommendations([]);
        } else {
          setRecommendations(recs);
          setIsOfflineMode(true);
          setExcludeIds((prev) => [...prev, ...recs.map((m) => m.id)]);
        }
      } catch {
        setError("Unable to generate alternative picks offline.");
      }
    } finally {
      setLoadingMore(false);
    }
  }

  async function exploreMoreLikeThis(seedMovie: Recommendation) {
    setActiveMovie(null);
    const loadingText = `Finding more films similar to ${seedMovie.title}...`;
    setContextualLoadingText(loadingText);
    setLoading(true);
    setError("");

    const currentIds = recommendations.map((m) => m.id);
    const updatedExcludeIds = Array.from(new Set([...excludeIds, ...currentIds]));
    setExcludeIds(updatedExcludeIds);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedColors: selectedColors.map((id) => moodColors.find((color) => color.id === id)),
          direction,
          sliders: {
            pace: Math.min(100, Math.max(0, sliders.pace)),
            tone: Math.min(100, Math.max(0, sliders.tone)),
            complexity: Math.min(100, Math.max(0, sliders.complexity)),
            intensity: Math.min(100, Math.max(0, sliders.intensity)),
          },
          exclude_ids: updatedExcludeIds,
          seed_movie_id: seedMovie.id,
        }),
      });

      const data = (await response.json()) as { recommendations?: Recommendation[]; error?: string; isOffline?: boolean };
      if (!response.ok) throw new Error(data.error || "Contextual recommendation failed.");

      const recs = data.recommendations || [];
      setRecommendations(recs);
      setIsOfflineMode(!!data.isOffline);
      setExcludeIds((prev) => Array.from(new Set([...prev, ...recs.map((m) => m.id)])));
      setStep(4);
    } catch (caught) {
      console.warn("Client network request failed during explore. Falling back to offline:", caught);
      try {
        const fallbackColors = selectedColors
          .map((id) => moodColors.find((color) => color.id === id))
          .filter(Boolean) as { id: string; name: string; tags: string[] }[];
        const recs = getOfflineRecommendations(fallbackColors, direction, sliders, updatedExcludeIds);
        setRecommendations(recs);
        setIsOfflineMode(true);
        setExcludeIds((prev) => Array.from(new Set([...prev, ...recs.map((m) => m.id)])));
        setStep(4);
      } catch {
        setError(toUserFriendlyError(caught));
      }
    } finally {
      setLoading(false);
      setContextualLoadingText("");
    }
  }

  return {
    recommendations,
    loading,
    loadingMore,
    error,
    setError,
    activeMovie,
    setActiveMovie,
    activeTrailer,
    setActiveTrailer,
    excludeIds,
    contextualLoadingText,
    isRequestSlow,
    loadingMessageIndex,
    isOfflineMode,
    retryConnection,
    triggerOfflineFallback,
    getRecommendations,
    fetchMoreRecommendations,
    exploreMoreLikeThis,
  };
}
