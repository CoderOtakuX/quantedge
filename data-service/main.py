from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

from cache import cache
from services.nse import get_live_price
from services.yfinance_service import (
    get_overview, get_financials, get_history,
    get_peers, get_shareholding
)

from services.screener import screen_stocks
from routers import report as report_router
from routers import sectors as sectors_router
from routers import search as search_router

app = FastAPI(title="QuantEdge Data Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(report_router.router, prefix="/api")
app.include_router(sectors_router.router, prefix="/api")
app.include_router(search_router.router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok", "service": "quantedge-data"}

@app.get("/api/stock/{ticker}/overview")
def stock_overview(ticker: str):
    key = f"overview:{ticker}"
    cached = cache.get(key)
    if cached: return cached
    try:
        price_data = get_live_price(ticker.upper())
    except:
        price_data = {}
    fundamentals = get_overview(ticker)
    result = {**fundamentals, **price_data}
    cache.set(key, result, ttl_seconds=900)
    return result

@app.get("/api/stock/{ticker}/financials")
def stock_financials(ticker: str):
    key = f"financials:{ticker}"
    cached = cache.get(key)
    if cached: return cached
    result = get_financials(ticker)
    cache.set(key, result, ttl_seconds=21600)
    return result

@app.get("/api/stock/{ticker}/peers")
def stock_peers(ticker: str):
    key = f"peers:{ticker}"
    cached = cache.get(key)
    if cached: return cached
    result = get_peers(ticker)
    cache.set(key, result, ttl_seconds=3600)
    return result

@app.get("/api/stock/{ticker}/shareholding")
def stock_shareholding(ticker: str):
    key = f"shareholding:{ticker}"
    cached = cache.get(key)
    if cached: return cached
    result = get_shareholding(ticker)
    cache.set(key, result, ttl_seconds=21600)
    return result

@app.get("/api/stock/{ticker}/history")
def stock_history(ticker: str, period: str = "1y"):
    key = f"history:{ticker}:{period}"
    cached = cache.get(key)
    if cached: return cached
    result = get_history(ticker, period)
    cache.set(key, result, ttl_seconds=900)
    return result

@app.get("/api/stock/{ticker}/news")
def stock_news(ticker: str):
    key = f"news:{ticker}"
    cached = cache.get(key)
    if cached: return cached
    from services.yfinance_service import get_news
    result = get_news(ticker)
    cache.set(key, result, ttl_seconds=3600)
    return result

@app.post("/api/screener")
def screener(
    min_pe: Optional[float] = None,
    max_pe: Optional[float] = None,
    min_roe: Optional[float] = None,
    min_market_cap: Optional[float] = None,
    sector: Optional[str] = None,
):
    return screen_stocks(min_pe, max_pe, min_roe, min_market_cap, sector)

