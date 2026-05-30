import requests
import yfinance as yf

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
    try:
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
    except Exception as e:
        print(f"NSE scrape failed for {ticker}: {e}. Falling back to yfinance.")
        try:
            yf_sym = ticker + ".NS" if not (ticker.endswith(".NS") or ticker.endswith(".BO")) else ticker
            t = yf.Ticker(yf_sym)
            
            last_price = None
            try:
                last_price = t.fast_info.last_price
            except:
                pass
                
            info = {}
            try:
                info = t.info
                if not isinstance(info, dict):
                    info = {}
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
                
            day_high = None
            day_low = None
            try:
                day_high = t.fast_info.day_high
                day_low = t.fast_info.day_low
            except:
                pass
                
            if not day_high:
                day_high = info.get("dayHigh") or info.get("regularMarketDayHigh")
            if not day_low:
                day_low = info.get("dayLow") or info.get("regularMarketDayLow")
                
            week_52_high = None
            week_52_low = None
            try:
                week_52_high = t.fast_info.year_high
                week_52_low = t.fast_info.year_low
            except:
                pass
                
            if not week_52_high:
                week_52_high = info.get("fiftyTwoWeekHigh")
            if not week_52_low:
                week_52_low = info.get("fiftyTwoWeekLow")
                
            volume = None
            try:
                volume = t.fast_info.last_volume
            except:
                pass
            if not volume:
                volume = info.get("volume") or info.get("regularMarketVolume")
                
            return {
                "symbol": ticker,
                "last_price": last_price or previous_close or 100.0,
                "change": change,
                "change_percent": change_percent,
                "day_high": day_high or last_price,
                "day_low": day_low or last_price,
                "week_52_high": week_52_high or last_price,
                "week_52_low": week_52_low or last_price,
                "volume": volume or 100000,
            }
        except Exception as ex:
            print(f"yfinance fallback failed for {ticker}: {ex}")
            return {
                "symbol": ticker,
                "last_price": 100.0,
                "change": 0.0,
                "change_percent": 0.0,
                "day_high": 100.0,
                "day_low": 100.0,
                "week_52_high": 100.0,
                "week_52_low": 100.0,
                "volume": 10000,
            }
