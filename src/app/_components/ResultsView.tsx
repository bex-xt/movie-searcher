"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Brain, Compass, Eye, Film, Sliders, Sparkles } from "lucide-react";
import { MovieCard } from "@/app/_components/MovieCard";
import { SkeletonGrid } from "@/app/_components/Skeletons";
import { loadingMessages } from "@/app/_data/moodConfig";
import { getVibeLabel } from "@/app/_lib/uiHelpers";
import type { Direction, MoodColor, MoodSliders, Recommendation } from "@/app/_types/movie";

type ResultsViewProps = {
  recommendations: Recommendation[];
  loading: boolean;
  isOfflineMode: boolean;
  retryConnection: () => void;
  selectedColorObjects: MoodColor[];
  selectedMoodTags: string[];
  direction: Direction;
  sliders: MoodSliders;
  isRequestSlow: boolean;
  triggerOfflineFallback: () => void;
  contextualLoadingText: string;
  loadingMessageIndex: number;
  setActiveMovie: (movie: Recommendation) => void;
  isMovieSaved: (movieId: number) => boolean;
  toggleSaveMovie: (movie: Recommendation) => void;
  setStep: (step: number) => void;
  fetchMoreRecommendations: () => void;
  loadingMore: boolean;
};

export function ResultsView({
  recommendations,
  loading,
  isOfflineMode,
  retryConnection,
  selectedColorObjects,
  selectedMoodTags,
  direction,
  sliders,
  isRequestSlow,
  triggerOfflineFallback,
  contextualLoadingText,
  loadingMessageIndex,
  setActiveMovie,
  isMovieSaved,
  toggleSaveMovie,
  setStep,
  fetchMoreRecommendations,
  loadingMore,
}: ResultsViewProps) {
  if (recommendations.length === 0 && !loading) {
    return (
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
    );
  }

  return (
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
    
  );
}
