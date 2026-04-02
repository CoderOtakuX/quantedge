export interface ScreenerResult {
  ticker: string;
  companyName: string;
  exchange: string;
  sector: string;
  price: number;
  changePercent: number;
  marketCap: number;
  pe: number;
  roe: number;
  rating: "STRONG BUY" | "BUY" | "HOLD" | "SELL";
  compositeScore?: number;
}

export interface ScreenerFilter {
  id: string;
  label: string;
  type: "range" | "boolean" | "select" | "multiselect";
  value: string | number | boolean | number[] | string[];
  options?: string[];
}
