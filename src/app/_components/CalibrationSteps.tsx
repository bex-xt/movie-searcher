"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SkeletonGrid } from "@/app/_components/Skeletons";
import { Slider, StepCard } from "@/app/_components/StepControls";
import { moodColors, presets, sliderCopy } from "@/app/_data/moodConfig";
import type { Direction, MoodSliders } from "@/app/_types/movie";

type CalibrationStepsProps = {
  step: number;
  selectedColors: string[];
  toggleColor: (id: string) => void;
  direction: Direction;
  setDirection: (direction: Direction) => void;
  sliders: MoodSliders;
  setSliders: (sliders: MoodSliders | ((current: MoodSliders) => MoodSliders)) => void;
  setStep: (step: number) => void;
  getRecommendations: () => void;
  loading: boolean;
};

export function CalibrationSteps({
  step,
  selectedColors,
  toggleColor,
  direction,
  setDirection,
  sliders,
  setSliders,
  setStep,
  getRecommendations,
  loading,
}: CalibrationStepsProps) {
  return (
    <>
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
    </>
  );
}
