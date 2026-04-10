'use client';

import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { mockStockQuote, mockCandleData } from '@/lib/mock-data';
import type { StockQuote, CandleData } from '@/lib/types';

const RANGES = ['1D', '1W', '1M', '3M', '1Y'] as const;

export default function StockPrice() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [quote, setQuote] = useState<StockQuote>(mockStockQuote);
  const [range, setRange] = useState<string>('3M');
  const [candles, setCandles] = useState<CandleData[]>(mockCandleData);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch('/api/stock?type=quote');
        const data = await res.json();
        if (data.success && data.data) setQuote(data.data);
      } catch { /* keep mock */ }
    };
    fetchQuote();
    const interval = setInterval(fetchQuote, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/stock?type=history&range=${range}`);
        const data = await res.json();
        if (data.success && data.data) setCandles(data.data);
      } catch { /* keep mock */ }
    };
    fetchHistory();
  }, [range]);

  useEffect(() => {
    if (!chartRef.current) return;

    let chart: ReturnType<typeof import('lightweight-charts').createChart> | null = null;

    const initChart = async () => {
      const { createChart, ColorType, CandlestickSeries } = await import('lightweight-charts');

      if (!chartRef.current) return;
      chartRef.current.innerHTML = '';

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      chart = createChart(chartRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: isDark ? '#94A3B8' : '#6B7280',
        },
        grid: {
          vertLines: { color: isDark ? '#1E293B' : '#F3F4F6' },
          horzLines: { color: isDark ? '#1E293B' : '#F3F4F6' },
        },
        width: chartRef.current.clientWidth,
        height: chartRef.current.clientHeight,
        timeScale: { borderColor: isDark ? '#1E293B' : '#E5E7EB' },
        rightPriceScale: { borderColor: isDark ? '#1E293B' : '#E5E7EB' },
      });

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22C55E',
        downColor: '#EF4444',
        borderUpColor: '#22C55E',
        borderDownColor: '#EF4444',
        wickUpColor: '#22C55E',
        wickDownColor: '#EF4444',
      });

      candleSeries.setData(candles as any);
      chart.timeScale().fitContent();
    };

    initChart();

    const handleResize = () => {
      if (chart && chartRef.current) {
        chart.applyOptions({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart?.remove();
    };
  }, [candles]);

  const isUp = quote.changePercent >= 0;

  return (
    <div className="flex flex-col h-full">
      {/* Price header */}
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-3xl font-bold font-mono text-[var(--foreground)]">
          {formatCurrency(quote.price)}
        </span>
        <div className={`flex items-center gap-1 text-sm ${isUp ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
          {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="font-mono">
            {isUp ? '+' : ''}{quote.change.toFixed(2)} ({isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%)
          </span>
        </div>
        <span className="text-xs text-[var(--muted)] ml-auto">
          MCap {formatCurrency(quote.marketCap, 1)} · Vol {formatNumber(quote.volume, 1)}
        </span>
      </div>

      {/* Chart */}
      <div ref={chartRef} className="flex-1 min-h-0" />

      {/* Range selector */}
      <div className="flex gap-1 mt-2">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              range === r
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--muted)] hover:bg-[var(--muted-light)]'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
