"use client";

import React, { useEffect, useState } from "react";

const TICKER_SYMBOLS = [
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL",
  "KOTAKBANK", "WIPRO", "AXISBANK", "LT", "TATAMOTORS", "SUNPHARMA", "TITAN",
];

interface TickerItem {
  symbol: string;
  last_price: number;
  change_percent: number;
}

const TickerTape: React.FC = () => {
  const [tickers, setTickers] = useState<TickerItem[]>([]);

  useEffect(() => {
    async function fetchTickers() {
      const results = await Promise.allSettled(
        TICKER_SYMBOLS.map((sym) =>
          fetch(`/api/stock/${sym}/overview`)
            .then((r) => r.json())
            .then((data) => ({
              symbol: data.symbol || sym,
              last_price: data.last_price ?? 0,
              change_percent: data.change_percent ?? 0,
            }))
        )
      );
      const resolved = results
        .filter((r): r is PromiseFulfilledResult<TickerItem> => r.status === "fulfilled")
        .map((r) => r.value)
        .filter((t) => t.last_price > 0);
      setTickers(resolved);
    }
    fetchTickers();
  }, []);

  if (tickers.length === 0) {
    return (
      <div className="w-full h-10 bg-surface-container overflow-hidden flex items-center px-8 border-b border-outline-variant/10">
        <span className="text-[10px] text-outline font-medium animate-pulse">Loading live prices...</span>
      </div>
    );
  }

  // Duplicate for seamless marquee
  const marqueeItems = [...tickers, ...tickers, ...tickers, ...tickers];

  return (
    <div className="w-full h-10 bg-surface-container overflow-hidden flex items-center border-b border-outline-variant/10 relative">
      <div className="flex items-center gap-8 whitespace-nowrap animate-marquee px-8">
        {marqueeItems.map((t, idx) => {
          const isPositive = t.change_percent >= 0;
          const colorClass = isPositive ? "text-tertiary-container" : "text-error";
          return (
            <div key={`${t.symbol}-${idx}`} className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
                {t.symbol}
              </span>
              <span className="text-xs font-bold tabular-nums">
                {t.last_price.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
              </span>
              <span className={`text-[10px] font-bold ${colorClass}`}>
                {isPositive ? "+" : ""}{t.change_percent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
      {/* Static delay label */}
      <div className="absolute right-0 top-0 h-full flex items-center pr-4 pl-6 bg-gradient-to-l from-surface-container via-surface-container to-transparent">
        <span className="text-[9px] text-outline font-medium tracking-wider">
          Prices ~15 min delayed
        </span>
      </div>
    </div>
  );
};

export default TickerTape;
