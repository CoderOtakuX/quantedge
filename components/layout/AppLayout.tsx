"use client";

import React from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import TickerTape from "./TickerTape";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Header Container (Fixed) */}
      <div className="fixed top-0 right-0 w-[calc(100%-220px)] z-40">
        <TopNav />
        <div className="mt-14">
          <TickerTape />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="ml-[220px] pt-24 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
