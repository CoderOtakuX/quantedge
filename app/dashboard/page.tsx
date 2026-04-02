"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
  ticker: string;
  company_name: string;
  sector: string;
  yf_ticker: string;
}

const SUGGESTED_STOCKS = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "WIPRO", "SBIN"];

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  const navigate = useCallback(
    (symbol: string) => {
      setQuery("");
      setOpen(false);
      router.push(`/stock/${symbol}`);
    },
    [router]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0 && highlightIdx >= 0) {
        navigate(results[highlightIdx]?.ticker);
      } else if (query.trim().length > 0) {
        navigate(query.trim().toUpperCase());
      }
    }
  };

  const showDropdown = open && results.length > 0;

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] relative bg-[#0F172A]">
        <div className="max-w-2xl w-full mx-auto px-4 flex flex-col items-center pb-24">
          {/* Brand Mark */}
          <div className="text-center mb-12">
            <h1 className="text-white text-[32px] font-bold mb-2">QuantEdge</h1>
            <p className="text-[#64748B] text-[14px]">
              AI-powered stock analysis for Indian investors
            </p>
          </div>

          {/* Search Hero */}
          <div ref={wrapperRef} className="relative w-full max-w-xl mb-12">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#64748B]" />
            </div>
            <input
              type="text"
              placeholder="Search stocks... e.g. RELIANCE, TCS, HDFC"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setHighlightIdx(0);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              className="w-full h-14 pl-12 pr-4 bg-[#1E293B] border border-[#334155] focus:border-[#028090] focus:ring-1 focus:ring-[#028090] rounded-2xl text-[16px] text-white transition-all placeholder:text-[#64748B] outline-none"
            />

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl overflow-hidden z-50">
                {results.map((stock, i) => (
                  <button
                    key={stock.ticker}
                    onMouseEnter={() => setHighlightIdx(i)}
                    onClick={() => navigate(stock.ticker)}
                    className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
                      i === highlightIdx
                        ? "bg-[#334155]/50"
                        : "hover:bg-[#334155]/50"
                    }`}
                  >
                    <div>
                      <p className="text-[16px] font-bold text-[#028090]">{stock.ticker}</p>
                      <p className="text-[12px] text-white font-medium line-clamp-1 mt-1">
                        {stock.company_name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Stocks */}
          <div className="w-full flex flex-col items-center mb-8">
            <span className="text-[#64748B] text-[13px] mb-4">Or analyse:</span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {SUGGESTED_STOCKS.map(ticker => (
                <button
                  key={ticker}
                  onClick={() => router.push(`/stock/${ticker}`)}
                  className="bg-[#1E293B] border border-[#334155] text-white text-[13px] px-4 py-2 rounded-full hover:bg-[#028090] hover:text-white hover:border-[#028090] transition-colors"
                >
                  {ticker}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center justify-center gap-4 text-[#64748B] text-[13px]">
            <Link href="/screener" className="hover:text-white transition-colors">
              Stock Screener
            </Link>
            <span>·</span>
            <Link href="/sectors" className="hover:text-white transition-colors">
              Sectors
            </Link>
            <span>·</span>
            <Link href="/screener?sort=composite_score" className="hover:text-white transition-colors">
              Top Movers
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-[#475569] text-[11px]">
            Data: NSE/BSE via Yahoo Finance · 15 min delayed · Not investment advice
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
