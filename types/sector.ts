export interface SectorData {
  id: string;
  name: string;
  dayChange: number;
  constituentCount: number;
  topGainer: {
    ticker: string;
    changePercent: number;
  };
}

export interface SectorDetail extends SectorData {
  advancing: number;
  declining: number;
  marketBreath: "Positive" | "Negative" | "Neutral";
  aiAlphaSummary: string;
  liquidityInflow: number;
  constituents: Array<{
    rank: number;
    ticker: string;
    companyName: string;
    price: number;
    changePercent: number;
    compositeScore: number;
    marketCap: number;
    relVol: number;
    trend: "up" | "down" | "flat";
  }>;
}
