import { Brain, Clapperboard, Eye, Laugh, Scale, Skull, Smile, Zap } from "lucide-react";
import type { Variants } from "framer-motion";
import type { MoodColor } from "@/app/_types/movie";

export const moodColors: MoodColor[] = [
  { id: "deep-blue", name: "Deep blue", hex: "#1d3557", tags: ["reflective", "lonely", "calm", "cerebral"] },
  { id: "muted-green", name: "Muted green", hex: "#8bb596", tags: ["grounded", "healing", "quiet", "natural"] },
  { id: "warm-amber", name: "Warm amber", hex: "#c88b4a", tags: ["nostalgic", "cozy", "hopeful"] },
  { id: "red", name: "Red", hex: "#b52b2b", tags: ["intense", "restless", "passionate"] },
  { id: "violet", name: "Violet", hex: "#74509a", tags: ["surreal", "mysterious", "dreamlike"] },
  { id: "gray", name: "Gray", hex: "#7a7f7b", tags: ["numb", "tired", "serious", "low-energy"] },
  { id: "pale-yellow", name: "Bright yellow", hex: "#f0d66f", tags: ["optimistic", "light", "playful"] },
  { id: "charcoal", name: "Charcoal", hex: "#202020", tags: ["dark", "tense", "brooding", "serious"] },
  { id: "rose", name: "Dusty rose", hex: "#b2777d", tags: ["tender", "romantic", "soft"] },
  { id: "teal", name: "Night teal", hex: "#2e716f", tags: ["curious", "moody", "atmospheric"] },
];

export const sliderCopy = {
  pace: ["Deliberate / Slow-Burn", "Dynamic / High-Tempo", "meditative vs high-velocity"],
  tone: ["Visceral / Shadowed", "Luminous / Uplifting", "dark atmospheric vs warm comforting"],
  complexity: ["Direct / Uncomplicated", "Intricate / Mind-Bending", "straightforward narrative vs deep enigma"],
  intensity: ["Subtle / Low-Stakes", "Profound / High-Stakes", "gentle ambiance vs heavy emotional impact"],
};

export const presets = [
  {
    label: "Cozy & Feel-Good",
    icon: Smile,
    values: { tone: 95, pace: 30, complexity: 15, intensity: 10 },
  },
  {
    label: "Pure Comedy",
    icon: Laugh,
    values: { tone: 85, pace: 70, complexity: 20, intensity: 40 },
  },
  {
    label: "Adrenaline Action",
    icon: Zap,
    values: { tone: 40, pace: 95, complexity: 20, intensity: 90 },
  },
  {
    label: "Psychological Thriller",
    icon: Eye,
    values: { tone: 25, pace: 40, complexity: 85, intensity: 80 },
  },
  {
    label: "Ruthless Gore",
    icon: Skull,
    values: { tone: 5, pace: 50, complexity: 30, intensity: 100 },
  },
  {
    label: "Mind-Bending Sci-Fi",
    icon: Brain,
    values: { tone: 45, pace: 50, complexity: 95, intensity: 60 },
  },
  {
    label: "Slow-Burn Art-House",
    icon: Clapperboard,
    values: { tone: 50, pace: 10, complexity: 80, intensity: 20 },
  },
  {
    label: "Gritty Crime Drama",
    icon: Scale,
    values: { tone: 20, pace: 60, complexity: 60, intensity: 70 },
  },
];


export const loadingMessages = [
  "Reading your mood profile...",
  "Analyzing color spectrum parameters...",
  "Balancing tone and pacing algorithms...",
  "Sculpting narrative texture complexity...",
  "Optimizing cinematic emotional resonance...",
  "Eliminating infinite scroll parameters...",
  "Bypassing decision fatigue syndromics...",
  "Curating exactly five high-caliber matches..."
];

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.04, duration: 0.32, ease: "easeOut" },
  }),
};
