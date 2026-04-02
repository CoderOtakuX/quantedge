import yfinance as yf
from typing import Optional

from stock_universe import get_all_tickers

def compute_score(info: dict) -> float:
    roe = (info.get("returnOnEquity") or 0) * 100
    revenue_growth = (info.get("revenueGrowth") or 0) * 100
    net_margin = (info.get("profitMargins") or 0) * 100
    de = info.get("debtToEquity") or 0

    roe_score = min(roe / 30 * 100, 100)
    growth_score = min(revenue_growth / 20 * 100, 100)
    margin_score = min(net_margin / 20 * 100, 100)
    de_score = max(0, 100 - (de / 2))

    return round(
        roe_score * 0.30 +
        growth_score * 0.25 +
        margin_score * 0.25 +
        de_score * 0.20, 2
    )

def screen_stocks(
    min_pe: Optional[float] = None,
    max_pe: Optional[float] = None,
    min_roe: Optional[float] = None,
    min_market_cap: Optional[float] = None,
    sector: Optional[str] = None,
) -> list:
    results = []
    tickers = get_all_tickers()[:100]
    
    for sym_yf in tickers:
        try:
            sym = sym_yf.replace(".NS", "")
            t = yf.Ticker(sym_yf)
            info = t.info
            pe = info.get("trailingPE")
            roe = (info.get("returnOnEquity") or 0) * 100
            mcap = info.get("marketCap") or 0
            sec = info.get("sector", "")

            if min_pe and pe and pe < min_pe: continue
            if max_pe and pe and pe > max_pe: continue
            if min_roe and roe < min_roe: continue
            if min_market_cap and mcap < min_market_cap: continue
            if sector and sec.lower() != sector.lower(): continue

            results.append({
                "symbol": sym,
                "name": info.get("longName"),
                "sector": sec,
                "pe_ratio": pe,
                "roe": round(roe, 2),
                "market_cap": mcap,
                "net_margin": round((info.get("profitMargins") or 0) * 100, 2),
                "debt_to_equity": info.get("debtToEquity"),
                "composite_score": compute_score(info),
            })
        except:
            continue
    return sorted(results, key=lambda x: x["composite_score"], reverse=True)
