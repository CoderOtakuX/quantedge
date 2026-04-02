"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import SectionLabel from "@/components/ui/SectionLabel";
import { Landmark } from "lucide-react";

export default function GenericPlaceholder({ title }: { title: string }) {
  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto p-10 space-y-10">
        <SectionLabel label={title} icon={Landmark} />
        <div className="bg-surface-container-low p-20 rounded-3xl border border-dashed border-outline-variant/30 flex items-center justify-center text-outline text-center">
            <div>
              <p className="text-lg font-semibold mb-2">{title} is initializing...</p>
              <p className="text-sm">Extended market modules are being synced with real-time data feeds.</p>
            </div>
        </div>
      </div>
    </AppLayout>
  );
}
