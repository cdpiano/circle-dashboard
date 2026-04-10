'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Target } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CoinDef {
  symbol: string;
  color: string;
}

const FALLBACK_COINS: CoinDef[] = [
  { symbol: 'USDT', color: '#26A17B' },
  { symbol: 'USDC', color: '#2775CA' },
  { symbol: 'DAI', color: '#F5AC37' },
  { symbol: 'USDe', color: '#8B5CF6' },
  { symbol: 'PYUSD', color: '#003087' },
];

export default function StablecoinCompetition() {
  const [history, setHistory] = useState<any[]>([]);
  const [coins, setCoins] = useState<CoinDef[]>(FALLBACK_COINS);
  const [usdcShare, setUsdcShare] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/competition');
        const json = await res.json();
        if (json.history?.length > 0) {
          setHistory(json.history);
        }
        if (json.coins) {
          setCoins(json.coins.map((c: any) => ({ symbol: c.symbol, color: c.color })));
        }
        if (json.currentShares) {
          const usdc = json.currentShares.find((s: any) => s.symbol === 'USDC');
          if (usdc) setUsdcShare(usdc.share);
        }
      } catch { /* keep empty */ }
    };
    fetchData();
  }, []);

  const isDark = typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-theme') === 'dark'
    : true;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Stablecoin Market Cap</span>
        {usdcShare > 0 && (
          <span className="text-xs font-mono text-[var(--muted)] ml-auto">
            USDC <span className="text-[var(--foreground)] font-medium">{usdcShare.toFixed(1)}%</span>
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
                width={50}
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
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 10, color: 'var(--muted)' }}
              />
              {coins.map((coin) => (
                <Area
                  key={coin.symbol}
                  type="monotone"
                  dataKey={coin.symbol}
                  stackId="1"
                  stroke={coin.color}
                  fill={coin.color}
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
