"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const SECTORS = [
  "Technology",
  "Financial Services",
  "Energy",
  "Consumer Defensive",
  "Consumer Cyclical",
  "Healthcare",
  "Industrials",
  "Basic Materials",
  "Communication Services",
  "Utilities",
  "Real Estate"
];

interface StockRecord {
  ticker: string;
  company_name: string;
  current_price: number;
  market_cap: number;
  pe_ratio: number;
  roe: number;
  net_margin: number;
  composite_score: number;
}

interface SectorData {
  stocks: StockRecord[];
  loaded: boolean;
  loading: boolean;
  error?: boolean;
}

export default function SectorsPage() {
  const router = useRouter();
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [sectorData, setSectorData] = useState<Record<string, SectorData>>({});
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});

  const handleExpand = async (sector: string) => {
    if (expandedSector === sector) {
      setExpandedSector(null);
      return;
    }
    
    setExpandedSector(sector);
    setCurrentPage(prev => ({ ...prev, [sector]: 1 }));
    
    // Check cache map
    if (sectorData[sector]?.loaded || sectorData[sector]?.loading) {
      return;
    }

    setSectorData(prev => ({ ...prev, [sector]: { stocks: [], loaded: false, loading: true } }));

    try {
      const stocksRes = await fetch(`/api/sectors/${encodeURIComponent(sector)}/stocks`);
      const stocksData = stocksRes.ok ? await stocksRes.json() : { stocks: [] };
      
      console.log(`Sector: ${sector}, Stocks count: ${stocksData.stocks?.length || 0}`);

      setSectorData(prev => ({
        ...prev,
        [sector]: {
          stocks: stocksData.stocks || [],
          loaded: true,
          loading: false,
          error: false
        }
      }));
    } catch (err) {
      setSectorData(prev => ({
        ...prev,
        [sector]: {
          stocks: [],
          loaded: true,
          loading: false,
          error: true
        }
      }));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20";
    if (score >= 40) return "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20";
    return "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20";
  };

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-8 min-h-screen bg-[#F4F6FB]">
        <header className="mb-8 border-b border-[#1E2761]/10 pb-6">
          <h1 className="text-4xl font-bold text-[#1E2761] tracking-tight">Sectors</h1>
          <p className="text-[#64748B] mt-2 text-sm">NSE sector performance at a glance</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SECTORS.map((sector) => {
            const isExpanded = expandedSector === sector;
            const data = sectorData[sector];
            const topStock = data?.loaded && data.stocks.length > 0 ? data.stocks[0] : null;

            return (
              <div 
                key={sector} 
                id={`sector-card-${sector.replace(/\s+/g, '-')}`}
                className={`bg-white rounded-xl border transition-all duration-300 shadow-sm overflow-hidden ${isExpanded ? 'border-[#028090]/30 ring-1 ring-[#028090]/10' : 'border-[#64748B]/20 hover:border-[#028090]/30 hover:shadow-md'}`}
              >
                {/* Collapsed Header Area */}
                <div 
                  className="p-6 flex justify-between items-start cursor-pointer group"
                  onClick={() => handleExpand(sector)}
                >
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-[#1E2761] group-hover:text-[#028090] transition-colors">{sector}</h2>
                    {data?.loaded && (
                      <p className="text-xs text-[#64748B] font-medium">
                        {data.stocks.length} Constituent{data.stocks.length !== 1 && 's'}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    {topStock && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#64748B]">Top: {topStock.ticker}</span>
                        <span className={`px-2 py-0.5 rounded border font-bold ${getScoreColor(topStock.composite_score)}`}>
                          {Math.round(topStock.composite_score)}
                        </span>
                      </div>
                    )}
                    <button className="flex items-center text-xs font-semibold text-[#028090] hover:text-[#1E2761] transition-colors">
                      {isExpanded ? (
                        <>Collapse <ChevronUp size={14} className="ml-1" /></>
                      ) : (
                        <>View stocks <ChevronDown size={14} className="ml-1" /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Content Area */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#64748B]/10"
                    >
                      <div className="p-6 bg-[#F4F6FB]/30">
                        {data?.loading ? (
                          <div className="flex flex-col items-center justify-center py-12 text-[#028090]">
                            <Loader2 className="animate-spin mb-4" size={32} />
                            <p className="text-sm font-medium text-[#1E2761]">Analyzing {sector} dynamics...</p>
                          </div>
                        ) : data?.loaded ? (
                          <div className="space-y-6">
                            {/* Data Table */}
                            {data.stocks.length === 0 ? (
                              <div className="text-center py-8 text-[#64748B] text-sm font-medium">
                                No stocks tracked in this sector yet
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="overflow-x-auto rounded border border-[#64748B]/10">
                                  <table className="w-full text-left border-collapse bg-white" style={{ minWidth: '700px' }}>
                                    <thead>
                                      <tr className="border-b-2 border-[#1E2761]/10 bg-[#F4F6FB]/50">
                                        <th className="py-3 px-4 text-[11px] font-bold text-[#1E2761] uppercase tracking-wider">Company</th>
                                        <th className="py-3 px-2 text-[11px] font-bold text-[#1E2761] uppercase tracking-wider text-center" style={{ width: '80px' }}>Score</th>
                                        <th className="py-3 px-2 text-[11px] font-bold text-[#1E2761] uppercase tracking-wider text-right" style={{ width: '90px' }}>Price</th>
                                        <th className="py-3 px-2 text-[11px] font-bold text-[#1E2761] uppercase tracking-wider text-right" style={{ width: '90px' }}>Mkt Cap (Cr)</th>
                                        <th className="py-3 px-2 text-[11px] font-bold text-[#1E2761] uppercase tracking-wider text-right" style={{ width: '80px' }}>P/E</th>
                                        <th className="py-3 px-2 text-[11px] font-bold text-[#1E2761] uppercase tracking-wider text-right" style={{ width: '80px' }}>ROE % *</th>
                                        <th className="py-3 px-2 text-[11px] font-bold text-[#1E2761] uppercase tracking-wider text-right" style={{ width: '90px' }}>Net Margin %</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#64748B]/10">
                                      {(() => {
                                        const PAGE_SIZE = 10;
                                        const page = currentPage[sector] || 1;
                                        const totalPages = Math.ceil(data.stocks.length / PAGE_SIZE);
                                        const paginatedStocks = data.stocks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
                                        const startIdx = (page - 1) * PAGE_SIZE + 1;
                                        const endIdx = Math.min(page * PAGE_SIZE, data.stocks.length);

                                        return (
                                          <>
                                            {paginatedStocks.map((stock) => (
                                              <tr 
                                                key={stock.ticker} 
                                                className="hover:bg-[#F4F6FB] transition-colors group cursor-pointer"
                                                onClick={() => router.push(`/stock/${stock.ticker}`)}
                                              >
                                                <td className="py-3 px-4">
                                                  <div className="font-bold text-[#1E2761] group-hover:text-[#028090] transition-colors text-sm">{stock.ticker}</div>
                                                  <div className="text-xs text-[#64748B] truncate max-w-[150px]">{stock.company_name}</div>
                                                </td>
                                                <td className="py-3 px-2 text-center" style={{ width: '80px' }}>
                                                  <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold border ${getScoreColor(stock.composite_score)}`}>
                                                    {Math.round(stock.composite_score)}
                                                  </span>
                                                </td>
                                                <td className="py-3 px-2 text-right font-medium text-[#1E2761] text-sm" style={{ width: '90px' }}>
                                                  ₹{(stock.current_price || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                                </td>
                                                <td className="py-3 px-2 text-right text-sm text-[#64748B]" style={{ width: '90px' }}>
                                                  {Math.floor((stock.market_cap || 0) / 10000000).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-2 text-right text-sm text-[#64748B]" style={{ width: '80px' }}>
                                                  {stock.pe_ratio ? stock.pe_ratio.toFixed(1) : "—"}
                                                </td>
                                                <td className="py-3 px-2 text-right text-sm text-[#64748B]" style={{ width: '80px' }}>
                                                  {stock.roe ? stock.roe.toFixed(1) : "—"}
                                                </td>
                                                <td className="py-3 px-2 text-right text-sm text-[#64748B]" style={{ width: '90px' }}>
                                                  {stock.net_margin ? stock.net_margin.toFixed(1) : "—"}
                                                </td>
                                              </tr>
                                            ))}
                                            <tr className="hidden"><td colSpan={7}></td></tr>
                                          </>
                                        );
                                      })()}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="text-[11px] text-[#64748B] italic">
                                  * Data may be unavailable for some stocks via Yahoo Finance
                                </div>

                                {/* Pagination Controls */}
                                {Math.ceil(data.stocks.length / 10) > 1 && (() => {
                                  const PAGE_SIZE = 10;
                                  const page = currentPage[sector] || 1;
                                  const totalPages = Math.ceil(data.stocks.length / PAGE_SIZE);
                                  const startIdx = (page - 1) * PAGE_SIZE + 1;
                                  const endIdx = Math.min(page * PAGE_SIZE, data.stocks.length);

                                  return (
                                    <div className="pt-2 pb-2 flex flex-col items-center justify-center space-y-3">
                                      <span className="text-xs text-[#64748B] font-medium">Showing {startIdx}–{endIdx} of {data.stocks.length} stocks</span>
                                      <div className="flex items-center space-x-6">
                                        <button 
                                          onClick={() => {
                                            setCurrentPage(prev => ({ ...prev, [sector]: page - 1 }));
                                            document.getElementById(`sector-card-${sector.replace(/\s+/g, '-')}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                          }}
                                          disabled={page === 1}
                                          className={`px-4 py-1.5 text-sm font-semibold rounded border transition-colors ${page === 1 ? 'border-[#64748B]/30 text-[#64748B]/50 cursor-not-allowed' : 'border-[#1E2761] text-[#1E2761] hover:bg-[#1E2761] hover:text-white'}`}
                                        >
                                          ← Prev
                                        </button>
                                        <span className="text-sm font-bold text-[#1E2761]">Page {page} of {totalPages}</span>
                                        <button 
                                          onClick={() => {
                                            setCurrentPage(prev => ({ ...prev, [sector]: page + 1 }));
                                            document.getElementById(`sector-card-${sector.replace(/\s+/g, '-')}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                          }}
                                          disabled={page === totalPages}
                                          className={`px-4 py-1.5 text-sm font-semibold rounded border transition-colors ${page === totalPages ? 'border-[#64748B]/30 text-[#64748B]/50 cursor-not-allowed' : 'border-[#1E2761] text-[#1E2761] hover:bg-[#1E2761] hover:text-white'}`}
                                        >
                                          Next →
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
