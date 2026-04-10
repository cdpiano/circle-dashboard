'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Shield } from 'lucide-react';
import { mockUsdcPegData } from '@/lib/mock-data';
import type { UsdcPegData } from '@/lib/types';

const STATUS_COLORS = {
  normal: 'var(--green)',
  watch: '#EAB308',
  'depeg-risk': 'var(--red)',
};

const STATUS_LABELS = {
  normal: 'Stable',
  watch: 'Watch',
  'depeg-risk': 'Risk',
};

export default function UsdcPeg() {
  const [data, setData] = useState<UsdcPegData>(mockUsdcPegData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/usdc-peg');
        const json = await res.json();
        if (json.success && json.data) setData(json.data);
      } catch { /* keep mock */ }
    };
    fetchData();
  }, []);

  const color = STATUS_COLORS[data.status];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">USDC Peg</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs font-medium" style={{ color }}>{STATUS_LABELS[data.status]}</span>
        </div>
      </div>
      <div className="text-xl font-bold font-mono text-[var(--foreground)]">
        {data.deviation >= 0 ? '+' : ''}{data.deviation.toFixed(4)}
      </div>
      <div className="text-xs text-[var(--muted)] mt-0.5">${data.currentPrice.toFixed(4)}</div>
      <div className="flex-1 min-h-0 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.history}>
            <ReferenceLine y={0} stroke="var(--muted)" strokeDasharray="3 3" strokeOpacity={0.3} />
            <Line type="monotone" dataKey="deviation" stroke={color} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
