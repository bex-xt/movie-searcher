"use client";

/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  Brain,
  Check,
  ChevronRight,
  Clapperboard,
  Compass,
  Eye,
  Film,
  Laugh,
  Play,
  Scale,
  Skull,
  Sliders,
  Smile,
  Sparkles,
  Star,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { getOfflineRecommendations } from "@/offlinePool";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

type Direction = "reflect" | "shift";

type MoodColor = {
  id: string;
  name: string;
  hex: string;
  tags: string[];
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
  providers?: {
    name: string;
    logo: string;
  }[];
  isOffline?: boolean;
  matchChips?: string[];
};

type SavedMovie = Recommendation & {
  savedAt?: number;
};

const moodColors: MoodColor[] = [
  { id: "deep-blue", name: "Deep blue", hex: "#1d3557", tags: ["reflective", "lonely", "calm", "cerebral"] },
  { id: "muted-green", name: "Muted green", hex: "#8bb596", tags: ["grounded", "healing", "quiet", "natural"] },
  { id: "warm-amber", name: "Warm amber", hex: "#c88b4a", tags: ["nostalgic", "cozy", "hopeful"] },
  { id: "red", name: "Red", hex: "#b52b2b", tags: ["intense", "restless", "passionate"] },
  { id: "violet", name: "Violet", hex: "#74509a", tags: ["surreal", "mysterious", "dreamlike"] },
  { id: "gray", name: "Gray", hex: "#7a7f7b", tags: ["numb", "tired", "serious", "low-energy"] },
  { id: "pale-yellow", name: "Bright yellow", hex: "#f0d66f", tags: ["optimistic", "light", "playful"] },
  { id: "charcoal", name: "Charcoal", hex: "#202020", tags: ["dark", "tense", "brooding", "serious"] },
  { id: "rose", name: "Dusty rose", hex: "#b2777d", tags: ["tender", "romantic", "soft"] },
  { id: "teal", name: "Night teal", hex: "#2e716f", tags: ["curious", "moody", "atmospheric"] },
];

const sliderCopy = {
  pace: ["Deliberate / Slow-Burn", "Dynamic / High-Tempo", "meditative vs high-velocity"],
  tone: ["Visceral / Shadowed", "Luminous / Uplifting", "dark atmospheric vs warm comforting"],
  complexity: ["Direct / Uncomplicated", "Intricate / Mind-Bending", "straightforward narrative vs deep enigma"],
  intensity: ["Subtle / Low-Stakes", "Profound / High-Stakes", "gentle ambiance vs heavy emotional impact"],
};

const presets = [
  {
    label: "Cozy & Feel-Good",
    icon: Smile,
    values: { tone: 95, pace: 30, complexity: 15, intensity: 10 },
  },
  {
    label: "Pure Comedy",
    icon: Laugh,
    values: { tone: 85, pace: 70, complexity: 20, intensity: 40 },
  },
  {
    label: "Adrenaline Action",
    icon: Zap,
    values: { tone: 40, pace: 95, complexity: 20, intensity: 90 },
  },
  {
    label: "Psychological Thriller",
    icon: Eye,
    values: { tone: 25, pace: 40, complexity: 85, intensity: 80 },
  },
  {
    label: "Ruthless Gore",
    icon: Skull,
    values: { tone: 5, pace: 50, complexity: 30, intensity: 100 },
  },
  {
    label: "Mind-Bending Sci-Fi",
    icon: Brain,
    values: { tone: 45, pace: 50, complexity: 95, intensity: 60 },
  },
  {
    label: "Slow-Burn Art-House",
    icon: Clapperboard,
    values: { tone: 50, pace: 10, complexity: 80, intensity: 20 },
  },
  {
    label: "Gritty Crime Drama",
    icon: Scale,
    values: { tone: 20, pace: 60, complexity: 60, intensity: 70 },
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(12px)" },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: index * 0.09, duration: 0.62, ease: "easeOut" },
  }),
};

function getVibeLabel(key: string, value: number): string {
  const labels: Record<string, [string, string, string]> = {
    pace: ["slow burn", "balanced pace", "fast-moving"],
    tone: ["dark", "balanced tone", "comforting"],
    complexity: ["easy watch", "moderate depth", "mind-bending"],
    intensity: ["low-stakes", "moderate stakes", "heavy"],
  };
  const [low, mid, high] = labels[key] || ["low", "mid", "high"];
  if (value < 35) return low;
  if (value > 65) return high;
  return mid;
}

const loadingMessages = [
  "Reading your mood profile...",
  "Analyzing color spectrum parameters...",
  "Balancing tone and pacing algorithms...",
  "Sculpting narrative texture complexity...",
  "Optimizing cinematic emotional resonance...",
  "Eliminating infinite scroll parameters...",
  "Bypassing decision fatigue syndromics...",
  "Curating exactly five high-caliber matches..."
];

function formatSavedAt(timestamp?: number): string {
  if (!timestamp) return "Saved recently";
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Saved just now";
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `Saved ${mins} min${mins === 1 ? "" : "s"} ago`;
  }
  if (diff < 86400000) {
    const hrs = Math.floor(diff / 3600000);
    return `Saved ${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  }
  const date = new Date(timestamp);
  return `Saved on ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [direction, setDirection] = useState<Direction>("reflect");
  const [sliders, setSliders] = useState({ pace: 45, tone: 58, complexity: 48, intensity: 42 });
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  async function retryConnection() {
    setIsOfflineMode(false);
    await getRecommendations();
  }

  const [lastVibe, setLastVibe] = useState<{
    selectedColors: string[];
    direction: Direction;
    sliders: { pace: number; tone: number; complexity: number; intensity: number };
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("netflix_de_syndrome_last_vibe");
        if (saved) {
          setLastVibe(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load last vibe", e);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function restoreLastVibe() {
    if (!lastVibe) return;
    setSelectedColors(lastVibe.selectedColors);
    setDirection(lastVibe.direction);
    setSliders(lastVibe.sliders);
    setStep(3);
  }

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

  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [showSavedPanel, setShowSavedPanel] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem("netflix_de_syndrome_saved_movies");
        if (stored) {
          setSavedMovies(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load saved movies", e);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1300);
    return () => clearInterval(interval);
  }, [loading]);

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
      const saved: SavedMovie = {
        ...movie,
        // eslint-disable-next-line react-hooks/purity
        savedAt: Date.now(),
      };
      persistSavedMovies([saved, ...savedMovies]);
    }
  }

  function removeSavedMovie(movieId: number) {
    persistSavedMovies(savedMovies.filter((m) => m.id !== movieId));
  }

  const activeMood = useMemo(
    () => moodColors.find((color) => color.id === selectedColors[selectedColors.length - 1]) || moodColors[2],
    [selectedColors],
  );

  const selectedMoodTags = useMemo(
    () =>
      moodColors
        .filter((color) => selectedColors.includes(color.id))
        .flatMap((color) => color.tags)
        .slice(0, 6),
    [selectedColors],
  );

  const selectedColorObjects = useMemo(
    () =>
      selectedColors
        .map((id) => moodColors.find((color) => color.id === id))
        .filter(Boolean) as MoodColor[],
    [selectedColors],
  );

  const shellStyle = useMemo(
    () =>
      ({
        "--accent": activeMood.hex,
        "--accent-rgb": hexToRgb(activeMood.hex),
      }) as CSSProperties,
    [activeMood.hex],
  );

  function toggleColor(id: string) {
    setSelectedColors((current) => {
      if (current.includes(id)) return current.filter((color) => color !== id);
      if (current.length === 2) return [current[1], id];
      return [...current, id];
    });
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
      const recs = getOfflineRecommendations(
        fallbackColors,
        direction,
        sliders,
        []
      );
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
    setStep(4); // Immediate transition to Step 4 results view with skeletons visible

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
        localStorage.setItem(
          "netflix_de_syndrome_last_vibe",
          JSON.stringify({
            selectedColors,
            direction,
            sliders,
          })
        );
        setLastVibe({ selectedColors, direction, sliders });
      } catch (e) {
        console.error("Failed to save vibe to localStorage", e);
      }
    } catch (caught) {
      console.warn("Client network request failed. Triggering offline fallback curation:", caught);
      try {
        const fallbackColors = selectedColors
          .map((id) => moodColors.find((color) => color.id === id))
          .filter(Boolean) as MoodColor[];
        const recs = getOfflineRecommendations(
          fallbackColors,
          direction,
          sliders,
          []
        );
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
        const recs = getOfflineRecommendations(
          fallbackColors,
          direction,
          sliders,
          excludeIds
        );
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
        const recs = getOfflineRecommendations(
          fallbackColors,
          direction,
          sliders,
          updatedExcludeIds
        );
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

  return (
    <main style={shellStyle} className="min-h-screen overflow-x-hidden text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-3 pb-8 pt-4 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-8 flex items-center justify-between border-b border-white/[0.04] py-3 sm:mb-16 sm:py-4">
          <BrandAnimation />
          <button
            onClick={() => setShowSavedPanel(true)}
            className="relative flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-400 backdrop-blur-md transition hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-zinc-200"
          >
            <Bookmark size={14} className={savedMovies.length > 0 ? "text-[color:var(--accent)] fill-[color:var(--accent)]" : ""} />
            Saved
            {savedMovies.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--accent)] text-[10px] font-bold text-black">
                {savedMovies.length}
              </span>
            )}
          </button>
        </header>

        <div className="w-full flex-1 py-3 sm:py-8">
          {step > 0 && <ProgressIndicator step={step} setStep={setStep} />}
          <section className="flex min-h-[calc(100svh-9rem)] flex-col justify-start pt-14 sm:min-h-[72vh] sm:justify-center sm:pt-0">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <OpeningPanel
                  key="opening"
                  onStart={() => setStep(1)}
                  lastVibe={lastVibe}
                  onUseLastVibe={restoreLastVibe}
                />
              )}
              {step === 1 && (
                <StepCard
                  key="colors"
                  eyebrow="Calibration • Step 1"
                  title="Select two colors that mirror your current emotional spectrum."
                  onBack={() => setStep(0)}
                  action={
                    <button
                      disabled={selectedColors.length < 2}
                      onClick={() => setStep(2)}
                      className="rounded-full bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_28px_rgb(var(--accent-rgb)/0.22)] disabled:cursor-not-allowed disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Confirm Spectrum
                    </button>
                  }
                >
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-5">
                    {moodColors.map((color) => {
                      const selected = selectedColors.includes(color.id);
                      return (
                        <button
                          key={color.id}
                          onClick={() => toggleColor(color.id)}
                          className={`group min-h-28 rounded-[18px] border p-2.5 text-left backdrop-blur-xl transition duration-300 hover:-translate-y-1 sm:min-h-32 sm:rounded-[20px] sm:p-3 ${
                            selected
                              ? "border-[color:var(--accent)]/70 bg-white/[0.07] shadow-[0_0_36px_rgb(var(--accent-rgb)/0.18)]"
                              : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
                          }`}
                        >
                          <motion.div
                            animate={{ scale: selected ? 1.04 : 1 }}
                            className="mb-3 h-12 rounded-2xl shadow-inner shadow-white/10 sm:mb-4 sm:h-16"
                            style={{
                              background: `radial-gradient(circle at 25% 20%, rgba(255,255,255,.35), transparent 28%), linear-gradient(135deg, ${color.hex}, #050505)`,
                            }}
                          />
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-white/86 sm:text-sm">{color.name}</span>
                            {selected && <Check size={16} className="text-[color:var(--accent)]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </StepCard>
              )}

              {step === 2 && (
                <StepCard
                  key="direction"
                  eyebrow="Calibration • Step 2"
                  title="Choose your trajectory: Do you wish to reflect your mood or shift it?"
                  onBack={() => setStep(1)}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["reflect", "Echo My Vibe", "Lean into your current feeling. Let the cinema mirror your emotional state."],
                      ["shift", "Pivot My Vibe", "Gently steer your mood to a new cinematic frequency."],
                    ].map(([value, label, copy]) => (
                      <button
                        key={value}
                        onClick={() => {
                          setDirection(value as Direction);
                          setStep(3);
                        }}
                        className={`rounded-[24px] border p-6 text-left backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${
                          direction === value
                            ? "border-[color:var(--accent)] bg-white/[0.07] shadow-[0_0_44px_rgb(var(--accent-rgb)/0.18)]"
                            : "border-white/[0.08] bg-white/[0.03]"
                        }`}
                      >
                        <span className="mb-2 block font-serif text-2xl">{label}</span>
                        <span className="text-sm leading-6 text-white/58">{copy}</span>
                      </button>
                    ))}
                  </div>
                </StepCard>
              )}

              {step === 3 && (
                <StepCard
                  key="sliders"
                  eyebrow="Calibration • Step 3"
                  title="Sculpt the narrative texture."
                  onBack={() => setStep(2)}
                  action={
                    <button
                      onClick={getRecommendations}
                      disabled={loading}
                      className="inline-flex rounded-full bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_28px_rgb(var(--accent-rgb)/0.24)] disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? "Curating selection..." : "Reveal My Five"}
                    </button>
                  }
                >
                  <div className="mb-10">
                    <p className="mb-4 text-xs uppercase tracking-[0.18em] text-zinc-500 font-medium">Cinematic Archetypes</p>
                    <div 
                      className="-mx-3 flex snap-x gap-2.5 overflow-x-auto px-3 pb-3 scrollbar-hide sm:-mx-1 sm:gap-3.5 sm:px-1"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      {presets.map((preset) => {
                        const Icon = preset.icon;
                        const isActive =
                          sliders.tone === preset.values.tone &&
                          sliders.pace === preset.values.pace &&
                          sliders.complexity === preset.values.complexity &&
                          sliders.intensity === preset.values.intensity;

                        return (
                          <button
                            key={preset.label}
                            onClick={() => setSliders(preset.values)}
                            className={`relative flex min-h-11 snap-start items-center gap-2 whitespace-nowrap px-4 py-2.5 text-xs font-semibold transition-all glass-pill ${
                              isActive
                                ? "bg-white/[0.12] border-white/[0.4] text-zinc-50 shadow-[inset_0_1px_12px_rgba(255,255,255,0.08)] scale-[1.02]"
                                : "text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                            }`}
                          >
                            
                            <Icon size={14} className={isActive ? "text-[color:var(--accent)]" : "text-zinc-400"} />
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-8">
                    {Object.entries(sliderCopy).map(([key, labels]) => (
                      <Slider
                        key={key}
                        label={key}
                        left={labels[0]}
                        right={labels[1]}
                        helper={labels[2]}
                        value={sliders[key as keyof typeof sliders]}
                        onChange={(value) => setSliders((current) => ({ ...current, [key]: value }))}
                      />
                    ))}
                  </div>
                  {loading && <SkeletonGrid />}
                </StepCard>
              )}

              {step === 4 && (recommendations.length > 0 || loading) && (
                <motion.section key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  {isOfflineMode && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[24px] border border-amber-500/20 bg-amber-500/5 px-6 py-4 text-sm text-amber-200/90 backdrop-blur-xl"
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="text-amber-400 shrink-0 animate-pulse" size={18} />
                        <p className="leading-relaxed text-left">
                          <strong className="text-white font-semibold">Offline Picks Mode Active:</strong> We couldn&apos;t connect to the live database, but our offline matching engine has curated 5 premium films matching your vibe signature.
                        </p>
                      </div>
                      <button
                        onClick={retryConnection}
                        disabled={loading}
                        className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                      >
                        {loading ? "Re-connecting..." : "Retry Connection"}
                      </button>
                    </motion.div>
                  )}

                  {/* Results Dashboard Header */}
                  <div className="mb-8 grid gap-4 lg:grid-cols-12 lg:gap-6 lg:mb-10 items-stretch">
                    {/* Left Column: Heading and Rule of Five */}
                    <div className="lg:col-span-6 flex flex-col justify-between gap-6">
                      <div className="text-left">
                        <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[color:var(--accent)] font-semibold">The Curation</p>
                        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-zinc-50 text-balance">
                          Five Films.<br />Zero Scrolling.
                        </h1>
                      </div>

                      {/* Rule of Five Cognitive Explanation */}
                      <div className="relative overflow-hidden rounded-[22px] border border-white/[0.05] bg-white/[0.01] p-4 backdrop-blur-md shadow-md sm:rounded-[24px] sm:p-5">
                        {/* Light flare */}
                        <div className="absolute inset-0 rounded-[24px] border border-white/[0.03] border-t-white/[0.12] pointer-events-none" />
                        <div className="flex gap-3.5 items-start">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                            <Brain size={13} className="animate-pulse" />
                          </div>
                          <div className="text-left text-xs leading-relaxed text-zinc-400">
                            <p className="font-semibold text-zinc-200 text-sm tracking-tight mb-1">The Rule of Five Paradigm</p>
                            Cognitive science proves that choice paralysis sets in beyond five options. By curating exactly five highly-calibrated films, we bypass the endless scroll and eliminate decision fatigue completely.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Vibe Signature Dashboard */}
                    <div className="lg:col-span-6">
                      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-2xl shadow-xl h-full flex flex-col justify-between sm:rounded-[28px] sm:p-6">
                        {/* Accent glow behind */}
                        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[color:var(--accent)]/10 blur-3xl pointer-events-none" />
                        {/* Inner highlight border */}
                        <div className="absolute inset-0 rounded-[28px] border border-white/[0.02] border-t-white/[0.1] pointer-events-none" />

                        <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-5">
                          <div className="flex items-center gap-2">
                            <Sliders size={14} className="text-[color:var(--accent)]" />
                            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-300">Vibe Signature</h3>
                          </div>
                          <span className="flex items-center gap-1.5 rounded-full bg-[color:var(--accent)]/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[color:var(--accent)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] animate-ping" />
                            Calibrated
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 flex-grow">
                          {/* Spectrum */}
                          <div className="flex flex-col gap-2 text-left">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Mood Spectrum</span>
                            <div className="flex flex-col gap-2">
                              {selectedColorObjects.map((color) => (
                                <div
                                  key={color.id}
                                  className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] pl-2 pr-3 py-1.5 text-xs text-zinc-300 w-fit animate-fade-in"
                                >
                                  <span
                                    className="h-3 w-3 rounded-full border border-white/20 shrink-0"
                                    style={{
                                      background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.45), transparent), ${color.hex}`,
                                      boxShadow: `0 0 10px ${color.hex}60`
                                    }}
                                  />
                                  <span className="font-semibold text-xs leading-none">{color.name}</span>
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] text-zinc-500 font-medium italic mt-1 leading-tight truncate">
                              {selectedMoodTags.slice(0, 3).join(", ")}
                            </p>
                          </div>

                          {/* Trajectory */}
                          <div className="flex flex-col gap-2 text-left">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Trajectory</span>
                            <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3.5 py-1.5 text-xs text-zinc-200 font-semibold w-fit">
                              {direction === "reflect" ? (
                                <>
                                  <Eye size={12} className="text-[color:var(--accent)] animate-pulse" />
                                  <span>Echo Vibe</span>
                                </>
                              ) : (
                                <>
                                  <Compass size={12} className="text-[color:var(--accent)] animate-spin-slow" />
                                  <span>Pivot Vibe</span>
                                </>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-normal font-medium mt-1">
                              {direction === "reflect" ? "Mirroring and leaning into your current feelings." : "Steering mood toward new frequencies."}
                            </p>
                          </div>

                          {/* Narrative Sliders */}
                          <div className="col-span-2 flex flex-col gap-2 text-left sm:col-span-1">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Narrative Texture</span>
                            <div className="grid grid-cols-1 gap-2 bg-white/[0.02] border border-white/[0.04] p-3 rounded-2xl">
                              {[
                                ["Pace", sliders.pace, getVibeLabel("pace", sliders.pace)],
                                ["Tone", sliders.tone, getVibeLabel("tone", sliders.tone)],
                                ["Complexity", sliders.complexity, getVibeLabel("complexity", sliders.complexity)],
                                ["Intensity", sliders.intensity, getVibeLabel("intensity", sliders.intensity)],
                              ].map(([label, , vibe]) => (
                                <div key={label as string} className="flex items-center justify-between gap-2 text-[10px]">
                                  <span className="text-zinc-500 font-medium">{label as string}</span>
                                  <span className="font-bold text-zinc-200 capitalize truncate text-right">{(vibe as string).replace("-", " ")}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="curation-skeleton-loader"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="w-full text-left"
                      >
                        {/* Slow Request Alert */}
                        {isRequestSlow && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[24px] border border-amber-500/20 bg-amber-500/5 px-6 py-4 text-sm text-amber-200/90 backdrop-blur-xl"
                          >
                            <div className="flex items-center gap-3 text-left">
                              <Sparkles className="text-amber-400 shrink-0 animate-pulse" size={18} />
                              <div>
                                <strong className="text-white font-semibold block mb-0.5">Connection latency detected</strong>
                                <p className="text-xs text-amber-200/70 leading-relaxed">
                                  Curating live recommendations from TMDB is taking longer than expected. You can wait a bit longer, or activate our high-precision offline matching engine instantly.
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={triggerOfflineFallback}
                              className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/25 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                            >
                              Activate Offline Picks
                            </button>
                          </motion.div>
                        )}

                        {/* Dynamic Contextual / Cinematic Status Banner */}
                        <div className="flex flex-col items-center justify-center text-center py-10 px-6 rounded-[32px] border border-white/[0.04] bg-white/[0.01] w-full mb-8 overflow-hidden relative shadow-md">
                          <div className="relative mb-5 h-12 w-12 flex items-center justify-center rounded-full bg-[color:var(--accent)]/10 text-[color:var(--accent)] shadow-[0_0_15px_rgb(var(--accent-rgb)/0.15)] border border-[color:var(--accent)]/10">
                            <Sparkles className="animate-pulse" size={16} />
                          </div>
                          <h3 className="font-serif text-xl sm:text-2xl text-zinc-200 animate-pulse font-medium tracking-wide">
                            {contextualLoadingText || loadingMessages[loadingMessageIndex]}
                          </h3>
                          <p className="mt-2 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                            Synthesizing exact cinematic alignments
                          </p>
                        </div>

                        {/* Shimmering exact skeleton grid */}
                        <SkeletonGrid />
                      </motion.div>
                    ) : (
                      <motion.div
                        key={recommendations.map(m => m.id).join(",")}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4 }}
                         className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-5"
                      >
                        {recommendations.map((movie, index) => (
                          <MovieCard
                            key={movie.id}
                            movie={movie}
                            index={index}
                            onSelect={() => setActiveMovie(movie)}
                            isSaved={isMovieSaved(movie.id)}
                            onToggleSave={() => toggleSaveMovie(movie)}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!loading && (
                    <div className="mt-10 flex flex-col justify-center items-stretch gap-3 sm:mt-12 sm:flex-row sm:items-center sm:gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[color:var(--accent)] px-6 py-3.5 text-sm font-semibold text-black shadow-[0_0_24px_rgb(var(--accent-rgb)/0.2)] transition hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Sliders size={16} />
                        Recalibrate Vibe
                      </button>

                      <button
                        onClick={fetchMoreRecommendations}
                        disabled={loadingMore}
                        className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white/90 disabled:opacity-50"
                      >
                        <Sparkles size={16} className={loadingMore ? "animate-spin text-[color:var(--accent)]" : "text-white/40"} />
                        {loadingMore ? "Curating alternatives..." : "Alternative Selection"}
                      </button>

                      {isOfflineMode && (
                        <button
                          onClick={retryConnection}
                          disabled={loading}
                          className="inline-flex items-center justify-center gap-2.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-6 py-3.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/25 hover:border-amber-500/35 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Sparkles size={16} className="text-amber-400 animate-pulse" />
                          Retry Live Database
                        </button>
                      )}
                    </div>
                  )}
                </motion.section>
              )}

              {step === 4 && recommendations.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-[32px] border border-dashed border-white/10 bg-white/[0.01]"
                >
                  <Film size={48} className="text-white/20 mb-4" />
                  <h3 className="font-serif text-2xl mb-2 text-white/90">Calibration Drift</h3>
                  <p className="text-sm text-white/50 max-w-md leading-relaxed">
                    We couldn&apos;t find any films matching this precise emotional signature. Try expanding your spectrum, adjusting narrative sliders, or pivoting your vibe trajectory.
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-2.5 text-xs font-semibold text-black shadow-[0_0_24px_rgb(var(--accent-rgb)/0.2)] hover:scale-[1.02]"
                  >
                    Re-Calibrate
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p className="mt-4 rounded-2xl border border-red-300/25 bg-red-950/30 px-4 py-3 text-sm leading-6 text-red-100 backdrop-blur-xl">
                {error}
              </p>
            )}
          </section>
        </div>
      </section>

      {/* Premium Cinematic Details View */}
      <AnimatePresence>
        {activeMovie && (
          <MovieDetailModal
            movie={activeMovie}
            onClose={() => setActiveMovie(null)}
            onWatchTrailer={(movie) => setActiveTrailer(movie)}
            onExploreMore={(movie) => exploreMoreLikeThis(movie)}
            isSaved={isMovieSaved(activeMovie.id)}
            onToggleSave={() => toggleSaveMovie(activeMovie)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSavedPanel && (
          <SavedPicksPanel
            savedMovies={savedMovies}
            onClose={() => setShowSavedPanel(false)}
            onRemove={removeSavedMovie}
            onWatchTrailer={(trailerKey, title) => {
              setShowSavedPanel(false);
              setActiveTrailer({ trailerKey, title } as Recommendation);
            }}
            onSelect={(movie) => {
              setShowSavedPanel(false);
              setActiveMovie(movie);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeTrailer && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveTrailer(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 24, filter: "blur(10px)" }}
              animate={{ scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ scale: 0.94, y: 24, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 130, damping: 18 }}
              className="w-full max-w-5xl rounded-[24px] border border-white/10 bg-white/[0.04] p-2 shadow-[0_0_90px_rgb(var(--accent-rgb)/0.28)] backdrop-blur-xl sm:rounded-[30px] sm:p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-3 px-2 pt-1">
                <p className="truncate font-serif text-lg sm:text-2xl">{activeTrailer.title} Trailer</p>
                <button onClick={() => setActiveTrailer(null)} className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              {activeTrailer.trailerKey ? (
                <div className="aspect-video overflow-hidden rounded-[24px] bg-black shadow-2xl shadow-black">
                  <iframe
                    title={`${activeTrailer.title} trailer`}
                    src={`https://www.youtube.com/embed/${activeTrailer.trailerKey}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-[24px] bg-black text-white/60">Trailer unavailable.</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function BrandAnimation() {
  return (
    <div className="relative h-10 min-w-0 flex-1 overflow-hidden sm:h-12">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2.2, duration: 0.3 }}
        className="absolute left-0 top-1 flex items-baseline font-serif text-2xl tracking-tight sm:text-4xl"
      >
        <span>netflix</span>
        <motion.span animate={{ x: 48 }} transition={{ delay: 0.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="ml-1.5 text-white/72 sm:ml-2">
          syndrome
        </motion.span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.35, duration: 0.55 }}
        className="absolute left-0 top-1 font-serif text-2xl tracking-tight sm:text-4xl"
      >
        <span>Netflix </span>
        <span className="text-[color:var(--accent)]">De-Syndrome</span>
      </motion.div>
    </div>
  );
}

function OpeningPanel({
  onStart,
  lastVibe,
  onUseLastVibe,
}: {
  onStart: () => void;
  lastVibe: {
    selectedColors: string[];
    direction: "reflect" | "shift";
    sliders: { pace: number; tone: number; complexity: number; intensity: number };
  } | null;
  onUseLastVibe: () => void;
}) {
  const colorNames = lastVibe
    ? lastVibe.selectedColors
        .map((id) => moodColors.find((c) => c.id === id)?.name || id)
        .join(" & ")
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="mx-auto max-w-4xl text-center"
    >
      <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[color:var(--accent)] font-semibold sm:mb-4 sm:text-sm sm:tracking-[0.3em]">What does tonight feel like?</p>
      <h1 className="mx-auto max-w-[22rem] font-serif text-5xl leading-[0.92] text-balance text-zinc-50 tracking-[-0.02em] font-semibold sm:max-w-4xl sm:text-8xl">Choose by mood, not by scrolling.</h1>
      <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-zinc-400 font-light sm:mt-6 sm:max-w-xl sm:text-base">
        Calibrate your mood in under a minute. Get exactly five emotionally relevant movies, each with a reason and a trailer.
      </p>

      {lastVibe ? (
        <div className="mt-8 flex flex-col items-center justify-center gap-5 sm:mt-12 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md rounded-2xl border border-white/[0.04] p-4 text-left shadow-xl sm:p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-[color:var(--accent)] font-semibold">Vibe Signature</span>
              <span className="text-[10px] text-zinc-500 italic">Saved Preset Found</span>
            </div>
            <p className="text-sm text-zinc-300 mb-2 leading-relaxed">
              Your previous profile combined <span className="font-semibold text-white">{colorNames}</span> to <span className="font-semibold text-white">{lastVibe.direction === "reflect" ? "reflect" : "shift"}</span> your emotional frequency.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-2">
              <div className="text-[10px] bg-white/[0.05] rounded-full px-2 py-0.5 border border-white/[0.04] text-zinc-400">Pace: {lastVibe.sliders.pace}</div>
              <div className="text-[10px] bg-white/[0.05] rounded-full px-2 py-0.5 border border-white/[0.04] text-zinc-400">Tone: {lastVibe.sliders.tone}</div>
              <div className="text-[10px] bg-white/[0.05] rounded-full px-2 py-0.5 border border-white/[0.04] text-zinc-400">Complexity: {lastVibe.sliders.complexity}</div>
              <div className="text-[10px] bg-white/[0.05] rounded-full px-2 py-0.5 border border-white/[0.04] text-zinc-400">Intensity: {lastVibe.sliders.intensity}</div>
            </div>
          </motion.div>

          <div className="flex w-full flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <button
              onClick={onUseLastVibe}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-8 py-3.5 font-semibold text-black shadow-[0_4px_24px_rgb(var(--accent-rgb)/0.25)] transition hover:scale-[1.02] active:scale-[0.98] sm:py-4"
            >
              <Sparkles size={18} />
              Restore Vibe Profile
            </button>
            <button
              onClick={onStart}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-8 py-3.5 font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition sm:py-4"
            >
              Calibrate New Vibe
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onStart}
          className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--accent)] px-8 py-3.5 font-semibold text-black shadow-[0_4px_24px_rgb(var(--accent-rgb)/0.25)] transition hover:scale-[1.02] active:scale-[0.98] sm:mt-12 sm:py-4"
        >
          <Sparkles size={18} />
          Begin Calibration
        </button>
      )}
    </motion.div>
  );
}

function StepCard({
  eyebrow,
  title,
  children,
  action,
  onBack,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="relative glass-card mx-auto w-full max-w-5xl overflow-hidden rounded-[24px] p-4 sm:rounded-[32px] sm:p-10"
    >
      {/* Top-inner border highlight to catch physical light */}
      <div className="absolute inset-0 rounded-[24px] border border-white/[0.05] border-t-white/[0.15] pointer-events-none z-20 sm:rounded-[32px]" />
      
      <div className="relative z-10 mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-white/[0.03] text-zinc-400 backdrop-blur-md transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
              title="Go back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--accent)] font-semibold sm:text-xs sm:tracking-[0.26em]">{eyebrow}</p>
            <h2 className="max-w-4xl font-serif text-[2rem] leading-tight text-balance text-zinc-50 tracking-[-0.02em] font-semibold sm:text-5xl">{title}</h2>
          </div>
        </div>
        {action}
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </motion.section>
  );
}

function Slider({
  label,
  left,
  right,
  helper,
  value,
  onChange,
}: {
  label: string;
  left: string;
  right: string;
  helper: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="relative block glass-card p-4 transition-all duration-300 hover:border-white/[0.12] sm:p-6">
      
      <span className="relative z-10 mb-4 flex items-center justify-between gap-4">
        <span className="capitalize text-zinc-200 font-medium tracking-wide">{label}</span>
        <span className="font-mono text-sm text-[color:var(--accent)] font-semibold">{value}</span>
      </span>
      <input type="range" min={0} max={100} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mood-slider relative z-10 w-full" />
      <span className="relative z-10 mt-3 flex justify-between gap-3 text-[11px] text-zinc-500 font-light sm:text-xs">
        <span>{left}</span>
        <span className="text-right">{right}</span>
      </span>
      <span className="relative z-10 block mt-2.5 text-center text-[10px] text-zinc-500 tracking-wider font-light italic sm:text-[11px]">
        {helper}
      </span>
    </label>
  );
}

function ProgressIndicator({ step, setStep }: { step: number; setStep: (step: number) => void }) {
  const steps = [
    { number: 1, label: "Mood" },
    { number: 2, label: "Direction" },
    { number: 3, label: "Vibe" },
    { number: 4, label: "Results" },
  ];

  return (
    <div className="mx-auto mb-7 w-full max-w-xl px-1 sm:mb-10 sm:px-4">
      <div className="relative flex items-center justify-between">
        {/* Progress bar line */}
        <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-white/[0.06]" />
        <motion.div
          className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-[color:var(--accent)]"
          initial={{ width: "0%" }}
          animate={{
            width: `${((Math.max(1, Math.min(4, step)) - 1) / 3) * 100}%`,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />

        {steps.map((s) => {
          const isActive = step === s.number;
          const isCompleted = step > s.number;
          const isClickable = s.number < step; // Allow going back

          return (
            <button
              key={s.number}
              disabled={!isClickable}
              onClick={() => setStep(s.number)}
                 className={`relative z-10 flex flex-col items-center gap-1.5 group transition duration-300 sm:gap-2 ${
                isClickable ? "cursor-pointer animate-pulse" : "cursor-default opacity-80"
              }`}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  backgroundColor: isActive
                    ? "var(--accent)"
                    : isCompleted
                    ? "var(--accent)"
                    : "#151518",
                  borderColor: isActive
                    ? "var(--accent)"
                    : isCompleted
                    ? "var(--accent)"
                    : "rgba(255,255,255,0.12)",
                }}
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-all sm:h-8 sm:w-8 sm:text-xs ${
                  isActive ? "text-black shadow-[0_0_18px_rgb(var(--accent-rgb)/0.3)]" : isCompleted ? "text-black" : "text-zinc-500"
                }`}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : s.number}
              </motion.div>
              <span
                 className={`text-[9px] sm:text-[11px] font-semibold tracking-wide sm:tracking-wider uppercase transition duration-300 ${
                  isActive
                    ? "text-[color:var(--accent)]"
                    : isCompleted
                    ? "text-zinc-300 group-hover:text-[color:var(--accent)]"
                    : "text-zinc-500"
                }`}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MovieCard({
  movie,
  index,
  onSelect,
  isSaved,
  onToggleSave,
}: {
  movie: Recommendation;
  index: number;
  onSelect: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const [posterFailed, setPosterFailed] = useState(false);

  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      onClick={onSelect}
      className="group relative flex h-full cursor-pointer flex-row overflow-hidden rounded-2xl border border-white/[0.06] glass-card transition-all duration-300 hover:border-white/15 hover:shadow-[0_20px_50px_rgba(var(--accent-rgb),0.12)] sm:flex-col"
    >
      {/* Poster Image Container */}
      <div className="relative w-[38%] shrink-0 overflow-hidden rounded-l-2xl bg-zinc-950 sm:aspect-[2/3] sm:w-full sm:rounded-l-none sm:rounded-t-2xl">
        {/* Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className={`absolute left-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 sm:left-3.5 sm:top-3.5 ${
            isSaved
              ? "bg-[color:var(--accent)] text-black border border-[color:var(--accent)] shadow-[0_0_16px_rgb(var(--accent-rgb)/0.3)] animate-pulse"
              : "bg-black/50 text-white/70 border border-white/10 opacity-100 sm:opacity-0 group-hover:opacity-100 hover:bg-black/70 hover:text-white"
          }`}
          title={isSaved ? "Remove from saved" : "Save this pick"}
        >
          <Bookmark size={13} fill={isSaved ? "currentColor" : "none"} />
        </button>

        {movie.poster && !posterFailed ? (
          <img
            alt={movie.title}
            src={movie.poster}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
            onError={() => setPosterFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-zinc-500 text-xs">
            No Poster
          </div>
        )}

        {/* Glow inner overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Rating or Match score badge overlay */}
        <div className="absolute right-2.5 top-2.5 z-20 flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-1 text-[9px] font-bold text-zinc-100 shadow-lg backdrop-blur-md sm:right-3.5 sm:top-3.5 sm:px-2.5 sm:text-[10px]">
          <span className="text-[color:var(--accent)] font-semibold">{movie.matchScore}% Match</span>
        </div>

        {movie.wildcard && (
          <span className="absolute bottom-3.5 left-3.5 z-20 rounded-full bg-purple-500/90 backdrop-blur-md px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white border border-purple-400/20">
            Wildcard
          </span>
        )}
      </div>

      {/* Curation Info Container */}
      <div className="flex min-w-0 flex-grow flex-col justify-between border-l border-white/[0.04] bg-zinc-950/30 p-3 text-left sm:border-l-0 sm:border-t sm:p-4">
        <div>
          {/* Year & Runtime */}
          <p className="text-[10px] text-zinc-500 font-semibold tracking-wide">
            {movie.year} {movie.runtime ? <>• {movie.runtime} min</> : ""}
            {movie.rating > 0 ? <> • ★ {movie.rating.toFixed(1)}</> : ""}
          </p>

          {/* Title */}
          <h3 className="mt-1 line-clamp-2 font-serif text-lg leading-snug tracking-tight text-zinc-100 transition-colors duration-200 group-hover:text-[color:var(--accent)] sm:line-clamp-1">
            {movie.title}
          </h3>

          {/* Curation match chips */}
          {movie.matchChips && movie.matchChips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {movie.matchChips.slice(0, 2).map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-[color:var(--accent)]/5 border border-[color:var(--accent)]/15 px-2 py-0.5 text-[9px] font-medium text-[color:var(--accent)] backdrop-blur-md"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

          {/* Curation reason text */}
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-400 line-clamp-2 transition-colors duration-200 group-hover:text-zinc-300 sm:mt-2.5 sm:line-clamp-3">
            {movie.reason}
          </p>
        </div>

        {/* Action prompt row */}
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-2.5 text-[10px] font-semibold text-zinc-500 transition-colors duration-200 group-hover:text-[color:var(--accent)] sm:mt-4">
          <span className="flex items-center gap-1">
            <Play size={10} fill="currentColor" className="opacity-60 translate-y-[-0.5px]" />
            <span>View Trailer & Details</span>
          </span>
          <ChevronRight size={12} className="transform group-hover:translate-x-0.5 transition-transform duration-200" />
        </div>
      </div>
    </motion.article>
  );
}

function MovieDetailModal({
  movie,
  onClose,
  onWatchTrailer,
  onExploreMore,
  isSaved,
  onToggleSave,
}: {
  movie: Recommendation;
  onClose: () => void;
  onWatchTrailer: (movie: Recommendation) => void;
  onExploreMore: (movie: Recommendation) => void;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const [posterFailed, setPosterFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-0 backdrop-blur-3xl sm:items-center sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="relative w-full max-w-5xl overflow-hidden rounded-t-[28px] glass-modal sm:rounded-[32px]"
        onClick={(e) => e.stopPropagation()}
      >

        {movie.backdrop && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-15 filter blur-2xl scale-105"
            style={{ backgroundImage: `url(${movie.backdrop})` }}
          />
        )}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/50 via-[#050507]/80 to-[#050507] pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#050507]/60 text-zinc-400 backdrop-blur-md transition hover:border-white/[0.15] hover:bg-[#050507]/80 hover:text-zinc-100 sm:right-6 sm:top-6"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 grid max-h-[92svh] grid-cols-1 gap-5 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-16 sm:max-h-[85vh] sm:gap-8 sm:p-8 md:grid-cols-2">
          <div className="flex flex-col items-center justify-start gap-4">
            {movie.poster && !posterFailed ? (
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full max-w-[180px] rounded-[18px] border border-white/10 object-cover shadow-2xl shadow-black sm:max-w-[320px] sm:rounded-[24px] md:max-w-full"
                onError={() => setPosterFailed(true)}
              />
            ) : (
              <div className="aspect-[2/3] w-full max-w-[180px] rounded-[18px] bg-white/5 flex items-center justify-center text-zinc-400 sm:max-w-[320px] sm:rounded-[24px] md:max-w-full">
                No Poster Available
              </div>
            )}
            
            <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:max-w-[320px] md:max-w-full">
              {movie.trailerKey && (
                <button
                  onClick={() => onWatchTrailer(movie)}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] py-3.5 text-sm font-semibold text-black shadow-[0_0_30px_rgb(var(--accent-rgb)/0.25)] transition hover:scale-[1.02] hover:shadow-[0_0_40px_rgb(var(--accent-rgb)/0.4)]"
                >
                  <Play size={16} fill="black" />
                  Play Trailer
                </button>
              )}

              <button
                onClick={() => onExploreMore(movie)}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 py-3.5 text-sm font-semibold text-[color:var(--accent)] backdrop-blur-xl transition hover:bg-[color:var(--accent)]/20 hover:scale-[1.02]"
              >
                <Compass size={16} className="text-[color:var(--accent)]" />
                Explore Similar Vibe
              </button>

              <button
                onClick={onToggleSave}
                className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition hover:scale-[1.02] ${
                  isSaved
                    ? "border border-[color:var(--accent)] bg-[color:var(--accent)]/20 text-[color:var(--accent)]"
                    : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Bookmarked" : "Bookmark Pick"}
              </button>

              <div className="relative mt-1 rounded-[20px] border border-white/[0.04] bg-white/[0.02] p-4 text-left shadow-lg backdrop-blur-xl sm:mt-4">
                {/* Top-inner border highlight overlay */}
                <div className="absolute inset-0 rounded-[20px] border border-white/[0.03] border-t-white/[0.12] pointer-events-none" />

                <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">Where to Watch</p>
                {movie.providers && movie.providers.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {movie.providers.map((provider) => (
                      <div key={provider.name} className="flex items-center gap-3">
                        <img
                          src={provider.logo}
                          alt={provider.name}
                          className="w-8 h-8 rounded-lg object-cover border border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                        <span className="text-sm font-medium text-zinc-300">{provider.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 leading-relaxed font-light">Not currently available on major streaming platforms.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 text-left sm:gap-6">
            <div>
              <h2 className="font-serif text-3xl leading-tight text-zinc-50 tracking-[-0.01em] font-semibold sm:text-5xl">{movie.title}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs text-zinc-400 sm:gap-3 sm:text-sm">
                <span className="font-semibold text-[color:var(--accent)]">{movie.year}</span>
                {movie.runtime && (
                  <>
                    <span className="text-white/20">{" \u2022 "}</span>
                    <span>{movie.runtime} minutes</span>
                  </>
                )}
                <span className="text-white/20">{" \u2022 "}</span>
                <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-xs text-zinc-300">
                  {movie.matchScore ?? 90}% Match
                </span>
                {(movie.rating ?? 0) > 0 && (
                  <>
                    <span className="text-white/20">{" \u2022 "}</span>
                    <span className="inline-flex items-center gap-1.5 text-zinc-300">
                      <Star size={14} fill="#eab308" stroke="#eab308" className="translate-y-[-1px]" />
                      <span className="font-bold">{(movie.rating ?? 0).toFixed(1)}</span>
                      <span className="text-white/40 text-xs">/10</span>
                      {(movie.votes ?? 0) > 0 && (
                        <span className="text-xs text-white/40 ml-0.5">({(movie.votes ?? 0).toLocaleString()} votes)</span>
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(movie.genres || []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/[0.04] bg-white/[0.02] px-3.5 py-1 text-xs text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-2 font-medium">Synopsis</h3>
              <p className="max-w-3xl text-sm leading-relaxed text-zinc-300 font-light sm:text-base">{movie.overview || movie.reason || "No synopsis available."}</p>
            </div>

            <div className="grid gap-4 border-t border-white/10 pt-4 sm:grid-cols-2">
              {movie.director && (
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-1 font-medium">Director</h4>
                  <p className="text-sm font-semibold text-zinc-200">{movie.director}</p>
                </div>
              )}
              {movie.writer && (
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-1 font-medium">Writer</h4>
                  <p className="text-sm font-semibold text-zinc-200">{movie.writer}</p>
                </div>
              )}
            </div>

            {movie.cast && movie.cast.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-3 font-medium">Principal Cast</h4>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  {(movie.cast || []).map((actor) => (
                    <div key={actor.id} className="flex min-w-[100px] max-w-[100px] flex-col gap-2 text-center group/actor">
                      {actor.profilePath ? (
                        <img
                          src={actor.profilePath}
                          alt={actor.name}
                          className="h-20 w-20 rounded-full object-cover mx-auto border border-white/[0.05] transition group-hover/actor:border-white/[0.15]"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 mx-auto text-xs">
                          {actor.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-zinc-200">{actor.name}</p>
                        <p className="truncate text-[10px] text-zinc-500" title={actor.character}>{actor.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-white/[0.01] border border-white/[0.04] p-5">
              <h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-3 font-semibold">Why This Matched</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.matchChips?.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[color:var(--accent)]/20 bg-[color:var(--accent)]/5 px-3 py-1 text-[11px] font-medium text-[color:var(--accent)]"
                  >
                    {chip}
                  </span>
                ))}
                {(movie.rating ?? 0) > 0 && (
                  <span className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1 text-[11px] font-medium text-yellow-400/90 inline-flex items-center gap-1">
                    <Star size={10} fill="currentColor" stroke="currentColor" />
                    {(movie.rating ?? 0).toFixed(1)}{(movie.votes ?? 0) > 0 ? ` (${(movie.votes ?? 0).toLocaleString()})` : ""}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-zinc-400 font-light leading-relaxed">{movie.reason}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SavedPicksPanel({
  savedMovies,
  onClose,
  onRemove,
  onWatchTrailer,
  onSelect,
}: {
  savedMovies: SavedMovie[];
  onClose: () => void;
  onRemove: (id: number) => void;
  onWatchTrailer: (trailerKey: string, title: string) => void;
  onSelect: (movie: SavedMovie) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-0 backdrop-blur-3xl sm:items-center sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-t-[28px] border border-white/[0.08] glass-modal sm:rounded-[32px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#050507]/90 to-[#050507] pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#050507]/60 text-zinc-400 backdrop-blur-md transition hover:border-white/[0.15] hover:bg-[#050507]/80 hover:text-zinc-100 sm:right-6 sm:top-6"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 max-h-[92svh] overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-16 sm:max-h-[85vh] sm:p-8">
          <div className="mb-6 text-left border-b border-white/[0.05] pb-4">
            <p className="mb-1 text-xs uppercase tracking-[0.26em] text-[color:var(--accent)] font-bold">Your Watchlist</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-zinc-50 tracking-[-0.02em] font-semibold">Bookmarked Cinema</h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400">
              {savedMovies.length === 0
                ? "Your watchlist is currently empty. Bookmark films to assemble your collection."
                : `A collection of ${savedMovies.length} hand-calibrated cinematic experience${savedMovies.length === 1 ? "" : "s"}.`}
            </p>
          </div>

          {savedMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-[28px] border border-dashed border-white/10 bg-white/[0.01]">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-white/[0.02] border border-white/[0.05] text-zinc-500 mb-4 animate-pulse">
                <Bookmark size={22} className="stroke-[1.5] text-zinc-400" />
              </div>
              <h3 className="font-serif text-xl text-zinc-200 mb-2 font-medium">Your Watchlist is Empty</h3>
              <p className="text-xs text-zinc-500 max-w-sm leading-relaxed font-light">
                Whenever a curated movie aligns with your vibe spectrum, click the bookmark icon on the card to save it here for later.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 max-h-[50vh] overflow-y-auto pr-1 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <AnimatePresence initial={false}>
                {savedMovies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                    onClick={() => onSelect(movie)}
                    className="group/saved relative flex cursor-pointer gap-3 overflow-hidden rounded-[18px] border border-white/[0.04] bg-white/[0.01] p-3 transition hover:border-white/[0.1] hover:bg-white/[0.03] sm:gap-4 sm:rounded-[20px]"
                  >
                    {/* Hover subtle glow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[color:var(--accent)]/[0.01] to-transparent opacity-0 group-hover/saved:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {movie.poster ? (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="h-24 w-16 shrink-0 rounded-xl border border-white/10 object-cover shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover/saved:scale-[1.02] sm:h-28 sm:w-20"
                      />
                    ) : (
                      <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[10px] text-zinc-500 sm:h-28 sm:w-20">
                        No Poster
                      </div>
                    )}

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 text-left">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-serif text-base sm:text-lg font-semibold text-zinc-200 truncate group-hover/saved:text-[color:var(--accent)] transition-colors duration-200">
                            {movie.title}
                          </h3>
                          <span className="shrink-0 rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[9px] font-semibold text-[color:var(--accent)] border border-white/[0.05] shadow-sm">
                            {movie.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1 flex flex-wrap items-center gap-1.5 font-medium tracking-wide">
                          <span className="text-zinc-400">{movie.year}</span>
                          {movie.runtime ? (
                            <>
                              <span>&bull;</span>
                              <span>{movie.runtime} min</span>
                            </>
                          ) : null}
                          <span>&bull;</span>
                          <span className="text-[color:var(--accent)] opacity-80 font-normal">
                            {formatSavedAt(movie.savedAt)}
                          </span>
                        </p>
                        <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed font-light">
                          {movie.reason}
                        </p>
                      </div>

                      <div className="mt-3.5 flex flex-wrap items-center gap-2">
                        {movie.trailerKey && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onWatchTrailer(movie.trailerKey!, movie.title);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3.5 py-1.5 text-[10px] font-semibold text-zinc-300 transition hover:bg-white/[0.12] hover:text-white border border-white/[0.06] shadow-sm active:scale-[0.98] cursor-pointer"
                          >
                            <Play size={10} fill="currentColor" className="translate-y-[-0.5px]" />
                            Watch Trailer
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(movie.id);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.02] px-3.5 py-1.5 text-[10px] font-semibold text-zinc-500 transition hover:bg-red-950/30 hover:text-red-300 border border-white/[0.04] hover:border-red-500/10 active:scale-[0.98] cursor-pointer"
                        >
                          <Trash2 size={10} />
                          Remove Pick
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="group relative flex flex-col glass-card border border-white/[0.04] bg-white/[0.01] overflow-hidden rounded-2xl h-full select-none pointer-events-none">
      {/* Top aspect-2/3 block */}
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-t-2xl bg-white/[0.02] skeleton-sheen animate-pulse" />
      {/* Bottom text block */}
      <div className="flex-grow p-4 bg-zinc-950/20 border-t border-white/[0.04] flex flex-col gap-3">
        {/* Year & Rating block */}
        <div className="h-3.5 w-20 bg-white/[0.03] rounded skeleton-sheen" />
        {/* Title */}
        <div className="h-5.5 w-3/4 bg-white/[0.05] rounded skeleton-sheen mt-1" />
        {/* Chips */}
        <div className="flex gap-1.5 mt-1">
          <div className="h-4.5 w-14 bg-white/[0.03] rounded-full skeleton-sheen" />
          <div className="h-4.5 w-16 bg-white/[0.03] rounded-full skeleton-sheen" />
        </div>
        {/* Reason text lines */}
        <div className="flex flex-col gap-2 mt-1.5">
          <div className="h-3.5 w-full bg-white/[0.02] rounded skeleton-sheen" />
          <div className="h-3.5 w-11/12 bg-white/[0.02] rounded skeleton-sheen" />
          <div className="h-3.5 w-4/5 bg-white/[0.02] rounded skeleton-sheen" />
        </div>
        {/* Action prompt row skeleton */}
        <div className="mt-4 pt-2.5 border-t border-white/[0.03] flex items-center justify-between">
          <div className="h-3.5 w-24 bg-white/[0.03] rounded skeleton-sheen" />
          <div className="h-4 w-4 bg-white/[0.03] rounded-full skeleton-sheen" />
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 w-full">
      {[0, 1, 2, 3, 4].map((item) => (
        <SkeletonCard key={item} />
      ))}
    </div>
  );
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `${red} ${green} ${blue}`;
}
