"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import DeltaPill from "@/components/ui/DeltaPill";
import Badge from "@/components/ui/Badge";
import MetricCard from "@/components/ui/MetricCard";
import SectionLabel from "@/components/ui/SectionLabel";
import { formatCurrency, formatLargeNumber } from "@/lib/utils";
import { ChevronRight, Brain, TrendingUp, TrendingDown, Info } from "lucide-react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

const MOCK_CONSTITUENTS = [
  { rank: 1, ticker: "RELIANCE", name: "Reliance Industries", price: 2540.5, change: 1.81, score: 82, mcap: 1721000, vol: 1.2, trend: "up" },
  { rank: 2, ticker: "TCS", name: "Tata Consultancy Services", price: 3942.1, change: 4.12, score: 91, mcap: 1445000, vol: 2.1, trend: "up" },
  { rank: 3, ticker: "HDFC BANK", name: "HDFC Bank Ltd", price: 1452.1, change: -0.85, score: 65, mcap: 1102000, vol: 0.9, trend: "down" },
  { rank: 4, ticker: "INFY", name: "Infosys Ltd", price: 1612.4, change: 2.15, score: 78, mcap: 669000, vol: 1.5, trend: "up" },
];

const SectorDetail: React.FC = () => {
  const { sector } = useParams();
  const sectorName = typeof sector === "string" ? sector.toUpperCase() : "TECHNOLOGY";

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto p-10 space-y-12">
        {/* Header Section */}
        <header className="space-y-6">
          <nav className="flex items-center gap-2 text-xs font-semibold text-outline tracking-wider uppercase">
            <span>Sectors</span>
            <ChevronRight size={10} />
            <span className="text-on-surface">{sectorName}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant/10 pb-8 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-light text-on-surface-variant tracking-tight mb-4">
                Sector Detail: <span className="font-semibold text-on-surface">{sectorName}</span>
              </h2>
              <div className="flex items-start gap-3 bg-primary-container/5 p-4 rounded-xl border border-primary-container/10">
                <Brain className="text-primary-container shrink-0" size={20} />
                <div>
                    <p className="text-[10px] font-bold text-primary-container uppercase tracking-widest mb-1 italic">AI Alpha Summary</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                        Sector rotation indices suggest a strong pivot towards defense. High institutional buy-back activity noted in top-tier {sectorName} large caps despite global headwind concerns.
                    </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 min-w-[300px]">
                <div className="text-right">
                    <span className="block text-[10px] uppercase font-bold tracking-widest text-outline mb-1">Inflow</span>
                    <span className="text-2xl font-semibold text-tertiary-container tabular-nums">₹4,228 Cr</span>
                </div>
                <div className="text-right border-l border-outline-variant/20 pl-8">
                    <span className="block text-[10px] uppercase font-bold tracking-widest text-outline mb-1">Breadth</span>
                    <span className="text-2xl font-semibold text-tertiary-container tabular-nums">71%</span>
                </div>
            </div>
          </div>
        </header>

        {/* Sector Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard label="Constituents" value="12" />
            <MetricCard label="Market Breath" value="Positive" valueClassName="text-tertiary-container" />
            <MetricCard label="Advancing / Declining" value="9 / 3" />
            <MetricCard label="Liquidity Inflow" value="High" />
        </div>

        {/* Constituent Table */}
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <SectionLabel label="Constituent Deep Dive" />
                <div className="flex items-center gap-2 text-[10px] font-bold text-outline uppercase tracking-widest border border-outline-variant/20 px-3 py-1.5 rounded-lg">
                    <Info size={12} />
                    Sorted by AI Composite Score
                </div>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low/50 border-b border-outline-variant/10">
                            <th className="p-4 text-[10px] font-bold text-outline uppercase tracking-widest w-16 text-center">Rank</th>
                            <th className="p-4 text-[10px] font-bold text-outline uppercase tracking-widest">Ticker</th>
                            <th className="p-4 text-[10px] font-bold text-outline uppercase tracking-widest text-right">Price</th>
                            <th className="p-4 text-[10px] font-bold text-outline uppercase tracking-widest text-right">Change %</th>
                            <th className="p-4 text-[10px] font-bold text-outline uppercase tracking-widest text-right">AI Score</th>
                            <th className="p-4 text-[10px] font-bold text-outline uppercase tracking-widest text-right">Market Cap (Cr)</th>
                            <th className="p-4 text-[10px] font-bold text-outline uppercase tracking-widest text-center">Trend</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                        {MOCK_CONSTITUENTS.map((stock) => (
                            <motion.tr 
                                key={stock.ticker} 
                                whileHover={{ backgroundColor: 'rgba(0, 55, 176, 0.02)' }}
                                className="group cursor-pointer transition-all duration-200"
                            >
                                <td className="p-4 text-center font-bold text-outline/50 tabular-nums">#{stock.rank}</td>
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm tracking-tight group-hover:text-primary-container transition-colors">{stock.ticker}</span>
                                        <span className="text-[10px] text-outline font-medium">{stock.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right font-bold text-sm tabular-nums">{formatCurrency(stock.price).replace("₹", "")}</td>
                                <td className="p-4 text-right">
                                    <DeltaPill value={stock.change} showIcon={false} className="justify-end" />
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="font-bold text-sm">{stock.score}</span>
                                        <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden">
                                            <div className="bg-primary-container h-full" style={{ width: `${stock.score}%` }}></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-right font-semibold text-xs text-on-surface-variant tabular-nums">
                                    {stock.mcap.toLocaleString("en-IN")}
                                </td>
                                <td className="p-4 text-center">
                                    {stock.trend === "up" ? (
                                        <div className="inline-flex items-center justify-center w-6 h-6 bg-tertiary-container/10 text-tertiary-container rounded-full">
                                            <TrendingUp size={14} />
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center justify-center w-6 h-6 bg-error-container/10 text-error rounded-full">
                                            <TrendingDown size={14} />
                                        </div>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default SectorDetail;
