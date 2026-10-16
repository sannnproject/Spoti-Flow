# SpotiFlow — High-Fidelity Spotify Media & Artwork Extractor

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="SpotiFlow Logo" width="80" height="80" />
</p>

<p align="center">
  <strong>An open-source, high-performance web application designed to extract studio-quality MP3 audio streams, embedded ID3 tags, and lossless album artwork from Spotify URLs.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture--logic">Architecture & Logic</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#vercel-deployment">Deploy to Vercel</a> •
  <a href="#credits">Credits</a>
</p>

---

## ⚡ Overview

**SpotiFlow** is an open-source media extractor engineered for developers and audio enthusiasts. Unlike ad-heavy download sites, SpotiFlow delivers a clean, serious, and minimalist user experience inspired by the design language of **Vercel** and **GitHub Dark**.

It connects to upstream high-speed CDN media nodes to resolve raw audio streams, extracts ID3 metadata tags (Title, Artist, Album, Release Year, Track Duration), renders an interactive browser audio preview player, and pipes downloads directly through a streaming proxy to bypass cross-origin restrictions.

---

## ✨ Key Features

- **2-Step Stream Extraction Engine**: Resolves Spotify track metadata and upstream CDN authorization tokens.
- **Direct & Proxy Downloading**:
  - **Proxy Download (`/api/download`)**: Streams binary audio data with proper `Content-Disposition: attachment; filename="Artist - Title.mp3"` headers to trigger authentic file saves on desktop and mobile.
  - **Direct CDN Link**: Fallback high-speed direct mirror for fast global caching.
- **Embedded In-Browser Audio Player**:
  - Interactive play/pause state.
  - Scrubbable timeline seeker with accurate duration format.
  - Native volume and mute controls.
- **Lossless Cover Artwork Extractor**: Downloads original full-resolution album covers (up to 640×640 / HD).
- **Vercel & GitHub Dark Aesthetic**:
  - Pure `#000000` canvas with `#0d1117` and `#161b22` cards.
  - High-contrast typography and subtle `#30363d` structural borders.
  - Zero telemetry, zero third-party tracking scripts, zero intrusive advertisements.
- **Mobile Native UX**: Fully responsive on iOS Safari (saves to the Files app) and Android (saves directly to the Downloads folder).
- **Client-Side Conversion History**: Persisted in `localStorage` with quick re-download and 1-click clear actions.
- **Vercel Serverless Ready**: Native deployment configuration with `vercel.json` and standalone serverless API handlers in `/api`.

---

## 🔬 Architecture & Logic Deep Dive

SpotiFlow executes a deterministic two-step token exchange protocol to retrieve audio streams without requiring Spotify user authentication or API credentials.

```
[User Input: Spotify URL]
          │
          ▼
┌────────────────────────┐
│  URL Sanitizer &       │ ── Validates host (open.spotify.com / spotify.link)
│  Validation Layer      │ ── Strips tracking query parameters (?si=..., utm=...)
└────────────────────────┘
          │
          ▼ (Step 1: Action Request)
┌────────────────────────┐
│ POST /action           │ ── Sends URL to upstream extraction service (SpotiDown engine)
│ Upstream Handshake     │ ── Receives HTML with base64 'data' token, 'base', and CSRF 'token'
└────────────────────────┘
          │
          ├──> [Decode Base64 JSON] ──> Title, Artist, Album, Cover, Duration, Year
          │
          ▼ (Step 2: Stream Tokenization)
┌────────────────────────┐
│ POST /action/track     │ ── Sends session cookies, 'data', 'base', and 'token'
│ Stream Resolution      │ ── Extracts Rapid CDN media tokens for MP3 and HD Cover
└────────────────────────┘
          │
          ▼
┌────────────────────────┐
│ Client Presentation    │ ── Renders Track Card, Album Art, and Audio Preview Player
└────────────────────────┘
          │
          ▼
┌────────────────────────┐
│ /api/download Proxy    │ ── Streams audio binary with clean ID3 filename & audio/mpeg MIME
└────────────────────────┘
```

### 1. Step 1: Upstream Action Handshake (`POST https://spotidown.app/action`)
- Input: Canonical track URL (e.g. `https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT`).
- Headers: Specific Chrome User-Agent, Origin, and Referer headers.
- Output: Returns a JSON response containing an HTML block with three hidden input elements:
  - `data`: A base64-encoded JSON payload containing raw Spotify metadata (`name`, `artist`, `album`, `cover`, `duration`, `date`, `tid`).
  - `base`: The normalized Spotify resource URI.
  - `token`: An anti-abuse validation token.
- Cookie Retention: Session cookies (`set-cookie`) are preserved for the subsequent handshake.

### 2. Step 2: Stream Resolution (`POST https://spotidown.app/action/track`)
- Payload: `data`, `base`, and `token` alongside session cookies.
- Output: Returns an HTML fragment containing high-speed CDN URLs hosted on `rapid.spotidown.app/v2?token=...`.
- RegEx matching extracts:
  - `mp3`: Direct audio stream URL.
  - `coverHd`: High-resolution lossless artwork URL.

### 3. Step 3: Streaming Proxy Pipeline (`/api/download`)
- Web browsers often block cross-origin downloads or open audio links in a new browser tab instead of triggering a file download.
- SpotiFlow provides `/api/download?url=<ENCODED_CDN_URL>&filename=<CLEAN_FILENAME>`:
  - Fetches the audio stream server-side.
  - Pipes the binary buffer to the client with `Content-Disposition: attachment; filename="..."` and `Content-Type: audio/mpeg`.
  - Enables one-tap saving across mobile and desktop browsers.

---

## 🛠 Tech Stack

| Domain | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | [React](https://react.dev/) | `^19.0.1` | Component architecture & state management |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `^7.0.2` | Strict type safety and compilation |
| **Build Tooling** | [Vite](https://vite.dev/) | `^8.3.0` | Sub-millisecond HMR & optimized production bundling |
| **CSS & Design** | [Tailwind CSS](https://tailwindcss.com/) | `^4.3.3` | Utility-first styling via `@tailwindcss/vite` |
| **Icons** | [Lucide React](https://lucide.dev/) | `^0.546.0` | Minimalist interface iconography |
| **Serverless Backend** | [Vercel Functions](https://vercel.com/) | Serverless | `/api/spotify.ts` & `/api/download.ts` handlers |
| **Dev API Middleware** | Connect / Vite Middleware | Embedded | Seamless zero-port development proxy in `vite.config.ts` |
| **Unit Testing** | [Node.js Test Runner](https://nodejs.org/api/test.html) | Native (Node 22) | Fast, dependency-free tests via `node:test` & `node:assert` |

---

## 📂 Project Structure

```
├── api/                          # Vercel Serverless Functions
│   ├── download.ts               # Streaming proxy handler with Content-Disposition
│   └── spotify.ts                # Production scraping endpoint for Vercel
├── src/
│   ├── components/
│   │   ├── AudioPlayer.tsx       # Embedded HTML5 audio preview player & timeline
│   │   ├── Footer.tsx            # Legal disclaimer & SANN404 developer credit
│   │   ├── Header.tsx            # Top navigation bar with official Spotify SVG logo
│   │   ├── RecentHistory.tsx     # LocalStorage conversion cache drawer
│   │   ├── TechnicalFaq.tsx      # Mobile saving guide (iOS/Android) & documentation
│   │   ├── TrackCard.tsx         # Extracted track details, artwork, and download CTA
│   │   └── UrlInput.tsx          # URL bar with clipboard paste, clear, & sample chips
│   ├── lib/
│   │   ├── spotifyScraper.ts     # Core 2-stage scraping logic, URL validation, & sanitization
│   │   └── spotifyScraper.test.ts# Deterministic unit tests (node:test)
│   ├── App.tsx                   # Main orchestrator component
│   ├── index.css                 # Global CSS styles & Vercel grid background
│   ├── main.tsx                  # React 19 entry point mounting to DOM #root
│   └── vite-env.d.ts             # Vite client TypeScript definitions
├── index.html                    # HTML entry point with metadata & OpenGraph tags
├── metadata.json                 # Applet metadata configuration
├── package.json                  # Dependencies, scripts, and project manifest
├── tsconfig.json                 # TypeScript compiler configuration
├── vercel.json                   # Zero-config Vercel deployment manifest
└── vite.config.ts                # Vite configuration with embedded dev API middleware
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `>= 20.x` (Node 22 recommended)
- `npm`, `pnpm`, or `bun`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sanigantengbet-source/SPOTDOWNLOWp.git
   cd SPOTDOWNLOWp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000`. Both the frontend and backend API endpoints are available on this single port.

---

## 🧪 Running Unit Tests

The test suite validates pure business logic (URL validation, base64 payload decoding, and cross-platform filename sanitization) using Node's native test runner:

```bash
node --test src/lib/spotifyScraper.test.ts
```

Output:
```
✔ validateSpotifyUrl correctly validates Spotify track URL
✔ validateSpotifyUrl identifies non-track Spotify types (playlist)
✔ validateSpotifyUrl parses spotify:track: URI
✔ validateSpotifyUrl rejects non-Spotify URLs
✔ validateSpotifyUrl rejects empty input
✔ parseMetadata safely unpacks base64 JSON
✔ parseMetadata handles malformed base64 without throwing
✔ sanitizeFilename produces clean, safe filenames across OSes
```

---

## 📡 API Reference

### 1. Extract Track Metadata & Download Streams
Extracts Spotify metadata and direct CDN media links.

- **Endpoint**: `/api/spotify`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "url": "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"
  }
  ```

#### Response Example (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "4cOdK2wGLETKBW3PvgPWqT",
    "title": "Never Gonna Give You Up",
    "artist": "Rick Astley",
    "album": "Whenever You Need Somebody",
    "duration": "3:33",
    "releaseYear": 1987,
    "cover": "https://i.scdn.co/image/ab67616d0000b273baf89eb11ec7c657805d2da0",
    "download": {
      "mp3": "https://rapid.spotidown.app/v2?token=eyJhbGciOi...",
      "coverHd": "https://rapid.spotidown.app/v2?token=eyJhbGciOi..."
    }
  }
}
```

---

### 2. Audio Streaming Download Proxy
Streams the media file with forced download attachment headers.

- **Endpoint**: `/api/download`
- **Method**: `GET`
- **Query Parameters**:
  - `url`: Direct CDN media URL (URL encoded).
  - `filename`: Desired filename on save (e.g., `Rick Astley - Never Gonna Give You Up.mp3`).
- **Response**: Binary audio stream (`audio/mpeg`) with `Content-Disposition: attachment`.

---

## ☁️ Deploying to Vercel

SpotiFlow is pre-configured for zero-friction 1-click deployment on [Vercel](https://vercel.com):

1. Push your repository to **GitHub**.
2. Go to **Vercel Dashboard** > **Add New Project** > Import your repository.
3. Vercel automatically detects the configuration from `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Both the Vite single-page application and the serverless functions in `/api/` will be provisioned immediately.

---

## 📱 Mobile Download Guide

- **iOS (iPhone / iPad)**:
  1. Open Safari and paste any Spotify track link.
  2. Tap **Download MP3**.
  3. When Safari displays the download prompt, tap **Download**.
  4. The MP3 file is stored directly in your **Files** app (`Files > Downloads`). You can play it offline or export it to VLC.

- **Android**:
  1. Tap **Download MP3** in Chrome or your default browser.
  2. The file is saved directly into your device's standard **Downloads** folder and automatically appears in your music player app with full ID3 metadata.

---

## ⚖️ Legal Disclaimer

SpotiFlow is an open-source educational utility created for personal backup and media analysis purposes. This project is **not affiliated with, endorsed by, or associated with Spotify AB**.

All trademarks, audio tracks, artist names, album titles, and album covers belong to their respective copyright holders. SpotiFlow does not host, store, or redistribute any copyrighted audio files on its servers; it acts solely as a client-side interface communicating with public extraction endpoints.

---

## 👨‍💻 Credits & Author

- **Developed & Maintained by**: **SANN404 FORUM GROUP**
- **License**: MIT License
- **Feedback & Issues**: Open an issue or submit a pull request on GitHub!
