"use client";
import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import DeltaPill from "@/components/ui/DeltaPill";
import SectionLabel from "@/components/ui/SectionLabel";
import { formatLargeNumber } from "@/lib/utils";
import { SlidersHorizontal, Search, TrendingUp, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const SECTORS = [
  "All Sectors",
  "Information Technology",
  "Banking",
  "Financial Services",
  "FMCG",
  "Healthcare",
  "Energy",
  "Automobiles",
  "Metals & Mining",
  "Cement",
  "Telecom",
  "Infrastructure",
];

const DEFAULT_FILTERS = {
  min_pe: "",
  max_pe: "",
  min_roe: "",
  min_market_cap: "",
  sector: "",
};

type SortKey = "composite_score" | "pe_ratio" | "roe" | "market_cap" | "net_margin";
type SortDir = "asc" | "desc";

const ScoreBar = ({ score }: { score: number }) => (
  <div className="flex items-center gap-2">
    <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
      <div
        className="h-full bg-tertiary-container rounded-full"
        style={{ width: `${score}%` }}
      />
    </div>
    <span className="text-xs font-bold tabular-nums">{score}</span>
  </div>
);

export default function ScreenerPage() {
  const router = useRouter();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("composite_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const fetchScreener = useCallback(async (f: typeof DEFAULT_FILTERS) => {
    setLoading(true);
    try {
      const body: any = {};
      if (f.min_pe) body.min_pe = parseFloat(f.min_pe);
      if (f.max_pe) body.max_pe = parseFloat(f.max_pe);
      if (f.min_roe) body.min_roe = parseFloat(f.min_roe);
      if (f.min_market_cap) body.min_market_cap = parseFloat(f.min_market_cap) * 1e7;
      if (f.sector && f.sector !== "All Sectors") body.sector = f.sector;

      const res = await fetch("/api/screener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Screener error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScreener(DEFAULT_FILTERS);
  }, [fetchScreener]);

  const handleApply = () => {
    setAppliedFilters(filters);
    fetchScreener(filters);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    fetchScreener(DEFAULT_FILTERS);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = results
    .filter((s) =>
      search
        ? s.symbol?.toLowerCase().includes(search.toLowerCase()) ||
          s.name?.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === "desc" ? <ChevronDown size={12} /> : <ChevronUp size={12} />
    ) : (
      <ChevronDown size={12} className="opacity-20" />
    );

  const thClass =
    "text-left pb-4 text-[10px] font-bold text-outline uppercase tracking-widest cursor-pointer hover:text-on-surface transition-colors select-none";

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto p-10 space-y-8">
        {/* Header */}
        <section className="flex items-end justify-between border-b border-outline-variant/10 pb-6">
          <div>
            <h2 className="text-[32px] tracking-tight mb-2">
              <span className="font-light">STOCK</span>
              <span className="font-semibold"> SCREENER</span>
            </h2>
            <p className="text-sm text-outline font-medium">
              Filter and rank stocks from the Nifty 500 universe by fundamentals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-outline font-medium">
              {loading ? "Loading..." : `${filtered.length} stocks`}
            </span>
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/10 px-4 py-2 rounded-lg text-sm font-semibold hover:border-primary-container/20 transition-all"
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
          </div>
        </section>

        {/* Filter Panel */}
        {filtersOpen && (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6">
            <SectionLabel label="Filter Parameters" className="mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {/* Min PE */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  Min P/E
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={filters.min_pe}
                  onChange={(e) => setFilters((f) => ({ ...f, min_pe: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant/10 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary-container/30 transition-colors"
                />
              </div>

              {/* Max PE */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  Max P/E
                </label>
                <input
                  type="number"
                  placeholder="e.g. 30"
                  value={filters.max_pe}
                  onChange={(e) => setFilters((f) => ({ ...f, max_pe: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant/10 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary-container/30 transition-colors"
                />
              </div>

              {/* Min ROE */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  Min ROE %
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={filters.min_roe}
                  onChange={(e) => setFilters((f) => ({ ...f, min_roe: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant/10 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary-container/30 transition-colors"
                />
              </div>

              {/* Min Market Cap */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  Min MCap (Cr)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={filters.min_market_cap}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, min_market_cap: e.target.value }))
                  }
                  className="w-full bg-surface-container border border-outline-variant/10 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary-container/30 transition-colors"
                />
              </div>

              {/* Sector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  Sector
                </label>
                <select
                  value={filters.sector}
                  onChange={(e) => setFilters((f) => ({ ...f, sector: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant/10 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary-container/30 transition-colors"
                >
                  {SECTORS.map((s) => (
                    <option key={s} value={s === "All Sectors" ? "" : s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/10">
              <button
                onClick={handleApply}
                className="bg-on-surface text-surface px-6 py-2 rounded-lg text-sm font-bold hover:bg-on-surface/90 transition-all"
              >
                Apply Filters
              </button>
              <button
                onClick={handleReset}
                className="text-sm font-semibold text-outline hover:text-on-surface transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            placeholder="Search by ticker or company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-primary-container/30 transition-colors"
          />
        </div>

        {/* Results Table */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={28} className="animate-spin text-primary-container" />
              <div className="text-center">
                <p className="font-bold text-sm mb-1">Screening Nifty 500 universe...</p>
                <p className="text-xs text-outline">Fetching live fundamentals. This takes 20–40 seconds on first load.</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-outline">
              <TrendingUp size={28} className="opacity-30" />
              <p className="text-sm font-medium">No stocks match your filters.</p>
              <button onClick={handleReset} className="text-xs font-bold text-primary-container hover:underline">
                Reset filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-outline-variant/10">
                  <tr className="px-6">
                    <th className={`${thClass} pl-6 w-8`}>#</th>
                    <th className={`${thClass} pl-4`}>Company</th>
                    <th className={`${thClass} px-4`}>Sector</th>
                    <th
                      className={`${thClass} px-4`}
                      onClick={() => handleSort("pe_ratio")}
                    >
                      <span className="flex items-center gap-1">P/E <SortIcon k="pe_ratio" /></span>
                    </th>
                    <th
                      className={`${thClass} px-4`}
                      onClick={() => handleSort("roe")}
                    >
                      <span className="flex items-center gap-1">ROE % <SortIcon k="roe" /></span>
                    </th>
                    <th
                      className={`${thClass} px-4`}
                      onClick={() => handleSort("net_margin")}
                    >
                      <span className="flex items-center gap-1">Net Margin <SortIcon k="net_margin" /></span>
                    </th>
                    <th
                      className={`${thClass} px-4`}
                      onClick={() => handleSort("market_cap")}
                    >
                      <span className="flex items-center gap-1">Mkt Cap <SortIcon k="market_cap" /></span>
                    </th>
                    <th
                      className={`${thClass} px-4`}
                      onClick={() => handleSort("composite_score")}
                    >
                      <span className="flex items-center gap-1">Score <SortIcon k="composite_score" /></span>
                    </th>
                    <th className={`${thClass} pr-6 px-4`}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {filtered.map((stock, i) => (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-surface-container transition-colors cursor-pointer group"
                      onClick={() => router.push(`/stock/${stock.symbol}`)}
                    >
                      <td className="pl-6 py-4 text-xs font-bold text-outline tabular-nums">
                        {i + 1}
                      </td>
                      <td className="pl-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-surface-container rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                            {stock.symbol?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm group-hover:text-primary-container transition-colors">
                              {stock.symbol}
                            </p>
                            <p className="text-[10px] text-outline font-medium line-clamp-1 max-w-[160px]">
                              {stock.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[10px] font-semibold text-outline bg-surface-container px-2 py-1 rounded-md">
                          {stock.sector || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold tabular-nums">
                        {stock.pe_ratio?.toFixed(1) ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold tabular-nums">
                        {stock.roe ? `${stock.roe.toFixed(1)}%` : "—"}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold tabular-nums">
                        {stock.net_margin ? `${stock.net_margin.toFixed(1)}%` : "—"}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold tabular-nums">
                        {stock.market_cap ? formatLargeNumber(stock.market_cap) : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <ScoreBar score={stock.composite_score ?? 0} />
                      </td>
                      <td className="pr-6 px-4 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/stock/${stock.symbol}`);
                          }}
                          className="text-[10px] font-bold text-primary-container hover:underline uppercase tracking-widest"
                        >
                          Analyse →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer note */}
        {!loading && filtered.length > 0 && (
          <p className="text-[10px] text-outline font-medium text-center uppercase tracking-widest">
            Fundamental data delayed ~15 min · Nifty 500 universe · Ranked by Composite Score
          </p>
        )}
      </div>
    </AppLayout>
  );
}
