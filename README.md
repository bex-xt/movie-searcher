# 🎬 Netflix De-Syndrome

A minimalist, mood-first movie discovery site designed to cure the endless scrolling and decision fatigue associated with modern streaming platforms. Rather than overwhelming you with hundreds of algorithmic tiles, **Netflix De-Syndrome** guides you through a mindful 4-step mood calibration and presents exactly five highly-tailored recommendations. 

**Pick your mood. Get five movies. Stop scrolling.**

---

## 🚀 Live Demo Setup

### 1. Prerequisites
To run this application locally, you **strictly require** API credentials from **The Movie Database (TMDB)**. The app performs real-time queries to TMDB and does not contain a hardcoded offline fallback list.

### 2. Environment Setup
1. Clone or download the repository to your local system.
2. In the root directory, create a file named `.env.local` by duplicating `.env.example` or creating it manually:
   ```bash
   # Copy template
   cp .env.example .env.local
   ```
3. Open `.env.local` and add either your TMDB v4 Read Access Token or your TMDB v3 API Key:
   ```env
   # Recommended (TMDB v4 Read Access Token)
   TMDB_ACCESS_TOKEN=your_tmdb_read_access_token_here

   # Alternative (TMDB v3 API Key)
   TMDB_API_KEY=your_tmdb_api_key_here
   ```

### 3. Installation & Start
Install the dependencies and run the local development server:
```bash
# Install packages
npm install

# Start Next.js dev server
npm run dev
```
Once started, open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🎨 Core Discovery Flow

Netflix De-Syndrome maps your emotional state to cinema choices using a beautiful 4-step progress-tracked wizard:

1. **Color Pick (Mood Selection)**: Pick exactly two vibrant colors that capture your current emotional headspace.
2. **Vibe Direction**: Decide whether the recommendation should **Reflect** your current state (providing validation and catharsis) or **Shift** your state (steering you towards a new mood).
3. **Fine-Tuning Sliders**: Adjust four cinematic sliders with live, localized descriptive cues:
   - ⏱️ **Pacing**: *Slow Burn* vs. *Fast-Moving*
   - 🎭 **Tone**: *Dark Edge* vs. *Light Landing*
   - 🧩 **Complexity**: *Easy Path* vs. *Room to Think*
   - ⚡ **Intensity**: *Gentle* vs. *High-Stakes*
4. **The Rule of Five**: Instantly receive exactly five highly-curated, top-rated movies matching your exact calibration.

---

## ✨ Implemented Features

This application focuses strictly on a high-fidelity, high-polish local experience with **zero logins, zero databases, and zero tracking**:

* **Return-User Session Memory**: Automatically remembers your last successful calibration (colors, direction, and sliders) in client `localStorage`. Surfaced via a glassmorphic **Welcome Back** modal upon return, allowing you to restore your previous vibe instantly or recalibrate.
* **Saved Movie Picks Overlay**: A compact bookmarking system utilizing `localStorage`. Users can bookmark movies directly from the cards or detail modal, tracking them in a sliding sidebar panel. Features YouTube trailer links and direct metadata retrieval.
* **Why This Matched Analytical Chips**: The detailed view of each movie features a clear breakdown explaining the recommendation, categorized into custom color-coded chips (Mood, Pace, Tone, Complexity, Intensity, and TMDB Quality score based on average ratings and vote count).
* **Explore More Like This (Seed Recommendations)**: Want to dive deeper? Click "Explore more like this" to instantly recalibrate the entire recommendations batch using that specific movie as an anchor seed, tracing matching directors, genres, and keywords.
* **Show Me 5 More (Fresh Draw)**: Safely request a new batch of 5 movies. The server-side algorithm retrieves fresh options from TMDB while strictly avoiding movies you've already seen or marked in your saved picks.
* **Watch Trailers & US Watch Providers**: Deep-links to trailers directly embedded in a high-fidelity YouTube video modal overlay. Displays localized streaming, rental, and purchasing options for the US region.
* **Aesthetic Micro-Animations**: Built with a sleek, premium dark glassmorphic design system using harmonic HSL colors, smooth Framer Motion transitions, and fully responsive mobile layouts.

---

## 🛠️ Technical Stack

* **Framework**: [Next.js 16.2.6 (App Router)](https://nextjs.org/)
* **State Management**: [React 19.2.4 Hooks](https://react.dev/) & [Zustand 5.0.13](https://zustand.docs.pmnd.rs/) (for fluid, modular overlays)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & PostCSS (a combination of modern utility structures and highly custom glassmorphic CSS rules)
* **Animations**: [Framer Motion 12.40.0](https://www.framer.com/motion/) (for step transitions, drawer slides, and hover micro-animations)
* **Icons**: [Lucide React 1.16.0](https://lucide.dev/)
* **Data Provider**: [TMDB REST API](https://developer.themoviedb.org/)

---

## 🏆 Competition Notes

### 1. Why Netflix De-Syndrome is Highly Useful
Traditional streaming interfaces are built to maximize *engagement time*, leading users down endless grids of infinite scroll. This creates choice paralysis (Hick's Law). Netflix De-Syndrome is a tool built for the user rather than the platform—turning media selection into a mindful, rapid emotional ritual. 

### 2. Originality in Design
Unlike typical search platforms that ask you to filter dry checkboxes (e.g., *"Action, PG-13, 2018"*), De-Syndrome translates **emotions** and **narrative texture**. By pairing colors with abstract mood metrics (Pace, Tone, Complexity, Intensity) rather than conventional genres, the app matches how humans actually feel.

### 3. Mood Calibration & Scoring Matrix
Your color picks map to emotional profiles (e.g., violet and blue pair to form introspective sadness). Choosing **Reflect** queries similar emotional cinematic themes, while **Shift** pulls contrasting palettes. Sliders then adjust search filters dynamically. A server-side algorithm queries TMDB and calculates a weighted matching score for each candidate, prioritizing critical acclaim (sorting by high-quality review averages) while including a curated **Wildcard** in the fifth slot to nudge you out of your comfort zone.

### 4. Hick's Law: The Rule of Five
Limiting the final selection to exactly five options eliminates decision fatigue. Five choices are enough to give you a sense of agency, but small enough that your brain can easily evaluate and commit without spiraling.

---

## 🤖 Codex & AI Collaboration Disclosure

This project was built in deep pair programming collaboration with **Antigravity**, a powerful AI coding assistant created by Google DeepMind. Our collaboration focused on four major areas:

1. **UX/UI Refinement & Glassmorphism**: Designed the dark mode design language, crafted responsive CSS utilities, and structured Framer Motion layouts to make the 4-step calibration wizard and sliding panels feel alive, smooth, and premium.
2. **Recommendation Logic Planning**: Architected the server-side API query relaxation engine (`route.ts`). It handles TMDB requests across multiple decades and dynamically adjusts filter criteria until five high-quality options are found, ensuring the "Rule of Five" remains fast and robust even with highly unique slider settings. We also implemented a strict filter to exclude animated titles, ensuring a focus on live-action cinema.
3. **Debugging, Type-Safety & Code Cleanup**: Replaced standard React placeholders with strict TypeScript typings, purged legacy states/filters, sanitized JSX characters to ensure 100% React rendering safety, and implemented a custom async effect timing wrapper to prevent Next.js SSR hydration mismatches on client localStorage retrieval.
4. **Competition-Focused Enhancements**: Designed the session memory restoring system, created the "Why This Matched" analytical indicator chips, integrated YouTube trailer overlays, and built the local Saved Picks bookmarking database.
