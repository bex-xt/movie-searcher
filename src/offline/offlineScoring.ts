import type { OfflineMovie } from "./offlineTypes";

export function scoreOfflineMovie(
  movie: OfflineMovie,
  selectedColorIds: string[],
  direction: "reflect" | "shift",
  sliders: { pace: number; tone: number; complexity: number; intensity: number }
): number {
  let baseScore = 72;

  const matchingColors = movie.idealColors.filter((color) =>
    selectedColorIds.includes(color)
  );
  baseScore += matchingColors.length * 8;

  const targetSliders = { ...sliders };

  if (direction === "shift") {
    const hasDark = selectedColorIds.some((id) => ["charcoal", "red"].includes(id));
    const hasLight = selectedColorIds.some((id) => ["pale-yellow", "warm-amber", "rose"].includes(id));
    const hasBlueGray = selectedColorIds.some((id) => ["deep-blue", "gray", "teal", "muted-green", "violet"].includes(id));

    if (hasDark) {
      targetSliders.tone = Math.min(100, sliders.tone + 30);
      targetSliders.intensity = Math.max(0, sliders.intensity - 25);
    }
    if (hasLight) {
      targetSliders.complexity = Math.min(100, sliders.complexity + 30);
      targetSliders.tone = Math.max(0, sliders.tone - 20);
    }
    if (hasBlueGray) {
      targetSliders.tone = Math.min(100, sliders.tone + 25);
      targetSliders.intensity = Math.min(100, sliders.intensity + 15);
    }
  }

  const paceDiff = Math.abs(movie.idealSliders.pace - targetSliders.pace);
  const toneDiff = Math.abs(movie.idealSliders.tone - targetSliders.tone);
  const complexityDiff = Math.abs(movie.idealSliders.complexity - targetSliders.complexity);
  const intensityDiff = Math.abs(movie.idealSliders.intensity - targetSliders.intensity);

  const penalty = (paceDiff + toneDiff + complexityDiff + intensityDiff) * 0.15;
  const finalScore = Math.round(baseScore - penalty);

  return Math.max(75, Math.min(98, finalScore));
}

export function buildOfflineMatchChips(
  colors: { id: string; name: string; tags: string[] }[],
  direction: "reflect" | "shift",
  sliders: { pace: number; tone: number; complexity: number; intensity: number },
  wildcard: boolean,
  matchScore: number
): string[] {
  const chips: string[] = [];

  if (colors.length > 0) {
    chips.push(`Mood: ${colors.map((c) => c.name).join(" & ")}`);
  }

  chips.push(direction === "shift" ? "Vibe Pivot" : "Vibe Echo");

  const pace = sliders.pace;
  if (pace < 35) chips.push("Slow-Burn");
  else if (pace > 65) chips.push("High-Tempo");

  const tone = sliders.tone;
  if (tone < 35) chips.push("Visceral Tone");
  else if (tone > 65) chips.push("Luminous Tone");

  const complexity = sliders.complexity;
  if (complexity < 35) chips.push("Direct Plot");
  else if (complexity > 65) chips.push("Intricate Plot");

  if (wildcard) {
    chips.push("Wildcard Pick");
  }

  chips.push(`${matchScore}% Match`);

  return chips.slice(0, 5);
}

export function reasonForOfflineMovie(
  movie: OfflineMovie,
  colors: { id: string; name: string; tags: string[] }[],
  direction: "reflect" | "shift",
  sliders: { pace: number; tone: number; complexity: number; intensity: number },
  wildcard: boolean
): string {
  const colorNames = colors.map((c) => c.name).slice(0, 2).join(" and ") || "your color spectrum";

  let tone = sliders.tone;
  const pace = sliders.pace;
  let complexity = sliders.complexity;

  if (direction === "shift") {
    const colorIds = colors.map((c) => c.id);
    const hasDark = colorIds.some((id) => ["charcoal", "red"].includes(id));
    const hasLight = colorIds.some((id) => ["pale-yellow", "warm-amber", "rose"].includes(id));
    const hasBlueGray = colorIds.some((id) => ["deep-blue", "gray", "teal", "muted-green", "violet"].includes(id));

    if (hasDark) {
      tone = Math.min(100, tone + 30);
    }
    if (hasLight) {
      complexity = Math.min(100, complexity + 30);
      tone = Math.max(0, tone - 20);
    }
    if (hasBlueGray) {
      tone = Math.min(100, tone + 25);
    }
  }

  const paceText = pace > 58 ? "dynamic tempo" : "slow burn pacing";
  const toneText = tone > 58 ? "comforting luminosity" : "grave atmospheric shadows";
  const complexityText = complexity > 58 ? "intricate narrative depth" : "direct, engaging storytelling";

  if (wildcard) {
    return `Selected as a wildcard match for your ${colorNames} spectrum. Chosen specifically to disrupt standard scroll patterns by introducing ${movie.title} as a fresh narrative route.`;
  }

  if (direction === "shift") {
    return `Highly tailored for your vibe trajectory. We mapped your ${colorNames} mood and steered the tone of ${movie.title} toward ${toneText} to successfully pivot your emotional state.`;
  }

  return `Chosen to mirror your current state. Maps directly to your ${colorNames} selection, delivering a ${paceText} and ${toneText} with ${complexityText} to reflect your frequency.`;
}
