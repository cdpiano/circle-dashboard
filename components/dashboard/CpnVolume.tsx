'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Network } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { mockCpnVolumeData } from '@/lib/mock-data';
import type { CpnVolumeData } from '@/lib/types';

export default function CpnVolume() {
  const [data, setData] = useState<CpnVolumeData>(mockCpnVolumeData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/cpn');
        const json = await res.json();
        if (json.success && json.data) setData(json.data);
      } catch { /* keep mock */ }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-1">
        <Network className="w-3.5 h-3.5 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">CPN Volume</span>
      </div>
      <div className="text-xl font-bold font-mono text-[var(--foreground)]">
        {formatCurrency(data.currentMonthVolume, 1)}
      </div>
      <div className={`text-xs font-mono mt-0.5 ${data.momGrowth >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
        {data.momGrowth >= 0 ? '+' : ''}{data.momGrowth.toFixed(1)}% MoM
      </div>
      <div className="flex-1 min-h-0 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.history}>
            <XAxis dataKey="month" hide />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 11,
                color: 'var(--foreground)',
              }}
              formatter={(val: number) => [formatCurrency(val, 1), 'Volume']}
              labelFormatter={(m) => {
                const s = String(m);
                if (!s.includes('-')) return s;
                const [y, mo] = s.split('-');
                const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                return `${months[parseInt(mo)]} ${y}`;
              }}
            />
            <Bar dataKey="volume" fill="var(--primary)" radius={[2, 2, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
