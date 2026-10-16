import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { TrackCard } from './components/TrackCard';
import { RecentHistory } from './components/RecentHistory';
import { TechnicalFaq } from './components/TechnicalFaq';
import { Footer } from './components/Footer';
import { SpotifyTrackResult } from './lib/spotifyScraper';
import { AlertCircle, Disc3 } from 'lucide-react';

const STORAGE_KEY = 'spotiflow_recent_tracks_v1';

export default function App() {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrackResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<SpotifyTrackResult[]>([]);
  const [searchedUrl, setSearchedUrl] = useState('');

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load history:', e);
    }

    // Check for ?url= query parameter to autostart
    const params = new URLSearchParams(window.location.search);
    const initialUrl = params.get('url');
    if (initialUrl) {
      handleSearch(initialUrl);
    }
  }, []);

  const saveToHistory = (track: SpotifyTrackResult) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== track.id && item.title !== track.title);
      const updated = [track, ...filtered].slice(0, 8); // Keep top 8
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to persist history:', err);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSearch = async (url: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSearchedUrl(url);

    try {
      const response = await fetch('/api/spotify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || `Server responded with status ${response.status}`);
      }

      setCurrentTrack(json.data);
      saveToHistory(json.data);
    } catch (err: any) {
      console.error('Error fetching track:', err);
      setErrorMessage(
        err.message || 'Unable to fetch track info. Please check the link or try another song.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#e6edf3] flex flex-col font-sans selection:bg-white/20 selection:text-white relative">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#8b949e] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2ea043]"></span>
            <span>Edge Stream Extractor</span>
            <span className="text-[#30363d]">·</span>
            <span>Zero Sign-In</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Spotify Music & Artwork Downloader
          </h1>

          <p className="mt-3.5 text-xs sm:text-sm text-[#8b949e] leading-relaxed max-w-xl mx-auto font-mono">
            Extract studio-quality MP3 audio streams, ID3 tags, and lossless artwork directly from Spotify URLs.
          </p>
        </div>

        {/* Input Form */}
        <div className="mb-8">
          <UrlInput
            onSearch={handleSearch}
            isLoading={isLoading}
            currentUrl={searchedUrl}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-8 text-center animate-pulse shadow-sm">
            <div className="flex flex-col items-center justify-center gap-3">
              <Disc3 className="w-8 h-8 text-white animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white font-mono">Resolving Spotify Stream</p>
                <p className="text-xs text-[#8b949e] font-mono">
                  Parsing track tokens, album artwork, and direct audio stream...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {errorMessage && !isLoading && (
          <div className="bg-[#3d1d24]/50 border border-[#f85149]/60 rounded-xl p-4 sm:p-5 mb-8 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-4 h-4 text-[#f85149] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-[#ff7b72] font-mono">Extraction Error</h4>
              <p className="text-xs text-[#ff7b72]/90 mt-1 leading-relaxed">
                {errorMessage}
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => searchedUrl && handleSearch(searchedUrl)}
                  className="px-3 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white text-xs font-mono rounded-md transition-colors border border-[#30363d] cursor-pointer"
                >
                  Retry Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Result Card */}
        {currentTrack && !isLoading && (
          <div className="mb-10 animate-fadeIn">
            <TrackCard track={currentTrack} />
          </div>
        )}

        {/* Conversion History */}
        <div className="mb-10">
          <RecentHistory
            history={history}
            onSelect={(track) => {
              setCurrentTrack(track);
              setErrorMessage(null);
            }}
            onClear={handleClearHistory}
          />
        </div>

        {/* Technical Guide & FAQ */}
        <TechnicalFaq />
      </main>

      <Footer />
    </div>
  );
}
