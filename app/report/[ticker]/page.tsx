"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Loader2, CheckCircle2, Circle } from 'lucide-react';
import AppLayout from "@/components/layout/AppLayout";

const slidesPreview = [
  { id: 1, title: 'Report Cover', desc: 'Company details, price, market cap' },
  { id: 2, title: 'AI Verdict', desc: 'BUY/HOLD/AVOID verdict & summary' },
  { id: 3, title: 'Key Metrics', desc: 'P/E, ROE, Debt/Equity, Composite Score' },
  { id: 4, title: 'Financials Chart', desc: 'Multi-year Revenue & Profit trends' },
  { id: 5, title: 'Balance Sheet', desc: '3-year financial health snapshot' },
  { id: 6, title: 'Peer Comparison', desc: 'Sector peers benchmarking table' },
  { id: 7, title: 'Shareholding', desc: 'Promoter & FII holdings, News sentiment' },
  { id: 8, title: 'Outlook & Risks', desc: '1-2 year forecast & alternatives' },
];

export default function ReportGenerator() {
  const { ticker } = useParams() as { ticker: string };
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState(ticker);

  useEffect(() => {
    fetch(`/api/stock/${ticker}/overview`)
      .then(r => r.json())
      .then(d => {
        if (d && d.name) setCompanyName(d.name);
      })
      .catch(e => console.error(e));
  }, [ticker]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      setStepIndex(0);
      
      // Step 0: Fetching live stock data & AI Analysis
      const aiRes = await fetch(`/api/ai/analyze/${ticker}`);
      if (!aiRes.ok) {
        const errData = await aiRes.json().catch(() => ({}));
        throw new Error(`AI analysis failed: ${errData.detail || errData.error || aiRes.statusText}`);
      }
      const aiData = await aiRes.json();
      setStepIndex(1);
      
      // Step 1: Building 8 slides via python API
      const v = aiData.verdict || {};
      const s = aiData.step2_sentiment || {};
      
      const vText = (v.verdict || '').toLowerCase();
      const finalVerdict = vText.includes('buy') ? 'BUY' : vText.includes('sell') ? 'AVOID' : 'HOLD';
      
      const sentimentText = (s.sentiment || '').toLowerCase();
      const finalSentiment = sentimentText.includes('bullish') ? 'Positive' : sentimentText.includes('bearish') ? 'Negative' : 'Neutral';

      const finalPayload = {
        verdict: finalVerdict,
        confidence: v.confidence || 50,
        summary: v.summary || "No summary available.",
        bull_case: Array.isArray(v.bull_case) ? v.bull_case.join('\n') : (v.bull_case || ""),
        bear_case: Array.isArray(v.bear_case) ? v.bear_case.join('\n') : (v.bear_case || ""),
        outlook_1_2yr: v.outlook_1_2yr || "No outlook available.",
        key_risks: Array.isArray(v.key_risks) ? v.key_risks : (Array.isArray(s.risks) ? s.risks : []),
        alternatives: Array.isArray(v.alternatives) ? v.alternatives : [],
        sentiment: finalSentiment,
        sentiment_score: s.sentiment_score || 50,
        catalysts: Array.isArray(s.catalysts) ? s.catalysts : [],
        news_summary: s.news_summary || ""
      };
      
      setStepIndex(2);

      const reportRes = await fetch(`/api/report/${ticker}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload)
      });
      
      if (!reportRes.ok) {
        const errData = await reportRes.json().catch(() => ({}));
        throw new Error(`Report generation failed: ${errData.detail || errData.error || reportRes.statusText}`);
      }
      
      // Step 3: Trigger Download
      setStepIndex(3);
      const blob = await reportRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ticker}_QuantEdge_Report.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setStepIndex(4);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
      setStepIndex(-1);
    }
  };

  const STEPS = [
    "Fetching live stock data",
    "Running AI analysis",
    "Building 8 slides",
    "Preparing download",
  ];

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-6rem)] bg-[#F4F6FB] -mt-6 rounded-tl-3xl p-6 lg:p-8">
        
        {/* Header Row */}
        <div className="flex items-center gap-6 mb-10 border-b border-[#E2E8F0] pb-6">
          <button 
            onClick={() => router.push(`/stock/${ticker}`)}
            className="flex items-center justify-center bg-white border border-[#1E2761]/20 rounded-lg w-12 h-12 shadow-sm hover:shadow-md transition-all text-[#1E2761]"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-[28px] font-bold text-[#1E293B] tracking-tight">{companyName}</h1>
            <p className="text-[#64748B] text-[13px] font-medium mt-1">Ticker: {ticker} · Investment Intelligence Report</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Slide Preview */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 lg:p-8">
            <h2 className="text-[16px] font-bold text-[#1E293B] mb-6">Report Contents</h2>
            <div className="flex flex-col">
              {slidesPreview.map((slide, i) => (
                <div key={slide.id} className={`py-4 flex items-center gap-4 ${i !== slidesPreview.length - 1 ? "border-b border-[#F4F6FB]" : ""}`}>
                  <div className="w-7 h-7 rounded-full bg-[#1E2761] text-white flex items-center justify-center text-[12px] font-bold shrink-0">
                    {slide.id}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#1E293B]">{slide.title}</h3>
                    <p className="text-[12px] text-[#64748B]">{slide.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Generator Panel */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 lg:p-8 sticky top-6">
            <h2 className="text-[18px] font-bold text-[#1E293B] mb-1">Generate Report</h2>
            <p className="text-[#64748B] text-[11px] font-medium mb-5 leading-relaxed">
              8-slide PowerPoint · Midnight Executive theme · Powered by Llama-3.3-70B
            </p>
            
            <hr className="border-[#F4F6FB] mb-5" />

            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="bg-[#F4F6FB] text-[#1E2761] text-[12px] px-3 py-1 rounded-full font-semibold">.pptx format</span>
              <span className="bg-[#F4F6FB] text-[#1E2761] text-[12px] px-3 py-1 rounded-full font-semibold">16:9 widescreen</span>
              <span className="bg-[#F4F6FB] text-[#1E2761] text-[12px] px-3 py-1 rounded-full font-semibold">~30 seconds</span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] transition-all text-white ${
                loading ? 'bg-[#1E2761]/60 cursor-not-allowed' : 'bg-[#1E2761] hover:bg-[#028090]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating report...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Generate & Download
                </>
              )}
            </button>

            {loading && (
              <div className="mt-8 space-y-4">
                {STEPS.map((step, idx) => {
                  const isCompleted = stepIndex > idx;
                  const isCurrent = stepIndex === idx;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle2 size={18} className="text-[#028090] shrink-0" />
                      ) : (
                        <Circle size={18} className={`shrink-0 ${isCurrent ? 'text-[#1E2761] animate-pulse' : 'text-[#CBD5E1]'}`} />
                      )}
                      <span className={`text-[13px] font-medium ${isCompleted || isCurrent ? 'text-[#1E293B]' : 'text-[#64748B]'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {error && (
              <div className="mt-6 border border-red-200 bg-red-50 p-4 rounded-xl">
                <p className="text-red-600 text-sm font-bold mb-2">{error}</p>
                <button 
                  onClick={handleGenerate}
                  className="w-full h-10 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition"
                >
                  Retry
                </button>
              </div>
            )}

            <p className="text-[#94A3B8] text-[10px] text-center mt-8 font-medium">
              Data: NSE/BSE via Yahoo Finance
            </p>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
