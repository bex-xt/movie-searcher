export function getVibeLabel(key: string, value: number): string {
  const labels: Record<string, [string, string, string]> = {
    pace: ["slow burn", "balanced pace", "fast-moving"],
    tone: ["dark", "balanced tone", "comforting"],
    complexity: ["easy watch", "moderate depth", "mind-bending"],
    intensity: ["low-stakes", "moderate stakes", "heavy"],
  };
  const [low, mid, high] = labels[key] || ["low", "mid", "high"];
  if (value < 35) return low;
  if (value > 65) return high;
  return mid;
}

export function formatSavedAt(timestamp?: number): string {
  if (!timestamp) return "Saved recently";
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Saved just now";
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `Saved ${mins} min${mins === 1 ? "" : "s"} ago`;
  }
  if (diff < 86400000) {
    const hrs = Math.floor(diff / 3600000);
    return `Saved ${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  }
  const date = new Date(timestamp);
  return `Saved on ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `${red} ${green} ${blue}`;
}
