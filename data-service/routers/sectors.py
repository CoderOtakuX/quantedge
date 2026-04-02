from fastapi import APIRouter
import os
import requests
import yfinance as yf
from cache import cache
from services.screener import compute_score
from stock_universe import get_tickers_for_sector

router = APIRouter()

SECTORS_LIST = [
    "Technology",
    "Financial Services",
    "Energy",
    "Consumer Defensive",
    "Consumer Cyclical",
    "Healthcare",
    "Industrials",
    "Basic Materials",
    "Communication Services",
    "Utilities",
    "Real Estate"
]

@router.get("/sectors")
def list_sectors():
    return {"sectors": SECTORS_LIST}

@router.get("/sectors/{sector_name}/stocks")
def get_sector_stocks(sector_name: str):
    key = f"sectors_stocks_{sector_name}"
    cached = cache.get(key)
    if cached: 
        return cached
    
    # Extract exactly 50 bounded tickers matching Nifty50 sector mapping
    tickers = get_tickers_for_sector(sector_name)[:50]
    
    results = []
    # Fetch latest price & meta per ticker
    for sym_yf in tickers:
        try:
            t = yf.Ticker(sym_yf)
            info = t.info
            cp = info.get("currentPrice") or info.get("regularMarketPrice") or 0
            
            roe = (info.get("returnOnEquity") or 0) * 100
            net_margin = round((info.get("profitMargins") or 0) * 100, 2)
            
            comp_score = compute_score(info)
            
            results.append({
                "ticker": sym_yf.replace(".NS", ""),
                "company_name": info.get("longName") or sym_yf,
                "current_price": cp,
                "market_cap": info.get("marketCap") or 0,
                "pe_ratio": info.get("trailingPE"),
                "roe": round(roe, 2),
                "net_margin": net_margin,
                "composite_score": comp_score
            })
        except:
            continue
            
    results.sort(key=lambda x: x["composite_score"], reverse=True)
    res = {"stocks": results}
    if results:
        cache.set(key, res, ttl_seconds=1800)
    return res

@router.get("/sectors/{sector_name}/summary")
def get_sector_summary(sector_name: str):
    key = f"sectors_summary_{sector_name}"
    cached = cache.get(key)
    if cached: 
        return cached
    
    stocks_data = get_sector_stocks(sector_name)
    top_5 = stocks_data["stocks"][:5]
    
    print(f"Fetching summary for {sector_name} with top 5 stocks...")
    prompt = f"Write a 2-3 sentence AI summary of the current health of the {sector_name} sector. Assess based on these top 5 stocks and their metrics: {top_5}."
    
    headers = {
        "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are a concise financial analyst."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 150
    }
    
    summary = "AI summary unavailable. Showing raw stock data."
    if top_5:
        try:
            response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)
            response.raise_for_status()
            summary = response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Groq API Error: {e}")
        
    res = {"summary": summary}
    cache.set(key, res, ttl_seconds=3600)
    return res
