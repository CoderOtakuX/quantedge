import yfinance as yf
import pandas as pd
from typing import Optional
from concurrent.futures import ThreadPoolExecutor
import os
import json

_valid_tickers = None

def get_valid_tickers():
    global _valid_tickers
    if _valid_tickers is None:
        try:
            json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "nifty500.json")
            with open(json_path, "r", encoding="utf-8") as f:
                universe = json.load(f)
            _valid_tickers = {s["ticker"].upper() for s in universe}
        except Exception as e:
            print(f"Error loading stock universe in yfinance_service: {e}")
            _valid_tickers = set()
    return _valid_tickers

def to_ns(ticker: str) -> str:
    ticker_upper = ticker.upper().replace(".NS", "").replace(".BO", "")
    valid = get_valid_tickers()
    if valid and ticker_upper not in valid:
        raise ValueError(f"Ticker '{ticker}' is not supported. QuantEdge covers Nifty 500 stocks.")
    if not ticker.endswith(".NS") and not ticker.endswith(".BO"):
        return ticker + ".NS"
    return ticker

def get_overview(ticker: str) -> dict:
    yf_ticker = to_ns(ticker)
    t = yf.Ticker(yf_ticker)
    
    try:
        info = t.info
        if not isinstance(info, dict):
            info = {}
    except Exception as e:
        print(f"Error fetching ticker info: {e}")
        info = {}
    
    # Check if this is an Indian stock (NSE/BSE)
    exchange = info.get("exchange", "")
    if exchange and exchange not in ["NSI", "BSE", "BOM", "NSE"]:
        # Fallback check for ticker suffix
        if not (yf_ticker.endswith(".NS") or yf_ticker.endswith(".BO")):
            raise ValueError(f"Exchange {exchange} not supported. QuantEdge covers NSE/BSE stocks.")

    # Price fallback chain
    last_price = None
    try:
        last_price = t.fast_info.last_price
    except:
        pass
    
    if not last_price:
        last_price = info.get("currentPrice") or info.get("regularMarketPrice")

    if not last_price:
        try:
            hist = t.history(period="1d")
            if not hist.empty:
                last_price = float(hist["Close"].iloc[-1])
        except:
            pass

    # Previous close fallback chain
    previous_close = None
    try:
        previous_close = t.fast_info.previous_close
    except:
        pass

    if not previous_close:
        previous_close = info.get("previousClose") or info.get("regularMarketPreviousClose")

    if not previous_close:
        try:
            hist2 = t.history(period="5d")
            if not hist2.empty and len(hist2) >= 2:
                previous_close = float(hist2["Close"].iloc[-2])
        except:
            pass

    change = 0.0
    change_percent = 0.0
    if last_price and previous_close:
        change = last_price - previous_close
        change_percent = (change / previous_close) * 100

    name = info.get("longName") or info.get("shortName") or ticker.upper()

    return {
        "name": name,
        "sector": info.get("sector") or "Technology",
        "industry": info.get("industry") or "Software",
        "market_cap": info.get("marketCap") or info.get("enterpriseValue") or 10000000000,
        "pe_ratio": info.get("trailingPE") or info.get("forwardPE") or 20.0,
        "pb_ratio": info.get("priceToBook") or 2.0,
        "roe": info.get("returnOnEquity") or 0.15,
        "roce": info.get("returnOnAssets") or 0.12,
        "debt_to_equity": info.get("debtToEquity") or 0.1,
        "dividend_yield": info.get("dividendYield") or 0.01,
        "eps": info.get("trailingEps") or 10.0,
        "revenue": info.get("totalRevenue") or 10000000000,
        "net_income": info.get("netIncomeToCommon") or 1000000000,
        "operating_margin": info.get("operatingMargins") or 0.15,
        "net_margin": info.get("profitMargins") or 0.10,
        "current_ratio": info.get("currentRatio") or 1.5,
        "free_cash_flow": info.get("freeCashflow") or 500000000,
        "beta": info.get("beta") or 1.0,
        "description": info.get("longBusinessSummary") or f"Analysis of {name} stock on QuantEdge.",
        "employees": info.get("fullTimeEmployees") or 1000,
        "website": info.get("website") or "https://www.nseindia.com",
        "last_price": last_price or previous_close or 100.0,
        "change": change,
        "change_percent": change_percent,
        "exchange": exchange or "NSE",
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

def fetch_peer_info(p_data) -> dict:
    sym = p_data.get("ticker")
    try:
        p = yf.Ticker(sym + ".NS")
        pi = p.info
        if not isinstance(pi, dict):
            pi = {}
        
        # Fallback values
        current_price = pi.get("currentPrice") or pi.get("regularMarketPrice") or pi.get("previousClose") or 100.0
        pe_ratio = pi.get("trailingPE") or pi.get("forwardPE") or 25.0
        pb_ratio = pi.get("priceToBook") or 2.0
        roe = pi.get("returnOnEquity") or 0.15
        market_cap = pi.get("marketCap") or 50000000000
        net_margin = pi.get("profitMargins") or 0.10
        roce = (pi.get("returnOnCapitalEmployed") * 100) if pi.get("returnOnCapitalEmployed") else 12.0

        return {
            "symbol": sym,
            "name": pi.get("longName") or p_data.get("company_name") or sym,
            "pe_ratio": pe_ratio,
            "pb_ratio": pb_ratio,
            "roe": roe,
            "market_cap": market_cap,
            "net_margin": net_margin,
            "current_price": current_price,
            "roce": roce,
        }
    except Exception as e:
        print(f"Error fetching peer {sym}: {e}")
        return {
            "symbol": sym,
            "name": p_data.get("company_name") or sym,
            "pe_ratio": 25.0,
            "pb_ratio": 2.0,
            "roe": 0.15,
            "market_cap": 50000000000,
            "net_margin": 0.10,
            "current_price": 100.0,
            "roce": 12.0,
        }

def get_peers(ticker: str) -> list:
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
                
        nifty_sector = nifty_sector or "Technology"
        
        # Find stocks in the same sector
        sector_peers = [p for p in nifty500 if p.get("sector") == nifty_sector and p.get("ticker", "") != ticker.upper()]
        
        # Parallel fetch peer data with ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=5) as executor:
            peers = list(executor.map(fetch_peer_info, sector_peers[:5]))
            
    except Exception as e:
        print(f"Error loading peers: {e}")
        
    return peers

def get_shareholding(ticker: str) -> dict:
    t = yf.Ticker(to_ns(ticker))
    def safe(df):
        try:
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
        except:
            return []
            
    inst = []
    mf = []
    maj = []
    try:
        inst = safe(t.institutional_holders)
    except:
        pass
    try:
        mf = safe(t.mutualfund_holders)
    except:
        pass
    try:
        maj = safe(t.major_holders)
    except:
        pass
        
    return {
        "institutional": inst,
        "mutual_fund": mf,
        "major_holders": maj,
    }

def get_news(ticker: str) -> list:
    t = yf.Ticker(to_ns(ticker))
    results = []
    try:
        news = t.news or []
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
    except Exception as e:
        print(f"Error fetching news for {ticker}: {e}")
    return results
