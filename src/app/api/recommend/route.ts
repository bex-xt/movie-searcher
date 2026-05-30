import { NextResponse } from "next/server";
import { getOfflineRecommendations } from "@/offlinePool";
import type { MoodInput } from "./tmdbTypes";
import { buildRecommendations } from "./discovery";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  let input: MoodInput & {
    exclude_ids?: number[];
    excludeIds?: number[];
    seed_movie_id?: number;
    seedMovieId?: number;
  };

  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload provided." }, { status: 400 });
  }

  // 1. Validate selectedColors
  if (!input.selectedColors || !Array.isArray(input.selectedColors) || input.selectedColors.length < 2) {
    return NextResponse.json({ error: "Please select at least two mood colors to generate recommendations." }, { status: 400 });
  }

  // 2. Validate sliders if present
  if (input.sliders) {
    const { pace, tone, complexity, intensity } = input.sliders;
    for (const [key, val] of Object.entries({ pace, tone, complexity, intensity })) {
      if (val !== undefined) {
        if (typeof val !== "number" || val < 0 || val > 100 || Number.isNaN(val)) {
          return NextResponse.json({ error: `Slider '${key}' must be a valid number between 0 and 100.` }, { status: 400 });
        }
      }
    }
  }

  try {
    const excludeIds = input.exclude_ids || input.excludeIds || [];
    const seedMovieId = input.seed_movie_id || input.seedMovieId || null;

    const recommendations = await buildRecommendations(input, excludeIds, seedMovieId);
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("TMDB/Backend recommendation failed. Falling back to offline pool:", error);
    try {
      const excludeIds = input.exclude_ids || input.excludeIds || [];
      const recommendations = getOfflineRecommendations(
        input.selectedColors || [],
        input.direction || "reflect",
        {
          pace: input.sliders?.pace ?? 50,
          tone: input.sliders?.tone ?? 50,
          complexity: input.sliders?.complexity ?? 50,
          intensity: input.sliders?.intensity ?? 50,
        },
        excludeIds
      );
      return NextResponse.json({ recommendations, isOffline: true });
    } catch (fallbackError) {
      const message = fallbackError instanceof Error ? fallbackError.message : "Unknown recommendation error.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
}
