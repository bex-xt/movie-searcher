"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { moodColors } from "@/app/_data/moodConfig";

export function OpeningPanel({
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
