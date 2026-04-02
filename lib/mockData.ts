import { StockOverview, FinancialYear, PeerStock, AIAnalysis, ShareholdingQuarter } from "@/types/stock";
import { ScreenerResult } from "@/types/screener";
import { SectorData, SectorDetail } from "@/types/sector";

export const MOCK_INDICES = [
  { ticker: "NIFTY 50", value: 22147.2, change: 45.2, changePercent: 0.45 },
  { ticker: "SENSEX", value: 72831.94, change: 276.12, changePercent: 0.38 },
  { ticker: "BANK NIFTY", value: 46812.4, change: -56.12, changePercent: -0.12 },
  { ticker: "RELIANCE", value: 2540.5, change: 45.2, changePercent: 1.81 },
  { ticker: "TCS", value: 3942.1, change: 156.4, changePercent: 4.12 },
  { ticker: "HDFC BANK", value: 1452.1, change: -12.45, changePercent: -0.85 },
];

export const MOCK_SCREENER_RESULTS: ScreenerResult[] = [
  {
    ticker: "RELIANCE",
    companyName: "Reliance Industries Ltd",
    exchange: "NSE",
    sector: "Energy",
    price: 2540.5,
    changePercent: 1.81,
    marketCap: 17210000000000,
    pe: 26.42,
    roe: 9.14,
    rating: "BUY",
    compositeScore: 82,
  },
  {
    ticker: "TCS",
    companyName: "Tata Consultancy Services",
    exchange: "NSE",
    sector: "IT",
    price: 3942.1,
    changePercent: 4.12,
    marketCap: 14450000000000,
    pe: 31.5,
    roe: 39.1,
    rating: "STRONG BUY",
    compositeScore: 91,
  },
  {
    ticker: "HDFC BANK",
    companyName: "HDFC Bank Ltd",
    exchange: "NSE",
    sector: "Banking",
    price: 1452.1,
    changePercent: -0.85,
    marketCap: 11020000000000,
    pe: 18.2,
    roe: 17.5,
    rating: "HOLD",
    compositeScore: 65,
  },
  {
    ticker: "INFY",
    companyName: "Infosys Ltd",
    exchange: "NSE",
    sector: "IT",
    price: 1612.4,
    changePercent: 2.15,
    marketCap: 6690000000000,
    pe: 24.8,
    roe: 31.2,
    rating: "BUY",
    compositeScore: 78,
  },
];

export const MOCK_SECTORS: SectorData[] = [
  { id: "it", name: "IT SECTOR", dayChange: 2.48, constituentCount: 10, topGainer: { ticker: "TCS", changePercent: 4.12 } },
  { id: "auto", name: "AUTO", dayChange: 1.15, constituentCount: 15, topGainer: { ticker: "M&M", changePercent: 3.85 } },
  { id: "banking", name: "BANKING", dayChange: -0.42, constituentCount: 12, topGainer: { ticker: "ICICIBANK", changePercent: 0.88 } },
  { id: "fmcg", name: "FMCG", dayChange: 0.67, constituentCount: 15, topGainer: { ticker: "TATACONSUM", changePercent: 2.14 } },
  { id: "pharma", name: "PHARMA", dayChange: 1.82, constituentCount: 20, topGainer: { ticker: "CIPLA", changePercent: 5.2 } },
  { id: "metal", name: "METAL", dayChange: -1.24, constituentCount: 15, topGainer: { ticker: "HINDALCO", changePercent: 0.45 } },
  { id: "energy", name: "ENERGY", dayChange: 0.12, constituentCount: 10, topGainer: { ticker: "RELIANCE", changePercent: 1.32 } },
  { id: "realty", name: "REALTY", dayChange: -0.92, constituentCount: 10, topGainer: { ticker: "DLF", changePercent: 0.22 } },
];

export const MOCK_STOCK_DETAIL: StockOverview = {
  ticker: "RELIANCE",
  companyName: "Reliance Industries Ltd",
  exchange: "NSE",
  sector: "Energy",
  industry: "Oil & Gas",
  price: 2540.5,
  change: 45.2,
  changePercent: 1.81,
  weekHigh52: 2755.0,
  weekLow52: 2210.3,
  marketCap: 17210000000000,
  pe: 26.42,
  eps: 96.16,
  roe: 9.14,
  debtToEquity: 0.42,
  dividendYield: 0.35,
  volume: 4520000,
  beta: 1.05,
  description: "Reliance Industries Limited is an Indian multinational conglomerate company, headquartered in Mumbai. It has diverse businesses including energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles.",
};

export const MOCK_FINANCIALS: FinancialYear[] = [
  { year: "2024", revenue: 890000, netProfit: 69000, operatingProfit: 142000, opm: 16.0, npm: 7.8, eps: 102.1 },
  { year: "2023", revenue: 879000, netProfit: 66700, operatingProfit: 138000, opm: 15.7, npm: 7.6, eps: 98.5 },
  { year: "2022", revenue: 720000, netProfit: 60700, operatingProfit: 110000, opm: 15.3, npm: 8.4, eps: 89.8 },
];

export const MOCK_PEERS: PeerStock[] = [
  { ticker: "RELIANCE", companyName: "Reliance Industries", marketCap: 1721000, pe: 26.4, revenueGrowth: 12.5, grossMargin: 18.2, compositeScore: 82, rating: "buy" },
  { ticker: "ONGC", companyName: "Oil & Natural Gas Corp", marketCap: 342000, pe: 12.1, revenueGrowth: 8.4, grossMargin: 15.6, compositeScore: 74, rating: "accumulate" },
  { ticker: "BPCL", companyName: "Bharat Petroleum", marketCap: 135000, pe: 14.5, revenueGrowth: 15.2, grossMargin: 12.4, compositeScore: 68, rating: "hold" },
];

export const MOCK_AI_ANALYSIS: AIAnalysis = {
  verdict: "BUY",
  summary: "Reliance displays strong momentum in its New Energy and Retail verticals, offsetting cyclical pressures in O2C margins.",
  bullCase: [
    "Aggressive expansion in the New Energy vertical expected to drive significant valuation re-rating by FY26.",
    "Recent tariff hikes in the telecom arm point toward a sharp improvement in ARPU and cash flow generation.",
    "Retail segment outperforming peers with a 24% YoY growth in digital commerce contributions.",
  ],
  bearCase: [
    "O2C margins under pressure due to global slowdown in refining and chemical spreads.",
    "Increasing net debt levels following high capex intensity across multiple business units.",
    "Regulatory headwinds in domestic markets regarding platform neutrality and data privacy.",
  ],
  outlook: "Positive over a 12-18 month horizon as capital expenditure transforms into functional revenue streams across new business units.",
  alternatives: [
    { ticker: "TCS", companyName: "Tata Consultancy Services", reason: "Defensive play with strong cash flows", score: 91 },
    { ticker: "HDFC BANK", companyName: "HDFC Bank Ltd", reason: "Value recovery play in banking sector", score: 65 },
  ],
  sourcesUsed: ["NSE Annual Reports", "Analyst Conference Calls", "Market Sentiment Indices"],
};

export const MOCK_SHAREHOLDING: ShareholdingQuarter[] = [
  { quarter: "Dec 2023", promoter: 50.39, fii: 22.5, dii: 16.2, public: 10.91 },
  { quarter: "Sep 2023", promoter: 50.39, fii: 22.1, dii: 15.9, public: 11.61 },
  { quarter: "Jun 2023", promoter: 50.41, fii: 22.8, dii: 15.4, public: 11.39 },
];
