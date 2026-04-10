'use client';

import { Circle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Circle className="w-4 h-4" />
            <span>Circle Dashboard</span>
            <span className="text-gray-300">·</span>
            <span>Data for informational purposes only</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span>Powered by Finnhub, CoinGecko, FRED, Etherscan</span>
            <span className="px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-medium">
              DEMO MODE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
