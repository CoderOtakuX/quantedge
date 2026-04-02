"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

interface SearchResult {
  ticker: string;
  company_name: string;
  sector: string;
  yf_ticker: string;
}

const TopNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [results, setResults] = useState<SearchResult[]>([]);

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

  const showDropdown = open && results.length > 0;

  const navigate = useCallback(
    (symbol: string) => {
      setQuery("");
      setOpen(false);
      router.push(`/stock/${symbol}`);
    },
    [router]
  );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
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

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-220px)] h-14 z-40 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-between px-8 border-b border-outline-variant/10">
      <div className="flex items-center gap-10 flex-1">
        {/* Search with Autocomplete */}
        {pathname !== "/dashboard" && (
          <div ref={wrapperRef} className="relative group max-w-md w-full">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary-container transition-colors"
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search stocks... (e.g. RELIANCE, TCS)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setHighlightIdx(0);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-full text-xs focus:ring-1 focus:ring-primary-container transition-all"
            />

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/10 rounded-xl shadow-xl shadow-black/10 overflow-hidden z-50">
                {results.map((stock, i) => (
                  <button
                    key={stock.ticker}
                    onMouseEnter={() => setHighlightIdx(i)}
                    onClick={() => navigate(stock.ticker)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                      i === highlightIdx
                        ? "bg-surface-container"
                        : "hover:bg-surface-container/50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">{stock.ticker}</p>
                      <p className="text-[10px] text-outline font-medium line-clamp-1">
                        {stock.company_name} • {stock.sector}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-outline shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 ml-4">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container border border-outline-variant/20 ml-2">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxPBqVGqGXKhcTCzDBYsbyabz5MAqM6t4xy3gbUalC5j1Qw8fJG1Tt0XgR0208oiky8zXRKHuZjW1QbVDlZ24JPjVaRNmbuu6fpFU15TP3GpeF3RIJJg5TqVy8DvJxTjVGpdLb8Kn-Ry8kBPv5Id7VCEbhVyhND3lrY18x7AMgVEemLCM2G5O5nlBtsVNWkjl1Shs1dbiZtwbNGUxIy72AcqPMPbld11_BhlVaFmBIvJt5FjNmK1_F-SfAtubRgOXIX8FWg1_sjj0K"
            alt="User Profile"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default TopNav;
