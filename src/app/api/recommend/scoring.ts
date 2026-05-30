import type { MoodInput, TmdbMovie } from "./tmdbTypes";

export function scoreMovie(movie: TmdbMovie, input: MoodInput): number {
  const vote = movie.vote_average || 6.5;
  const popularity = Math.min(movie.popularity || 20, 260);
  const base = 62 + (vote - 5.8) * 6 + popularity / 22;
  let tone = input.sliders?.tone ?? 50;
  const pace = input.sliders?.pace ?? 50;
  let complexity = input.sliders?.complexity ?? 50;
  let intensity = input.sliders?.intensity ?? 50;

  const direction = input.direction ?? "reflect";

  if (direction === "shift") {
    const colorIds = input.selectedColors?.map((c) => c.id) || [];
    const hasDark = colorIds.some((id) => ["charcoal", "red"].includes(id));
    const hasLight = colorIds.some((id) => ["pale-yellow", "warm-amber", "rose"].includes(id));
    const hasBlueGray = colorIds.some((id) => ["deep-blue", "gray", "teal", "muted-green", "violet"].includes(id));

    if (hasDark) {
      tone = Math.min(100, tone + 30);
      intensity = Math.max(0, intensity - 25);
    }
    if (hasLight) {
      complexity = Math.min(100, complexity + 30);
      tone = Math.max(0, tone - 20);
    }
    if (hasBlueGray) {
      tone = Math.min(100, tone + 25);
      intensity = Math.min(100, intensity + 15);
    }
  }

  const toneBoost = tone > 55 && movie.genre_ids?.some((id) => [35, 12, 16, 10751].includes(id)) ? 5 : 0;
  const darkBoost = tone < 46 && movie.genre_ids?.some((id) => [53, 80, 9648, 18].includes(id)) ? 5 : 0;
  const paceBoost = pace > 55 && movie.genre_ids?.some((id) => [28, 53, 12].includes(id)) ? 4 : 0;
  const complexityBoost = complexity > 55 && movie.genre_ids?.some((id) => [878, 9648].includes(id)) ? 4 : 0;

  let intensityBoost = 0;
  if (intensity <= 35) {
    if (movie.genre_ids?.some((id) => [27, 53, 80, 28].includes(id))) {
      intensityBoost = -8;
    } else if (movie.genre_ids?.some((id) => [35, 10751, 10749].includes(id))) {
      intensityBoost = 6;
    }
  } else if (intensity >= 65) {
    if (movie.genre_ids?.some((id) => [27, 53, 80, 28].includes(id))) {
      intensityBoost = 6;
    } else if (movie.genre_ids?.some((id) => [35, 10751].includes(id))) {
      intensityBoost = -4;
    }
  }

  return Math.max(76, Math.min(97, Math.round(base + toneBoost + darkBoost + paceBoost + intensityBoost + complexityBoost)));
}

export function buildMatchChips(
  movie: unknown,
  input: MoodInput,
  wildcard: boolean,
  matchScore: number
): string[] {
  const chips: string[] = [];
  const colors = input.selectedColors || [];
  if (colors.length > 0) {
    chips.push(`Mood: ${colors.map((c) => c.name).join(" & ")}`);
  }

  chips.push(input.direction === "shift" ? "Vibe Pivot" : "Vibe Echo");

  const pace = input.sliders?.pace ?? 50;
  if (pace < 35) chips.push("Slow-Burn");
  else if (pace > 65) chips.push("High-Tempo");

  const tone = input.sliders?.tone ?? 50;
  if (tone < 35) chips.push("Visceral Tone");
  else if (tone > 65) chips.push("Luminous Tone");

  const complexity = input.sliders?.complexity ?? 50;
  if (complexity < 35) chips.push("Direct Plot");
  else if (complexity > 65) chips.push("Intricate Plot");

  if (wildcard) {
    chips.push("Wildcard Pick");
  }

  chips.push(`${matchScore}% Match`);

  return chips.slice(0, 5);
}

export function reasonFor(
  title: string,
  input: MoodInput,
  genres: string[],
  wildcard: boolean
): string {
  const colors = input.selectedColors || [];
  const colorNames = colors.map((c) => c.name).slice(0, 2).join(" and ") || "your color spectrum";
  const direction = input.direction ?? "reflect";

  let tone = input.sliders?.tone ?? 50;
  const pace = input.sliders?.pace ?? 50;
  let complexity = input.sliders?.complexity ?? 50;

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
    return `Selected as a wildcard match for your ${colorNames} spectrum. Chosen specifically to disrupt standard scroll patterns by introducing ${title} as a fresh narrative route.`;
  }

  if (direction === "shift") {
    return `Highly tailored for your vibe trajectory. We mapped your ${colorNames} mood and steered the tone of ${title} toward ${toneText} to successfully pivot your emotional state.`;
  }

  return `Chosen to mirror your current state. Maps directly to your ${colorNames} selection, delivering a ${paceText} and ${toneText} with ${complexityText} to reflect your frequency.`;
}

export function buildVibeTags(genres: string[], input: MoodInput): string[] {
  const tags = tagsFor(input).slice(0, 2);
  return [...new Set([...genres.slice(0, 2), ...tags])].slice(0, 4);
}

export function tagsFor(input: MoodInput): string[] {
  const colorTags = input.selectedColors?.flatMap((color) => color?.tags || []) || [];
  const craving = (input.craving || "").toLowerCase();
  const textTags = [
    craving.includes("cozy") && "cozy",
    craving.includes("myster") && "mysterious",
    craving.includes("thriller") && "tense",
    craving.includes("smart") && "cerebral",
    craving.includes("nostalg") && "nostalgic",
    craving.includes("not too heavy") && "light",
    craving.includes("visual") && "atmospheric",
  ].filter(Boolean) as string[];

  return [...new Set([...colorTags, ...textTags])];
}
