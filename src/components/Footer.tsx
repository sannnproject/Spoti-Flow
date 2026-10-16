import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-[#21262d] py-8 px-4 text-center text-xs text-[#8b949e]">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Developer Credit */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono">
          <span className="text-[#8b949e]">Developed by</span>
          <span className="font-semibold text-[#e6edf3] bg-[#161b22] border border-[#30363d] px-2.5 py-0.5 rounded text-[11px] hover:border-[#58a6ff]/50 transition-colors">
            SANN404 FORUM GROUP
          </span>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[#6e7681] pt-1 font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-[#6e7681]" />
          <span className="font-medium text-[11px]">Legal Disclaimer</span>
        </div>

        <p className="text-[11px] leading-relaxed max-w-2xl mx-auto text-[#6e7681]">
          SpotiFlow is an independent utility designed for extracting publicly accessible media streams for personal backup and educational purposes. We do not host, store, or redistribute any copyrighted audio files on our servers. All trademarks, track names, and artist rights belong to Spotify AB and their respective intellectual property owners.
        </p>

        <div className="pt-2 text-[11px] font-mono text-[#484f58]">
          SpotiFlow &bull; Next.js App Router Architecture &bull; Vercel Deployment Ready
        </div>
      </div>
    </footer>
  );
};
