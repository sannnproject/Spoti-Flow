import React, { useState } from 'react';
import { Smartphone, Laptop, FileAudio, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export const TechnicalFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I download and play Spotify songs on iPhone (iOS)?',
      a: 'On iOS Safari, tap "Download MP3". When the download dialog prompts, tap "Download". The MP3 file will be saved directly into your device\'s Files app (Files > iCloud Drive or On My iPhone > Downloads). You can play it offline with the native Files player or open it in apps like VLC.',
    },
    {
      q: 'How does it work on Android devices?',
      a: 'Tap "Download MP3". The file automatically downloads to your phone\'s standard Downloads folder. Any music player app (such as Samsung Music, YouTube Music offline player, or VLC) will instantly detect the MP3 with embedded tags.',
    },
    {
      q: 'What audio format is extracted?',
      a: 'Tracks are delivered in constant high-bitrate MP3 format. Track metadata such as track title, artist name, and album artwork are preserved into standard ID3 tags.',
    },
    {
      q: 'Why does a Spotify playlist or album URL not download directly?',
      a: 'Spotify albums and playlists contain dozens of distinct tracks. To maintain high download speeds and prevent server timeouts, SpotiFlow processes individual tracks. To download a song from a playlist, tap the three dots (···) next to the track in Spotify > Share > Copy Link, then paste it here.',
    },
    {
      q: 'What should I do if a download fails or times out?',
      a: 'If the primary download button takes too long, click the "Direct CDN" button next to it. Some corporate networks or VPNs may throttle media proxies; the direct CDN link establishes a direct connection to the source storage server.',
    },
  ];

  return (
    <section id="faq" className="mt-12 pt-8 border-t border-[#21262d]">
      <div className="flex items-center gap-2 mb-6 font-mono">
        <BookOpen className="w-4 h-4 text-[#58a6ff]" />
        <h3 className="text-sm font-semibold text-[#e6edf3]">
          Documentation & Mobile Guide
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
        <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg">
          <div className="flex items-center gap-2 text-[#c9d1d9] font-mono text-xs mb-1.5 font-semibold">
            <Smartphone className="w-4 h-4 text-[#58a6ff]" />
            <span>Mobile Native</span>
          </div>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            Optimized for iOS Safari & Android Chrome. Downloads directly to system storage without third-party apps.
          </p>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg">
          <div className="flex items-center gap-2 text-[#c9d1d9] font-mono text-xs mb-1.5 font-semibold">
            <FileAudio className="w-4 h-4 text-[#3fb950]" />
            <span>ID3 Metadata</span>
          </div>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            Preserves title, artist, album name, release year, and high-resolution cover artwork.
          </p>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg">
          <div className="flex items-center gap-2 text-[#c9d1d9] font-mono text-xs mb-1.5 font-semibold">
            <Laptop className="w-4 h-4 text-[#79c0ff]" />
            <span>Vercel Edge Ready</span>
          </div>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            Built with Next.js App Router architecture and serverless streaming proxy support.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-[#0d1117] border border-[#21262d] rounded-lg overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-3.5 text-left hover:bg-[#161b22] transition-colors cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-medium text-[#c9d1d9]">
                  {faq.q}
                </span>
                <span className="text-[#8b949e] shrink-0 ml-4">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-[#8b949e] leading-relaxed border-t border-[#21262d]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
