import type { OfflineMovie } from "./offlineTypes";

export const offlineMovies: OfflineMovie[] = [
  {
    id: -101, title: "Inception", year: "2010", runtime: 148,
    poster: "https://image.tmdb.org/t/p/w500/o01vCoZg5aX3o6G5n2HnZ16Z2eA.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8ZMRsiK8n8qJu92wJ62nMN4gKCH.jpg",
    genres: ["Sci-Fi", "Action", "Mystery"],
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    rating: 8.4, votes: 34500, director: "Christopher Nolan", writer: "Christopher Nolan",
    cast: [
      { id: 1, name: "Leonardo DiCaprio", character: "Cobb", profilePath: "https://image.tmdb.org/t/p/w92/wo2hJv0814J0z2JceNrsjgoLn5r.jpg" },
      { id: 2, name: "Joseph Gordon-Levitt", character: "Arthur", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" },
      { id: 3, name: "Elliot Page", character: "Ariadne", profilePath: "https://image.tmdb.org/t/p/w92/a1D62nB0N6a241ePjGG1g55.jpg" },
      { id: 4, name: "Tom Hardy", character: "Eames", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" }
    ],
    providers: [
      { name: "Apple TV", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" },
      { name: "Amazon Video", logo: "https://image.tmdb.org/t/p/w92/sV1gJu1c4479e0R712R.jpg" }
    ],
    trailerKey: "8hP9D6kZseM", idealSliders: { pace: 65, tone: 45, complexity: 90, intensity: 80 }, idealColors: ["deep-blue", "charcoal", "violet"]
  },
  {
    id: -102, title: "Amélie", year: "2001", runtime: 122,
    poster: "https://image.tmdb.org/t/p/w500/r7p0A89t2Nt9scvj657j6p3tMvG.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/yE5N663tMvG78wJ428HhYJv7G78.jpg",
    genres: ["Comedy", "Romance", "Drama"],
    overview: "Amélie is an innocent and naive girl in Paris with her own sense of justice. She decides to help those around her and, along the way, discovers love.",
    rating: 8.0, votes: 10800, director: "Jean-Pierre Jeunet", writer: "Jean-Pierre Jeunet",
    cast: [
      { id: 10, name: "Audrey Tautou", character: "Amélie Poulain", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" },
      { id: 11, name: "Mathieu Kassovitz", character: "Nino Quincampoix", profilePath: "https://image.tmdb.org/t/p/w92/a1D62nB0N6a241ePjGG1g55.jpg" }
    ],
    providers: [
      { name: "Apple TV", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" }
    ],
    trailerKey: "HWEW_qON2LY", idealSliders: { pace: 40, tone: 85, complexity: 35, intensity: 25 }, idealColors: ["muted-green", "warm-amber", "pale-yellow", "rose"]
  },
  {
    id: -103, title: "The Dark Knight", year: "2008", runtime: 152,
    poster: "https://image.tmdb.org/t/p/w500/qJ2tWw75e1zFjKx241ePjGG1g55.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nMKdUUepfe156n2Iy5h6Z2eA.jpg",
    genres: ["Action", "Crime", "Drama"],
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    rating: 8.5, votes: 31200, director: "Christopher Nolan", writer: "Jonathan Nolan",
    cast: [
      { id: 20, name: "Christian Bale", character: "Bruce Wayne / Batman", profilePath: "https://image.tmdb.org/t/p/w92/wo2hJv0814J0z2JceNrsjgoLn5r.jpg" },
      { id: 21, name: "Heath Ledger", character: "Joker", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" }
    ],
    providers: [
      { name: "Netflix", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" },
      { name: "Apple TV", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" }
    ],
    trailerKey: "LDG9iYyWQPc", idealSliders: { pace: 75, tone: 20, complexity: 55, intensity: 90 }, idealColors: ["charcoal", "red", "gray"]
  },
  {
    id: -104, title: "Everything Everywhere All at Once", year: "2022", runtime: 139,
    poster: "https://image.tmdb.org/t/p/w500/w35xp15G56263t5k68pM5J2aD2o.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fOy2JurLhZ2oXJ241ePjGG1g55.jpg",
    genres: ["Action", "Sci-Fi", "Comedy"],
    overview: "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes connecting with the lives she could have led.",
    rating: 8.0, votes: 6800, director: "Daniel Kwan", writer: "Daniel Scheinert",
    cast: [
      { id: 30, name: "Michelle Yeoh", character: "Evelyn Wang", profilePath: "https://image.tmdb.org/t/p/w92/wo2hJv0814J0z2JceNrsjgoLn5r.jpg" },
      { id: 31, name: "Ke Huy Quan", character: "Waymond Wang", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" }
    ],
    providers: [
      { name: "Amazon Prime Video", logo: "https://image.tmdb.org/t/p/w92/sV1gJu1c4479e0R712R.jpg" }
    ],
    trailerKey: "wxN1Tysgooo", idealSliders: { pace: 80, tone: 60, complexity: 85, intensity: 75 }, idealColors: ["violet", "red", "pale-yellow"]
  },
  {
    id: -105, title: "Interstellar", year: "2014", runtime: 169,
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E7vNIgJyjuBM3PjJ5C.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xJHokZbljvjC1n2Iy5h6Z2eA.jpg",
    genres: ["Sci-Fi", "Drama", "Mystery"],
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    rating: 8.4, votes: 32500, director: "Christopher Nolan", writer: "Jonathan Nolan",
    cast: [
      { id: 40, name: "Matthew McConaughey", character: "Cooper", profilePath: "https://image.tmdb.org/t/p/w92/wo2hJv0814J0z2JceNrsjgoLn5r.jpg" },
      { id: 41, name: "Anne Hathaway", character: "Brand", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" }
    ],
    providers: [
      { name: "Apple TV", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" },
      { name: "Netflix", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" }
    ],
    trailerKey: "zSWdZAHP3Pk", idealSliders: { pace: 50, tone: 50, complexity: 85, intensity: 75 }, idealColors: ["deep-blue", "violet", "teal"]
  },
  {
    id: -106, title: "Paddington 2", year: "2017", runtime: 104,
    poster: "https://image.tmdb.org/t/p/w500/t2NH13Lg560FkLqB2aD2o374.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xJHokZbljvjC1n2Iy5h6Z2eA.jpg",
    genres: ["Comedy", "Family", "Adventure"],
    overview: "Paddington, now happily settled with the Brown family and a popular member of the local community, picks up a series of odd jobs to buy the perfect 100th birthday present for his Aunt Lucy, only for the gift to be stolen.",
    rating: 7.8, votes: 4500, director: "Paul King", writer: "Simon Farnaby",
    cast: [
      { id: 50, name: "Ben Whishaw", character: "Paddington (voice)", profilePath: "https://image.tmdb.org/t/p/w92/wo2hJv0814J0z2JceNrsjgoLn5r.jpg" },
      { id: 51, name: "Hugh Grant", character: "Phoenix Buchanan", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" }
    ],
    providers: [
      { name: "Apple TV", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" }
    ],
    trailerKey: "cKqJy_m508Y", idealSliders: { pace: 50, tone: 95, complexity: 20, intensity: 15 }, idealColors: ["warm-amber", "pale-yellow", "rose"]
  },
  {
    id: -107, title: "Knives Out", year: "2019", runtime: 130,
    poster: "https://image.tmdb.org/t/p/w500/pThyQovBhPLu828HEjJ46o73Hbg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fOy2JurLhZ2oXJ241ePjGG1g55.jpg",
    genres: ["Comedy", "Mystery", "Drama"],
    overview: "When renowned crime novelist Harlan Thrombey is found dead at his estate just after his 85th birthday, the inquisitive and debonair Detective Benoit Blanc is mysteriously enlisted to investigate.",
    rating: 7.9, votes: 14200, director: "Rian Johnson", writer: "Rian Johnson",
    cast: [
      { id: 60, name: "Daniel Craig", character: "Benoit Blanc", profilePath: "https://image.tmdb.org/t/p/w92/wo2hJv0814J0z2JceNrsjgoLn5r.jpg" },
      { id: 61, name: "Ana de Armas", character: "Marta Cabrera", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" }
    ],
    providers: [
      { name: "Apple TV", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" }
    ],
    trailerKey: "qGqiHJTsRkQ", idealSliders: { pace: 65, tone: 75, complexity: 65, intensity: 45 }, idealColors: ["warm-amber", "teal", "violet"]
  },
  {
    id: -108, title: "Parasite", year: "2019", runtime: 132,
    poster: "https://image.tmdb.org/t/p/w500/7IiTTvv38A26z544zOhOIJ521v1.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aP2JurLhZ2oXJ241ePjGG1g55.jpg",
    genres: ["Drama", "Thriller", "Comedy"],
    overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    rating: 8.5, votes: 17500, director: "Bong Joon Ho", writer: "Bong Joon Ho",
    cast: [
      { id: 70, name: "Song Kang-ho", character: "Ki-taek", profilePath: "https://image.tmdb.org/t/p/w92/wo2hJv0814J0z2JceNrsjgoLn5r.jpg" },
      { id: 71, name: "Lee Sun-kyun", character: "Mr. Park", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" }
    ],
    providers: [
      { name: "Apple TV", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" }
    ],
    trailerKey: "SEUXgvriDXw", idealSliders: { pace: 60, tone: 25, complexity: 80, intensity: 85 }, idealColors: ["charcoal", "gray", "red"]
  },
  {
    id: -109, title: "Before Sunrise", year: "1995", runtime: 101,
    poster: "https://image.tmdb.org/t/p/w500/qy5aD9JQwJ28dKq82oE32fD8O.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aP2JurLhZ2oXJ241ePjGG1g55.jpg",
    genres: ["Romance", "Drama"],
    overview: "A young man and woman meet on a train in Europe, and wind up spending one evening together in Vienna. However, they both know that this will probably be their only night together.",
    rating: 8.0, votes: 3800, director: "Richard Linklater", writer: "Richard Linklater",
    cast: [
      { id: 80, name: "Ethan Hawke", character: "Jesse", profilePath: "https://image.tmdb.org/t/p/w92/wo2hJv0814J0z2JceNrsjgoLn5r.jpg" },
      { id: 81, name: "Julie Delpy", character: "Céline", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" }
    ],
    providers: [
      { name: "Apple TV", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" }
    ],
    trailerKey: "25v7N3455kg", idealSliders: { pace: 25, tone: 80, complexity: 40, intensity: 20 }, idealColors: ["dusty-rose", "warm-amber", "deep-blue"]
  },
  {
    id: -110, title: "Eternal Sunshine of the Spotless Mind", year: "2004", runtime: 108,
    poster: "https://image.tmdb.org/t/p/w500/56kLqBoG2aD2o374MvG.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aP2JurLhZ2oXJ241ePjGG1g55.jpg",
    genres: ["Sci-Fi", "Drama", "Romance"],
    overview: "Joel Barish, heartbroken that his girlfriend Clementine underwent a procedure to erase him from her memory, decides to do the same. However, as he watches his memories fade, he realizes he still loves her.",
    rating: 8.1, votes: 13500, director: "Michel Gondry", writer: "Charlie Kaufman",
    cast: [
      { id: 90, name: "Jim Carrey", character: "Joel Barish", profilePath: "https://image.tmdb.org/t/p/w92/wo2hJv0814J0z2JceNrsjgoLn5r.jpg" },
      { id: 91, name: "Kate Winslet", character: "Clementine Kruczynski", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" }
    ],
    providers: [
      { name: "Apple TV", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" }
    ],
    trailerKey: "yE-f1alkq9I", idealSliders: { pace: 40, tone: 60, complexity: 80, intensity: 55 }, idealColors: ["violet", "deep-blue", "rose"]
  },
  {
    id: -111, title: "Whiplash", year: "2014", runtime: 107,
    poster: "https://image.tmdb.org/t/p/w500/7IiTTvv38A26z544zOhOIJ521v1.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aP2JurLhZ2oXJ241ePjGG1g55.jpg",
    genres: ["Drama", "Music"],
    overview: "Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost, even his humanity.",
    rating: 8.4, votes: 14200, director: "Damien Chazelle", writer: "Damien Chazelle",
    cast: [
      { id: 100, name: "Miles Teller", character: "Andrew Neiman", profilePath: "https://image.tmdb.org/t/p/w92/wo2hJv0814J0z2JceNrsjgoLn5r.jpg" },
      { id: 101, name: "J.K. Simmons", character: "Terence Fletcher", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" }
    ],
    providers: [
      { name: "Netflix", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" },
      { name: "Apple TV", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" }
    ],
    trailerKey: "7d_jQyGLDVc", idealSliders: { pace: 85, tone: 30, complexity: 50, intensity: 95 }, idealColors: ["red", "charcoal"]
  },
  {
    id: -112, title: "La La Land", year: "2016", runtime: 128,
    poster: "https://image.tmdb.org/t/p/w500/uDO8ZMRsiK8n8qJu92wJ62nM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aP2JurLhZ2oXJ241ePjGG1g55.jpg",
    genres: ["Comedy", "Romance", "Drama"],
    overview: "Mia, an aspiring actress, and Sebastian, a dedicated jazz musician, are struggling to make ends meet in a city known for crushing hopes and breaking hearts.",
    rating: 7.9, votes: 15800, director: "Damien Chazelle", writer: "Damien Chazelle",
    cast: [
      { id: 110, name: "Ryan Gosling", character: "Sebastian Wilder", profilePath: "https://image.tmdb.org/t/p/w92/wo2hJv0814J0z2JceNrsjgoLn5r.jpg" },
      { id: 111, name: "Emma Stone", character: "Mia Dolan", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" }
    ],
    providers: [
      { name: "Netflix", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" },
      { name: "Apple TV", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" }
    ],
    trailerKey: "0pdqf4P9MB8", idealSliders: { pace: 55, tone: 80, complexity: 35, intensity: 45 }, idealColors: ["pale-yellow", "rose", "warm-amber"]
  },
  {
    id: -113, title: "The Grand Budapest Hotel", year: "2014", runtime: 99,
    poster: "https://image.tmdb.org/t/p/w500/eG6aD9JQwJ28dKq82oE32fD8O.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aP2JurLhZ2oXJ241ePjGG1g55.jpg",
    genres: ["Comedy", "Drama"],
    overview: "The writer relates his adventures at a renowned European resort hotel between the first and second World Wars with a concierge who is wrongly framed for murder.",
    rating: 8.0, votes: 13900, director: "Wes Anderson", writer: "Wes Anderson",
    cast: [
      { id: 120, name: "Ralph Fiennes", character: "Monsieur Gustave H.", profilePath: "https://image.tmdb.org/t/p/w92/wo2hJv0814J0z2JceNrsjgoLn5r.jpg" },
      { id: 121, name: "Tony Revolori", character: "Zero Moustafa", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" }
    ],
    providers: [
      { name: "Apple TV", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" }
    ],
    trailerKey: "1Fg5iWmQjwk", idealSliders: { pace: 70, tone: 70, complexity: 50, intensity: 35 }, idealColors: ["pale-yellow", "warm-amber", "violet"]
  },
  {
    id: -114, title: "Se7en", year: "1995", runtime: 127,
    poster: "https://image.tmdb.org/t/p/w500/69SskjvISSM6YkUpgbBhPLu828H.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aP2JurLhZ2oXJ241ePjGG1g55.jpg",
    genres: ["Crime", "Mystery", "Thriller"],
    overview: "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.",
    rating: 8.3, votes: 19800, director: "David Fincher", writer: "Andrew Kevin Walker",
    cast: [
      { id: 130, name: "Brad Pitt", character: "David Mills", profilePath: "https://image.tmdb.org/t/p/w92/wo2hJv0814J0z2JceNrsjgoLn5r.jpg" },
      { id: 131, name: "Morgan Freeman", character: "William Somerset", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" }
    ],
    providers: [
      { name: "Netflix", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" },
      { name: "Apple TV", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" }
    ],
    trailerKey: "znmZoYJ7P4E", idealSliders: { pace: 45, tone: 10, complexity: 75, intensity: 95 }, idealColors: ["charcoal", "gray"]
  },
  {
    id: -115, title: "Lost in Translation", year: "2003", runtime: 102,
    poster: "https://image.tmdb.org/t/p/w500/wkJ56G2J9o2Nt2scK6o86f8aD11.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aP2JurLhZ2oXJ241ePjGG1g55.jpg",
    genres: ["Drama", "Romance"],
    overview: "Two lonely Americans, a middle-aged actor and a young girl, meet in Tokyo and strike up an unexpected, deeply understanding friendship.",
    rating: 7.7, votes: 6800, director: "Sofia Coppola", writer: "Sofia Coppola",
    cast: [
      { id: 140, name: "Bill Murray", character: "Bob Harris", profilePath: "https://image.tmdb.org/t/p/w92/wo2hJv0814J0z2JceNrsjgoLn5r.jpg" },
      { id: 141, name: "Scarlett Johansson", character: "Charlotte", profilePath: "https://image.tmdb.org/t/p/w92/4tA3uF362wH0YVv2d0hZ6m1c4.jpg" }
    ],
    providers: [
      { name: "Apple TV", logo: "https://image.tmdb.org/t/p/w92/p10mqPMn16z6QLc14479e0R712R.jpg" }
    ],
    trailerKey: "sU0oZsqeG_s", idealSliders: { pace: 20, tone: 70, complexity: 45, intensity: 15 }, idealColors: ["deep-blue", "gray", "muted-green"]
  }
];
