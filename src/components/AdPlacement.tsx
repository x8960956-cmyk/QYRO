import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

interface AdPlacementProps {
  format?: 'banner' | 'card' | 'inline';
}

export const AdPlacement: React.FC<AdPlacementProps> = ({ format = 'banner' }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
      <div className="rounded-2xl border border-[#25304B]/60 bg-[#0D1428]/80 p-4 sm:p-5 relative overflow-hidden backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Ad disclosure tag */}
        <span className="absolute top-2 right-3 text-[9px] font-mono tracking-widest text-[#4B597B] uppercase select-none">
          Sponsored Announcement
        </span>

        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7657FF]/30 to-[#15D9F5]/30 border border-[#15D9F5]/40 flex items-center justify-center text-[#15D9F5] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F8FAFF]">
              Ultra-Fast Cloud Hosting & Edge Routing
            </div>
            <p className="text-[11px] text-[#A8B4D0]">
              Accelerate your QR code redirects with sub-10ms global latency and multi-region CDN.
            </p>
          </div>
        </div>

        <a
          href="https://cloud.google.com"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl bg-[#111A31] hover:bg-[#1A2646] border border-[#25304B] text-[11px] font-semibold text-[#15D9F5] hover:text-white flex items-center space-x-1.5 transition-all shrink-0"
        >
          <span>Learn More</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
