import React, { useState } from 'react';
import { Search, Clipboard, X, Loader2, ArrowRight } from 'lucide-react';
import { validateSpotifyUrl } from '../lib/spotifyScraper';

interface UrlInputProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
  currentUrl?: string;
}

const SAMPLE_TRACKS = [
  {
    name: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    url: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
  },
  {
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
  },
  {
    name: 'Bohemian Rhapsody',
    artist: 'Queen',
    url: 'https://open.spotify.com/track/7tFiyTwD0ph5KSdiEQ2qwz',
  },
];

export const UrlInput: React.FC<UrlInputProps> = ({ onSearch, isLoading, currentUrl = '' }) => {
  const [url, setUrl] = useState(currentUrl);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setValidationError('Please paste or type a Spotify track link.');
      return;
    }

    const validation = validateSpotifyUrl(url);
    if (!validation.isValid && validation.error && !url.includes('spotify.link')) {
      setValidationError(validation.error);
      return;
    }

    setValidationError(null);
    onSearch(url.trim());
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text);
          setValidationError(null);
          const check = validateSpotifyUrl(text);
          if (check.isValid) {
            onSearch(text.trim());
          }
        }
      } else {
        setValidationError('Clipboard read permission is unavailable in your browser. Please paste with Ctrl+V / Cmd+V.');
      }
    } catch {
      setValidationError('Clipboard access denied. Please paste manually into the input box.');
    }
  };

  const handleClear = () => {
    setUrl('');
    setValidationError(null);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setValidationError(null);
    onSearch(sampleUrl);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-[#6e7681] pointer-events-none">
            <Search className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Paste Spotify track URL (e.g. https://open.spotify.com/track/...)"
            disabled={isLoading}
            aria-label="Spotify Track Link"
            className="w-full bg-[#0d1117] hover:bg-[#12161f] focus:bg-[#0d1117] text-[#e6edf3] placeholder-[#6e7681] text-xs sm:text-sm pl-11 pr-28 sm:pr-36 py-3.5 rounded-lg border border-[#30363d] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/40 outline-none transition-all shadow-sm font-sans"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {url && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear input"
                className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] transition-colors rounded hover:bg-[#21262d]"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {!url && !isLoading && (
              <button
                type="button"
                onClick={handlePaste}
                aria-label="Paste from clipboard"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#c9d1d9] hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors border border-[#30363d] font-mono"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              aria-label="Extract and fetch track"
              className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 bg-white hover:bg-[#e6edf3] disabled:opacity-40 disabled:cursor-not-allowed text-[#000000] font-semibold text-xs sm:text-sm rounded-md transition-all active:scale-98 shadow-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                  <span className="hidden sm:inline">Fetching</span>
                </>
              ) : (
                <>
                  <span>Download</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </>
              )}
            </button>
          </div>
        </div>

        {validationError && (
          <div className="mt-2 text-xs text-[#f85149] flex items-center gap-1.5 px-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f85149]"></span>
            <span>{validationError}</span>
          </div>
        )}
      </form>

      {/* Quick sample chips */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#6e7681] font-mono">Quick test:</span>
        {SAMPLE_TRACKS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSample(sample.url)}
            disabled={isLoading}
            className="text-xs text-[#8b949e] hover:text-[#58a6ff] bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff]/40 px-2.5 py-1 rounded-md transition-colors font-mono cursor-pointer"
          >
            {sample.artist} – {sample.name}
          </button>
        ))}
      </div>
    </div>
  );
};
