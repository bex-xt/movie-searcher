"use client";

/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import { Bookmark, ChevronRight, Play } from "lucide-react";
import { useState } from "react";
import { cardVariants } from "@/app/_data/moodConfig";
import type { Recommendation } from "@/app/_types/movie";

export function MovieCard({
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
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      onClick={onSelect}
      className="group relative flex h-full cursor-pointer flex-row overflow-hidden rounded-2xl border border-white/[0.06] glass-card transition-colors duration-200 hover:border-white/15 sm:flex-col transform-gpu will-change-transform"
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
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025] transform-gpu"
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
