"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  CircleDashed,
  Brain,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";

interface ReportSlide {
  id: number;
  title: string;
  subtitle: string;
  status: "done" | "active" | "pending";
}

const INITIAL_SLIDES: ReportSlide[] = [
  { id: 1, title: "Executive Intelligence Summary", subtitle: "Synthesizing market sentiment and analyst consensus", status: "pending" },
  { id: 2, title: "Historical Performance & Volatility", subtitle: "Extracting multi-year price patterns", status: "pending" },
  { id: 3, title: "Capital Structure & Debt Analysis", subtitle: "Analyzing leverage and interest coverage metrics", status: "pending" },
  { id: 4, title: "Peer Benchmarking & Competitive Edge", subtitle: "Comparing sector-specific alpha drivers", status: "pending" },
  { id: 5, title: "AI Qualitative Risk Assessment", subtitle: "Processing regulatory filings and news keywords", status: "pending" },
  { id: 6, title: "QuantEdge Proprietary Verdict", subtitle: "Generating final probabilistic outcomes", status: "pending" },
];

const ReportGenerator: React.FC = () => {
  const { ticker } = useParams();
  const router = useRouter();
  const [slides, setSlides] = useState<ReportSlide[]>(INITIAL_SLIDES);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let currentSlideIndex = 0;
    const interval = setInterval(() => {
      if (currentSlideIndex < INITIAL_SLIDES.length) {
        setSlides((prev) =>
          prev.map((s, idx) => ({
            ...s,
            status: idx < currentSlideIndex ? "done" : idx === currentSlideIndex ? "active" : "pending",
          }))
        );
        setProgress(((currentSlideIndex + 1) / INITIAL_SLIDES.length) * 100);
        currentSlideIndex++;
      } else {
        setSlides((prev) => prev.map((s) => ({ ...s, status: "done" })));
        setCompleted(true);
        clearInterval(interval);
      }
    }, 800); // 800ms per step as requested

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-primary-container/20 overflow-hidden">
      {/* Standalone Header */}
      <header className="h-20 border-b border-outline-variant/10 px-10 flex items-center justify-between bg-surface-container-lowest shadow-sm z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-surface-container-low rounded-full transition-colors border border-outline-variant/10"
          >
            <ArrowLeft size={18} className="text-on-surface" />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center text-white">
                <Brain size={16} fill="white" />
             </div>
             <div>
                <h1 className="text-lg font-bold text-on-surface">{APP_NAME} AI Labs</h1>
                <p className="text-[10px] text-outline font-bold tracking-widest uppercase italic">Deep-Dive Synthesis Module</p>
             </div>
          </div>
        </div>
        <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-outline tracking-wider block mb-1">Target Asset</span>
            <span className="text-sm font-bold text-primary-container">{ticker}</span>
        </div>
      </header>

      {/* Generation Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center p-10 max-w-4xl mx-auto w-full relative">
        {/* Large Progress Indicator */}
        <div className="w-full mb-16 space-y-4">
            <div className="flex justify-between items-end">
                <div>
                   <h2 className="text-2xl font-light text-on-surface tracking-tight mb-2">Synthesizing Digital Twin...</h2>
                   <p className="text-xs text-outline font-medium">Processing regulatory disclosures and real-time sentiment data.</p>
                </div>
                <div className="text-right">
                   <span className="text-4xl font-bold tabular-nums text-primary-container">{Math.round(progress)}%</span>
                </div>
            </div>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-primary-container"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeInOut", duration: 0.3 }}
                />
            </div>
        </div>

        {/* Slide Steps */}
        <div className="w-full space-y-4 relative">
             <div className="absolute left-[23px] top-4 bottom-4 w-px bg-outline-variant/20 z-0 border-dashed border-l" />
             {slides.map((slide, idx) => (
                <motion.div 
                    key={slide.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative z-10 flex items-center gap-6 p-5 rounded-2xl border transition-all duration-300 ${
                        slide.status === 'active' 
                        ? 'bg-surface-container-lowest border-primary-container/30 shadow-md ring-1 ring-primary-container/10'
                        : slide.status === 'done'
                        ? 'bg-surface-container-lowest/50 border-outline-variant/10 opacity-70'
                        : 'bg-transparent border-transparent grayscale'
                    }`}
                >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        slide.status === 'active' ? 'bg-primary-container text-white animate-pulse' : 
                        slide.status === 'done' ? 'bg-tertiary-container/10 text-tertiary-container' : 
                        'bg-surface-container text-outline'
                    }`}>
                        {slide.status === 'active' && <CircleDashed size={24} className="animate-spin-slow" />}
                        {slide.status === 'done' && <CheckCircle2 size={24} />}
                        {slide.status === 'pending' && <span className="font-bold text-xs">0{slide.id}</span>}
                    </div>
                    <div className="flex-1">
                        <h4 className={`font-bold transition-colors ${slide.status === 'active' ? 'text-on-surface' : 'text-outline/80'}`}>
                            {slide.title}
                        </h4>
                        <p className="text-[11px] text-outline font-medium tracking-tight mt-1">{slide.subtitle}</p>
                    </div>
                    {slide.status === 'active' && (
                        <div className="flex items-center gap-2 bg-primary-container/10 px-3 py-1 rounded-full border border-primary-container/20">
                            <Zap size={12} className="text-primary-container fill-primary-container" />
                            <span className="text-[10px] font-bold text-primary-container uppercase tracking-wider">Processing</span>
                        </div>
                    )}
                </motion.div>
             ))}
        </div>

        {/* Action Reveal */}
        <AnimatePresence>
            {completed && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 w-full flex justify-center"
                >
                    <button className="bg-on-surface text-surface py-4 px-12 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center gap-4">
                        DOWNLOAD FULL INTELLIGENCE REPORT
                        <ArrowLeft size={18} className="rotate-180" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="p-10 text-center opacity-30 select-none">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
            Generated by QuantEdge 4.0 Deep Learning Engine • Distributed Intelligence Model
          </p>
      </footer>
    </div>
  );
};

export default ReportGenerator;
