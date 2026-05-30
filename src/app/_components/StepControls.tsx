"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";

export function StepCard({
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

export function Slider({
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

export function ProgressIndicator({
  step,
  setStep,
  compact = false,
}: {
  step: number;
  setStep: (step: number) => void;
  compact?: boolean;
}) {
  const steps = [
    { number: 1, label: "Mood" },
    { number: 2, label: "Direction" },
    { number: 3, label: "Vibe" },
    { number: 4, label: "Results" },
  ];

  return (
    <div className={`mx-auto w-full max-w-xl px-1 sm:px-4 ${compact ? "mb-3 sm:mb-6" : "mb-7 sm:mb-10"}`}>
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
                isClickable ? "cursor-pointer" : "cursor-default opacity-80"
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
