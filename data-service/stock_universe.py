import json
import os

_universe = None

def get_stock_universe():
    global _universe
    if _universe is None:
        json_path = os.path.join(os.path.dirname(__file__), "nifty500.json")
        with open(json_path, "r") as f:
            _universe = json.load(f)
    return _universe

def get_tickers_for_sector(sector: str) -> list[str]:
    universe = get_stock_universe()
    # NSE sector names don't always match yfinance sector names
    # Do a case-insensitive contains match
    matches = [
        s["yf_ticker"] for s in universe
        if sector.lower() in s["sector"].lower() 
        or s["sector"].lower() in sector.lower()
    ]
    return matches

def get_all_tickers() -> list[str]:
    return [s["yf_ticker"] for s in get_stock_universe()]

def search_stocks(query: str) -> list[dict]:
    universe = get_stock_universe()
    q = query.lower().strip()
    if len(q) < 1:
        return []
    
    results = []
    for s in universe:
        ticker_clean = s["ticker"].lower()        # "reliance" not "reliance.ns"
        company_lower = s["company_name"].lower() # "reliance industries limited"
        
        # Match if query appears anywhere in ticker OR company name
        if q in ticker_clean or q in company_lower:
            results.append({
                "ticker": s["ticker"],           # clean ticker without .NS
                "company_name": s["company_name"],
                "sector": s["sector"],
                "yf_ticker": s["yf_ticker"]      # keep .NS version for internal use
            })
    
    # Sort: exact ticker match first, then starts-with, then contains
    def sort_key(s):
        t = s["ticker"].lower()
        if t == q:
            return 0
        if t.startswith(q):
            return 1
        if s["company_name"].lower().startswith(q):
            return 2
        return 3
    
    results.sort(key=sort_key)
    return results[:20]
