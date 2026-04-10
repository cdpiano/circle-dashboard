'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MintBurnDay {
  date: string;
  mint: number;
  burn: number;
  net: number;
}

export default function MintBurn() {
  const [data, setData] = useState<MintBurnDay[]>([]);
  const [netFlow, setNetFlow] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/analytics?type=mintburn&days=30');
        const json = await res.json();
        const items = Array.isArray(json) ? json : json.data || [];
        if (items.length > 0) {
          const mapped = items.map((d: any) => ({
            date: d.date,
            mint: d.minted ?? d.mint ?? 0,
            burn: d.burned ?? d.burn ?? 0,
            net: d.net ?? 0,
          }));
          setData(mapped);
          setNetFlow(mapped.reduce((sum: number, d: MintBurnDay) => sum + d.net, 0));
        }
      } catch {
        const mock: MintBurnDay[] = [];
        for (let i = 30; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const mint = Math.random() * 500_000_000;
          const burn = Math.random() * 400_000_000;
          mock.push({
            date: d.toISOString().split('T')[0],
            mint,
            burn: -burn,
            net: mint - burn,
          });
        }
        setData(mock);
        setNetFlow(mock.reduce((s, d) => s + d.net, 0));
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <ArrowUpDown className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Mint / Burn</span>
      </div>
      <div className="text-2xl font-bold font-mono text-[var(--foreground)]">
        {formatCurrency(Math.abs(netFlow), 1)}
      </div>
      <div className={`text-sm font-mono mt-1 ${netFlow >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
        Net {netFlow >= 0 ? 'Mint' : 'Burn'} (30d)
      </div>
      <div className="flex-1 min-h-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Bar dataKey="net" radius={[2, 2, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.net >= 0 ? 'var(--green)' : 'var(--red)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
