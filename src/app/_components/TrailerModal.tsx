"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Recommendation } from "@/app/_types/movie";

export function TrailerModal({ movie, onClose }: { movie: Recommendation; onClose: () => void }) {
  return (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose()}
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
              <p className="truncate font-serif text-lg sm:text-2xl">{movie.title} Trailer</p>
              <button onClick={() => onClose()} className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white">
          <X size={18} />
              </button>
            </div>
            {movie.trailerKey ? (
              <div className="aspect-video overflow-hidden rounded-[24px] bg-black shadow-2xl shadow-black">
          <iframe
            title={`${movie.title} trailer`}
            src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`}
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
  );
}
