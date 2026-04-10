'use client';

import { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Protocol {
  name: string;
  usdcAmount: number;
  share: number;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#6B7280'];

export default function DefiDistribution() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [totalTvl, setTotalTvl] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/defi');
        const json = await res.json();
        const prots = json.protocols || json.data?.protocols || [];
        if (prots.length > 0) {
          const mapped = prots.map((p: any) => ({
            name: p.name || p.protocol,
            usdcAmount: p.usdcAmount || 0,
            share: p.share || 0,
          }));
          const sorted = mapped.sort((a: Protocol, b: Protocol) => b.usdcAmount - a.usdcAmount).slice(0, 5);
          setProtocols(sorted);
          setTotalTvl(mapped.reduce((s: number, p: Protocol) => s + p.usdcAmount, 0));
        }
      } catch {
        const mock: Protocol[] = [
          { name: 'Aave', usdcAmount: 4_200_000_000, share: 35 },
          { name: 'Compound', usdcAmount: 2_800_000_000, share: 23 },
          { name: 'MakerDAO', usdcAmount: 2_100_000_000, share: 18 },
          { name: 'Curve', usdcAmount: 1_500_000_000, share: 12 },
          { name: 'Other', usdcAmount: 1_400_000_000, share: 12 },
        ];
        setProtocols(mock);
        setTotalTvl(12_000_000_000);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">DeFi TVL</span>
        </div>
        <span className="text-xs font-mono font-medium text-[var(--foreground)]">
          {formatCurrency(totalTvl, 1)}
        </span>
      </div>
      <div className="h-3 rounded-full overflow-hidden flex mt-1">
        {protocols.map((p, i) => (
          <div
            key={p.name}
            style={{ width: `${p.share}%`, backgroundColor: COLORS[i] }}
            className="h-full"
          />
        ))}
      </div>
      <div className="mt-2 space-y-1 flex-1 overflow-y-auto">
        {protocols.map((p, i) => (
          <div key={p.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-[var(--foreground)]">{p.name}</span>
            </div>
            <span className="font-mono text-[var(--muted)]">{formatCurrency(p.usdcAmount, 1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
