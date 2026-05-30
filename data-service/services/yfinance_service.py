import yfinance as yf
import pandas as pd
from typing import Optional

def to_ns(ticker: str) -> str:
    if not ticker.endswith(".NS") and not ticker.endswith(".BO"):
        return ticker + ".NS"
    return ticker

def get_overview(ticker: str) -> dict:
    yf_ticker = to_ns(ticker)
    t = yf.Ticker(yf_ticker)
    info = t.info
    
    # Check if this is an Indian stock (NSE/BSE)
    exchange = info.get("exchange", "")
    if exchange not in ["NSI", "BSE", "BOM"]:
        # Fallback check for ticker suffix
        if not (yf_ticker.endswith(".NS") or yf_ticker.endswith(".BO")):
            raise ValueError(f"Exchange {exchange} not supported. QuantEdge covers NSE/BSE stocks.")

    # Price fallback chain
    last_price = None
    try:
        last_price = t.fast_info.last_price
    except:
        last_price = info.get("currentPrice") or info.get("regularMarketPrice")

    return {
        "name": info.get("longName"),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "market_cap": info.get("marketCap"),
        "pe_ratio": info.get("trailingPE"),
        "pb_ratio": info.get("priceToBook"),
        "roe": info.get("returnOnEquity"),
        "roce": info.get("returnOnAssets"),
        "debt_to_equity": info.get("debtToEquity"),
        "dividend_yield": info.get("dividendYield"),
        "eps": info.get("trailingEps"),
        "revenue": info.get("totalRevenue"),
        "net_income": info.get("netIncomeToCommon"),
        "operating_margin": info.get("operatingMargins"),
        "net_margin": info.get("profitMargins"),
        "current_ratio": info.get("currentRatio"),
        "free_cash_flow": info.get("freeCashflow"),
        "beta": info.get("beta"),
        "description": info.get("longBusinessSummary"),
        "employees": info.get("fullTimeEmployees"),
        "website": info.get("website"),
        "last_price": last_price,
        "exchange": exchange,
    }

def get_financials(ticker: str) -> dict:
    t = yf.Ticker(to_ns(ticker))
    def safe_df(df):
        if df is None or df.empty:
            return {}
        df.columns = [str(c)[:10] for c in df.columns]
        return df.fillna(0).to_dict()

    return {
        "income_statement": safe_df(t.financials),
        "balance_sheet": safe_df(t.balance_sheet),
        "cash_flow": safe_df(t.cashflow),
        "quarterly_financials": safe_df(t.quarterly_financials),
    }

def get_history(ticker: str, period: str = "1y") -> list:
    t = yf.Ticker(to_ns(ticker))
    hist = t.history(period=period)
    if hist.empty:
        return []
    hist = hist.reset_index()
    hist["Date"] = hist["Date"].astype(str)
    return hist[["Date", "Open", "High", "Low", "Close", "Volume"]].to_dict(orient="records")

def get_peers(ticker: str) -> list:
    t = yf.Ticker(to_ns(ticker))
    info = t.info
    sector = info.get("sector", "")
    
    import json
    import os
    
    peers = []
    try:
        # Load Nifty 500 from json
        json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'nifty500.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            nifty500 = json.load(f)
            
        nifty_sector = None
        for p in nifty500:
            if p.get("ticker", "") == ticker.upper() or p.get("yf_ticker", "") == ticker.upper() + ".NS":
                nifty_sector = p.get("sector")
                break
                
        nifty_sector = nifty_sector or sector
        
        # Find stocks in the same sector
        sector_peers = [p for p in nifty500 if p.get("sector") == nifty_sector and p.get("ticker", "") != ticker.upper()]
        
        # Take first 5 matches to avoid too many requests
        for p_data in sector_peers[:5]:
            sym = p_data.get("ticker")
            try:
                p = yf.Ticker(sym + ".NS")
                pi = p.info
                peers.append({
                    "symbol": sym,
                    "name": pi.get("longName") or p_data.get("company_name"),
                    "pe_ratio": pi.get("trailingPE"),
                    "pb_ratio": pi.get("priceToBook"),
                    "roe": pi.get("returnOnEquity"),
                    "market_cap": pi.get("marketCap"),
                    "net_margin": pi.get("profitMargins"),
                    "current_price": pi.get("currentPrice") or pi.get("regularMarketPrice") or pi.get("previousClose") or None,
                    "roce": (pi.get("returnOnCapitalEmployed") * 100) if pi.get("returnOnCapitalEmployed") else None,
                })
            except Exception as e:
                continue
    except Exception as e:
        print(f"Error loading peers: {e}")
        
    return peers

def get_shareholding(ticker: str) -> dict:
    t = yf.Ticker(to_ns(ticker))
    def safe(df):
        if df is None or df.empty:
            return []
        df = df.reset_index()
        df.columns = [str(c) for c in df.columns]
        for col in df.columns:
            if df[col].dtype == object:
                pass
            else:
                df[col] = df[col].fillna(0)
        return df.to_dict(orient="records")
    return {
        "institutional": safe(t.institutional_holders),
        "mutual_fund": safe(t.mutualfund_holders),
        "major_holders": safe(t.major_holders),
    }

def get_news(ticker: str) -> list:
    t = yf.Ticker(to_ns(ticker))
    news = t.news or []
    results = []
    for n in news[:10]:
        content = n.get("content", {})
        thumbnail = content.get("thumbnail")
        thumb_url = None
        if thumbnail and isinstance(thumbnail, dict):
            resolutions = thumbnail.get("resolutions", [])
            if resolutions:
                thumb_url = resolutions[0].get("url")
        provider = content.get("provider", {})
        canonical = content.get("canonicalUrl", {})
        results.append({
            "title": content.get("title"),
            "url": canonical.get("url"),
            "published_at": content.get("pubDate"),
            "source": provider.get("displayName"),
            "summary": content.get("summary"),
            "thumbnail": thumb_url,
        })
    return results
