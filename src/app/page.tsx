"use client";

import { AnimatePresence } from "framer-motion";
import { Bookmark } from "lucide-react";
import { BrandAnimation } from "@/app/_components/BrandAnimation";
import { CalibrationSteps } from "@/app/_components/CalibrationSteps";
import { MovieDetailModal } from "@/app/_components/MovieDetailModal";
import { OpeningPanel } from "@/app/_components/OpeningPanel";
import { ResultsView } from "@/app/_components/ResultsView";
import { SavedPicksPanel } from "@/app/_components/SavedPicksPanel";
import { ProgressIndicator } from "@/app/_components/StepControls";
import { TrailerModal } from "@/app/_components/TrailerModal";
import { useSavedMovies } from "@/app/_hooks/useSavedMovies";
import { useVibeState } from "@/app/_hooks/useVibeState";
import { useRecommendations } from "@/app/_hooks/useRecommendations";
import type { Recommendation } from "@/app/_types/movie";

export default function Home() {
  const {
    step,
    setStep,
    selectedColors,
    direction,
    setDirection,
    sliders,
    setSliders,
    lastVibe,
    setLastVibe,
    restoreLastVibe,
    toggleColor,
    selectedMoodTags,
    selectedColorObjects,
    shellStyle,
  } = useVibeState();

  const {
    savedMovies,
    showSavedPanel,
    setShowSavedPanel,
    isMovieSaved,
    toggleSaveMovie,
    removeSavedMovie,
  } = useSavedMovies();

  const {
    recommendations,
    loading,
    loadingMore,
    error,
    activeMovie,
    setActiveMovie,
    activeTrailer,
    setActiveTrailer,
    contextualLoadingText,
    isRequestSlow,
    loadingMessageIndex,
    isOfflineMode,
    retryConnection,
    triggerOfflineFallback,
    getRecommendations,
    fetchMoreRecommendations,
    exploreMoreLikeThis,
  } = useRecommendations(selectedColors, direction, sliders, setStep, setLastVibe);

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
          {step > 0 && <ProgressIndicator step={step} setStep={setStep} compact={step === 4} />}
          <section
            className={`flex min-h-[calc(100svh-9rem)] flex-col justify-start sm:min-h-[72vh] ${
              step === 4 ? "pt-1 sm:pt-2" : "pt-14 sm:justify-center sm:pt-0"
            }`}
          >
            <AnimatePresence mode="wait">
              {step === 0 && (
                <OpeningPanel
                  key="opening"
                  onStart={() => setStep(1)}
                  lastVibe={lastVibe}
                  onUseLastVibe={restoreLastVibe}
                />
              )}
              {(step === 1 || step === 2 || step === 3) && (
                <CalibrationSteps
                  key="calibration"
                  step={step}
                  selectedColors={selectedColors}
                  toggleColor={toggleColor}
                  direction={direction}
                  setDirection={setDirection}
                  sliders={sliders}
                  setSliders={setSliders}
                  setStep={setStep}
                  getRecommendations={getRecommendations}
                  loading={loading}
                />
              )}

              {step === 4 && (
                <ResultsView
                  key="results"
                  recommendations={recommendations}
                  loading={loading}
                  isOfflineMode={isOfflineMode}
                  retryConnection={retryConnection}
                  selectedColorObjects={selectedColorObjects}
                  selectedMoodTags={selectedMoodTags}
                  direction={direction}
                  sliders={sliders}
                  isRequestSlow={isRequestSlow}
                  triggerOfflineFallback={triggerOfflineFallback}
                  contextualLoadingText={contextualLoadingText}
                  loadingMessageIndex={loadingMessageIndex}
                  setActiveMovie={setActiveMovie}
                  isMovieSaved={isMovieSaved}
                  toggleSaveMovie={toggleSaveMovie}
                  setStep={setStep}
                  fetchMoreRecommendations={fetchMoreRecommendations}
                  loadingMore={loadingMore}
                />
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
              setActiveTrailer({ trailerKey, title } as unknown as Recommendation);
            }}
            onSelect={(movie) => {
              setShowSavedPanel(false);
              setActiveMovie(movie);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeTrailer && <TrailerModal movie={activeTrailer} onClose={() => setActiveTrailer(null)} />}
      </AnimatePresence>
    </main>
  );
}
