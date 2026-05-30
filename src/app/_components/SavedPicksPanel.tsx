"use client";

/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Play, Trash2, X } from "lucide-react";
import { formatSavedAt } from "@/app/_lib/uiHelpers";
import type { SavedMovie } from "@/app/_types/movie";

export function SavedPicksPanel({
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
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:bg-black/60 sm:p-6 sm:backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-t-[28px] border border-white/[0.08] glass-modal sm:rounded-[32px] transform-gpu will-change-transform"
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
