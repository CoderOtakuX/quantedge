"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import SectionLabel from "@/components/ui/SectionLabel";
import { Newspaper } from "lucide-react";

export default function NewsPage() {
  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto p-10 space-y-10">
        <SectionLabel label="Market News" icon={Newspaper} />
        <div className="bg-surface-container-low p-20 rounded-3xl border border-dashed border-outline-variant/30 flex items-center justify-center text-outline text-center">
            <div>
              <p className="text-lg font-semibold mb-2">News Intelligence Engine is initializing...</p>
              <p className="text-sm">Real-time aggregate sentiment analysis will be available soon.</p>
            </div>
        </div>
      </div>
    </AppLayout>
  );
}
