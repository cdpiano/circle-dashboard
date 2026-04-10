'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Layers } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EC4899', '#8B5CF6'];

interface ProtocolInfo {
  name: string;
  tvl: number;
  share: number;
}

export default function DefiDistribution() {
  const [history, setHistory] = useState<any[]>([]);
  const [protocols, setProtocols] = useState<ProtocolInfo[]>([]);
  const [totalTvl, setTotalTvl] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/defi');
        const json = await res.json();
        if (json.history?.length > 0) setHistory(json.history);
        if (json.protocols) setProtocols(json.protocols);
        if (json.totalTvl) setTotalTvl(json.totalTvl);
      } catch { /* keep empty */ }
    };
    fetchData();
  }, []);

  const isDark = typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-theme') === 'dark'
    : true;

  const protocolNames = protocols.map((p) => p.name);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <Layers className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">DeFi TVL</span>
        {totalTvl > 0 && (
          <span className="text-xs font-mono text-[var(--foreground)] ml-auto font-medium">
            {formatCurrency(totalTvl, 1)}
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {history.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: 'var(--muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(m) => {
                  const [, mo] = m.split('-');
                  const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  return months[parseInt(mo)];
                }}
              />
              <YAxis
                tick={{ fontSize: 9, fill: 'var(--muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1e9).toFixed(0)}B`}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(val: number, name: string) => [formatCurrency(val, 1), name]}
                labelFormatter={(m) => {
                  const [y, mo] = m.split('-');
                  const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  return `${months[parseInt(mo)]} ${y}`;
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              {protocolNames.map((name, i) => (
                <Area
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stackId="1"
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-sm text-[var(--muted)] text-center py-8">Loading...</div>
        )}
      </div>
    </div>
  );
}
