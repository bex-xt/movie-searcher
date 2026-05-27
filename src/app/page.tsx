"use client";

/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  Brain,
  Check,
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
};

type SavedMovie = {
  id: number;
  title: string;
  year: string;
  poster: string | null;
  runtime: number | null;
  reason: string;
  trailerKey: string | null;
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
  pace: ["Slow / Art-House", "Fast / Adrenaline", "slow burn vs fast-moving"],
  tone: ["Ruthless / Gore", "Soft / Feel-Good", "dark vs comforting"],
  complexity: ["Simple / Comforting", "Mind-Bending / Surreal", "easy watch vs mind-bending"],
  intensity: ["Soft / Low-stakes", "Heavy / Intense", "low-stakes vs heavy"],
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

export default function Home() {
  const [step, setStep] = useState(0);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [direction, setDirection] = useState<Direction>("reflect");
  const [sliders, setSliders] = useState({ pace: 45, tone: 58, complexity: 48, intensity: 42 });

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
      const compact: SavedMovie = {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        poster: movie.poster,
        runtime: movie.runtime,
        reason: movie.reason,
        trailerKey: movie.trailerKey,
      };
      persistSavedMovies([compact, ...savedMovies]);
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

  async function getRecommendations() {
    if (selectedColors.length < 2) {
      setError("Please select at least two mood colors to calibrate your vibe.");
      return;
    }

    setLoading(true);
    setError("");
    setRecommendations([]);
    setExcludeIds([]);

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

      const data = (await response.json()) as { recommendations?: Recommendation[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Recommendation service failed.");

      const recs = data.recommendations || [];
      setRecommendations(recs);
      setExcludeIds(recs.map((m) => m.id));
      setStep(4);

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
      setError(toUserFriendlyError(caught));
    } finally {
      setLoading(false);
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

      const data = (await response.json()) as { recommendations?: Recommendation[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Recommendation service failed.");

      const recs = data.recommendations || [];
      if (recs.length === 0) {
        setRecommendations([]);
      } else {
        setRecommendations(recs);
        setExcludeIds((prev) => [...prev, ...recs.map((m) => m.id)]);
      }
    } catch (caught) {
      setError(toUserFriendlyError(caught));
    } finally {
      setLoadingMore(false);
    }
  }

  async function exploreMoreLikeThis(seedMovie: Recommendation) {
    setActiveMovie(null);
    const loadingText = `Finding more films that is similar to ${seedMovie.title}...`;
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

      const data = (await response.json()) as { recommendations?: Recommendation[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Contextual recommendation failed.");

      const recs = data.recommendations || [];
      setRecommendations(recs);
      setExcludeIds((prev) => Array.from(new Set([...prev, ...recs.map((m) => m.id)])));
      setStep(4);
    } catch (caught) {
      setError(toUserFriendlyError(caught));
    } finally {
      setLoading(false);
      setContextualLoadingText("");
    }
  }

  return (
    <main style={shellStyle} className="min-h-screen overflow-x-hidden text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-4 mb-16 border-b border-white/[0.04]">
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

        <div className="flex-1 py-8 w-full">
          {step > 0 && <ProgressIndicator step={step} setStep={setStep} />}
          <section className="flex min-h-[72vh] flex-col justify-center">
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
                  eyebrow="Step 1"
                  title="Pick 2 colors that match your current vibe."
                  onBack={() => setStep(0)}
                  action={
                    <button
                      disabled={selectedColors.length < 2}
                      onClick={() => setStep(2)}
                      className="rounded-full bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_28px_rgb(var(--accent-rgb)/0.22)] disabled:cursor-not-allowed disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Continue
                    </button>
                  }
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {moodColors.map((color) => {
                      const selected = selectedColors.includes(color.id);
                      return (
                        <button
                          key={color.id}
                          onClick={() => toggleColor(color.id)}
                          className={`group min-h-32 rounded-[20px] border p-3 text-left backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${
                            selected
                              ? "border-[color:var(--accent)]/70 bg-white/[0.07] shadow-[0_0_36px_rgb(var(--accent-rgb)/0.18)]"
                              : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
                          }`}
                        >
                          <motion.div
                            animate={{ scale: selected ? 1.04 : 1 }}
                            className="mb-4 h-16 rounded-2xl shadow-inner shadow-white/10"
                            style={{
                              background: `radial-gradient(circle at 25% 20%, rgba(255,255,255,.35), transparent 28%), linear-gradient(135deg, ${color.hex}, #050505)`,
                            }}
                          />
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-white/86">{color.name}</span>
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
                  eyebrow="Step 2"
                  title="Do you want a movie that reflects your current mood or changes it?"
                  onBack={() => setStep(1)}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["reflect", "Reflect my mood", "Stay with this feeling, but make it cinematic."],
                      ["shift", "Shift my mood", "Move somewhere else without breaking the spell."],
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
                  eyebrow="Step 3"
                  title="Fine-tune the vibe."
                  onBack={() => setStep(2)}
                  action={
                    <button
                      onClick={getRecommendations}
                      disabled={loading}
                      className="inline-flex rounded-full bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_28px_rgb(var(--accent-rgb)/0.24)] disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? "Finding your five..." : "Find my five"}
                    </button>
                  }
                >
                  <div className="mb-10">
                    <p className="mb-4 text-xs uppercase tracking-[0.18em] text-zinc-500 font-medium">Quick Cognitive Presets</p>
                    <div 
                      className="flex overflow-x-auto gap-3.5 pb-3 scrollbar-hide -mx-1 px-1"
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
                            className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all glass-pill ${
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

              {step === 4 && recommendations.length > 0 && (
                <motion.section key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="mb-10">
                    <p className="mb-2 text-sm uppercase tracking-[0.28em] text-[color:var(--accent)]">The Rule of Five</p>
                    <h1 className="max-w-4xl font-serif text-4xl leading-[0.96] text-balance sm:text-6xl">Five choices. No spiral.</h1>
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/58">
                      Based on your <span className="font-medium text-white/90">{selectedMoodTags.slice(0, 2).join(" + ") || "cinematic"}</span> mood, these five avoid endless scrolling.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedMoodTags.slice(0, 4).map((tag) => (
                        <span key={tag} className="rounded-full border border-[color:var(--accent)]/20 bg-[color:var(--accent)]/5 px-3 py-1 text-[11px] font-medium text-[color:var(--accent)]">
                          {tag}
                        </span>
                      ))}
                      <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-zinc-400">
                        {getVibeLabel("pace", sliders.pace)}
                      </span>
                      <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-zinc-400">
                        {getVibeLabel("tone", sliders.tone)}
                      </span>
                    </div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {loading && contextualLoadingText ? (
                      <motion.div
                        key="contextual-loader"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="flex flex-col items-center justify-center text-center py-24 px-6 rounded-[32px] border border-dashed border-white/10 bg-white/[0.01] w-full"
                      >
                        <div className="relative mb-8 h-20 w-20">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="h-full w-full rounded-full border-2 border-dashed border-[color:var(--accent)]/30 border-t-[color:var(--accent)]"
                          />
                          <Sparkles className="absolute inset-0 m-auto text-[color:var(--accent)] animate-pulse" size={24} />
                        </div>
                        <h3 className="font-serif text-2xl sm:text-3xl text-white/90 animate-pulse font-medium tracking-wide">
                          {contextualLoadingText}
                        </h3>
                        <p className="mt-3 text-sm text-white/40 tracking-wider">Curating the perfect custom cinematic vibe...</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={recommendations.map(m => m.id).join(",")}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4 }}
                        className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
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
                    <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="inline-flex items-center gap-2.5 rounded-full bg-[color:var(--accent)] px-6 py-3.5 text-sm font-semibold text-black shadow-[0_0_24px_rgb(var(--accent-rgb)/0.2)] transition hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Sliders size={16} />
                        Recalibrate
                      </button>

                      <button
                        onClick={fetchMoreRecommendations}
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white/90 disabled:opacity-50"
                      >
                        <Sparkles size={16} className={loadingMore ? "animate-spin text-[color:var(--accent)]" : "text-white/40"} />
                        {loadingMore ? "Curating a new batch..." : "Show me 5 more"}
                      </button>
                    </div>
                  )}
                </motion.section>
              )}

              {step === 4 && recommendations.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-[32px] border border-dashed border-white/10 bg-white/[0.01]"
                >
                  <Film size={48} className="text-white/20 mb-4" />
                  <h3 className="font-serif text-2xl mb-2 text-white/90">Vibe Recalibration Needed</h3>
                  <p className="text-sm text-white/50 max-w-md leading-relaxed">
                    We couldn&apos;t find any films matching this exact combination. Try adjusting your intensity sliders, selecting new mood colors, or trying a different emotional direction!
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-2.5 text-xs font-semibold text-black shadow-[0_0_24px_rgb(var(--accent-rgb)/0.2)] hover:scale-[1.02]"
                  >
                    Adjust Calibration
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
            moodTags={selectedMoodTags}
            vibeLabels={{
              pace: getVibeLabel("pace", sliders.pace),
              tone: getVibeLabel("tone", sliders.tone),
              complexity: getVibeLabel("complexity", sliders.complexity),
              intensity: getVibeLabel("intensity", sliders.intensity),
            }}
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
              className="w-full max-w-5xl rounded-[30px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_0_90px_rgb(var(--accent-rgb)/0.28)] backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-3 px-2 pt-1">
                <p className="truncate font-serif text-2xl">{activeTrailer.title} Trailer</p>
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
    <div className="relative h-12 min-w-0 flex-1 overflow-hidden">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2.2, duration: 0.3 }}
        className="absolute left-0 top-1 flex items-baseline font-serif text-3xl tracking-tight sm:text-4xl"
      >
        <span>netfix</span>
        <motion.span animate={{ x: 42 }} transition={{ delay: 0.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="ml-2 text-white/72">
          syndrome
        </motion.span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.35, duration: 0.55 }}
        className="absolute left-0 top-1 font-serif text-3xl tracking-tight sm:text-4xl"
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
      className="max-w-4xl mx-auto text-center"
    >
      <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[color:var(--accent)] font-semibold">What does tonight feel like?</p>
      <h1 className="max-w-4xl font-serif text-6xl leading-[0.9] text-balance sm:text-8xl text-zinc-50 tracking-[-0.02em] font-semibold">Choose by mood, not by scrolling.</h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 font-light mx-auto">
        Calibrate your vibe in under a minute. Get exactly five emotionally relevant movies, each with a reason and a trailer.
      </p>

      {lastVibe ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl border border-white/[0.04] p-5 w-full max-w-md text-left shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-[color:var(--accent)] font-semibold">Welcome Back</span>
              <span className="text-[10px] text-zinc-500 italic">Saved Vibe Found</span>
            </div>
            <p className="text-sm text-zinc-300 mb-2 leading-relaxed">
              Your last setup had <span className="font-semibold text-white">{colorNames}</span> colors, matching in <span className="font-semibold text-white">{lastVibe.direction === "reflect" ? "reflective" : "shifting"}</span> mode.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-2">
              <div className="text-[10px] bg-white/[0.05] rounded-full px-2 py-0.5 border border-white/[0.04] text-zinc-400">Pace: {lastVibe.sliders.pace}</div>
              <div className="text-[10px] bg-white/[0.05] rounded-full px-2 py-0.5 border border-white/[0.04] text-zinc-400">Tone: {lastVibe.sliders.tone}</div>
              <div className="text-[10px] bg-white/[0.05] rounded-full px-2 py-0.5 border border-white/[0.04] text-zinc-400">Complexity: {lastVibe.sliders.complexity}</div>
              <div className="text-[10px] bg-white/[0.05] rounded-full px-2 py-0.5 border border-white/[0.04] text-zinc-400">Intensity: {lastVibe.sliders.intensity}</div>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              onClick={onUseLastVibe}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-8 py-4 font-semibold text-black shadow-[0_4px_24px_rgb(var(--accent-rgb)/0.25)] transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={18} />
              Use Last Vibe
            </button>
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-8 py-4 font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition"
            >
              Recalibrate Vibe
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onStart}
          className="mt-12 inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-8 py-4 font-semibold text-black shadow-[0_4px_24px_rgb(var(--accent-rgb)/0.25)] transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles size={18} />
          Begin
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
      className="relative glass-card overflow-hidden rounded-[32px] p-6 sm:p-10 max-w-5xl mx-auto w-full"
    >
      {/* Top-inner border highlight to catch physical light */}
      <div className="absolute inset-0 rounded-[32px] border border-white/[0.05] border-t-white/[0.15] pointer-events-none z-20" />
      
      <div className="relative z-10 mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
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
            <p className="mb-2 text-xs uppercase tracking-[0.26em] text-[color:var(--accent)] font-semibold">{eyebrow}</p>
            <h2 className="max-w-4xl font-serif text-4xl leading-tight text-balance sm:text-5xl text-zinc-50 tracking-[-0.02em] font-semibold">{title}</h2>
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
    <label className="relative block glass-card p-6 transition-all duration-300 hover:border-white/[0.12]">
      
      <span className="relative z-10 mb-4 flex items-center justify-between gap-4">
        <span className="capitalize text-zinc-200 font-medium tracking-wide">{label}</span>
        <span className="font-mono text-sm text-[color:var(--accent)] font-semibold">{value}</span>
      </span>
      <input type="range" min={0} max={100} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mood-slider relative z-10 w-full" />
      <span className="relative z-10 mt-3 flex justify-between gap-3 text-xs text-zinc-500 font-light">
        <span>{left}</span>
        <span className="text-right">{right}</span>
      </span>
      <span className="relative z-10 block mt-2.5 text-center text-[11px] text-zinc-500 tracking-wider font-light italic">
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
    <div className="mx-auto mb-10 w-full max-w-xl px-4">
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
              className={`relative z-10 flex flex-col items-center gap-2 group transition duration-300 ${
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
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                  isActive ? "text-black shadow-[0_0_18px_rgb(var(--accent-rgb)/0.3)]" : isCompleted ? "text-black" : "text-zinc-500"
                }`}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : s.number}
              </motion.div>
              <span
                className={`text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase transition duration-300 ${
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
  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8, scale: 1.025 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      onClick={onSelect}
      className="group relative cursor-pointer overflow-hidden aspect-[2/3] flex flex-col justify-end glass-card hover:border-white/15 hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(var(--accent-rgb),0.12)]"
    >
      {/* Save/Bookmark Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
        className={`absolute top-4 left-4 z-20 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
          isSaved
            ? "bg-[color:var(--accent)]/90 text-black border border-[color:var(--accent)] shadow-[0_0_16px_rgb(var(--accent-rgb)/0.3)]"
            : "bg-black/50 text-white/60 border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-black/70 hover:text-white"
        }`}
        title={isSaved ? "Remove from saved" : "Save this pick"}
      >
        <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
      </button>

      {movie.poster ? (
        <img
          alt={movie.title}
          src={movie.poster}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-zinc-400">
          No Poster
        </div>
      )}
      
      {movie.rating > 0 && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-zinc-50 backdrop-blur-md border border-white/10 shadow-lg">
          <Star size={12} fill="#eab308" stroke="#eab308" />
          <span>{movie.rating.toFixed(1)}</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/40 to-transparent opacity-90 transition duration-500 group-hover:opacity-100" />
      
      <div
        className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 80px rgb(var(--accent-rgb) / 0.2)" }}
      />

      <div className="relative z-10 p-5 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {movie.wildcard && (
              <span className="rounded-full bg-[color:var(--accent)] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black">
                Wildcard
              </span>
            )}
            {movie.providers && movie.providers.length > 0 && (
              <div className="flex gap-1">
                {movie.providers.map((provider) => (
                  <img
                    key={provider.name}
                    src={provider.logo}
                    alt={provider.name}
                    title={provider.name}
                    className="w-6 h-6 rounded-full object-cover border border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                  />
                ))}
              </div>
            )}
          </div>
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-[color:var(--accent)] border border-white/5">
            {movie.matchScore}% match
          </span>
        </div>

        <div className="text-left">
          <h3 className="font-serif text-xl sm:text-2xl leading-tight text-zinc-50 group-hover:text-[color:var(--accent)] transition-colors duration-300 tracking-[-0.01em] font-semibold">
            {movie.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-400 font-normal">
            {movie.year} {movie.runtime ? <>{" \u2022 "}{movie.runtime} min</> : ""}
          </p>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {movie.genres.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-300 border border-white/[0.04]">
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-zinc-400 line-clamp-2 transition-all duration-300 group-hover:text-zinc-300">
            {movie.reason}
          </p>
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
  moodTags,
  vibeLabels,
}: {
  movie: Recommendation;
  onClose: () => void;
  onWatchTrailer: (movie: Recommendation) => void;
  onExploreMore: (movie: Recommendation) => void;
  isSaved: boolean;
  onToggleSave: () => void;
  moodTags: string[];
  vibeLabels: { pace: string; tone: string; complexity: string; intensity: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-3xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="relative w-full max-w-5xl overflow-hidden rounded-[32px] glass-modal"
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
          className="absolute right-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#050507]/40 text-zinc-400 backdrop-blur-md transition hover:border-white/[0.15] hover:bg-[#050507]/80 hover:text-zinc-100"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 grid gap-8 p-6 sm:p-8 grid-cols-1 md:grid-cols-2 overflow-y-auto max-h-[85vh]">
          <div className="flex flex-col items-center justify-start gap-4">
            {movie.poster ? (
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full rounded-[24px] border border-white/10 object-cover shadow-2xl shadow-black max-w-[320px] md:max-w-full"
              />
            ) : (
              <div className="aspect-[2/3] w-full rounded-[24px] bg-white/5 flex items-center justify-center text-zinc-400 max-w-[320px] md:max-w-full">
                No Poster Available
              </div>
            )}
            
            <div className="flex flex-col gap-3 w-full max-w-[320px] md:max-w-full">
              {movie.trailerKey && (
                <button
                  onClick={() => onWatchTrailer(movie)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] py-3.5 text-sm font-semibold text-black shadow-[0_0_30px_rgb(var(--accent-rgb)/0.25)] transition hover:scale-[1.02] hover:shadow-[0_0_40px_rgb(var(--accent-rgb)/0.4)]"
                >
                  <Play size={16} fill="black" />
                  Watch Trailer
                </button>
              )}

              <button
                onClick={() => onExploreMore(movie)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 py-3.5 text-sm font-semibold text-[color:var(--accent)] backdrop-blur-xl transition hover:bg-[color:var(--accent)]/20 hover:scale-[1.02]"
              >
                <Compass size={16} className="text-[color:var(--accent)]" />
                Explore more like this
              </button>

              <button
                onClick={onToggleSave}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition hover:scale-[1.02] ${
                  isSaved
                    ? "border border-[color:var(--accent)] bg-[color:var(--accent)]/20 text-[color:var(--accent)]"
                    : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Saved to picks" : "Save this pick"}
              </button>

              <div className="mt-4 rounded-[20px] border border-white/[0.04] bg-white/[0.02] p-4 text-left shadow-lg backdrop-blur-xl">
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

          <div className="flex flex-col gap-6 text-left">
            <div>
              <h2 className="font-serif text-4xl leading-tight text-zinc-50 sm:text-5xl tracking-[-0.01em] font-semibold">{movie.title}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                <span className="font-semibold text-[color:var(--accent)]">{movie.year}</span>
                {movie.runtime && (
                  <>
                    <span className="text-white/20">{" \u2022 "}</span>
                    <span>{movie.runtime} minutes</span>
                  </>
                )}
                <span className="text-white/20">{" \u2022 "}</span>
                <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-xs text-zinc-300">
                  {movie.matchScore}% Match
                </span>
                {movie.rating > 0 && (
                  <>
                    <span className="text-white/20">{" \u2022 "}</span>
                    <span className="inline-flex items-center gap-1.5 text-zinc-300">
                      <Star size={14} fill="#eab308" stroke="#eab308" className="translate-y-[-1px]" />
                      <span className="font-bold">{movie.rating.toFixed(1)}</span>
                      <span className="text-white/40 text-xs">/10</span>
                      {movie.votes > 0 && (
                        <span className="text-xs text-white/40 ml-0.5">({movie.votes.toLocaleString()} votes)</span>
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genres.map((tag) => (
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
              <p className="text-base leading-relaxed text-zinc-300 max-w-3xl font-light">{movie.overview}</p>
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
                  {movie.cast.map((actor) => (
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
                {moodTags.slice(0, 2).length > 0 && (
                  <span className="rounded-full border border-[color:var(--accent)]/25 bg-[color:var(--accent)]/8 px-3 py-1 text-[11px] font-medium text-[color:var(--accent)]">
                    Mood: {moodTags.slice(0, 2).join(" + ")}
                  </span>
                )}
                <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-zinc-400">
                  Pace: {vibeLabels.pace}
                </span>
                <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-zinc-400">
                  Tone: {vibeLabels.tone}
                </span>
                <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-zinc-400">
                  Complexity: {vibeLabels.complexity}
                </span>
                <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-zinc-400">
                  Intensity: {vibeLabels.intensity}
                </span>
                {movie.rating > 0 && (
                  <span className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1 text-[11px] font-medium text-yellow-400/90 inline-flex items-center gap-1">
                    <Star size={10} fill="currentColor" stroke="currentColor" />
                    {movie.rating.toFixed(1)}{movie.votes > 0 ? ` (${movie.votes.toLocaleString()})` : ""}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-zinc-400">{movie.reason}</p>
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
}: {
  savedMovies: SavedMovie[];
  onClose: () => void;
  onRemove: (id: number) => void;
  onWatchTrailer: (trailerKey: string, title: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-3xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-[32px] glass-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#050507]/90 to-[#050507] pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#050507]/40 text-zinc-400 backdrop-blur-md transition hover:border-white/[0.15] hover:bg-[#050507]/80 hover:text-zinc-100"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 p-6 sm:p-8 overflow-y-auto max-h-[85vh]">
          <div className="mb-6">
            <p className="mb-2 text-xs uppercase tracking-[0.26em] text-[color:var(--accent)] font-semibold">Your Picks</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-zinc-50 tracking-[-0.02em] font-semibold">Saved Movies</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {savedMovies.length === 0
                ? "No movies saved yet. Bookmark movies you love to find them here."
                : `${savedMovies.length} movie${savedMovies.length === 1 ? "" : "s"} saved`}
            </p>
          </div>

          {savedMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 rounded-[24px] border border-dashed border-white/10 bg-white/[0.01]">
              <Bookmark size={40} className="text-white/15 mb-4" />
              <p className="text-sm text-zinc-500 max-w-xs">
                Tap the bookmark icon on any movie card to save it for later.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {savedMovies.map((movie) => (
                <motion.div
                  key={movie.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group/saved flex gap-4 rounded-[20px] border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="h-28 w-20 shrink-0 rounded-xl object-cover border border-white/10"
                    />
                  ) : (
                    <div className="h-28 w-20 shrink-0 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 text-xs border border-white/10">
                      No Poster
                    </div>
                  )}

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-zinc-100 truncate">{movie.title}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {movie.year}{movie.runtime ? ` \u2022 ${movie.runtime} min` : ""}
                      </p>
                      <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">{movie.reason}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {movie.trailerKey && (
                        <button
                          onClick={() => onWatchTrailer(movie.trailerKey!, movie.title)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition hover:bg-white/[0.12] hover:text-white border border-white/[0.06]"
                        >
                          <Play size={10} fill="currentColor" />
                          Trailer
                        </button>
                      )}
                      <button
                        onClick={() => onRemove(movie.id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-500 transition hover:bg-red-950/40 hover:text-red-300 border border-white/[0.04] hover:border-red-400/20"
                      >
                        <Trash2 size={10} />
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SkeletonGrid() {
  return (
    <div className="mt-7 grid gap-3 sm:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="skeleton-sheen h-40 rounded-[24px] border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl" />
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
