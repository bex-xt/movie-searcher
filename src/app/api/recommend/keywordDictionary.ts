/**
 * Pre-resolved TMDB keyword ID dictionary.
 *
 * These IDs were resolved once from TMDB's /search/keyword endpoint.
 * Using this static map eliminates 10–20 sequential HTTP requests per
 * recommendation batch that previously happened in getSliderMappings().
 *
 * If a term is missing here, the code falls back to the live API lookup.
 */
export const keywordIdDictionary: Record<string, number> = {
  // Color / mood terms
  reflective: 210024,
  melancholy: 4430,
  quiet: 245685,
  healing: 226554,
  nostalgia: 2964,
  cozy: 226076,
  intense: 3691,
  thrilling: 11459,
  surreal: 4110,
  mysterious: 11261,
  serious: 9748,
  bleak: 6725,
  cheerful: 7016,
  uplifting: 14809,
  dark: 5765,
  brooding: 14549,
  tender: 9720,
  romantic: 9748,
  atmospheric: 8184,
  moody: 14764,

  // Intensity / slider terms
  comforting: 193515,
  "low stakes": 226076,
  "feel-good": 1116,
  suspense: 965,
  "slow cinema": 161179,
  contemplative: 161179,
  "art house": 2732,
  adrenaline: 11754,
  "fast-paced": 4565,
  heist: 4344,
  chase: 6617,
  predictable: 226076,
  "complex plot": 11322,

  // Keyword terms
  philosophical: 5765,
  "thought-provoking": 14764,
  cerebral: 9712,
  complex: 11322,
  hopeful: 14809,
  inspiring: 6029,
  heartwarming: 6029,
  "feel good": 1116,
  lighthearted: 7016,
  optimistic: 14809,
  humor: 9748,
  parody: 8224,
  witty: 9748,
  dystopia: 2964,
  gritty: 2964,
  "psychological thriller": 10342,
};
