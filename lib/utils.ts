import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number | null | undefined, decimals = 2): string {
  if (value == null || isNaN(value)) return '$0.00';
  if (Math.abs(value) >= 1e12) {
    return `$${(value / 1e12).toFixed(decimals)}T`;
  }
  if (Math.abs(value) >= 1e9) {
    return `$${(value / 1e9).toFixed(decimals)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `$${(value / 1e6).toFixed(decimals)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `$${(value / 1e3).toFixed(decimals)}K`;
  }
  return `$${value.toFixed(decimals)}`;
}

export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value == null || isNaN(value)) return '0';
  if (Math.abs(value) >= 1e12) {
    return `${(value / 1e12).toFixed(decimals)}T`;
  }
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

export function formatPercent(value: number | null | undefined, decimals = 2): string {
  if (value == null || isNaN(value)) return '0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getChangeColor(value: number): string {
  if (value > 0) return 'text-emerald-600';
  if (value < 0) return 'text-red-500';
  return 'text-gray-500';
}

export function getChangeBgColor(value: number): string {
  if (value > 0) return 'bg-emerald-50 text-emerald-700';
  if (value < 0) return 'bg-red-50 text-red-700';
  return 'bg-gray-50 text-gray-600';
}
