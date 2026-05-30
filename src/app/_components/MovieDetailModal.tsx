"use client";

/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import { Bookmark, Compass, Play, Star, X } from "lucide-react";
import { useState } from "react";
import type { Recommendation } from "@/app/_types/movie";

export function MovieDetailModal({
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
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:bg-black/60 sm:p-6 sm:backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
        className="relative w-full max-w-5xl overflow-hidden rounded-t-[28px] glass-modal sm:rounded-[32px] transform-gpu will-change-transform"
        onClick={(e) => e.stopPropagation()}
      >

        {movie.backdrop && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-10 sm:opacity-15 sm:filter sm:blur-xl sm:scale-105"
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
