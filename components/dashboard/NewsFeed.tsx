'use client';

import { useEffect, useState } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';
import type { NewsItem } from '@/lib/types';

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news');
        const json = await res.json();
        const items = Array.isArray(json) ? json : json.data || [];
        setNews(items.slice(0, 15));
      } catch { /* keep empty */ }
    };
    fetchNews();
    const interval = setInterval(fetchNews, 600_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">News</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {news.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 rounded-lg hover:bg-[var(--muted-light)] transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-[var(--foreground)] leading-tight line-clamp-2 group-hover:text-[var(--primary)]">
                {item.title}
              </h4>
              <ExternalLink className="w-3 h-3 text-[var(--muted)] shrink-0 mt-0.5 opacity-0 group-hover:opacity-100" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[var(--muted)]">{item.source}</span>
              <span className="text-xs text-[var(--muted)]">·</span>
              <span className="text-xs text-[var(--muted)]">{formatTimeAgo(item.datetime)}</span>
            </div>
          </a>
        ))}
        {news.length === 0 && (
          <div className="text-sm text-[var(--muted)] text-center py-8">Loading news...</div>
        )}
      </div>
    </div>
  );
}
