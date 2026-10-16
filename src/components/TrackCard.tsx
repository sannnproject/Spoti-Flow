import React, { useState } from 'react';
import { Download, ExternalLink, Image, Copy, Check, Disc, Calendar, Clock, Music2 } from 'lucide-react';
import { SpotifyTrackResult, sanitizeFilename } from '../lib/spotifyScraper';
import { AudioPlayer } from './AudioPlayer';

interface TrackCardProps {
  track: SpotifyTrackResult;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  const [copied, setCopied] = useState(false);
  const [downloadingMp3, setDownloadingMp3] = useState(false);

  const cleanMp3Filename = sanitizeFilename(track.title, track.artist, 'mp3');
  const cleanCoverFilename = sanitizeFilename(track.title, track.artist, 'jpg');

  const proxyDownloadMp3Url = track.download.mp3
    ? `/api/download?url=${encodeURIComponent(track.download.mp3)}&filename=${encodeURIComponent(cleanMp3Filename)}`
    : null;

  const handleCopyLink = () => {
    const textToCopy = `${track.title} - ${track.artist} (${track.album || ''})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerDownload = () => {
    setDownloadingMp3(true);
    setTimeout(() => setDownloadingMp3(false), 3000);
  };

  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl transition-all">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Cover Art */}
          <div className="relative group shrink-0 w-full sm:w-52 md:w-56 aspect-square rounded-lg overflow-hidden bg-[#161b22] border border-[#30363d] shadow-md">
            {track.cover ? (
              <img
                src={track.cover}
                alt={`${track.title} by ${track.artist}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#6e7681] gap-2">
                <Music2 className="w-10 h-10" />
                <span className="text-xs font-mono">No Cover Available</span>
              </div>
            )}

            {track.download.coverHd && (
              <a
                href={track.download.coverHd}
                target="_blank"
                rel="noopener noreferrer"
                title="View Full Resolution Cover"
                className="absolute top-2 right-2 p-1.5 rounded-md bg-[#000000]/70 hover:bg-[#000000] text-[#c9d1d9] hover:text-white border border-[#30363d] opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Details & Metadata */}
          <div className="flex-1 w-full flex flex-col justify-between">
            <div>
              {/* Header status bar */}
              <div className="flex items-center justify-between gap-2 text-xs text-[#8b949e] mb-2 font-mono">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[#3fb950] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#238636]"></span>
                    Stream Extracted
                  </span>
                  <span aria-hidden="true" className="text-[#30363d]">/</span>
                  <span className="text-[#8b949e]">MP3 Format</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  aria-label="Copy track information"
                  className="inline-flex items-center gap-1 text-[11px] text-[#8b949e] hover:text-[#e6edf3] transition-colors p-1 rounded hover:bg-[#21262d] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#3fb950]" />
                      <span className="text-[#3fb950]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Info</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title & Artist */}
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {track.title}
              </h2>
              <p className="text-sm sm:text-base text-[#58a6ff] font-medium mt-1">
                {track.artist}
              </p>

              {/* Unboxed Metadata (Zero-pill discipline) */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-[#8b949e] mt-3 pt-3 border-t border-[#21262d] font-mono">
                {track.album && (
                  <div className="flex items-center gap-1.5 text-[#8b949e]">
                    <Disc className="w-3.5 h-3.5 text-[#6e7681]" />
                    <span className="truncate max-w-[200px] text-[#c9d1d9]">{track.album}</span>
                  </div>
                )}

                {track.releaseYear && (
                  <>
                    <span aria-hidden="true" className="text-[#30363d]">·</span>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#6e7681]" />
                      <span>{track.releaseYear}</span>
                    </div>
                  </>
                )}

                {track.duration && (
                  <>
                    <span aria-hidden="true" className="text-[#30363d]">·</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#6e7681]" />
                      <span>{track.duration}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Audio Preview */}
            {track.download.mp3 && (
              <div className="mt-5">
                <AudioPlayer
                  src={track.download.mp3}
                  title={track.title}
                  artist={track.artist}
                />
              </div>
            )}
          </div>
        </div>

        {/* Download Buttons Section */}
        <div className="mt-6 pt-5 border-t border-[#21262d] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            {/* Primary Download: Vercel stark white or GitHub green */}
            {proxyDownloadMp3Url && (
              <a
                href={proxyDownloadMp3Url}
                download={cleanMp3Filename}
                onClick={handleTriggerDownload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-[#e6edf3] text-black font-semibold text-xs sm:text-sm transition-all active:scale-98 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-black stroke-[2.2]" />
                <span>{downloadingMp3 ? 'Starting Download...' : 'Download MP3'}</span>
              </a>
            )}

            {/* Direct CDN Download (GitHub outline style) */}
            {track.download.mp3 && (
              <a
                href={track.download.mp3}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white border border-[#30363d] text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Direct CDN</span>
              </a>
            )}

            {/* Download HD Cover */}
            {track.download.coverHd && (
              <a
                href={track.download.coverHd}
                target="_blank"
                rel="noopener noreferrer"
                download={cleanCoverFilename}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white border border-[#30363d] text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                <Image className="w-3.5 h-3.5" />
                <span>HD Artwork</span>
              </a>
            )}
          </div>

          <div className="text-[11px] font-mono text-[#6e7681] text-center sm:text-right">
            <span>ID3 Tagged &bull; Direct Stream</span>
          </div>
        </div>
      </div>
    </div>
  );
};
