import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.nseindia.com/",
}

def get_nse_session() -> requests.Session:
    session = requests.Session()
    session.get("https://www.nseindia.com", headers=HEADERS, timeout=10)
    return session

def get_live_price(ticker: str) -> dict:
    """ticker should be NSE symbol without .NS e.g. RELIANCE"""
    session = get_nse_session()
    url = f"https://www.nseindia.com/api/quote-equity?symbol={ticker}"
    resp = session.get(url, headers=HEADERS, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    pd = data.get("priceInfo", {})
    return {
        "symbol": ticker,
        "last_price": pd.get("lastPrice"),
        "change": pd.get("change"),
        "change_percent": pd.get("pChange"),
        "day_high": pd.get("intraDayHighLow", {}).get("max"),
        "day_low": pd.get("intraDayHighLow", {}).get("min"),
        "week_52_high": pd.get("weekHighLow", {}).get("max"),
        "week_52_low": pd.get("weekHighLow", {}).get("min"),
        "volume": data.get("marketDeptOrderBook", {}).get("totalSellQuantity"),
    }
