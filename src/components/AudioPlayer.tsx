import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title: string;
  artist: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title, artist }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setLoadError(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.load();
    }
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Playback blocked or failed:', err);
          setLoadError(true);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    audioRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        audioRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3.5 sm:p-4 text-[#e6edf3]">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={() => setLoadError(true)}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#79c0ff]">Preview</span>
            <span className="text-[#30363d] text-xs">/</span>
            <span className="text-xs text-[#8b949e] truncate max-w-[180px] sm:max-w-xs">{title}</span>
          </div>
          <span className="text-[11px] font-mono text-[#8b949e]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Scrubber timeline */}
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            aria-label="Seek audio time"
            className="w-full h-1.5 bg-[#21262d] rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#58a6ff]"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
              className="w-9 h-9 rounded-full bg-white hover:bg-[#e6edf3] text-black flex items-center justify-center transition-transform active:scale-95 shadow-sm cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              title="Restart"
              aria-label="Restart audio from beginning"
              className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] transition-colors rounded hover:bg-[#21262d] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] transition-colors rounded hover:bg-[#21262d] cursor-pointer"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-[#f85149]" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="Volume level"
              className="w-16 sm:w-20 h-1 bg-[#21262d] rounded appearance-none cursor-pointer"
            />
          </div>
        </div>

        {loadError && (
          <p className="text-[11px] font-mono text-[#d29922] pt-1">
            Direct streaming preview may be restricted by CDN headers. Use download button below to save the file.
          </p>
        )}
      </div>
    </div>
  );
};
