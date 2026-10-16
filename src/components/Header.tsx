import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-[#21262d] bg-[#000000]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center justify-center p-1.5 transition-colors hover:border-[#58a6ff]/50">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
              alt="Spotify"
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-white">SpotiFlow</span>
            <span className="text-[#484f58] text-xs font-mono">/</span>
            <span className="text-xs text-[#8b949e] hidden sm:inline font-mono">audio-extractor</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-xs text-[#8b949e] bg-[#0d1117] border border-[#30363d] px-2.5 py-1 rounded-md font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ea043] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#238636]"></span>
            </span>
            <span className="text-[#3fb950] font-medium text-[11px]">System Active</span>
          </div>

          <a
            href="#faq"
            className="text-xs text-[#8b949e] hover:text-[#58a6ff] transition-colors py-1 px-2 font-medium"
          >
            Docs
          </a>
        </div>
      </div>
    </header>
  );
};
