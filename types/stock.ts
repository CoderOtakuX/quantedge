export interface StockOverview {
  ticker: string;
  companyName: string;
  exchange: string;
  sector: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  weekHigh52: number;
  weekLow52: number;
  marketCap: number;
  pe: number;
  eps: number;
  roe: number;
  debtToEquity: number;
  dividendYield: number;
  volume: number;
  beta: number;
  description: string;
}

export interface FinancialYear {
  year: string;
  revenue: number;
  netProfit: number;
  operatingProfit: number;
  opm: number;
  npm: number;
  eps: number;
}

export interface PeerStock {
  ticker: string;
  companyName: string;
  marketCap: number;
  pe: number;
  revenueGrowth: number;
  grossMargin: number;
  compositeScore: number;
  rating: "buy" | "hold" | "accumulate" | "avoid";
}

export interface AIAnalysis {
  verdict: "BUY" | "ACCUMULATE" | "HOLD" | "AVOID";
  summary: string;
  bullCase: string[];
  bearCase: string[];
  outlook: string;
  alternatives: Array<{
    ticker: string;
    companyName: string;
    reason: string;
    score: number;
  }>;
  sourcesUsed: string[];
}

export interface ShareholdingQuarter {
  quarter: string;
  promoter: number;
  fii: number;
  dii: number;
  public: number;
}
