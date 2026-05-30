import { useState, useEffect, useMemo } from "react";
import type { CSSProperties } from "react";
import type { Direction, MoodColor } from "@/app/_types/movie";
import { moodColors } from "@/app/_data/moodConfig";
import { hexToRgb } from "@/app/_lib/uiHelpers";

export function useVibeState() {
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
        if (saved) setLastVibe(JSON.parse(saved));
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

  function toggleColor(id: string) {
    setSelectedColors((current) => {
      if (current.includes(id)) return current.filter((color) => color !== id);
      if (current.length === 2) return [current[1], id];
      return [...current, id];
    });
  }

  const activeMood = useMemo(
    () => moodColors.find((color) => color.id === selectedColors[selectedColors.length - 1]) || moodColors[2],
    [selectedColors],
  );

  const selectedMoodTags = useMemo(
    () => moodColors.filter((color) => selectedColors.includes(color.id)).flatMap((color) => color.tags).slice(0, 6),
    [selectedColors],
  );

  const selectedColorObjects = useMemo(
    () => selectedColors.map((id) => moodColors.find((color) => color.id === id)).filter(Boolean) as MoodColor[],
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

  return {
    step,
    setStep,
    selectedColors,
    setSelectedColors,
    direction,
    setDirection,
    sliders,
    setSliders,
    lastVibe,
    setLastVibe,
    restoreLastVibe,
    toggleColor,
    activeMood,
    selectedMoodTags,
    selectedColorObjects,
    shellStyle,
  };
}
