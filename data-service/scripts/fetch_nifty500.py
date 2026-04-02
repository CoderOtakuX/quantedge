import requests
import json
import time

try:
    # Download Nifty 500 list from NSE
    url = "https://archives.nseindia.com/content/indices/ind_nifty500list.csv"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200 or not response.text.strip():
        raise Exception(f"Failed to fetch from NSE, code: {response.status_code}")
        
    lines = response.text.strip().split('\n')
    
    # Parse CSV - columns: Company Name, Industry, Symbol, Series, ISIN Code
    tickers = []
    for line in lines[1:]:  # skip header
        parts = line.split(',')
        if len(parts) >= 3:
            symbol = parts[2].strip().strip('"')
            company = parts[0].strip().strip('"')
            sector = parts[1].strip().strip('"')
            if symbol:
                tickers.append({
                    "ticker": symbol,
                    "company_name": company,
                    "sector": sector,
                    "yf_ticker": f"{symbol}.NS"
                })
except Exception as e:
    print(f"Primary NSE fetch failed: {e}. Falling back to nsepython...")
    try:
        from nsepython import nse_eq_symbols
        symbols = nse_eq_symbols()
        tickers = []
        for symbol in symbols:
            tickers.append({
                "ticker": symbol,
                "company_name": symbol, # fallback
                "sector": "Unknown", # fallback
                "yf_ticker": f"{symbol}.NS"
            })
    except ImportError:
        print("nsepython not installed. Please install it using `pip install nsepython` or ensure network connection is open.")
        exit(1)

print(f"Found {len(tickers)} stocks")

# Save to JSON
with open("data-service/nifty500.json", "w") as f:
    json.dump(tickers, f, indent=2)

print("Saved to data-service/nifty500.json")
print("Sample:", tickers[:3])
