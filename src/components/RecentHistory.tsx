import React from 'react';
import { History, Trash2, ArrowUpRight, Music } from 'lucide-react';
import { SpotifyTrackResult } from '../lib/spotifyScraper';

interface RecentHistoryProps {
  history: SpotifyTrackResult[];
  onSelect: (track: SpotifyTrackResult) => void;
  onClear: () => void;
}

export const RecentHistory: React.FC<RecentHistoryProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#79c0ff]" />
          <h3 className="text-xs sm:text-sm font-semibold text-[#e6edf3] font-mono">Recent Downloads</h3>
          <span className="text-[11px] text-[#6e7681] font-mono">({history.length})</span>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear conversion history"
          className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#f85149] transition-colors p-1 rounded hover:bg-[#21262d] font-mono cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      <div className="divide-y divide-[#21262d] mt-1">
        {history.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => onSelect(item)}
            className="flex items-center justify-between py-2.5 px-2 hover:bg-[#161b22] rounded-lg cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-md bg-[#21262d] shrink-0 overflow-hidden border border-[#30363d]">
                {item.cover ? (
                  <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#6e7681]">
                    <Music className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="truncate">
                <p className="text-xs sm:text-sm font-medium text-[#c9d1d9] group-hover:text-[#58a6ff] transition-colors truncate">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#8b949e] font-mono">
                  <span className="truncate">{item.artist}</span>
                  {item.duration && (
                    <>
                      <span aria-hidden="true" className="text-[#30363d]">·</span>
                      <span>{item.duration}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="p-1 rounded text-[#6e7681] group-hover:text-[#58a6ff] group-hover:translate-x-0.5 transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
