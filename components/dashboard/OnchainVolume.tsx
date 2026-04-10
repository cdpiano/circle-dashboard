'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { mockOnchainData } from '@/lib/mock-data';

export default function OnchainVolume() {
  const [transfers, setTransfers] = useState(mockOnchainData.transfers24h);
  const [holders, setHolders] = useState(mockOnchainData.holderCount);
  const [trend, setTrend] = useState<{ date: string; value: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/onchain');
        const json = await res.json();
        if (json.success && json.data) {
          setTransfers(json.data.transfers24h);
          setHolders(json.data.holderCount);
        }
      } catch { /* keep mock */ }
    };
    fetchData();

    const t: { date: string; value: number }[] = [];
    for (let i = 30; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      t.push({ date: d.toISOString().split('T')[0], value: 150_000 + Math.random() * 80_000 });
    }
    setTrend(t);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="w-3.5 h-3.5 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">On-Chain</span>
      </div>
      <div className="text-lg font-bold font-mono text-[var(--foreground)]">
        {formatNumber(transfers, 0)} txns
      </div>
      <div className="text-xs text-[var(--muted)] mt-0.5">
        {formatNumber(holders, 1)} holders
      </div>
      <div className="flex-1 min-h-0 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend}>
            <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
