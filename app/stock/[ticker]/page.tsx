"use client";
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import MetricCard from "@/components/ui/MetricCard";
import DeltaPill from "@/components/ui/DeltaPill";
import SectionLabel from "@/components/ui/SectionLabel";
import Badge from "@/components/ui/Badge";
import StockChat from "@/components/StockChat";
import { formatCurrency, formatLargeNumber } from "@/lib/utils";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Activity, TrendingUp, DollarSign, Users, Target, BookOpen, Clock, ExternalLink, RefreshCw, Loader2, Info, ArrowUp, ArrowDown, ChevronRight, FileText, Maximize2, Brain, TrendingDown } from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const TABS = ["Overview", "Financials", "Peer Comparison", "AI Analyst", "Shareholding", "Chat"];

const StockDetail: React.FC = () => {
  const { ticker } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [stock, setStock] = useState<any>(null);
  const [peers, setPeers] = useState<any[] | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [shareholding, setShareholding] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState({ key: 'market_cap', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSteps, setAiSteps] = useState<Record<number, { label: string; done: boolean; data?: any }>>({});
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [chartPeriod, setChartPeriod] = useState("1y");
  const [chartLoading, setChartLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) return;
    async function fetchStock() {
      setLoading(true);
      try {
        const [overviewRes, newsRes] = await Promise.all([
          fetch(`/api/stock/${ticker}/overview`),
          fetch(`/api/stock/${ticker}/news`),
        ]);
        const overviewData = await overviewRes.json();
        const newsData = await newsRes.json();
        setStock(overviewData);
        setNews(newsData);
      } catch (err) {
        console.error("Stock fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStock();
  }, [ticker]);

  useEffect(() => {
    if (!ticker || (activeTab !== "Peer Comparison" && activeTab !== "Chat")) return;
    if (peers !== null) return;
    fetch(`/api/stock/${ticker}/peers`)
      .then((r) => r.json())
      .then(setPeers)
      .catch(console.error);
  }, [ticker, activeTab]);

  useEffect(() => {
    if (!ticker || (activeTab !== "Financials" && activeTab !== "Chat")) return;
    if (financials) return;
    fetch(`/api/stock/${ticker}/financials`)
      .then((r) => r.json())
      .then(setFinancials)
      .catch(console.error);
  }, [ticker, activeTab]);

  useEffect(() => {
    if (!ticker || (activeTab !== "Shareholding" && activeTab !== "Chat")) return;
    if (shareholding) return;
    fetch(`/api/stock/${ticker}/shareholding`)
      .then((r) => r.json())
      .then(setShareholding)
      .catch(console.error);
  }, [ticker, activeTab]);

  useEffect(() => {
    if (!ticker) return;
    setChartLoading(true);
    fetch(`/api/stock/${ticker}/history?period=${chartPeriod}`)
      .then((r) => r.json())
      .then((data) => {
        const formatted = (Array.isArray(data) ? data : []).map((d: any) => ({
          ...d,
          label: new Date(d.Date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: chartPeriod === "5y" ? "numeric" : undefined,
          }),
        }));
        setHistoryData(formatted);
      })
      .catch(console.error)
      .finally(() => setChartLoading(false));
  }, [ticker, chartPeriod]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-[1400px] mx-auto p-10 flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-outline">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-medium">Fetching {ticker} data...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!stock) {
    return (
      <AppLayout>
        <div className="max-w-[1400px] mx-auto p-10 flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <p className="text-outline text-sm">Could not load data for {ticker}.</p>
            {ticker?.toString().toUpperCase() === "KKR" && (
              <p className="text-xs text-outline-variant max-w-xs mx-auto">
                Note: KKR is listed on NYSE. QuantEdge currently covers NSE/BSE stocks only.
              </p>
            )}
            <Link href="/dashboard" className="text-primary-container text-xs font-bold hover:underline">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto p-10 space-y-10">
        {/* Breadcrumb & Header */}
        <section className="flex items-end justify-between border-b border-outline-variant/10 pb-6">
          <div>
            <nav className="flex items-center gap-2 text-xs font-semibold text-outline tracking-wider mb-2 uppercase">
              <span>Equity</span>
              <ChevronRight size={10} />
              <span>NSE</span>
              <ChevronRight size={10} />
              <span className="text-on-surface">{ticker}</span>
            </nav>
            <h2 className="text-[32px] tracking-tight mb-2">
              <span className="font-light">{ticker} </span>
              <span className="font-semibold">{(stock.name || "").toUpperCase()}</span>
            </h2>
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold tabular-nums tracking-tighter">
                ₹{stock.last_price?.toLocaleString("en-IN") ?? "—"}
              </span>
              {stock.change_percent != null && (
                <div className={`flex items-center gap-1.5 font-semibold ${stock.change_percent >= 0 ? "text-tertiary-container" : "text-error"}`}>
                  {stock.change_percent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>
                    {stock.change >= 0 ? "+" : ""}{(stock.change ?? 0).toFixed(2)} ({(stock.change_percent ?? 0).toFixed(2)}%)
                  </span>
                </div>
              )}
              {stock.last_updated && (
                <span className="text-[10px] text-outline font-medium">
                  Data as of {new Date(stock.last_updated).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })} IST
                </span>
              )}
            </div>
          </div>
          <Link
            href={`/report/${ticker}`}
            className="bg-on-surface text-surface py-2.5 px-6 rounded-lg font-semibold text-sm hover:bg-on-surface/90 transition-all flex items-center gap-2"
          >
            <FileText size={18} />
            GENERATE REPORT
          </Link>
        </section>

        {/* Tabs */}
        <div className="flex items-center gap-10 border-b border-outline-variant/10">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold transition-all border-b-2 ${
                activeTab === tab
                  ? "text-primary-container border-primary-container"
                  : "text-outline border-transparent hover:text-on-surface"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Chart Placeholder */}
              <div className="bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden border border-outline-variant/10 shadow-sm shadow-black/5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-outline tracking-widest uppercase">Performance</span>
                    <div className="flex bg-surface-container-low rounded-lg p-1">
                      {[
                        { label: "1M", value: "1mo" },
                        { label: "3M", value: "3mo" },
                        { label: "6M", value: "6mo" },
                        { label: "1Y", value: "1y" },
                        { label: "5Y", value: "5y" },
                      ].map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setChartPeriod(p.value)}
                          className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                            chartPeriod === p.value
                              ? "bg-surface-container-lowest shadow-sm text-on-surface"
                              : "text-outline hover:text-on-surface"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className="text-outline hover:text-on-surface"><Maximize2 size={18} /></button>
                </div>
                <div className="h-[300px] w-full">
                  {chartLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 size={20} className="animate-spin text-outline" />
                    </div>
                  ) : historyData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-outline text-xs">
                      No chart data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#006b2f" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#006b2f" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.4} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: "#9e9e9e" }}
                          tickLine={false}
                          axisLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          domain={["auto", "auto"]}
                          tick={{ fontSize: 10, fill: "#9e9e9e" }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                          width={72}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#fafaf8",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                          formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Close"]}
                          labelFormatter={(label) => label}
                        />
                        <Area
                          type="monotone"
                          dataKey="Close"
                          stroke="#006b2f"
                          strokeWidth={1.5}
                          fill="url(#priceGradient)"
                          dot={false}
                          activeDot={{ r: 4, fill: "#006b2f" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Market Cap" value={formatLargeNumber(stock.market_cap)} />
                <MetricCard label="P/E Ratio" value={stock.pe_ratio?.toFixed(2) ?? "—"} />
                <MetricCard label="P/B Ratio" value={stock.pb_ratio?.toFixed(2) ?? "—"} />
                <MetricCard label="ROE" value={stock.roe ? `${(stock.roe * 100).toFixed(1)}%` : "—"} />
                <MetricCard label="Debt/Equity" value={stock.debt_to_equity?.toFixed(2) ?? "—"} />
                <MetricCard label="52W High" value={stock.week_52_high ? `₹${stock.week_52_high.toLocaleString("en-IN")}` : "—"} />
                <MetricCard label="52W Low" value={stock.week_52_low ? `₹${stock.week_52_low.toLocaleString("en-IN")}` : "—"} />
                <MetricCard label="EPS" value={stock.eps ? `₹${stock.eps}` : "—"} />
              </div>

              {/* News Section */}
              <section className="space-y-4 pt-10 border-t border-outline-variant/10">
                <SectionLabel label="Latest News" icon={Brain} />
                {news.length === 0 ? (
                  <p className="text-sm text-outline">No news available.</p>
                ) : (
                  <div className="space-y-3">
                    {news.slice(0, 5).map((article, i) => (
                      <a
                        key={i}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 hover:border-primary-container/20 transition-all"
                      >
                        <p className="text-sm font-semibold mb-1 leading-snug">{article.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-outline font-medium uppercase tracking-wider">
                          <span>{article.source}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </section>

              {/* About */}
              {stock.description && (
                <section className="space-y-4 pt-10 border-t border-outline-variant/10">
                  <SectionLabel label="About" />
                  <p className="text-sm text-on-surface-variant leading-relaxed">{stock.description}</p>
                </section>
              )}
            </div>

            {/* Right Panel */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm shadow-black/5 space-y-4">
                <h3 className="text-xs font-bold text-outline tracking-widest uppercase">Key Stats</h3>
                {[
                  { label: "Sector", value: stock.sector },
                  { label: "Industry", value: stock.industry },
                  { label: "Employees", value: stock.employees?.toLocaleString("en-IN") },
                  { label: "Beta", value: stock.beta?.toFixed(2) },
                  { label: "Div Yield", value: stock.dividend_yield ? `${(stock.dividend_yield * 100).toFixed(2)}%` : "—" },
                  { label: "Net Margin", value: stock.net_margin ? `${(stock.net_margin * 100).toFixed(1)}%` : "—" },
                  { label: "Free Cash Flow", value: stock.free_cash_flow ? formatLargeNumber(stock.free_cash_flow) : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center text-xs border-b border-outline-variant/5 pb-2">
                    <span className="text-outline">{label}</span>
                    <span className="font-semibold">{value ?? "—"}</span>
                  </div>
                ))}
                {stock.website && (
                  <a href={stock.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-container hover:underline block pt-1">
                    {stock.website}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Shareholding Tab ... Wait, replacing Peer Comparison */}
        {activeTab === "Peer Comparison" && (
          <div className="space-y-4">
            {!peers ? (
              <div className="flex items-center gap-3 text-outline p-10">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading peer data...</span>
              </div>
            ) : peers.length === 0 && !stock ? (
              <div className="flex items-center gap-3 text-outline p-10">
                <span className="text-sm">No peer data available for this stock.</span>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl border border-outline-variant/10 shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[#1E293B] text-[11px] uppercase tracking-wider border-b border-outline-variant/10">
                      {[
                        { label: 'Company', key: 'symbol', align: 'left' },
                        { label: 'CMP (₹)', key: 'current_price', align: 'right' },
                        { label: 'Mkt Cap (Cr)', key: 'market_cap', align: 'right' },
                        { label: 'P/E', key: 'pe_ratio', align: 'right' },
                        { label: 'P/B', key: 'pb_ratio', align: 'right' },
                        { label: 'ROE %', key: 'roe', align: 'right' },
                        { label: 'Net Margin %', key: 'net_margin', align: 'right' },
                        { label: 'ROCE %', key: 'roce', align: 'right' },
                      ].map((col) => (
                        <th 
                          key={col.key} 
                          className={`py-3 px-4 ${col.align === 'right' ? 'text-right' : 'text-left'} cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap`}
                          onClick={() => {
                            setSortConfig(current => ({
                              key: col.key,
                              direction: current.key === col.key && current.direction === 'desc' ? 'asc' : 'desc'
                            }));
                          }}
                        >
                          <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                            {col.label}
                            {sortConfig.key === col.key ? (
                              sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                            ) : (
                              <div className="flex flex-col -space-y-[4px] opacity-20">
                                <ArrowUp size={8} />
                                <ArrowDown size={8} />
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {(() => {
                      let data = [...(peers || [])];
                      if (stock && !data.some((p) => p.symbol === ticker)) {
                        data.push({
                          symbol: ticker as string,
                          name: stock.name,
                          market_cap: stock.market_cap,
                          pe_ratio: stock.pe_ratio,
                          pb_ratio: stock.pb_ratio,
                          roe: stock.roe,
                          net_margin: stock.net_margin,
                          roce: stock.roce ? stock.roce * 100 : null,
                          current_price: stock.last_price || stock.currentPrice,
                        });
                      }
                      data.sort((a, b) => {
                        let aVal = a[sortConfig.key];
                        let bVal = b[sortConfig.key];
                        if (aVal === undefined || aVal === null) aVal = -Infinity;
                        if (bVal === undefined || bVal === null) bVal = -Infinity;
                        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                        return 0;
                      });

                      return data.map((peer) => {
                        const isCurrent = peer.symbol === ticker;
                        return (
                          <tr 
                            key={peer.symbol} 
                            className={`transition-colors ${isCurrent ? 'bg-blue-50/50' : 'hover:bg-surface-container-lowest'}`}
                          >
                            <td className="py-4 px-4 whitespace-nowrap">
                              <p className={`text-sm ${isCurrent ? 'font-bold text-[#1E293B]' : 'font-semibold'}`}>{peer.symbol}</p>
                              <p className="text-[10px] text-outline font-medium">{peer.name}</p>
                            </td>
                            <td className={`text-right px-4 tabular-nums ${isCurrent ? 'font-bold' : ''}`}>
                              {peer.current_price ? peer.current_price.toLocaleString("en-IN") : "—"}
                            </td>
                            <td className={`text-right px-4 tabular-nums ${isCurrent ? 'font-bold' : ''}`}>
                              {peer.market_cap ? Math.floor(peer.market_cap / 10000000).toLocaleString("en-IN") : "—"}
                            </td>
                            <td className={`text-right px-4 tabular-nums ${isCurrent ? 'font-bold' : ''}`}>
                              {peer.pe_ratio?.toFixed(1) ?? "—"}
                            </td>
                            <td className={`text-right px-4 tabular-nums ${isCurrent ? 'font-bold' : ''}`}>
                              {peer.pb_ratio?.toFixed(1) ?? "—"}
                            </td>
                            <td className={`text-right px-4 tabular-nums ${isCurrent ? 'font-bold' : ''}`}>
                              {peer.roe ? `${(peer.roe * (peer.roe < 2 ? 100 : 1)).toFixed(1)}%` : "—"}
                            </td>
                            <td className={`text-right px-4 tabular-nums ${isCurrent ? 'font-bold' : ''}`}>
                              {peer.net_margin ? `${(peer.net_margin * (peer.net_margin < 2 ? 100 : 1)).toFixed(1)}%` : "—"}
                            </td>
                            <td className={`text-right px-4 tabular-nums ${isCurrent ? 'font-bold' : ''}`}>
                              {peer.roce ? `${(peer.roce * (peer.roce < 2 ? 100 : 1)).toFixed(1)}%` : "—"}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            )}
            {peers !== null && (
              <p className="text-[#94A3B8] text-[11px] italic mt-2 px-2">
                CMP = Current Market Price · ROCE = Return on Capital Employed · Data: NSE/BSE via Yahoo Finance · May be 15 min delayed
              </p>
            )}
          </div>
        )}

        {/* Shareholding Tab */}
        {activeTab === "Shareholding" && (
          <div className="space-y-8">
            {!shareholding ? (
              <div className="flex items-center gap-3 text-outline p-10">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading shareholding data...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Major Holders */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                  <div className="p-6 border-b border-outline-variant/10">
                    <h3 className="text-xs font-bold text-outline tracking-widest uppercase">Major Holders</h3>
                  </div>
                  <div className="p-6">
                    {!shareholding.major_holders || shareholding.major_holders.length === 0 ? (
                      <p className="text-sm text-outline">Not available for this stock.</p>
                    ) : (
                      <div className="space-y-4">
                        {shareholding.major_holders.map((row: any, i: number) => {
                          const pct = row["Value"] ?? row[0];
                          const label = row["index"] ?? row["Breakdown"] ?? row[1];
                          if (!label) return null;
                          const isCount = label === "institutionsCount";
                          const displayLabel = label
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (s: string) => s.toUpperCase())
                            .trim();
                          return (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-sm text-outline-variant">{displayLabel}</span>
                              <div className="flex items-center gap-4">
                                {!isCount && (
                                  <div className="w-32 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-tertiary-container rounded-full"
                                      style={{
                                        width: `${Math.min(
                                          (typeof pct === "number" ? pct : parseFloat(pct)) * 100,
                                          100
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                )}
                                <span className="text-sm font-bold tabular-nums w-16 text-right">
                                  {pct !== undefined
                                    ? isCount
                                      ? Number(pct).toLocaleString("en-IN")
                                      : `${((typeof pct === "number" ? pct : parseFloat(pct)) * 100).toFixed(2)}%`
                                    : "—"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Institutional Holders */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                  <div className="p-6 border-b border-outline-variant/10">
                    <h3 className="text-xs font-bold text-outline tracking-widest uppercase">
                      Institutional Holders
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    {!shareholding.institutional || shareholding.institutional.length === 0 ? (
                      <p className="text-sm text-outline p-6">Not available for this stock.</p>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-outline-variant/10">
                            <th className="text-left px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">Institution</th>
                            <th className="text-right px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">Shares</th>
                            <th className="text-right px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">% Held</th>
                            <th className="text-right px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/5">
                          {shareholding.institutional.slice(0, 10).map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-surface-container transition-colors">
                              <td className="px-6 py-4 text-sm font-medium truncate max-w-[240px]">
                                {row.Holder ?? row.holder ?? "—"}
                              </td>
                              <td className="px-6 py-4 text-right text-sm tabular-nums">
                                {row.Shares
                                  ? Number(row.Shares).toLocaleString("en-IN")
                                  : "—"}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-bold tabular-nums">
                                {row.pctHeld !== undefined
                                  ? `${(row.pctHeld * 100).toFixed(2)}%`
                                  : row["% Out"] !== undefined
                                  ? `${(parseFloat(row["% Out"]) * 100).toFixed(2)}%`
                                  : "—"}
                              </td>
                              <td className="px-6 py-4 text-right text-sm tabular-nums text-outline">
                                {row.Value
                                  ? `₹${Number(row.Value).toLocaleString("en-IN")}`
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Mutual Fund Holders */}
                {shareholding.mutual_fund && shareholding.mutual_fund.length > 0 && (
                  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                    <div className="p-6 border-b border-outline-variant/10">
                      <h3 className="text-xs font-bold text-outline tracking-widest uppercase">
                        Mutual Fund Holders
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-outline-variant/10">
                            <th className="text-left px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">Fund</th>
                            <th className="text-right px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">Shares</th>
                            <th className="text-right px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">% Held</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/5">
                          {shareholding.mutual_fund.slice(0, 10).map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-surface-container transition-colors">
                              <td className="px-6 py-4 text-sm font-medium truncate max-w-[240px]">
                                {row.Holder ?? row.holder ?? "—"}
                              </td>
                              <td className="px-6 py-4 text-right text-sm tabular-nums">
                                {row.Shares ? Number(row.Shares).toLocaleString("en-IN") : "—"}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-bold tabular-nums">
                                {row.pctHeld !== undefined
                                  ? `${(row.pctHeld * 100).toFixed(2)}%`
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Financials Tab */}
        {activeTab === "Financials" && (
          <div className="space-y-8">
            {!financials ? (
              <div className="flex items-center gap-3 text-outline p-10">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading financials...</span>
              </div>
            ) : (() => {
              // Transpose: API returns {date: {metric: val}} → we need {metric: {date: val}}
              const transpose = (dateKeyed: any) => {
                const result: any = {};
                for (const date of Object.keys(dateKeyed)) {
                  const metrics = dateKeyed[date];
                  if (typeof metrics !== "object" || metrics === null) continue;
                  for (const metric of Object.keys(metrics)) {
                    if (!result[metric]) result[metric] = {};
                    result[metric][date] = metrics[metric];
                  }
                }
                return result;
              };

              const rawIS = financials.income_statement || {};
              // Detect format: if first key is a date string, transpose
              const firstKey = Object.keys(rawIS)[0] || "";
              const isDateKeyed = /^\d{4}/.test(firstKey);
              const is = isDateKeyed ? transpose(rawIS) : rawIS;

              const years = Object.keys(is["Total Revenue"] || is["Net Income"] || {})
                .sort()
                .reverse()
                .slice(0, 5);

              const fmt = (val: any) => {
                if (val === undefined || val === null) return "—";
                const n = Number(val);
                if (isNaN(n)) return "—";
                if (Math.abs(n) >= 1e12) return `₹${(n / 1e12).toFixed(2)}T`;
                if (Math.abs(n) >= 1e9) return `₹${(n / 1e9).toFixed(2)}B`;
                if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
                return `₹${n.toLocaleString("en-IN")}`;
              };

              const rows = [
                { label: "Total Revenue", key: "Total Revenue" },
                { label: "Gross Profit", key: "Gross Profit" },
                { label: "EBITDA", key: "EBITDA" },
                { label: "Operating Income", key: "Operating Income" },
                { label: "Net Income", key: "Net Income" },
                { label: "Basic EPS", key: "Basic EPS" },
                { label: "Diluted EPS", key: "Diluted EPS" },
              ];

              return (
                <div className="space-y-8">
                  {/* Income Statement */}
                  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
                      <h3 className="text-xs font-bold text-outline tracking-widest uppercase">
                        Income Statement (Annual)
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-outline-variant/10">
                            <th className="text-left px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">
                              Metric
                            </th>
                            {years.map((y) => (
                              <th key={y} className="text-right px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">
                                {y.slice(0, 4)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/5">
                          {rows.map((row) => (
                            <tr key={row.key} className="hover:bg-surface-container transition-colors">
                              <td className="px-6 py-4 text-sm font-semibold">{row.label}</td>
                              {years.map((y) => {
                                const val = is[row.key]?.[y];
                                const isEps = row.key.includes("EPS");
                                return (
                                  <td key={y} className="px-6 py-4 text-right text-sm tabular-nums font-medium">
                                    {isEps
                                      ? val !== undefined && val !== null
                                        ? `₹${Number(val).toFixed(2)}`
                                        : "—"
                                      : fmt(val)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Balance Sheet */}
                  {financials.balance_sheet && (() => {
                    const rawBS = financials.balance_sheet;
                    const firstBSKey = Object.keys(rawBS)[0] || "";
                    const bs = /^\d{4}/.test(firstBSKey) ? transpose(rawBS) : rawBS;
                    const bsYears = Object.keys(bs["Total Assets"] || bs["Stockholders Equity"] || {})
                      .sort()
                      .reverse()
                      .slice(0, 5);

                    const bsRows = [
                      { label: "Total Assets", key: "Total Assets" },
                      { label: "Total Liabilities", key: "Total Liabilities Net Minority Interest" },
                      { label: "Total Equity", key: "Stockholders Equity" },
                      { label: "Total Debt", key: "Total Debt" },
                      { label: "Cash & Equivalents", key: "Cash And Cash Equivalents" },
                    ];

                    return (
                      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                        <div className="p-6 border-b border-outline-variant/10">
                          <h3 className="text-xs font-bold text-outline tracking-widest uppercase">
                            Balance Sheet (Annual)
                          </h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-outline-variant/10">
                                <th className="text-left px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">
                                  Metric
                                </th>
                                {bsYears.map((y) => (
                                  <th key={y} className="text-right px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">
                                    {y.slice(0, 4)}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/5">
                              {bsRows.map((row) => (
                                <tr key={row.key} className="hover:bg-surface-container transition-colors">
                                  <td className="px-6 py-4 text-sm font-semibold">{row.label}</td>
                                  {bsYears.map((y) => (
                                    <td key={y} className="px-6 py-4 text-right text-sm tabular-nums font-medium">
                                      {fmt(bs[row.key]?.[y])}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Cash Flow */}
                  {financials.cash_flow && (() => {
                    const rawCF = financials.cash_flow;
                    const firstCFKey = Object.keys(rawCF)[0] || "";
                    const cf = /^\d{4}/.test(firstCFKey) ? transpose(rawCF) : rawCF;
                    const cfYears = Object.keys(cf["Operating Cash Flow"] || cf["Free Cash Flow"] || {})
                      .sort()
                      .reverse()
                      .slice(0, 5);

                    const cfRows = [
                      { label: "Operating Cash Flow", key: "Operating Cash Flow" },
                      { label: "Investing Cash Flow", key: "Investing Cash Flow" },
                      { label: "Financing Cash Flow", key: "Financing Cash Flow" },
                      { label: "Free Cash Flow", key: "Free Cash Flow" },
                    ];

                    return (
                      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                        <div className="p-6 border-b border-outline-variant/10">
                          <h3 className="text-xs font-bold text-outline tracking-widest uppercase">
                            Cash Flow (Annual)
                          </h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-outline-variant/10">
                                <th className="text-left px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">
                                  Metric
                                </th>
                                {cfYears.map((y) => (
                                  <th key={y} className="text-right px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">
                                    {y.slice(0, 4)}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/5">
                              {cfRows.map((row) => (
                                <tr key={row.key} className="hover:bg-surface-container transition-colors">
                                  <td className="px-6 py-4 text-sm font-semibold">{row.label}</td>
                                  {cfYears.map((y) => (
                                    <td key={y} className="px-6 py-4 text-right text-sm tabular-nums font-medium">
                                      {fmt(cf[row.key]?.[y])}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>
        )}

        {/* AI Analyst Tab */}
        {activeTab === "AI Analyst" && (
          <div className="space-y-8">
            {!aiAnalysis && !aiLoading && (
              <div className="bg-surface-container-lowest rounded-2xl p-12 border border-outline-variant/10 flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 bg-primary-container/10 rounded-2xl flex items-center justify-center">
                  <Brain size={32} className="text-primary-container" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">AI Analyst — {ticker}</h3>
                  <p className="text-sm text-outline max-w-md">
                    Runs a 4-step chain across financials, news sentiment, peer benchmarking,
                    and synthesis using Groq LLaMA 3.3 70B.
                  </p>
                </div>

                {aiError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-xs max-w-md">
                    <strong>Error:</strong> {aiError}
                  </div>
                )}

                <button
                  onClick={async () => {
                    setAiLoading(true);
                    setAiError(null);
                    setAiAnalysis(null);
                    setAiSteps({});
                    try {
                      const res = await fetch(`/api/ai/analyze/${ticker}?stream=true`);
                      if (!res.ok) {
                        const errData = await res.json().catch(() => ({}));
                        throw new Error(errData.detail || errData.error || "AI Analysis failed");
                      }
                      const reader = res.body?.getReader();
                      if (!reader) throw new Error("No stream available");
                      const decoder = new TextDecoder();
                      let buffer = "";
                      while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split("\n");
                        buffer = lines.pop() || "";
                        let currentEvent = "";
                        for (const line of lines) {
                          if (line.startsWith("event: ")) {
                            currentEvent = line.slice(7).trim();
                          } else if (line.startsWith("data: ")) {
                            try {
                              const payload = JSON.parse(line.slice(6));
                              if (currentEvent === "status") {
                                setAiSteps(prev => ({
                                  ...prev,
                                  [payload.step]: { label: payload.label, done: !!payload.done },
                                }));
                              } else if (currentEvent === "step") {
                                setAiSteps(prev => ({
                                  ...prev,
                                  [payload.step]: { label: payload.label, done: true, data: payload.data },
                                }));
                              } else if (currentEvent === "complete") {
                                setAiAnalysis(payload);
                              } else if (currentEvent === "error") {
                                setAiError(payload.message);
                              }
                            } catch {}
                          }
                        }
                      }
                    } catch (err: any) {
                      console.error("AI fetch error:", err);
                      setAiError(err.message);
                    } finally {
                      setAiLoading(false);
                    }
                  }}
                  className="bg-on-surface text-surface py-3 px-8 rounded-xl font-bold text-sm hover:bg-on-surface/90 transition-all flex items-center gap-2"
                >
                  <Brain size={16} />
                  Run AI Analysis
                </button>
              </div>
            )}

            {aiLoading && (
              <div className="bg-surface-container-lowest rounded-2xl p-12 border border-outline-variant/10 flex flex-col items-center gap-6">
                <Loader2 size={32} className="animate-spin text-primary-container" />
                <div className="text-center">
                  <p className="font-bold mb-1">Running AI analysis...</p>
                  <p className="text-sm text-outline">Steps 1-3 run in parallel for speed</p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {[
                    { step: 0, name: "Data Fetch" },
                    { step: 1, name: "Financials" },
                    { step: 2, name: "News Sentiment" },
                    { step: 3, name: "Peer Benchmarking" },
                    { step: 4, name: "Synthesis" },
                  ].map(({ step, name }) => {
                    const s = aiSteps[step];
                    const isDone = s?.done;
                    const isActive = s && !s.done;
                    return (
                      <div key={step} className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                        isDone ? 'bg-tertiary-container/20 text-tertiary-container' :
                        isActive ? 'bg-primary-container/10 text-primary-container' :
                        'bg-surface-container text-outline'
                      }`}>
                        {isDone ? (
                          <span className="text-tertiary-container">✓</span>
                        ) : isActive ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <span className="w-3 h-3 rounded-full bg-outline/20" />
                        )}
                        <span>{name}</span>
                        {s?.label && <span className="ml-auto text-[10px] font-medium normal-case opacity-70">{s.label}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {aiAnalysis && !aiLoading && (
              <div className="space-y-8">
                {/* Verdict Header */}
                <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">AI Verdict</p>
                      <h3 className="text-4xl font-bold tracking-tight">{aiAnalysis.verdict?.verdict}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-outline">Confidence: {aiAnalysis.verdict?.confidence}%</p>
                        {aiAnalysis.verdict?.weighted_score != null && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary-container/10 text-primary-container">
                            Score: {aiAnalysis.verdict?.weighted_score}/100
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        aiAnalysis.step2_sentiment?.sentiment === "Bullish" ? "success" :
                        aiAnalysis.step2_sentiment?.sentiment === "Bearish" ? "error" : "default"
                      }>
                        {aiAnalysis.step2_sentiment?.sentiment} Sentiment
                      </Badge>
                      <p className="text-[10px] text-outline mt-2 font-medium">
                        {aiAnalysis.step3_peers?.relative_position} vs Peers
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {aiAnalysis.verdict?.summary}
                  </p>
                </div>

                {/* Bull & Bear Case */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface-container-lowest p-8 rounded-2xl border-l-4 border-tertiary-container">
                    <div className="flex items-center gap-2 mb-4 text-tertiary-container">
                      <TrendingUp size={16} />
                      <span className="text-xs font-bold tracking-widest uppercase">Bull Case</span>
                    </div>
                    <ul className="space-y-3">
                      {(aiAnalysis.verdict?.bull_case || []).map((item: string, i: number) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-tertiary-container font-bold text-sm">•</span>
                          <p className="text-sm text-on-surface-variant leading-relaxed">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-surface-container-lowest p-8 rounded-2xl border-l-4 border-error">
                    <div className="flex items-center gap-2 mb-4 text-error">
                      <TrendingDown size={16} />
                      <span className="text-xs font-bold tracking-widest uppercase">Bear Case</span>
                    </div>
                    <ul className="space-y-3">
                      {(aiAnalysis.verdict?.bear_case || []).map((item: string, i: number) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-error font-bold text-sm">•</span>
                          <p className="text-sm text-on-surface-variant leading-relaxed">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Outlook + Financials Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 space-y-4">
                    <h4 className="text-xs font-bold text-outline uppercase tracking-widest">12–24 Month Outlook</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{aiAnalysis.verdict?.outlook_1_2yr}</p>
                    <div className="pt-2 border-t border-outline-variant/10">
                      <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-3">Key Risks</h4>
                      <ul className="space-y-2">
                        {(aiAnalysis.verdict?.key_risks || []).map((risk: string, i: number) => (
                          <li key={i} className="text-sm text-on-surface-variant flex gap-2">
                            <span className="text-error">▲</span>{risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 space-y-4">
                    <h4 className="text-xs font-bold text-outline uppercase tracking-widest">Financial Strengths</h4>
                    <ul className="space-y-2">
                      {(aiAnalysis.step1_financials?.strengths || []).map((s: string, i: number) => (
                        <li key={i} className="text-sm text-on-surface-variant flex gap-2">
                          <span className="text-tertiary-container">✓</span>{s}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 border-t border-outline-variant/10">
                      <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-3">Valuation</h4>
                      <p className="text-sm font-bold">{aiAnalysis.step3_peers?.valuation_verdict}</p>
                      <p className="text-xs text-outline mt-1">{aiAnalysis.step3_peers?.pe_commentary}</p>
                    </div>
                  </div>
                </div>

                {/* Alternatives */}
                {aiAnalysis.verdict?.alternatives?.length > 0 && (
                  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10">
                    <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Consider Also</h4>
                    <div className="flex gap-3 flex-wrap">
                      {aiAnalysis.verdict.alternatives.map((alt: string) => (
                        <a
                          key={alt}
                          href={`/stock/${alt}`}
                          className="bg-surface-container px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-container/10 hover:text-primary-container transition-all"
                        >
                          {alt}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regenerate */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setAiAnalysis(null)}
                    className="text-xs font-bold text-outline hover:text-on-surface uppercase tracking-widest flex items-center gap-2 transition-colors"
                  >
                    <Brain size={12} />
                    Run Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === "Chat" && (
          <div className="pt-2">
            {!stock || !financials || !shareholding || peers === null ? (
              <div className="flex flex-col items-center justify-center p-12 gap-4">
                <Loader2 size={32} className="animate-spin text-outline" />
                <span className="text-sm text-outline">Loading full dataset for AI context...</span>
              </div>
            ) : (
              <StockChat ticker={ticker as string} stockData={{ overview: stock, financials, peers, shareholding }} />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StockDetail;
